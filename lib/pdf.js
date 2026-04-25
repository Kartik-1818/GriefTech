import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const DOC_DEFS = {
  epf_form_20: {
    title: 'FORM 20 — CLAIM FOR EPF ACCUMULATIONS ON DEATH OF A MEMBER',
    agency: 'EMPLOYEES\' PROVIDENT FUND ORGANISATION, INDIA',
    intro: 'Under Paragraph 72(5) of the Employees\' Provident Funds Scheme, 1952',
    lines: (p) => [
      ['1. Name of the deceased member', p.deceasedName || '—'],
      ['2. Father\'s / Husband\'s name', p.fatherName || '—'],
      ['3. UAN / PF Account Number', p?.assets?.uan || '—'],
      ['4. Date of death (dd / mm / yyyy)', fmt(p.dateOfDeath)],
      ['5. Last employer', p?.assets?.lastEmployer || '—'],
      ['6. Name of claimant', p.claimantName || '—'],
      ['7. Relationship with deceased', p.relationship || '—'],
      ['8. Address of claimant', p.address || '—'],
      ['9. Bank account (claimant)', p.bankAccount || '— (to be filled)'],
      ['10. IFSC code', p.ifsc || '— (to be filled)'],
      ['11. Claimant PAN', p.claimantPan || '— (to be filled)']
    ],
    declaration: 'I hereby certify that the above particulars are true to the best of my knowledge. I request the Commissioner to sanction the Provident Fund accumulations of the deceased member in my favour.'
  },
  epf_form_10d: {
    title: 'FORM 10D — CLAIM FOR PENSION ON DEATH OF A MEMBER',
    agency: 'EPS-1995, EMPLOYEES\' PROVIDENT FUND ORGANISATION',
    intro: 'Application for monthly pension to family pensioner under EPS-1995',
    lines: (p) => [
      ['1. Name of the deceased member', p.deceasedName || '—'],
      ['2. UAN / Pension Payment Order No.', p?.assets?.uan || '—'],
      ['3. Date of death', fmt(p.dateOfDeath)],
      ['4. Name of the family pensioner', p.claimantName || '—'],
      ['5. Relationship', p.relationship || '—'],
      ['6. Date of birth of pensioner', p.claimantDob || '— (to be filled)'],
      ['7. Bank account / IFSC', (p.bankAccount || '—') + ' / ' + (p.ifsc || '—')]
    ],
    declaration: 'I hereby apply for grant of family / widow pension under the Employees\' Pension Scheme, 1995.'
  },
  bank_transfer_letter: {
    title: 'APPLICATION FOR TRANSFER OF ACCOUNT ON DEATH OF DEPOSITOR',
    agency: 'To: The Branch Manager',
    intro: '',
    lines: (p) => [
      ['Subject', 'Transfer / settlement of account No. ' + (p?.assets?.bankAccount || '—')],
      ['Name of deceased', p.deceasedName || '—'],
      ['Date of death', fmt(p.dateOfDeath)],
      ['Branch', p?.assets?.bankBranch || '— (to be filled)'],
      ['Claimant', p.claimantName || '—'],
      ['Relationship', p.relationship || '—'],
      ['Claimant account (for credit)', (p.bankAccount || '—') + ' / ' + (p.ifsc || '—')]
    ],
    declaration: 'Respected Sir / Madam, I regret to inform you about the demise of the above account holder. Kindly freeze all debits and settle the balance in my favour as nominee / legal heir. The death certificate and my KYC are enclosed.'
  },
  insurance_claim_letter: {
    title: 'LIFE-INSURANCE DEATH CLAIM — NOMINEE INTIMATION LETTER',
    agency: 'To: The Claims Department',
    intro: '',
    lines: (p) => [
      ['Policy holder', p.deceasedName || '—'],
      ['Policy number', p?.assets?.policyNumber || '— (to be filled)'],
      ['Insurer', p?.assets?.insurer || '— (to be filled)'],
      ['Date of death', fmt(p.dateOfDeath)],
      ['Cause of death', p.causeOfDeath || '— (per death certificate)'],
      ['Nominee / claimant', p.claimantName || '—'],
      ['Relationship', p.relationship || '—'],
      ['Claimant bank / IFSC', (p.bankAccount || '—') + ' / ' + (p.ifsc || '—')]
    ],
    declaration: 'I, the nominee, hereby intimate the demise of the life-assured and request you to process the death-claim benefit under the above policy. Original policy bond, death certificate, nominee KYC and cancelled cheque are enclosed. Please process this claim within 30 days as per IRDAI norms.'
  },
  succession_cert_application: {
    title: 'APPLICATION FOR SUCCESSION CERTIFICATE',
    agency: 'In the Court of the District Judge, ' + '{district}',
    intro: 'Under Section 372 of the Indian Succession Act, 1925',
    lines: (p) => [
      ['Name of deceased', p.deceasedName || '—'],
      ['Date of death', fmt(p.dateOfDeath)],
      ['Place of death', p.state || '—'],
      ['Last residence', p.address || '—'],
      ['Petitioner', p.claimantName || '—'],
      ['Relationship', p.relationship || '—'],
      ['Debts & securities', '(attach Schedule A — list of assets)']
    ],
    declaration: 'The petitioner prays that a succession certificate be granted in respect of the debts and securities of the above-named deceased.'
  },
  death_cert_application: {
    title: 'APPLICATION FOR DEATH CERTIFICATE',
    agency: 'To: The Registrar of Births and Deaths',
    intro: 'Under the Registration of Births and Deaths Act, 1969',
    lines: (p) => [
      ['Name of deceased', p.deceasedName || '—'],
      ['Father/Husband name', p.fatherName || '—'],
      ['Date of death', fmt(p.dateOfDeath)],
      ['Place of death', p.placeOfDeath || p.state || '—'],
      ['Age at death', p.ageAtDeath || '— (to be filled)'],
      ['Name of informant', p.claimantName || '—'],
      ['Relationship', p.relationship || '—'],
      ['Address', p.address || '—'],
      ['Number of copies requested', '10']
    ],
    declaration: 'Kindly register the death and issue certified copies for use in legal, banking and insurance formalities. Medical certificate of death, ID proof of informant and locality proof are enclosed.'
  },
  property_mutation: {
    title: 'APPLICATION FOR MUTATION OF PROPERTY (ON DEATH OF OWNER)',
    agency: 'To: The Tehsildar / Sub-Registrar',
    intro: '',
    lines: (p) => [
      ['Name of deceased owner', p.deceasedName || '—'],
      ['Date of death', fmt(p.dateOfDeath)],
      ['Property address', p?.assets?.propertyAddress || '— (to be filled)'],
      ['Khasra / Survey No.', p?.assets?.surveyNo || '— (to be filled)'],
      ['Applicant / heir', p.claimantName || '—'],
      ['Relationship', p.relationship || '—'],
      ['State', p.state || '—']
    ],
    declaration: 'I request you to mutate the above property in my name as legal heir. Death certificate, legal-heir certificate, latest tax receipt and identity proof are enclosed.'
  }
};

