/**
 * Shared helpers for GHL ↔ HubSpot webhook handlers.
 */

export const GHL = 'https://rest.gohighlevel.com/v1';
export const HS = 'https://api.hubapi.com';

export const PIPELINE = 'default';
export const STAGE_MQL = 'contractsent';
export const ADVANCED_STAGES = new Set([
  'contractsent', '1341301763', '1295938402', 'closedwon',
]);

// --- GHL ---

export async function ghl(path, method = 'GET', body = null) {
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

export async function getGhlContactByEmail(email) {
  const data = await ghl(
    `/contacts/?locationId=${process.env.GHL_LOCATION_ID}&query=${encodeURIComponent(email)}&limit=1`
  );
  return data.contacts?.[0] || null;
}

export async function getGhlContact(contactId) {
  const data = await ghl(`/contacts/${contactId}`);
  return data.contact || data;
}

export function hasTag(contact, tag) {
  return Array.isArray(contact?.tags) && contact.tags.includes(tag);
}

// --- HubSpot ---

export async function hs(path, method = 'GET', body = null) {
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

export async function findHsContact(email) {
  if (!email) return null;
  const res = await hs('/crm/v3/contacts/search', 'POST', {
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email', 'firstname', 'lastname'],
    limit: 1,
  });
  return res.results?.[0] || null;
}

export async function createHsContact({ email, firstName, lastName, phone }) {
  return hs('/crm/v3/contacts', 'POST', {
    properties: {
      email: email || '',
      firstname: firstName || '',
      lastname: lastName || '',
      phone: phone || '',
      lifecyclestage: 'lead',
    },
  });
}

/** Returns true if HubSpot contact has at least one logged call from Quo. */
export async function hsContactHasCall(hsContactId) {
  const res = await hs(`/crm/v3/objects/contacts/${hsContactId}/associations/calls`);
  return (res.results?.length || 0) > 0;
}

/** Returns true if contact already has an MQL or higher deal. */
export async function hasAdvancedDeal(hsContactId) {
  const assoc = await hs(`/crm/v3/objects/contacts/${hsContactId}/associations/deals`);
  const ids = (assoc.results || []).map((r) => r.id);
  if (!ids.length) return false;
  const batch = await hs('/crm/v3/objects/deals/batch/read', 'POST', {
    inputs: ids.map((id) => ({ id })),
    properties: ['dealstage'],
  });
  return (batch.results || []).some((d) => ADVANCED_STAGES.has(d.properties?.dealstage));
}

export async function createMqlDeal(hsContactId, contactName) {
  const closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const deal = await hs('/crm/v3/objects/deals', 'POST', {
    properties: {
      dealname: `${contactName} — MQL via GHL CC + Quo Call`,
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

/** Full promotion check — requires CC in GHL + call in HubSpot. */
export async function maybePromote({ email, ghlContact, hsContact }) {
  const name =
    `${ghlContact?.firstName || ''} ${ghlContact?.lastName || ''}`.trim() ||
    hsContact?.properties?.firstname + ' ' + hsContact?.properties?.lastname ||
    email;

  // 1. CC check (GHL tag)
  if (!hasTag(ghlContact, 'card_connected')) {
    return { action: 'waiting', reason: 'no card_connected tag', email };
  }

  // 2. Call check (HubSpot engagement from Quo)
  const called = await hsContactHasCall(hsContact.id);
  if (!called) {
    return { action: 'waiting', reason: 'no call logged in HubSpot yet', email };
  }

  // 3. Already promoted?
  const already = await hasAdvancedDeal(hsContact.id);
  if (already) {
    return { action: 'skipped', reason: 'already MQL+', email };
  }

  // 4. Create MQL
  const deal = await createMqlDeal(hsContact.id, name.trim());
  return {
    action: 'mql_created',
    dealId: deal.id,
    dealName: deal.properties?.dealname,
    email,
  };
}
