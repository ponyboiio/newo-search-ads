/**
 * GHL → HubSpot real-time sync
 *
 * Creates an MQL deal in HubSpot when both conditions are true:
 *   1. Contact has `card_connected` tag in GHL
 *   2. Contact has been called by an SDR (`sdr_called` tag in GHL)
 *
 * On ContactCreate: syncs contact to HubSpot immediately.
 * On OutboundCallConnected: stamps `sdr_called` tag, checks CC → creates MQL.
 * On ContactUpdate: re-evaluates both conditions → creates MQL if met.
 *
 * Required env vars (set in Vercel dashboard):
 *   GHL_API_KEY, GHL_LOCATION_ID, HUBSPOT_ACCESS_TOKEN, WEBHOOK_SECRET (optional)
 */

const GHL = 'https://rest.gohighlevel.com/v1';
const HS = 'https://api.hubapi.com';

// HubSpot deal stages (Sales Pipeline = "default")
const PIPELINE = 'default';
const STAGE_NQL = 'appointmentscheduled';
const STAGE_MQL = 'contractsent';
const ADVANCED_STAGES = new Set([
  'contractsent', '1341301763', '1295938402', 'closedwon',
]);

// --- GHL helpers ---

async function ghl(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${GHL}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function getGhlContact(contactId) {
  const data = await ghl(`/contacts/${contactId}`);
  return data.contact || data;
}

async function addGhlTag(contactId, tag) {
  return ghl(`/contacts/${contactId}/tags`, 'POST', { tags: [tag] });
}

function hasTag(contact, tag) {
  return Array.isArray(contact.tags) && contact.tags.includes(tag);
}

// --- HubSpot helpers ---

async function hs(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${HS}${path}`, opts);
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`HS ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function findHsContact(email) {
  if (!email) return null;
  const res = await hs('/crm/v3/contacts/search', 'POST', {
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email', 'firstname', 'lastname', 'hs_object_id'],
    limit: 1,
  });
  return res.results?.[0] || null;
}

async function createHsContact(ghlContact) {
  return hs('/crm/v3/contacts', 'POST', {
    properties: {
      email: ghlContact.email || '',
      firstname: ghlContact.firstName || '',
      lastname: ghlContact.lastName || '',
      phone: ghlContact.phone || '',
      lifecyclestage: 'lead',
    },
  });
}

async function hasAdvancedDeal(hsContactId) {
  const assoc = await hs(`/crm/v3/objects/contacts/${hsContactId}/associations/deals`);
  const ids = (assoc.results || []).map((r) => r.id);
  if (!ids.length) return false;

  const batch = await hs('/crm/v3/objects/deals/batch/read', 'POST', {
    inputs: ids.map((id) => ({ id })),
    properties: ['dealstage'],
  });
  return (batch.results || []).some((d) => ADVANCED_STAGES.has(d.properties?.dealstage));
}

async function createMqlDeal(hsContactId, contactName, reason) {
  const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const deal = await hs('/crm/v3/objects/deals', 'POST', {
    properties: {
      dealname: `${contactName} — MQL via ${reason}`,
      dealstage: STAGE_MQL,
      pipeline: PIPELINE,
      closedate: closeDate,
    },
  });

  if (deal.id) {
    await hs(
      `/crm/v3/objects/deals/${deal.id}/associations/contacts/${hsContactId}/deal_to_contact`,
      'PUT'
    );
  }
  return deal;
}

// --- Core logic ---

async function evaluateAndPromote(ghlContact) {
  const ccReady = hasTag(ghlContact, 'card_connected');
  const calledReady = hasTag(ghlContact, 'sdr_called');

  if (!ccReady || !calledReady) {
    return {
      action: 'waiting',
      cc: ccReady,
      called: calledReady,
      contact: ghlContact.email || ghlContact.id,
    };
  }

  const email = ghlContact.email;
  const name =
    `${ghlContact.firstName || ''} ${ghlContact.lastName || ''}`.trim() || email || ghlContact.id;

  // Find or create HubSpot contact
  let hsContact = email ? await findHsContact(email) : null;
  if (!hsContact) {
    hsContact = await createHsContact(ghlContact);
  }
  if (!hsContact?.id) {
    return { action: 'error', reason: 'failed to find/create HubSpot contact', email };
  }

  // Check if already MQL+
  const alreadyAdvanced = await hasAdvancedDeal(hsContact.id);
  if (alreadyAdvanced) {
    return { action: 'skipped', reason: 'already MQL+', hsContactId: hsContact.id };
  }

  const deal = await createMqlDeal(hsContact.id, name, 'GHL CC + SDR Call');
  return {
    action: 'mql_created',
    dealId: deal.id,
    dealName: deal.properties?.dealname,
    hsContactId: hsContact.id,
    email,
  };
}

// --- Event handlers ---

async function onContactCreate(contact) {
  const email = contact.email;
  if (!email) return { action: 'skipped', reason: 'no email' };

  let hsContact = await findHsContact(email);
  if (!hsContact) {
    hsContact = await createHsContact(contact);
    return { action: 'contact_synced', hsContactId: hsContact?.id, email };
  }
  return { action: 'contact_exists', hsContactId: hsContact.id, email };
}

async function onCallConnected(payload) {
  const contactId = payload.contactId || payload.contact?.id;
  if (!contactId) return { action: 'skipped', reason: 'no contactId' };

  // Stamp sdr_called tag on the GHL contact
  try {
    await addGhlTag(contactId, 'sdr_called');
  } catch (e) {
    console.warn('Could not add sdr_called tag:', e.message);
  }

  // Fetch fresh contact data to check tags
  const contact = await getGhlContact(contactId);
  return evaluateAndPromote(contact);
}

async function onContactUpdate(contact) {
  return evaluateAndPromote(contact);
}

// --- Main handler ---

export default async function handler(req, res) {
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'ghl-webhook', ts: new Date().toISOString() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;

  // Optional secret validation
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers['x-ghl-secret'] !== secret) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  // Location guard
  if (payload.locationId && payload.locationId !== process.env.GHL_LOCATION_ID) {
    return res.status(401).json({ error: 'Location mismatch' });
  }

  const eventType = payload.type || 'unknown';
  const contact = payload.contact || payload.contactData || {};

  console.log(`[ghl-webhook] ${eventType}`, {
    contactId: contact.id || payload.contactId,
    email: contact.email,
    tags: contact.tags,
  });

  let result = { action: 'unhandled', eventType };

  try {
    switch (eventType) {
      case 'ContactCreate':
        result = await onContactCreate(contact);
        break;

      case 'ContactUpdate':
        result = await onContactUpdate(contact);
        break;

      case 'OutboundCallConnected':
      case 'CallStatus':
      case 'InboundCallConnected':
        result = await onCallConnected(payload);
        break;

      default:
        result = { action: 'ignored', eventType };
    }
  } catch (err) {
    console.error('[ghl-webhook] error:', err.message);
    result = { action: 'error', error: err.message, eventType };
  }

  console.log('[ghl-webhook] result:', result);
  return res.status(200).json({ ok: true, result });
}
