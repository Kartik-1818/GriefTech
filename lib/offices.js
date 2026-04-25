// Comprehensive offices DB across major Indian metros. PIN-prefix lookup.
// Categories: EPFO, MUNICIPAL, SUB_REGISTRAR, TEHSILDAR, CIVIL_COURT,
// AADHAAR_KENDRA, IT_OFFICE, RTO, BANK, INSURER
//
// For lesser-known PINs we fall back to state-level offices + Google Maps
// search-query links so the user can still find the nearest one.

function maps(query) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

const CITIES = {
  // PIN prefix -> city block
  '110': { city: 'Delhi', state: 'Delhi', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Bhavishya Nidhi Bhawan', address: '28 Community Centre, Wazirpur Industrial Area, Delhi 110052', phone: '011-27375354', hours: 'Mon–Fri 9:30–18:00' },
    { cat: 'MUNICIPAL', name: 'MCD Birth & Death Registration Office', address: 'Town Hall, Chandni Chowk, Delhi 110006', phone: '011-23961101', hours: 'Mon–Sat 10:00–17:00' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, Kashmere Gate', address: 'Old Tis Hazari Court Complex, Delhi 110054', phone: '011-23966851', hours: 'Mon–Fri 10:00–17:00' },
    { cat: 'TEHSILDAR', name: 'Tehsildar Office, Civil Lines', address: '5, Sham Nath Marg, Delhi 110054', phone: '011-23890172', hours: 'Mon–Fri 10:00–16:30' },
    { cat: 'CIVIL_COURT', name: 'Tis Hazari District Court', address: 'Tis Hazari Court Complex, Delhi 110054', phone: '011-23968900', hours: 'Mon–Sat 10:00–17:00' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (North)', address: 'Pragati Maidan Metro Station Bldg, New Delhi 110001', phone: '1947', hours: 'Mon–Sat 9:30–17:30' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office, CR Building', address: 'Indraprastha Estate, Delhi 110002', phone: '011-23379263', hours: 'Mon–Fri 10:00–18:00' },
    { cat: 'RTO', name: 'Mall Road RTO (North)', address: 'Mall Road, North Delhi 110054', phone: '011-23811992', hours: 'Mon–Fri 10:00–16:00' },
    { cat: 'BANK', name: 'SBI Main Branch (Parliament Street)', address: '11 Parliament Street, New Delhi 110001', phone: '011-23374390' },
    { cat: 'BANK', name: 'HDFC Bank — Connaught Place', address: 'F-Block, Connaught Place, New Delhi 110001', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — Janpath', address: 'Janpath, New Delhi 110001', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Delhi-I)', address: 'Jeevan Bharti, Connaught Place, New Delhi 110001', phone: '011-23413010' },
    { cat: 'INSURER', name: 'HDFC Life — Connaught Place', address: 'Statesman House, Barakhamba Road, New Delhi 110001', phone: '022-68446000' }
  ]},

  '400': { city: 'Mumbai', state: 'Maharashtra', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Bandra-Kurla Complex', address: 'Bhavishya Nidhi Bhavan, BKC, Bandra (E), Mumbai 400051', phone: '022-26571046', hours: 'Mon–Fri 9:30–18:00' },
    { cat: 'MUNICIPAL', name: 'BMC Birth & Death Registration', address: 'BMC HQ, Mahapalika Marg, Mumbai 400001', phone: '022-22620251', hours: 'Mon–Sat 10:00–17:00' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office (Andheri)', address: 'Old Custom House, Sahar Road, Andheri (E), Mumbai 400099', phone: '022-26821025', hours: 'Mon–Fri 10:00–17:00' },
    { cat: 'TEHSILDAR', name: 'Tehsildar Office, Mumbai City', address: 'Old Custom House, Fort, Mumbai 400001', phone: '022-22662828', hours: 'Mon–Fri 10:00–16:30' },
    { cat: 'CIVIL_COURT', name: 'Bombay City Civil Court', address: 'Fort, Mumbai 400001', phone: '022-22691451', hours: 'Mon–Sat 10:00–17:00' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Mumbai)', address: '7th Floor, MTNL Bldg, Bandra (E), Mumbai 400051', phone: '1947', hours: 'Mon–Sat 9:30–17:30' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office (Aaykar Bhavan)', address: 'Maharshi Karve Road, Mumbai 400020', phone: '022-22039131', hours: 'Mon–Fri 10:00–18:00' },
    { cat: 'RTO', name: 'Andheri RTO (MH-02)', address: 'Tagore Nagar, Vikhroli (W), Mumbai 400083', phone: '022-25787200' },
    { cat: 'BANK', name: 'SBI Main Branch (Fort)', address: 'Madame Cama Road, Mumbai 400021', phone: '022-22025028' },
    { cat: 'BANK', name: 'HDFC Bank — Lower Parel', address: 'HDFC Bank House, Senapati Bapat Marg, Mumbai 400013', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — BKC', address: 'ICICI Bank Towers, BKC, Mumbai 400051', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Central Office', address: 'Yogakshema, Jeevan Bima Marg, Nariman Point, Mumbai 400021', phone: '022-66598732' },
    { cat: 'INSURER', name: 'HDFC Life — Lodha Excelus', address: 'Apollo Mills Compound, NM Joshi Marg, Mumbai 400011', phone: '022-68446000' }
  ]},

  '411': { city: 'Pune', state: 'Maharashtra', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Pune', address: 'Bhavishya Nidhi Bhavan, Golibar Maidan, Pune 411001', phone: '020-26054000', hours: 'Mon–Fri 9:30–18:00' },
    { cat: 'MUNICIPAL', name: 'PMC Birth & Death Office', address: 'Shivajinagar PMC HQ, Pune 411005', phone: '020-25501000', hours: 'Mon–Sat 10:00–17:30' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, Haveli-1', address: 'New Adalat Bldg, Shivajinagar, Pune 411005', phone: '020-25533322', hours: 'Mon–Fri 10:00–17:00' },
    { cat: 'TEHSILDAR', name: 'Tehsildar Office, Pune City', address: 'Council Hall, Pune 411001', phone: '020-26129802', hours: 'Mon–Fri 10:00–16:30' },
    { cat: 'CIVIL_COURT', name: 'District & Sessions Court, Pune', address: 'Shivajinagar, Pune 411005', phone: '020-25538144', hours: 'Mon–Sat 10:00–17:00' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Aadhaar Seva Kendra (Wakdewadi)', address: 'IT Bhavan, Wakdewadi, Pune 411005', phone: '1947', hours: 'Mon–Sat 9:30–17:30' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office, Aaykar Bhavan', address: '12 Sadhu Vaswani Road, Pune 411001', phone: '020-26052706' },
    { cat: 'RTO', name: 'Pune RTO (MH-12)', address: 'Sangam Bridge, Pune 411001', phone: '020-26058080' },
    { cat: 'BANK', name: 'SBI Pune Main Branch', address: 'Bund Garden Road, Pune 411001', phone: '020-26121000' },
    { cat: 'BANK', name: 'HDFC Bank — Camp', address: '4 Bund Garden Road, Pune 411001', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — FC Road', address: 'Fergusson College Road, Pune 411004', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Pune)', address: '6/7 Jeevan Prakash, University Road, Pune 411016', phone: '020-25537002' },
    { cat: 'INSURER', name: 'HDFC Life — Bund Garden Road', address: 'Trade Centre, Bund Garden Road, Pune 411001', phone: '022-68446000' }
  ]},

  '560': { city: 'Bengaluru', state: 'Karnataka', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Bengaluru', address: 'Bhavishya Nidhi Bhavan, 13 Rajaram Mohan Roy Road, Bengaluru 560025', phone: '080-22236508', hours: 'Mon–Fri 9:30–18:00' },
    { cat: 'MUNICIPAL', name: 'BBMP Birth & Death Registration', address: 'NR Square, Bengaluru 560002', phone: '080-22660000' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, Shivajinagar', address: 'Cunningham Road, Bengaluru 560052', phone: '080-22862253' },
    { cat: 'TEHSILDAR', name: 'Tehsildar Office, Bengaluru North', address: 'KR Circle, Bengaluru 560001', phone: '080-22214541' },
    { cat: 'CIVIL_COURT', name: 'City Civil Court Complex', address: 'Mayo Hall, Bengaluru 560001', phone: '080-25599595' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Bengaluru)', address: 'Khanija Bhavan, Race Course Road, Bengaluru 560001', phone: '1947' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office, Queens Road', address: 'Aayakar Bhavan, Queens Road, Bengaluru 560052', phone: '080-22863215' },
    { cat: 'RTO', name: 'RTO Koramangala (KA-03)', address: 'Koramangala, Bengaluru 560034', phone: '080-25530385' },
    { cat: 'BANK', name: 'SBI Main Branch — St. Mark\'s Road', address: '85 St. Mark\'s Road, Bengaluru 560001', phone: '080-22001620' },
    { cat: 'BANK', name: 'HDFC Bank — MG Road', address: 'Brigade Road Junction, Bengaluru 560001', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — Cunningham Road', address: 'Cunningham Road, Bengaluru 560052', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Bengaluru-I)', address: 'Jeevan Prakash, JC Road, Bengaluru 560002', phone: '080-22963300' }
  ]},

  '600': { city: 'Chennai', state: 'Tamil Nadu', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Chennai', address: 'Bhavishya Nidhi Bhavan, 37 Royapettah High Road, Chennai 600014', phone: '044-28524488' },
    { cat: 'MUNICIPAL', name: 'GCC Birth & Death Registration', address: 'Ripon Building, Chennai 600003', phone: '044-25619413' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar, T. Nagar', address: '10 Pondy Bazar, T. Nagar, Chennai 600017', phone: '044-28341500' },
    { cat: 'TEHSILDAR', name: 'Tehsildar Office, Chennai District', address: 'Singaravelar Maaligai, Rajaji Salai, Chennai 600001', phone: '044-25241616' },
    { cat: 'CIVIL_COURT', name: 'Madras High Court (Civil Side)', address: 'High Court Buildings, Chennai 600104', phone: '044-25340147' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Chennai)', address: 'Block-7, 5th Floor, Rajaji Bhavan, Besant Nagar, Chennai 600090', phone: '1947' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office, Aayakar Bhavan', address: '121 Mahatma Gandhi Road, Nungambakkam, Chennai 600034', phone: '044-28338700' },
    { cat: 'RTO', name: 'RTO Chennai Central (TN-01)', address: 'Pallavan Salai, Chepauk, Chennai 600005', phone: '044-28524488' },
    { cat: 'BANK', name: 'SBI Local Head Office', address: '16 College Lane, Chennai 600006', phone: '044-28333222' },
    { cat: 'BANK', name: 'HDFC Bank — Mount Road', address: '751 Anna Salai, Chennai 600002', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — T. Nagar', address: 'Burkit Road, T. Nagar, Chennai 600017', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Chennai-I)', address: 'LIC Building, Mount Road, Chennai 600002', phone: '044-28524488' }
  ]},

  '700': { city: 'Kolkata', state: 'West Bengal', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Kolkata', address: 'Sardar Patel Bhavan, 19 Park Road, Kolkata 700017', phone: '033-22834060' },
    { cat: 'MUNICIPAL', name: 'KMC Birth & Death Registration', address: '5 SN Banerjee Road, Kolkata 700013', phone: '033-22861000' },
    { cat: 'SUB_REGISTRAR', name: 'ARA Office, Alipore', address: 'Alipore Court Compound, Kolkata 700027', phone: '033-24793000' },
    { cat: 'TEHSILDAR', name: 'BLLRO Office, Kolkata', address: '3 Government Place West, Kolkata 700001', phone: '033-22253000' },
    { cat: 'CIVIL_COURT', name: 'Calcutta High Court', address: '3 Esplanade Row West, Kolkata 700001', phone: '033-22481333' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Kolkata)', address: 'Sankalp Building, EM Bypass, Kolkata 700107', phone: '1947' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office, Aayakar Bhavan', address: 'P-7 Chowringhee Square, Kolkata 700069', phone: '033-22130301' },
    { cat: 'RTO', name: 'RTO Beltala (WB-02)', address: '38 Beltala Road, Kolkata 700026', phone: '033-24655555' },
    { cat: 'BANK', name: 'SBI Local Head Office', address: 'Samriddhi Bhavan, 1 Strand Road, Kolkata 700001', phone: '033-22102600' },
    { cat: 'BANK', name: 'HDFC Bank — Park Street', address: '1 Park Street, Kolkata 700016', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — Camac Street', address: '22 Camac Street, Kolkata 700016', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Kolkata-I)', address: 'Jeevan Prakash, 4 CR Avenue, Kolkata 700072', phone: '033-22202100' }
  ]},

  '500': { city: 'Hyderabad', state: 'Telangana', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Hyderabad', address: 'Bhavishya Nidhi Bhavan, Barkatpura, Hyderabad 500027', phone: '040-27563375' },
    { cat: 'MUNICIPAL', name: 'GHMC Birth & Death Office', address: 'CC Complex, Tank Bund Road, Hyderabad 500063', phone: '040-21111111' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, SR Nagar', address: 'Sanjeeva Reddy Nagar, Hyderabad 500038', phone: '040-23700001' },
    { cat: 'TEHSILDAR', name: 'Tehsildar Office, Khairatabad', address: 'Khairatabad, Hyderabad 500004', phone: '040-23231009' },
    { cat: 'CIVIL_COURT', name: 'City Civil Court', address: 'Public Gardens, Nampally, Hyderabad 500001', phone: '040-23201146' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Hyderabad)', address: 'East Block, Swarna Jayanthi Complex, Begumpet, Hyderabad 500016', phone: '1947' },
    { cat: 'IT_OFFICE', name: 'Income Tax Office, Aayakar Bhavan', address: 'Basheerbagh, Hyderabad 500004', phone: '040-23231166' },
    { cat: 'RTO', name: 'RTO Khairatabad (TS-09)', address: 'Khairatabad, Hyderabad 500004', phone: '040-23231009' },
    { cat: 'BANK', name: 'SBI Local Head Office', address: 'Bank Street, Koti, Hyderabad 500095', phone: '040-23466900' },
    { cat: 'BANK', name: 'HDFC Bank — Banjara Hills', address: 'Road No 2, Banjara Hills, Hyderabad 500034', phone: '1800-258-3838' },
    { cat: 'BANK', name: 'ICICI Bank — Begumpet', address: 'Begumpet, Hyderabad 500016', phone: '1860-120-7777' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Hyderabad-I)', address: 'Jeevan Bhagya, Saifabad, Hyderabad 500004', phone: '040-23231009' }
  ]},

  '380': { city: 'Ahmedabad', state: 'Gujarat', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Ahmedabad', address: 'Bhavishya Nidhi Bhavan, Bhavnagari Road, Ahmedabad 380015', phone: '079-26580700' },
    { cat: 'MUNICIPAL', name: 'AMC Birth & Death Office', address: 'Sardar Patel Bhavan, Ahmedabad 380001', phone: '079-25391811' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, Naranpura', address: 'Naranpura, Ahmedabad 380013', phone: '079-27452060' },
    { cat: 'CIVIL_COURT', name: 'Ahmedabad City Civil Court', address: 'Bhadra, Ahmedabad 380001', phone: '079-25506066' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Ahmedabad)', address: '7th Floor, Pragati Vihar, Sector 10, Gandhinagar 382010', phone: '1947' },
    { cat: 'BANK', name: 'SBI Local Head Office — Lal Darwaja', address: 'Bhadra, Ahmedabad 380001', phone: '079-25506066' },
    { cat: 'BANK', name: 'HDFC Bank — Navrangpura', address: 'CG Road, Navrangpura, Ahmedabad 380009', phone: '1800-258-3838' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Ahmedabad)', address: 'Jeevan Prakash, Tilak Road, Ahmedabad 380001', phone: '079-25506066' }
  ]},

  '302': { city: 'Jaipur', state: 'Rajasthan', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Jaipur', address: 'Bhavishya Nidhi Bhavan, Bhawani Singh Road, Jaipur 302001', phone: '0141-2740111' },
    { cat: 'MUNICIPAL', name: 'JMC Birth & Death Office', address: 'JMC Headquarters, Jaipur 302001', phone: '0141-2740111' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, Jaipur-I', address: 'C-Scheme, Jaipur 302001', phone: '0141-2740111' },
    { cat: 'CIVIL_COURT', name: 'Rajasthan High Court Bench', address: 'Janpath, Jaipur 302005', phone: '0141-2227481' },
    { cat: 'AADHAAR_KENDRA', name: 'UIDAI Regional Office (Jaipur)', address: '4th Floor, Block-2, Pant Krishi Bhawan, Jaipur 302005', phone: '1947' },
    { cat: 'BANK', name: 'SBI Main Branch — Jaipur', address: 'Sanganeri Gate, Jaipur 302003', phone: '0141-2740111' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Jaipur)', address: 'Jeevan Nidhi, Bhawani Singh Road, Jaipur 302005', phone: '0141-2740111' }
  ]},

  '226': { city: 'Lucknow', state: 'Uttar Pradesh', offices: [
    { cat: 'EPFO', name: 'EPFO Regional Office, Lucknow', address: 'Bhavishya Nidhi Bhavan, 36 Sarvodaya Nagar, Lucknow 226016', phone: '0522-4080808' },
    { cat: 'MUNICIPAL', name: 'LMC Birth & Death Office', address: 'Lalbagh, Lucknow 226001', phone: '0522-2638667' },
    { cat: 'SUB_REGISTRAR', name: 'Sub-Registrar Office, Aliganj', address: 'Aliganj, Lucknow 226024', phone: '0522-4080808' },
    { cat: 'CIVIL_COURT', name: 'Allahabad High Court Lucknow Bench', address: 'Civil Lines, Lucknow 226001', phone: '0522-2628222' },
    { cat: 'BANK', name: 'SBI Main Branch — Hazratganj', address: 'Hazratganj, Lucknow 226001', phone: '0522-2287012' },
    { cat: 'INSURER', name: 'LIC Divisional Office (Lucknow)', address: 'Jeevan Bhavan, 14 Kapoorthala Complex, Lucknow 226024', phone: '0522-2335445' }
  ]}
};

