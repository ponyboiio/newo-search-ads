/**
 * HubSpot → webhook (triggered by HubSpot Workflow when Quo logs a call)
 *
 * When an SDR completes a call via Quo, HubSpot Workflow POSTs here with
 * the contact's ID and email. We check GHL for the `card_connected` tag.
 * If CC is attached, we create the MQL deal immediately.
 *
 * HubSpot Workflow setup:
 *   Trigger: Call engagement created
 *   Action:  Send webhook → POST https://<your-domain>/api/hs-call-webhook
 *   Body:    { "contactId": "{{contact.id}}", "email": "{{contact.email}}" }
 */

import {
  getGhlContactByEmail,
  findHsContact,
  hs,
  hasTag,
  maybePromote,
} from './_lib.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', handler: 'hs-call-webhook' });
  }
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // HubSpot Workflow sends an array of enrolled objects
  // Shape: [{ "objectId": 123, "properties": { "email": "...", ... } }]
  // OR a custom body if you configure it as JSON
  const body = req.body;

  // Support both HubSpot native webhook format and custom JSON body
  let contactId, email;

  if (Array.isArray(body)) {
    // Native HubSpot webhook format
    const obj = body[0];
    contactId = String(obj.objectId || obj.vid || '');
    email = obj.properties?.email?.value || obj.properties?.email || '';
  } else {
    // Custom JSON body from Workflow webhook action
    contactId = String(body.contactId || '');
    email = body.email || '';
  }

  console.log('[hs-call] call logged', { contactId, email });

  if (!email && !contactId) {
    return res.status(400).json({ error: 'missing contactId or email' });
  }

  let result = { action: 'ignored' };

  try {
    // Get full HubSpot contact
    let hsContact;
    if (contactId) {
      const data = await hs(`/crm/v3/contacts/${contactId}?properties=email,firstname,lastname`);
      hsContact = data;
      email = email || data.properties?.email;
    } else {
      hsContact = await findHsContact(email);
    }

    if (!hsContact?.id) {
      return res.status(200).json({ ok: true, result: { action: 'skipped', reason: 'no HubSpot contact' } });
    }

    // Look up GHL contact by email
    const ghlContact = email ? await getGhlContactByEmail(email) : null;

    if (!ghlContact) {
      result = { action: 'waiting', reason: 'contact not in GHL', email };
    } else if (!hasTag(ghlContact, 'card_connected')) {
      result = { action: 'waiting', reason: 'no card_connected tag in GHL', email };
    } else {
      result = await maybePromote({ email, ghlContact, hsContact });
    }
  } catch (err) {
    console.error('[hs-call] error:', err.message);
    result = { action: 'error', error: err.message };
  }

  console.log('[hs-call] result:', result);
  return res.status(200).json({ ok: true, result });
}
