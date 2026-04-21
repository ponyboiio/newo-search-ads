/**
 * GHL → webhook
 *
 * Listens for GHL events. When `card_connected` tag is added to a contact,
 * checks HubSpot for a Quo call engagement. If both conditions are met,
 * creates an MQL deal in HubSpot immediately.
 *
 * Also syncs new GHL contacts to HubSpot on ContactCreate.
 */

import {
  getGhlContact,
  findHsContact,
  createHsContact,
  hasTag,
  maybePromote,
} from './_lib.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', handler: 'ghl-webhook' });
  }
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const payload = req.body;

  if (payload.locationId && payload.locationId !== process.env.GHL_LOCATION_ID) {
    return res.status(401).json({ error: 'location mismatch' });
  }

  const eventType = payload.type || 'unknown';
  const contact = payload.contact || payload.contactData || {};
  const email = contact.email;

  console.log(`[ghl] ${eventType}`, { id: contact.id, email, tags: contact.tags });

  let result = { action: 'ignored', eventType };

  try {
    if (eventType === 'ContactCreate') {
      // Sync new GHL contact to HubSpot
      if (email) {
        let hsContact = await findHsContact(email);
        if (!hsContact) {
          hsContact = await createHsContact(contact);
          result = { action: 'contact_synced', hsContactId: hsContact?.id, email };
        } else {
          result = { action: 'contact_exists', hsContactId: hsContact.id, email };
        }
      }
    } else if (eventType === 'ContactUpdate') {
      // Only proceed if card_connected tag is present
      if (!hasTag(contact, 'card_connected')) {
        result = { action: 'ignored', reason: 'no card_connected tag' };
      } else {
        const hsContact = email ? await findHsContact(email) : null;
        if (!hsContact) {
          result = { action: 'skipped', reason: 'no HubSpot contact found', email };
        } else {
          result = await maybePromote({ email, ghlContact: contact, hsContact });
        }
      }
    }
  } catch (err) {
    console.error('[ghl] error:', err.message);
    result = { action: 'error', error: err.message };
  }

  console.log('[ghl] result:', result);
  return res.status(200).json({ ok: true, result });
}