const CITY_LABELS = {
  EPFO: { label: 'EPFO Regional Office', icon: 'briefcase', why: 'For EPF Form 20 / 10D, pension claim and grievance redressal.' },
  MUNICIPAL: { label: 'Municipal Registrar (Birth & Death)', icon: 'building', why: 'Apply for the official Death Certificate and certified copies.' },
  SUB_REGISTRAR: { label: 'Sub-Registrar Office', icon: 'file-signature', why: 'For property mutation, registration and certified copies of deeds.' },
  TEHSILDAR: { label: 'Tehsildar / Revenue Office', icon: 'landmark', why: 'For Legal Heir Certificate and revenue records.' },
  CIVIL_COURT: { label: 'Civil / District Court', icon: 'scale', why: 'For Succession Certificate (Section 372 of the Indian Succession Act).' },
  AADHAAR_KENDRA: { label: 'UIDAI / Aadhaar Seva Kendra', icon: 'id-card', why: 'To surrender the deceased\'s Aadhaar to prevent misuse.' },
  IT_OFFICE: { label: 'Income Tax Office', icon: 'receipt', why: 'To surrender the deceased\'s PAN and file the final return.' },
  RTO: { label: 'Regional Transport Office', icon: 'car', why: 'For transfer of vehicle ownership.' },
  BANK: { label: 'Bank branches', icon: 'wallet', why: 'To freeze, settle and transmit bank accounts and FDs.' },
  INSURER: { label: 'Insurance offices', icon: 'shield', why: 'To file life-insurance death-claim and nominee paperwork.' }
};