function fmt(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB');
  } catch { return d; }
}

export async function generatePdf(docKey, profile) {
  const def = DOC_DEFS[docKey];
  if (!def) throw new Error('Unknown document: ' + docKey);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const teal = rgb(0.008, 0.502, 0.565);
  const grey = rgb(0.3, 0.3, 0.3);
  const dark = rgb(0.1, 0.1, 0.1);
  const light = rgb(0.92, 0.96, 0.96);

  // Header band
  page.drawRectangle({ x: 0, y: 782, width: 595, height: 60, color: teal });
  page.drawText('GriefTech', { x: 40, y: 810, size: 18, font: bold, color: rgb(1,1,1) });
  page.drawText('AI-generated legal form — verify before signing', { x: 40, y: 792, size: 9, font, color: rgb(1,1,1) });
  page.drawText('grieftech.in', { x: 500, y: 810, size: 10, font, color: rgb(1,1,1) });

  let y = 755;
  page.drawText(def.title, { x: 40, y, size: 13, font: bold, color: dark });
  y -= 18;
  page.drawText(def.agency, { x: 40, y, size: 10, font, color: grey });
  y -= 14;
  if (def.intro) {
    page.drawText(def.intro, { x: 40, y, size: 9, font, color: grey });
    y -= 18;
  } else { y -= 4; }

  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: teal });
  y -= 20;

  const lines = def.lines(profile || {});
  for (const [label, value] of lines) {
    page.drawRectangle({ x: 40, y: y - 6, width: 515, height: 22, color: light });
    page.drawText(String(label), { x: 48, y: y + 2, size: 10, font: bold, color: dark });
    const val = String(value || '—');
    page.drawText(val.length > 55 ? val.slice(0, 55) + '…' : val, { x: 240, y: y + 2, size: 10, font, color: dark });
    y -= 28;
    if (y < 160) break;
  }

  y -= 10;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: teal });
  y -= 20;
  page.drawText('Declaration', { x: 40, y, size: 11, font: bold, color: dark });
  y -= 16;
  const decl = def.declaration || '';
  const wrap = wrapText(decl, 95);
  for (const line of wrap) {
    page.drawText(line, { x: 40, y, size: 10, font, color: dark });
    y -= 14;
  }

  y -= 30;
  page.drawText('Signature of claimant: ________________________', { x: 40, y, size: 10, font, color: dark });
  page.drawText('Date: ___________', { x: 400, y, size: 10, font, color: dark });

  // Footer
  page.drawText('Generated by GriefTech • This is a pre-filled template to assist you. Please verify all fields with the respective authority before submission.',
    { x: 40, y: 40, size: 7.5, font, color: grey });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

function wrapText(text, maxLen) {
  const words = (text || '').split(/\s+/);
  const out = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLen) { out.push(cur.trim()); cur = w; }
    else { cur += ' ' + w; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
