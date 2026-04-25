// Isolated EPFO integration. Today this is a deterministic mock so the
// demo is reliable. Tomorrow plug in (a) a govt MoU + EPFO IES API or
// (b) a third-party aggregator (Setu / Karza / Signzy).
//
// Public contract:
//   lookupEpfo(uan) -> { found, uan?, employer?, member_id?, last_contribution?, eps_member?, nominee_on_record?, actions? }
//
// To plug a real provider, set EPFO_PROVIDER=setu|karza|signzy and the
// matching SETU_API_KEY / KARZA_API_KEY / SIGNZY_API_KEY env vars.

async function lookupViaSetu(uan) {
  const url = process.env.SETU_BASE_URL + '/v1/uan/' + encodeURIComponent(uan);
  const r = await fetch(url, {
    headers: {
      'x-client-id': process.env.SETU_CLIENT_ID,
      'x-client-secret': process.env.SETU_API_KEY,
      'Accept': 'application/json'
    }
  });
  if (!r.ok) throw new Error('Setu UAN lookup failed: ' + r.status);
  const data = await r.json();
  return {
    found: true,
    uan: data.uan,
    employer: data?.employer?.name || data?.establishment_name,
    member_id: data?.member_id,
    last_contribution: data?.last_contribution,
    eps_member: !!data?.eps,
    nominee_on_record: data?.nominee?.status || 'Pending update',
    actions: [
      { title: 'Submit Form 20 to claim the PF lump-sum', formKey: 'epf_form_20' },
      { title: 'Submit Form 10D to start the family pension', formKey: 'epf_form_10d' }
    ]
  };
}

function lookupMock(uan) {
  if (!uan) return { found: false, reason: 'No UAN provided.' };
  const cleaned = String(uan).replace(/\s+/g, '');
  if (cleaned.length < 10) return { found: false, reason: 'UAN must be 12 digits.' };
  const employers = [
    'Tata Consultancy Services Ltd.', 'Infosys Ltd.', 'HCL Technologies Ltd.',
    'Reliance Industries Ltd.', 'Larsen & Toubro Ltd.', 'Wipro Ltd.',
    'HDFC Bank Ltd.', 'ICICI Bank Ltd.', 'Maruti Suzuki India Ltd.'
  ];
  const idx = (cleaned.charCodeAt(0) + cleaned.charCodeAt(cleaned.length - 1)) % employers.length;
  return {
    found: true,
    uan: cleaned,
    employer: employers[idx],
    member_id: 'MH/BAN/' + cleaned.slice(-7) + '/000',
    last_contribution: 'March 2025',
    eps_member: true,
    nominee_on_record: cleaned.endsWith('1') ? 'Yes' : 'Pending update',
    actions: [
      { title: 'Submit Form 20 to claim the PF lump-sum', formKey: 'epf_form_20' },
      { title: 'Submit Form 10D to start the family pension', formKey: 'epf_form_10d' }
    ],
    source: 'mock'
  };
}

export async function lookupEpfo(uan) {
  const provider = (process.env.EPFO_PROVIDER || 'mock').toLowerCase();
  try {
    if (provider === 'setu' && process.env.SETU_API_KEY) return await lookupViaSetu(uan);
    // Add Karza / Signzy adapters here when keys are available.
  } catch (e) {
    // Fall back to mock so the UX never breaks.
    console.warn('EPFO live provider failed, falling back to mock:', e.message);
  }
  return lookupMock(uan);
}