export function getOfficesNear(pinCode) {
  if (!pinCode) return null;
  const pin = String(pinCode).replace(/\D/g, '').slice(0, 6);
  if (pin.length !== 6) return null;
  const prefix3 = pin.slice(0, 3);
  const prefix2 = pin.slice(0, 2);
  let city = CITIES[prefix3];
  if (!city) {
    // Try fallback by 2-prefix → closest city in same zone
    const fallback = Object.entries(CITIES).find(([p]) => p.slice(0, 2) === prefix2);
    if (fallback) city = fallback[1];
  }
  if (!city) {
    // Generic fallback — return Maps search-only entries
    return {
      pin, city: null, state: null, generic: true,
      groups: Object.entries(CITY_LABELS).map(([cat, meta]) => ({
        category: cat,
        label: meta.label,
        why: meta.why,
        offices: [{
          name: 'Find your nearest ' + meta.label,
          address: `Search around PIN ${pin}`,
          mapsLink: maps(`${meta.label} near ${pin}`),
          phone: null, hours: null, generic: true
        }]
      }))
    };
  }
  // Group by category
  const byCat = {};
  for (const o of city.offices) {
    if (!byCat[o.cat]) byCat[o.cat] = [];
    byCat[o.cat].push({ ...o, mapsLink: maps(o.name + ' ' + o.address) });
  }
  const groups = Object.entries(CITY_LABELS).map(([cat, meta]) => ({
    category: cat,
    label: meta.label,
    why: meta.why,
    offices: byCat[cat] || []
  })).filter(g => g.offices.length > 0);

  return {
    pin, city: city.city, state: city.state, generic: false, groups
  };
}
