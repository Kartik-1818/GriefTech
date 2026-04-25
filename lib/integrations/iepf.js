// Isolated IEPF integration. IEPF (Investor Education and Protection Fund)
// has no public API for unclaimed dividends/shares lookup. Hooks for Setu
// or other aggregators exist below; today we use a deterministic mock.

function lookupMock(name, dob) {
  const hasName = !!(name && name.trim());
  if (!hasName) return { found: false };
  return {
    found: true,
    matches: [
      {
        company: 'Reliance Industries Ltd.',
        instrument: 'Unclaimed dividend (FY 2017-18)',
        status: 'Transferred to IEPF authority',
        action: 'File Form IEPF-5 on iepf.gov.in'
      },
      {
        company: 'Tata Steel Ltd.',
        instrument: 'Matured deposits / dividend',
        status: 'Eligible for refund',
        action: 'File Form IEPF-5 with shareholding proof'
      }
    ],
    source: 'mock'
  };
}

export async function lookupIepf(name, dob) {
  // Real provider hook (when key available):
  // if ((process.env.IEPF_PROVIDER || '').toLowerCase() === 'setu') { ... }
  return lookupMock(name, dob);
}
