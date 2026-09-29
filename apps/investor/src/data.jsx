// data.jsx - mock data for the CredX investor portal

const INVESTOR = {
  name: "Dorant Gashi",
  initials: "DG",
  email: "d.gashi@example.co.uk",
  classification: "Sophisticated Investor",
  accountId: "CX-INV-0421",
  // If the investor has an offline-negotiated NDA already on file (uploaded
  // by CredX admin), this object pre-unlocks Tier 2 content with no modal.
  // Set to null for retail / self-cert investors.
  institutionalNda: null,
  // institutionalNda: { entity: "Whitestone Capital Partners LLP", signedAt: "2026-03-14T10:22:00Z" },
  rm: { name: "CredX Investor Team", title: "Funder Relations", email: "info@credx.co.uk", phone: "0204 628 0990" },
};

const COMPANY = {
  name: "CredX Ltd",
  no: "16640225",
  ico: "ZB991146",
  address: "Suite F16, St George's Business Park, Sittingbourne, Kent ME10 3TB",
  email: "info@credx.co.uk",
  phone: "0204 628 0990",
  web: "credx.co.uk",
};

// Live (active) deals - already deployed
const LIVE_DEALS = [
  {
    id: "CX-2604-K",
    title: "Sevenoaks Mixed-Use Refinance",
    property: "Sevenoaks, Kent · Mixed-use",
    type: "Commercial",
    position: 250000,
    rate: 11.4,
    term: 9,
    drawn: "14 Feb 2026",
    maturity: "14 Nov 2026",
    progress: 0.62,
    status: "live",
    ltv: 0.58,
    interestAccrued: 8842.50,
    nextEvent: { date: "01 Jun 2026", label: "Quarterly interest payment" },
    security: "First legal charge - Title K-4421AB",
    borrower: "Hawthorn Sevenoaks Holdings Ltd",
    purpose: "Refinance of existing senior debt pending sale of two adjoining units.",
    facilityRef: "JMW-FA-2604",
  },
  {
    id: "CX-2598-K",
    title: "Tunbridge Wells Office Acquisition",
    property: "Tunbridge Wells · Commercial office",
    type: "Commercial",
    position: 175000,
    rate: 11.0,
    term: 6,
    drawn: "03 Mar 2026",
    maturity: "03 Sep 2026",
    progress: 0.47,
    status: "live",
    ltv: 0.55,
    interestAccrued: 4218.75,
    nextEvent: { date: "03 Jun 2026", label: "Monthly interest payment" },
    security: "First legal charge - Title TW-7711",
    borrower: "Vellum Estates Ltd",
    purpose: "Acquisition of vacant Class E office, light refurbishment, onward letting.",
    facilityRef: "JMW-FA-2598",
  },
  {
    id: "CX-2581-R",
    title: "Whitstable Residential Auction",
    property: "Whitstable · Detached residential",
    type: "Residential",
    position: 95000,
    rate: 10.5,
    term: 4,
    drawn: "21 Mar 2026",
    maturity: "21 Jul 2026",
    progress: 0.55,
    status: "live",
    ltv: 0.52,
    interestAccrued: 1769.00,
    nextEvent: { date: "21 Jun 2026", label: "Monthly interest payment" },
    security: "First legal charge - Title CT-5022",
    borrower: "S. & P. Lourens",
    purpose: "Auction purchase pending mortgage; clear exit via Atom Bank offer in principle.",
    facilityRef: "JMW-FA-2581",
  },
  {
    id: "CX-2572-D",
    title: "Maidstone Light Industrial",
    property: "Maidstone · Light industrial unit",
    type: "Commercial",
    position: 320000,
    rate: 11.75,
    term: 12,
    drawn: "08 Jan 2026",
    maturity: "08 Jan 2027",
    progress: 0.35,
    status: "live",
    ltv: 0.61,
    interestAccrued: 12533.30,
    nextEvent: { date: "08 Jun 2026", label: "Quarterly interest payment" },
    security: "First legal charge - Title ME-9134",
    borrower: "Aldred Industrial Ltd",
    purpose: "Bridge to refinance with high-street commercial lender post-letting.",
    facilityRef: "JMW-FA-2572",
  },
  {
    id: "CX-2540-K",
    title: "Canterbury HMO Conversion",
    property: "Canterbury · Residential HMO",
    type: "Residential",
    position: 140000,
    rate: 10.95,
    term: 8,
    drawn: "12 Oct 2025",
    maturity: "12 Jun 2026",
    progress: 0.88,
    status: "live",
    ltv: 0.49,
    interestAccrued: 11198.40,
    nextEvent: { date: "12 Jun 2026", label: "Redemption scheduled" },
    security: "First legal charge - Title CB-3308",
    borrower: "Ellingsworth Properties Ltd",
    purpose: "Conversion of period semi to six-bed HMO with onward refinance to Foundation.",
    facilityRef: "JMW-FA-2540",
  },
  {
    id: "CX-2511-R",
    title: "Folkestone Residential Refurb",
    property: "Folkestone · Residential",
    type: "Residential",
    position: 60000,
    rate: 10.25,
    term: 5,
    drawn: "29 Dec 2025",
    maturity: "29 May 2026",
    progress: 0.97,
    status: "pending",
    ltv: 0.46,
    interestAccrued: 2562.50,
    nextEvent: { date: "29 May 2026", label: "Awaiting redemption funds" },
    security: "First legal charge - Title FO-2204",
    borrower: "Mr. R. P. Bell",
    purpose: "Refurb-to-let with refinance via Together Money - completion imminent.",
    facilityRef: "JMW-FA-2511",
  },
];

// Open opportunities - not yet deployed
//
// Each opportunity carries three blocks of richer data sourced from the
// real CredX documents:
//   • security    - property, tenure, valuation breakdown for the term sheet
//   • dip         - key Decision in Principle terms (reference, validity, fees,
//                   conditions). Borrower-identifying fields are intentionally
//                   redacted ("Available upon NDA") in the investor-facing view.
//   • documents   - the four canonical investor documents per deal:
//                   Investor Term Sheet · DIP · Valuation Report · Title Plan.
const OPPORTUNITIES = [
  {
    id: "CX-2618-K",
    title: "Ashford Retail Parade",
    property: "Ashford, Kent · 4 retail units + 2 flats",
    type: "Commercial",
    category: "Commercial bridging",
    chargeType: "First",
    typeTag: "Bridging",
    facility: 480000,
    rate: 11.5,
    term: 9,
    ltv: 0.59,
    min: 25000,
    raisedPct: 0.42,
    closes: "06 Jun 2026",
    hot: true,
    summary: "Refinance of existing senior facility with onward sale of two units underwritten.",
    bullets: [
      "First legal charge over a three-storey freehold parade",
      "DV £810k (Cushman & Wakefield, Mar 2026), 95% rented at £58k pa",
      "Exit: confirmed sale of units 3 & 4 to neighbouring operator at £390k",
    ],
    security: {
      tenure: "Freehold (Title No. K442101)",
      description: "Three-storey, mid-terrace mixed-use parade comprising four ground-floor retail units (Class E) and two two-bedroom flats above. GIA c.4,200 sqft.",
      tenancy: "95% let - combined passing rent £58,000 pa across 4 retail leases plus 2 ASTs",
      councilTax: "Mixed-use",
      epc: "EPC Bands C-D across units, MEES-compliant",
      marketValue: 810000,
      restricted180: 810000,
      restricted90: 729000,
      valuer: "Cushman & Wakefield",
      valuationDate: "12 Mar 2026",
      valuerRef: "CW-A6204",
      monthlyRent: 4833,
    },
    dip: {
      reference: "CXP-618",
      date: "08 May 2026",
      validity: "14 days",
      product: "Bridging Loan",
      borrowerRate: 14.5,
      monthlyInterest: 5800,
      term: 9,
      minTerm: 3,
      grossLoan: 480000,
      netDrawdown: 410000,
      arrangementFee: 9600,
      brokerFee: 4800,
      setupFee: 1495,
      retainedInterest: 52200,
      applicationFee: 495,
      redemptionFee: 500,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Confirmed onward-sale heads of terms for units 3 & 4 to be provided pre-completion",
        "Existing senior lender to provide settlement figure within 5 working days of drawdown",
        "Buildings insurance with CredX noted as interested party",
      ],
    },
  },
  {
    id: "CX-2619-R",
    title: "Sandgate Coastal Residence",
    property: "Sandgate · Detached residential",
    type: "Residential",
    category: "Residential bridging",
    chargeType: "First",
    typeTag: "Bridging",
    facility: 220000,
    rate: 10.75,
    term: 6,
    ltv: 0.51,
    min: 25000,
    raisedPct: 0.18,
    closes: "10 Jun 2026",
    hot: false,
    summary: "Auction purchase pending high-street remortgage. AIP issued by Atom Bank.",
    bullets: [
      "First legal charge over a freehold detached residence",
      "RICS valuation £435k (Apr 2026); LTV 51%",
      "Exit: mortgage offer received, completion booked",
    ],
    security: {
      tenure: "Freehold (Title No. K721883)",
      description: "Detached 4-bedroom freehold residence (c.1920), arranged over ground and first floors with pitched tiled roof. GIA c.1,650 sqft, west-facing rear garden, off-street parking.",
      tenancy: "Vacant possession on completion",
      councilTax: "Band E",
      epc: "EPC Band D (62), valid to 18 Aug 2031 - MEES-compliant",
      marketValue: 435000,
      restricted180: 435000,
      restricted90: 391500,
      valuer: "Validate Desktop+",
      valuationDate: "18 Apr 2026",
      valuerRef: "VA-014812",
      monthlyRent: 1450,
    },
    dip: {
      reference: "CXP-619",
      date: "21 Apr 2026",
      validity: "14 days",
      product: "Bridging Loan",
      borrowerRate: 13.75,
      monthlyInterest: 2520,
      term: 6,
      minTerm: 3,
      grossLoan: 220000,
      netDrawdown: 198000,
      arrangementFee: 4400,
      brokerFee: 2200,
      setupFee: 1495,
      retainedInterest: 15125,
      applicationFee: 495,
      redemptionFee: 250,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Atom Bank mortgage AIP to remain valid through to redemption",
        "Up-to-date redemption statement from Atom Bank required pre-completion",
        "Credible exit plan with documentary evidence (per DIP)",
      ],
    },
  },
  {
    id: "CX-2620-K",
    title: "Rochester Office Acquisition",
    property: "Rochester · Class E office building",
    type: "Commercial",
    category: "Commercial bridging",
    chargeType: "First",
    typeTag: "Bridging",
    facility: 390000,
    rate: 11.25,
    term: 8,
    ltv: 0.56,
    min: 25000,
    raisedPct: 0.34,
    closes: "08 Jun 2026",
    hot: false,
    summary: "Acquisition of a vacant freehold office for refurb-to-let, with refinance to a commercial term lender.",
    bullets: [
      "First legal charge over a freehold Class E office",
      "RICS valuation £695k (Apr 2026); LTV 56%",
      "Exit: refinance via Allica Bank on completion of letting",
    ],
    security: {
      tenure: "Freehold (Title No. K801232)",
      description: "Three-storey end-of-terrace Class E office building (c.1985), recently vacated. GIA c.3,900 sqft, on-site parking for 6 vehicles.",
      tenancy: "Vacant - refurb-to-let strategy with target completion Q4 2026",
      councilTax: "Commercial",
      epc: "EPC Band C (68), valid to 14 Feb 2034",
      marketValue: 695000,
      restricted180: 695000,
      restricted90: 625500,
      valuer: "Knight Frank",
      valuationDate: "02 Apr 2026",
      valuerRef: "KF-K2204",
      monthlyRent: 5200,
    },
    dip: {
      reference: "CXP-620",
      date: "30 Apr 2026",
      validity: "14 days",
      product: "Bridging Loan",
      borrowerRate: 14.25,
      monthlyInterest: 4631,
      term: 8,
      minTerm: 3,
      grossLoan: 390000,
      netDrawdown: 332000,
      arrangementFee: 7800,
      brokerFee: 3900,
      setupFee: 1495,
      retainedInterest: 37050,
      applicationFee: 495,
      redemptionFee: 500,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Refurbishment budget signed off by monitoring surveyor pre-drawdown",
        "Allica Bank DIP for commercial refinance to be issued by month 3",
        "Quarterly monitoring surveyor inspections during works",
      ],
    },
  },
  {
    id: "CX-2621-K",
    title: "Margate Mixed-Use Acquisition",
    property: "Margate · Mixed-use",
    type: "Commercial",
    category: "Commercial bridging",
    chargeType: "First",
    typeTag: "Bridging",
    facility: 310000,
    rate: 11.25,
    term: 8,
    ltv: 0.57,
    min: 25000,
    raisedPct: 0.08,
    closes: "13 Jun 2026",
    hot: false,
    summary: "Acquisition of a high-street mixed-use freehold, pending Class E refurbishment.",
    bullets: [
      "First legal charge over freehold corner property",
      "DV £545k; ground-floor commercial pre-let to coffee operator",
      "Exit: refinance to commercial term lender post-let",
    ],
    security: {
      tenure: "Freehold (Title No. K662014)",
      description: "Three-storey corner mixed-use property (c.1910). Ground-floor Class E unit (current shell, pre-let to independent coffee operator) plus two self-contained one-bedroom flats above.",
      tenancy: "Ground floor pre-let (15-year FRI, £18k pa). Flats refurb-to-AST.",
      councilTax: "Mixed-use",
      epc: "EPC Band D across units, valid to 2030 - MEES-compliant",
      marketValue: 545000,
      restricted180: 545000,
      restricted90: 490500,
      valuer: "Validate Desktop+",
      valuationDate: "26 Apr 2026",
      valuerRef: "VA-014891",
      monthlyRent: 2700,
    },
    dip: {
      reference: "CXP-621",
      date: "04 May 2026",
      validity: "14 days",
      product: "Bridging Loan",
      borrowerRate: 14.25,
      monthlyInterest: 3680,
      term: 8,
      minTerm: 3,
      grossLoan: 310000,
      netDrawdown: 262000,
      arrangementFee: 6200,
      brokerFee: 3100,
      setupFee: 1495,
      retainedInterest: 29440,
      applicationFee: 495,
      redemptionFee: 500,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Coffee operator lease signed and dated pre-drawdown (executed copy to JMW)",
        "Class E refurbishment costed schedule of works approved by monitoring surveyor",
        "Buildings insurance noting CredX as interested party",
      ],
    },
  },
  {
    id: "CX-2622-R",
    title: "Hythe Residential Refurb",
    property: "Hythe · Residential refurb-to-let",
    type: "Residential",
    category: "Residential bridging",
    chargeType: "First",
    typeTag: "Refurb",
    facility: 130000,
    rate: 10.5,
    term: 7,
    ltv: 0.48,
    min: 25000,
    raisedPct: 0.32,
    closes: "03 Jun 2026",
    hot: false,
    summary: "Light-refurb bridge with onward BTL remortgage - established borrower.",
    bullets: [
      "First legal charge over freehold semi-detached",
      "DV £270k current, £305k GDV post-works",
      "Exit: BTL refinance via Paragon (DIP in place)",
    ],
    security: {
      tenure: "Freehold (Title No. K588110)",
      description: "Two-storey semi-detached three-bedroom freehold residence (c.1935). Existing GIA 980 sqft; light refurbishment to kitchen, bathroom and electrics.",
      tenancy: "Vacant - refurb-to-let",
      councilTax: "Band C",
      epc: "EPC Band D (65), valid to 2033 - MEES-compliant",
      marketValue: 270000,
      restricted180: 270000,
      restricted90: 243000,
      valuer: "Validate Desktop+",
      valuationDate: "19 Apr 2026",
      valuerRef: "VA-014821",
      monthlyRent: 1200,
      gdv: 305000,
    },
    dip: {
      reference: "CXP-622",
      date: "26 Apr 2026",
      validity: "14 days",
      product: "Bridging Loan (Refurb)",
      borrowerRate: 13.5,
      monthlyInterest: 1463,
      term: 7,
      minTerm: 3,
      grossLoan: 130000,
      netDrawdown: 110500,
      arrangementFee: 2600,
      brokerFee: 1300,
      setupFee: 1495,
      retainedInterest: 10238,
      applicationFee: 495,
      redemptionFee: 250,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Paragon BTL DIP issued and dated within last 30 days at drawdown",
        "Schedule of works with itemised costings signed off pre-drawdown",
        "Practical completion sign-off and revised valuation before exit",
      ],
    },
  },
  {
    id: "CX-2623-R",
    title: "Tonbridge BTL Capital Raise",
    property: "Tonbridge · Tenanted BTL portfolio",
    type: "Residential",
    category: "Residential bridging",
    chargeType: "Second",
    typeTag: "Capital raise",
    requiresDealNda: true,  // Borrower has requested an additional facility-level NDA
    facility: 85000,
    rate: 11.75,
    term: 6,
    ltv: 0.66,
    min: 25000,
    raisedPct: 0.55,
    closes: "01 Jun 2026",
    hot: true,
    summary: "Second-charge capital raise against three tenanted BTL units, behind a Lloyds first charge.",
    bullets: [
      "Second legal charge over three freehold residential units",
      "Combined DV £680k; first-charge balance £290k; CLTV 55%",
      "Consent to second charge confirmed by Lloyds in writing",
      "Exit: portfolio refinance on first-charge product maturity",
    ],
    security: {
      tenure: "Freehold across three titles (TN552014/15/16)",
      description: "Three freehold mid-terrace BTL properties on a single Tonbridge street, each tenanted on a 12-month AST.",
      tenancy: "Three ASTs in situ - combined £3,150 pcm passing rent",
      councilTax: "Band B / B / C",
      epc: "All EPC Band C, MEES-compliant",
      marketValue: 680000,
      restricted180: 680000,
      restricted90: 612000,
      valuer: "CKM Surveyors (RICS)",
      valuationDate: "08 Apr 2026",
      valuerRef: "CKM-58104",
      monthlyRent: 3150,
      seniorFacility: 290000,
      seniorLender: "Lloyds Bank",
      combinedLTV: 0.55,
    },
    dip: {
      reference: "CXP-623",
      date: "30 Apr 2026",
      validity: "14 days",
      product: "Bridging Loan (Second Charge)",
      borrowerRate: 18.0,
      monthlyInterest: 1275,
      term: 6,
      minTerm: 3,
      grossLoan: 85000,
      netDrawdown: 72000,
      arrangementFee: 1700,
      brokerFee: 850,
      setupFee: 1495,
      retainedInterest: 7650,
      applicationFee: 495,
      redemptionFee: 250,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Lloyds Bank written consent to second charge to be on file pre-completion",
        "All three ASTs evidenced (signed leases + tenant deposits registered)",
        "First-charge redemption statement at exit",
      ],
    },
  },
  {
    id: "CX-2624-B",
    title: "Maidstone Trading Business Loan",
    property: "Maidstone · Commercial freehold (owner-occupied)",
    type: "Business",
    category: "Business loan",
    chargeType: "First",
    typeTag: "Business loan",
    facility: 180000,
    rate: 12.0,
    term: 12,
    ltv: 0.52,
    min: 25000,
    raisedPct: 0.21,
    closes: "15 Jun 2026",
    hot: false,
    summary: "Short-term working-capital facility for an established Kent trading company, secured against owner-occupied commercial freehold.",
    bullets: [
      "First legal charge over a freehold trading premises",
      "RICS valuation £345k (Mar 2026); LTV 52%",
      "Personal guarantees from directors; 5+ years trading history",
      "Exit: invoice-finance line refinance on completion of contracts",
    ],
    security: {
      tenure: "Freehold (Title No. ME-9180)",
      description: "End-of-terrace trading premises (c.1980) - office front (c.420 sqft) plus warehouse and three roller-door bays (c.2,800 sqft). Owner-occupied by the borrower for 5+ years.",
      tenancy: "Owner-occupied",
      councilTax: "Commercial",
      epc: "EPC Band C (72), MEES-compliant",
      marketValue: 345000,
      restricted180: 345000,
      restricted90: 310500,
      valuer: "CKM Surveyors (RICS)",
      valuationDate: "14 Mar 2026",
      valuerRef: "CKM-58088",
      monthlyRent: null,
    },
    dip: {
      reference: "CXP-624",
      date: "03 May 2026",
      validity: "14 days",
      product: "Business Loan (Bridging)",
      borrowerRate: 15.5,
      monthlyInterest: 2325,
      term: 12,
      minTerm: 3,
      grossLoan: 180000,
      netDrawdown: 152500,
      arrangementFee: 3600,
      brokerFee: 1800,
      setupFee: 1495,
      retainedInterest: 27900,
      applicationFee: 495,
      redemptionFee: 500,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Personal guarantees executed by both directors at drawdown",
        "Last 3 years' filed accounts and 12 months' bank statements on file",
        "Invoice-finance commitment letter from refinancing lender by month 9",
      ],
    },
  },
  {
    id: "CX-2625-K",
    title: "Dover Coastal Hotel Refinance",
    property: "Dover · Boutique hotel (16 rooms)",
    type: "Commercial",
    category: "Commercial bridging",
    chargeType: "First",
    typeTag: "Bridging",
    requiresDealNda: true,  // Trading entity disclosure requires per-deal NDA
    facility: 620000,
    rate: 11.75,
    term: 10,
    ltv: 0.6,
    min: 50000,
    raisedPct: 0.62,
    closes: "12 Jun 2026",
    hot: false,
    summary: "Refinance of existing senior debt during a transition to long-term commercial mortgage with Cynergy Bank.",
    bullets: [
      "First legal charge over a freehold boutique hotel",
      "DV £1.05m (Christie & Co., Feb 2026); LTV 60%",
      "Trading EBITDA covers serviceability comfortably",
      "Exit: Cynergy commercial mortgage offer issued, completion timetabled",
    ],
    security: {
      tenure: "Freehold (Title No. DV-3308)",
      description: "Four-storey period boutique hotel (c.1880, partial refurbishment 2022). 16 en-suite letting rooms plus owner's accommodation, breakfast room, bar, and small kitchen. GIA c.6,400 sqft.",
      tenancy: "Trading hotel - 16 letting rooms with seasonal occupancy 68% (LTM)",
      councilTax: "Commercial",
      epc: "EPC Band C (74), valid to 2032",
      marketValue: 1050000,
      restricted180: 1050000,
      restricted90: 945000,
      valuer: "Christie & Co.",
      valuationDate: "11 Feb 2026",
      valuerRef: "CC-DV-2208",
      monthlyRent: null,
      tradingEBITDA: 174000,
    },
    dip: {
      reference: "CXP-625",
      date: "07 May 2026",
      validity: "14 days",
      product: "Bridging Loan",
      borrowerRate: 14.75,
      monthlyInterest: 7619,
      term: 10,
      minTerm: 3,
      grossLoan: 620000,
      netDrawdown: 524000,
      arrangementFee: 12400,
      brokerFee: 6200,
      setupFee: 1495,
      retainedInterest: 76188,
      applicationFee: 495,
      redemptionFee: 500,
      defaultFee: "2% above standard rate",
      earlyRepayment: "Min. 3 months interest",
      esg: "Approved",
      conditions: [
        "Cynergy Bank formal mortgage offer received by month 6 of the term",
        "Quarterly trading P&L provided to CredX during term",
        "Buildings & business interruption insurance noting CredX as interested party",
      ],
    },
  },
];

// Updates feed
const UPDATES = (window.CREDX_UPDATES_SEED || [
  {
    id: "u-026",
    date: "20 May 2026",
    timeAgo: "yesterday",
    kind: "Platform",
    title: "May investor letter - book composition and pipeline",
    body: "Capital deployed at month-end stands at £18.4m across 41 facilities. Weighted average LTV is 56%. Six new facilities funded in May with three resolutions in the pipeline; redemption performance remains in line with prior quarters.",
    attachments: ["May 2026 letter (PDF, 2 pages)"],
    pinned: true,
  },
  {
    id: "u-025",
    date: "18 May 2026",
    timeAgo: "3 days ago",
    kind: "Deal update",
    dealId: "CX-2540-K",
    title: "Canterbury HMO conversion - works signed off, redemption booked",
    body: "Foundation Home Loans has issued the formal mortgage offer. Solicitors are instructed for redemption on 12 June. No remedial items outstanding from the monitoring surveyor's final inspection.",
    attachments: ["Monitoring report (PDF)"],
  },
  {
    id: "u-024",
    date: "14 May 2026",
    timeAgo: "1 week ago",
    kind: "Deal update",
    dealId: "CX-2604-K",
    title: "Sevenoaks Mixed-Use - onward sale exchanged on Unit 3",
    body: "Borrower has exchanged on the sale of Unit 3 at £210k. Funds expected to support a partial redemption of the facility in Q3, reducing exposure ahead of maturity.",
    attachments: [],
  },
  {
    id: "u-023",
    date: "07 May 2026",
    timeAgo: "2 weeks ago",
    kind: "Platform",
    title: "JMW facility agreement template - annual review issued",
    body: "Our solicitors have issued the FY26 update to the facility agreement template, with refreshed event-of-default language and ICO-aligned data processing terms. No action required from existing investors; the new template applies to deployments from 01 June.",
    attachments: ["FA template v6.0 markup (PDF)"],
  },
  {
    id: "u-022",
    date: "30 Apr 2026",
    timeAgo: "3 weeks ago",
    kind: "Statement",
    title: "Q1 2026 investor statement available",
    body: "Your quarterly statement is now available in the document vault. Interest credited for the period: £14,229.83 across five facilities.",
    attachments: ["Q1 2026 statement (PDF)"],
  },
  {
    id: "u-021",
    date: "22 Apr 2026",
    timeAgo: "1 month ago",
    kind: "Deal update",
    dealId: "CX-2511-R",
    title: "Folkestone refurb - practical completion certified",
    body: "Works are signed off and Together Money has issued the formal remortgage offer. Redemption is scheduled for 29 May with funds returning to your client account same day.",
    attachments: [],
  },
]);

const DOCUMENTS = [
  { id: "d1", name: "Q1 2026 Investor Statement.pdf", category: "Statements", deal: null, date: "30 Apr 2026", size: "612 KB" },
  { id: "d2", name: "Q4 2025 Investor Statement.pdf", category: "Statements", deal: null, date: "31 Jan 2026", size: "598 KB" },
  { id: "d3", name: "CGT Annual Summary 2024-25.pdf", category: "Tax", deal: null, date: "06 Apr 2026", size: "204 KB" },
  { id: "d4", name: "Facility Agreement - CX-2604-K.pdf", category: "Facility Agreements", deal: "CX-2604-K", date: "14 Feb 2026", size: "1.2 MB" },
  { id: "d5", name: "Facility Agreement - CX-2598-K.pdf", category: "Facility Agreements", deal: "CX-2598-K", date: "03 Mar 2026", size: "1.1 MB" },
  { id: "d6", name: "Legal Charge - Title K-4421AB.pdf", category: "Legal Charges", deal: "CX-2604-K", date: "14 Feb 2026", size: "880 KB" },
  { id: "d7", name: "Legal Charge - Title TW-7711.pdf", category: "Legal Charges", deal: "CX-2598-K", date: "03 Mar 2026", size: "820 KB" },
  { id: "d8", name: "May 2026 Investor Letter.pdf", category: "Reports", deal: null, date: "20 May 2026", size: "412 KB" },
  { id: "d9", name: "AML / Source of Funds Confirmation.pdf", category: "KYC", deal: null, date: "12 Feb 2026", size: "188 KB" },
  { id: "d10", name: "Sophisticated Investor Self-Certification.pdf", category: "KYC", deal: null, date: "12 Feb 2026", size: "142 KB" },
];

// Completed (redeemed) facilities - the history. The Portfolio page
// stitches these together with LIVE_DEALS to show the full lifetime view.
const COMPLETED_DEALS = [
  {
    id: "CX-2488-K", title: "Sittingbourne Trade Counter", property: "Sittingbourne · Light industrial",
    type: "Commercial", position: 180000, rate: 11.25, term: 8,
    drawn: "12 May 2025", redeemed: "12 Jan 2026", actualTerm: 8,
    interestEarned: 13500.00, status: "repaid", ltv: 0.55,
  },
  {
    id: "CX-2452-R", title: "Broadstairs Residential Refurb", property: "Broadstairs · Residential",
    type: "Residential", position: 85000, rate: 10.5, term: 6,
    drawn: "18 Apr 2025", redeemed: "18 Oct 2025", actualTerm: 6,
    interestEarned: 4462.50, status: "repaid", ltv: 0.48,
  },
  {
    id: "CX-2411-K", title: "Faversham Office Refinance", property: "Faversham · Commercial office",
    type: "Commercial", position: 220000, rate: 11.0, term: 9,
    drawn: "02 Feb 2025", redeemed: "29 Oct 2025", actualTerm: 9,
    interestEarned: 18150.00, status: "repaid", ltv: 0.58,
  },
  {
    id: "CX-2382-K", title: "Gravesend Mixed-Use Refinance", property: "Gravesend · Mixed-use commercial",
    type: "Commercial", position: 320000, rate: 12.25, term: 10,
    drawn: "16 Dec 2024", redeemed: "16 Oct 2025", actualTerm: 10,
    interestEarned: 32666.67, status: "repaid", ltv: 0.60,
  },
  {
    id: "CX-2340-R", title: "Dartford Residential Bridge", property: "Dartford · Residential",
    type: "Residential", position: 110000, rate: 10.75, term: 5,
    drawn: "08 Sep 2024", redeemed: "08 Feb 2025", actualTerm: 5,
    interestEarned: 4927.08, status: "repaid", ltv: 0.51,
  },
  {
    id: "CX-2295-K", title: "Maidstone Mixed-Use", property: "Maidstone · Mixed-use",
    type: "Commercial", position: 240000, rate: 11.5, term: 7,
    drawn: "14 Jul 2024", redeemed: "14 Feb 2025", actualTerm: 7,
    interestEarned: 16100.00, status: "repaid", ltv: 0.56,
  },
  {
    id: "CX-2241-R", title: "Tunbridge Wells Refurb", property: "Tunbridge Wells · Residential",
    type: "Residential", position: 75000, rate: 10.5, term: 4,
    drawn: "22 May 2024", redeemed: "22 Sep 2024", actualTerm: 4,
    interestEarned: 2625.00, status: "repaid", ltv: 0.45,
  },
  {
    id: "CX-2198-K", title: "Ashford Retail Acquisition", property: "Ashford · Commercial retail",
    type: "Commercial", position: 200000, rate: 11.0, term: 8,
    drawn: "10 Feb 2024", redeemed: "10 Oct 2024", actualTerm: 8,
    interestEarned: 14666.67, status: "repaid", ltv: 0.57,
  },
];

// Cumulative interest earned, by month (last 24 months) - for the portfolio
// performance chart. Mixes realised history with the YTD trajectory.
const CUMULATIVE_INTEREST = [
  { m: "Jun '24", v: 8420 },
  { m: "Jul '24", v: 10600 },
  { m: "Aug '24", v: 13180 },
  { m: "Sep '24", v: 16240 },
  { m: "Oct '24", v: 20180 },
  { m: "Nov '24", v: 24410 },
  { m: "Dec '24", v: 29680 },
  { m: "Jan '25", v: 35420 },
  { m: "Feb '25", v: 42180 },
  { m: "Mar '25", v: 49620 },
  { m: "Apr '25", v: 57480 },
  { m: "May '25", v: 65920 },
  { m: "Jun '25", v: 74980 },
  { m: "Jul '25", v: 84840 },
  { m: "Aug '25", v: 95220 },
  { m: "Sep '25", v: 106340 },
  { m: "Oct '25", v: 118400 },
  { m: "Nov '25", v: 130980 },
  { m: "Dec '25", v: 144020 },
  { m: "Jan '26", v: 157840 },
  { m: "Feb '26", v: 167420 },
  { m: "Mar '26", v: 175680 },
  { m: "Apr '26", v: 180200 },
  { m: "May '26", v: 184221 },
];

// Geographic exposure (by Kent borough) for the composition panel
const GEO_EXPOSURE = [
  { region: "Sevenoaks",     v: 250000 },
  { region: "Tunbridge Wells", v: 175000 },
  { region: "Maidstone",     v: 320000 },
  { region: "Canterbury",    v: 140000 },
  { region: "Whitstable",    v: 95000 },
  { region: "Folkestone",    v: 60000 },
];
const DISTRIBUTIONS = [
  { date: "29 May 2026", deal: "CX-2511-R", label: "Folkestone - redemption + interest", amount: 62562.50, kind: "redemption" },
  { date: "01 Jun 2026", deal: "CX-2604-K", label: "Sevenoaks - Q2 interest", amount: 7125.00, kind: "interest" },
  { date: "03 Jun 2026", deal: "CX-2598-K", label: "Tunbridge - monthly interest", amount: 1604.17, kind: "interest" },
  { date: "08 Jun 2026", deal: "CX-2572-D", label: "Maidstone - Q2 interest", amount: 9400.00, kind: "interest" },
  { date: "12 Jun 2026", deal: "CX-2540-K", label: "Canterbury - redemption + interest", amount: 145598.40, kind: "redemption" },
];

// Performance series - monthly capital deployed (£k) + interest earned (£k)
// 12 months back-window
const PERF_SERIES = [
  { m: "Jun '25", deployed: 540, earned: 4.6 },
  { m: "Jul '25", deployed: 615, earned: 5.4 },
  { m: "Aug '25", deployed: 580, earned: 5.2 },
  { m: "Sep '25", deployed: 720, earned: 6.5 },
  { m: "Oct '25", deployed: 760, earned: 6.8 },
  { m: "Nov '25", deployed: 690, earned: 6.4 },
  { m: "Dec '25", deployed: 820, earned: 7.5 },
  { m: "Jan '26", deployed: 905, earned: 8.2 },
  { m: "Feb '26", deployed: 1040, earned: 9.4 },
  { m: "Mar '26", deployed: 1135, earned: 10.1 },
  { m: "Apr '26", deployed: 1080, earned: 9.8 },
  { m: "May '26", deployed: 1040, earned: 9.6 },
];

const KPIS = {
  capitalDeployed: 1040000,
  netIrrYtd: 11.18,
  liveDeals: 6,
  weightedLtv: 0.547,
  pendingReturns: 62562.50,
  lifetimeReturns: 184221.40,
  capitalAvailable: 240000,
};

// little currency helpers
const fmtGBP = (n, opts = {}) => {
  const { compact = false, decimals = 0 } = opts;
  if (compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000) {
      const v = (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
      return "£" + (v || "0") + "m";
    }
    // guard the boundary: 999,500 must not round to "1000k"
    const k = Math.round(n / 1000);
    if (Math.abs(k) >= 1000) return "£" + (k / 1000).toFixed(2).replace(/\.?0+$/, "") + "m";
    return "£" + k + "k";
  }
  return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
const fmtPct = (n, d = 2) => n.toFixed(d) + "%";

// Compact value (no £ prefix, suitable for KPI `value` props where the unit "£" is rendered separately):
//   1_040_000 → "1.04m"   10_000_000 → "10m"   100_000 → "100k"   41_300 → "41k"
// Below £1m → rounded thousands ("Nk"); ≥ £1m → up to 2dp ("N.NNm") with trailing zeros trimmed.
function compactGBPValue(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
    return (v || "0") + "m";
  }
  if (abs >= 1000) {
    const k = Math.round(n / 1000);
    if (Math.abs(k) >= 1000) return (k / 1000).toFixed(2).replace(/\.?0+$/, "") + "m";
    return k + "k";
  }
  return String(Math.round(n));
}

// ─────────────────────────────────────────────────────────────────
// CSV export - builds a spreadsheet of positions and triggers a
// download. Opens natively in Excel / Numbers / Google Sheets.
// ─────────────────────────────────────────────────────────────────
function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = v => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => escape(r[h])).join(","));
  // BOM so Excel reads UTF-8 (£ sign) correctly
  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportPositions(scope = "all") {
  const today = new Date().toISOString().slice(0, 10);
  const active = LIVE_DEALS.map(d => ({
    "Facility ID":             d.id,
    "Title":                   d.title,
    "Property":                d.property,
    "Type":                    d.type,
    "Status":                  "Active",
    "Principal (GBP)":         d.position,
    "Coupon (%)":              d.rate.toFixed(2),
    "LTV (%)":                 Math.round(d.ltv * 100),
    "Term (months)":           d.term,
    "Drawn":                   d.drawn,
    "Maturity / Redeemed":     d.maturity,
    "Actual term (months)":    "",
    "Interest accrued (GBP)":  d.interestAccrued.toFixed(2),
    "Interest realised (GBP)": "",
    "Borrower":                d.borrower,
    "Facility ref":            d.facilityRef,
  }));
  const redeemed = COMPLETED_DEALS.map(d => ({
    "Facility ID":             d.id,
    "Title":                   d.title,
    "Property":                d.property,
    "Type":                    d.type,
    "Status":                  "Redeemed",
    "Principal (GBP)":         d.position,
    "Coupon (%)":              d.rate.toFixed(2),
    "LTV (%)":                 Math.round(d.ltv * 100),
    "Term (months)":           d.term,
    "Drawn":                   d.drawn,
    "Maturity / Redeemed":     d.redeemed,
    "Actual term (months)":    d.actualTerm,
    "Interest accrued (GBP)":  "",
    "Interest realised (GBP)": d.interestEarned.toFixed(2),
    "Borrower":                "",
    "Facility ref":            "",
  }));

  let rows, suffix;
  if (scope === "active")        { rows = active; suffix = "active"; }
  else if (scope === "redeemed") { rows = redeemed; suffix = "redeemed"; }
  else                            { rows = [...active, ...redeemed]; suffix = "all"; }

  downloadCSV(`CredX_Portfolio_${INVESTOR.accountId}_${suffix}_${today}.csv`, rows);
}

// ─────────────────────────────────────────────────────────────────
// Investor statement - multi-sheet Excel workbook (.xlsx)
//   1. Summary           - performance KPIs, returns, defaults
//   2. Active positions  - live facilities
//   3. Redeemed          - completed facilities with realised yield
//   4. Solicitor transfers - capital out to solicitor client accounts
//   5. Capital returns   - capital + interest back from solicitors
//   6. Transaction ledger - full chronological list with running balance
//   7. Events & defaults - material events, default register
// ─────────────────────────────────────────────────────────────────

// Default-register data - empty in good times. Surface the section so
// the absence is itself a reportable fact. Add rows here if/when a
// material event occurs on any facility.
const DEFAULT_EVENTS = [
  // example row shape:
  // { date: "12 Jan 2026", facility: "CX-XXXX-X", title: "...", category: "Default / arrears / waiver / enforcement", status: "Resolved / Open", note: "...", impactGBP: 0 },
];

function _parse(d) {
  const m = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const [a, b, c] = d.split(" ");
  return new Date(parseInt(c), m[b], parseInt(a));
}
function _fmtDate(d) {
  return String(d.getDate()).padStart(2, "0") + " " +
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " +
    d.getFullYear();
}

function _yearsActive(deal, asOf) {
  return Math.max((asOf - _parse(deal.drawn)) / (365.25 * 24 * 60 * 60 * 1000), 1/12);
}

function _buildStatement() {
  const today = new Date();
  const todayStr = _fmtDate(today);

  // ── aggregates ──────────────────────────────────────────────
  const activeCapital   = LIVE_DEALS.reduce((s, d) => s + d.position, 0);
  const lifetimeDeployed = activeCapital + COMPLETED_DEALS.reduce((s, d) => s + d.position, 0);
  const capitalReturned  = COMPLETED_DEALS.reduce((s, d) => s + d.position, 0);
  const interestRealised = COMPLETED_DEALS.reduce((s, d) => s + d.interestEarned, 0);
  const interestAccrued  = LIVE_DEALS.reduce((s, d) => s + d.interestAccrued, 0);
  const totalReturnsToDate = interestRealised + interestAccrued;
  // weighted realised yield (annualised) on completed book
  const completedPositionYears = COMPLETED_DEALS.reduce((s, d) => s + d.position * (d.actualTerm / 12), 0);
  const realisedYieldPct = completedPositionYears > 0 ? (interestRealised / completedPositionYears) * 100 : 0;
  // weighted coupon on active book
  const activeWeightedCoupon = activeCapital > 0
    ? LIVE_DEALS.reduce((s, d) => s + d.rate * d.position, 0) / activeCapital
    : 0;
  // average actual term (completed, position-weighted)
  const avgActualTerm = capitalReturned > 0
    ? COMPLETED_DEALS.reduce((s, d) => s + d.actualTerm * d.position, 0) / capitalReturned
    : 0;
  const defaultsCount = DEFAULT_EVENTS.length;
  const defaultsLoss  = DEFAULT_EVENTS.reduce((s, e) => s + (e.impactGBP || 0), 0);

  // ── Sheet 1: Summary ────────────────────────────────────────
  const summary = [
    ["CredX - Investor Statement"],
    [],
    ["Investor",        INVESTOR.name],
    ["Account ID",      INVESTOR.accountId],
    ["Classification",  INVESTOR.classification],
    ["Statement date",  todayStr],
    ["Period covered",  "Inception to " + todayStr],
    ["Generated by",    "CredX Investor Portal"],
    [],
    ["Issued by",       COMPANY.name + " (Co. " + COMPANY.no + " · ICO " + COMPANY.ico + ")"],
    ["Registered office", COMPANY.address],
    ["Contact",         COMPANY.email + " · " + COMPANY.phone],
    [],
    ["CAPITAL"],
    ["Lifetime capital funded",           lifetimeDeployed,    "GBP", "Across " + (LIVE_DEALS.length + COMPLETED_DEALS.length) + " facilities"],
    ["Capital currently active",          activeCapital,        "GBP", LIVE_DEALS.length + " active facilities"],
    ["Capital returned to date",          capitalReturned,      "GBP", COMPLETED_DEALS.length + " facilities redeemed"],
    [],
    ["RETURNS"],
    ["Interest realised (paid to you)",   interestRealised,     "GBP", "Lifetime, completed facilities"],
    ["Interest accruing (not yet paid)",  interestAccrued,      "GBP", "Live facilities, as at statement date"],
    ["Total returns to date",             totalReturnsToDate,   "GBP", "Realised + accrued"],
    [],
    ["YIELD"],
    ["Realised yield (weighted, p.a.)",   Number(realisedYieldPct.toFixed(2)), "%",   "Position-weighted across completed deals"],
    ["Average coupon, active book",       Number(activeWeightedCoupon.toFixed(2)), "%", "Position-weighted across live deals"],
    ["Average actual term (completed)",   Number(avgActualTerm.toFixed(1)),    "mo",  "Position-weighted"],
    [],
    ["DEFAULTS & LOSS EVENTS"],
    ["Default / loss events",             defaultsCount,        "count", defaultsCount === 0 ? "Nil reportable events" : "See 'Events & defaults' sheet"],
    ["Realised loss of capital",          defaultsLoss,         "GBP",   defaultsLoss === 0 ? "Zero capital impairment to date" : "See 'Events & defaults' sheet"],
    [],
    ["LOAN BOOK MIX (active)"],
    ["Commercial bridging",  LIVE_DEALS.filter(d => d.type === "Commercial").reduce((s, d) => s + d.position, 0), "GBP", LIVE_DEALS.filter(d => d.type === "Commercial").length + " facilities"],
    ["Residential bridging", LIVE_DEALS.filter(d => d.type === "Residential").reduce((s, d) => s + d.position, 0), "GBP", LIVE_DEALS.filter(d => d.type === "Residential").length + " facilities"],
    [],
    ["NOTES"],
    ["1.", "CredX Ltd is not authorised or regulated by the FCA and does not hold Funder capital."],
    ["2.", "All funding is transferred directly from your nominated account to the appointed solicitor's client account on completion."],
    ["3.", "Each facility is governed by a bespoke Facility Agreement drafted by JMW."],
    ["4.", "Interest 'realised' has been paid to your nominated account. 'Accruing' interest is calculated pro-rata to the statement date and will be paid on the next scheduled payment / redemption."],
  ];

  // ── Sheet 2: Active positions ───────────────────────────────
  const active = [
    ["Facility ID", "Title", "Property", "Type", "Principal (GBP)", "Coupon (%)", "LTV (%)", "Term (mo)", "Drawn", "Maturity", "Interest accrued (GBP)", "Borrower", "Facility Ref", "Status"],
    ...LIVE_DEALS.map(d => [
      d.id, d.title, d.property, d.type, d.position, Number(d.rate.toFixed(2)),
      Math.round(d.ltv * 100), d.term, d.drawn, d.maturity,
      Number(d.interestAccrued.toFixed(2)), d.borrower, d.facilityRef, d.status === "pending" ? "Closing" : "Active",
    ]),
    [],
    ["TOTAL", "", "", "", activeCapital, "", "", "", "", "", Number(interestAccrued.toFixed(2)), "", "", LIVE_DEALS.length + " facilities"],
  ];

  // ── Sheet 3: Redeemed positions (with realised yield per deal) ──
  const redeemed = [
    ["Facility ID", "Title", "Property", "Type", "Principal (GBP)", "Coupon (%)", "LTV (%)", "Term (mo)", "Actual term (mo)", "Drawn", "Redeemed", "Interest realised (GBP)", "Realised yield (% p.a.)", "Outcome"],
    ...COMPLETED_DEALS.map(d => {
      const realised = (d.interestEarned / (d.position * d.actualTerm / 12)) * 100;
      return [
        d.id, d.title, d.property, d.type, d.position, Number(d.rate.toFixed(2)),
        Math.round(d.ltv * 100), d.term, d.actualTerm, d.drawn, d.redeemed,
        Number(d.interestEarned.toFixed(2)), Number(realised.toFixed(2)),
        "Redeemed in full",
      ];
    }),
    [],
    ["TOTAL", "", "", "", capitalReturned, "", "", "", "", "", "", Number(interestRealised.toFixed(2)), Number(realisedYieldPct.toFixed(2)), COMPLETED_DEALS.length + " facilities"],
  ];

  // ── Sheet 4: Solicitor transfers (Capital out) ──────────────
  // Each drawdown moves from the Funder's nominated account to the
  // appointed solicitor's client account on completion day.
  const allDeals = [
    ...LIVE_DEALS.map(d => ({ ...d, kind: "active" })),
    ...COMPLETED_DEALS.map(d => ({ ...d, kind: "completed" })),
  ];
  const solicitorTransfers = [
    ["Completion date", "Facility ID", "Title", "Property", "Borrower", "Amount transferred (GBP)", "Solicitor (client account)", "Facility Ref"],
    ...allDeals
      .sort((a, b) => _parse(b.drawn) - _parse(a.drawn))
      .map(d => [
        d.drawn, d.id, d.title, d.property, d.borrower || "-",
        d.position, "JMW Solicitors - Client Account", d.facilityRef || "-",
      ]),
    [],
    ["TOTAL TRANSFERRED", "", "", "", "", lifetimeDeployed, "", ""],
  ];

  // ── Sheet 5: Capital returns from solicitors ───────────────
  const capitalReturns = [
    ["Redemption date", "Facility ID", "Title", "Capital returned (GBP)", "Interest paid (GBP)", "Total received (GBP)", "Source"],
    ...COMPLETED_DEALS
      .sort((a, b) => _parse(b.redeemed) - _parse(a.redeemed))
      .map(d => [
        d.redeemed, d.id, d.title,
        d.position, Number(d.interestEarned.toFixed(2)),
        Number((d.position + d.interestEarned).toFixed(2)),
        "JMW Solicitors - Client Account",
      ]),
    [],
    ["TOTAL RECEIVED", "", "", capitalReturned, Number(interestRealised.toFixed(2)),
      Number((capitalReturned + interestRealised).toFixed(2)), ""],
  ];

  // ── Sheet 6: Transaction ledger with running balance ─────────
  const txns = [];
  for (const d of allDeals) {
    txns.push({ date: _parse(d.drawn), dateStr: d.drawn, type: "Capital out (drawdown)", facility: d.id, desc: d.title, in: 0, out: d.position });
  }
  for (const d of COMPLETED_DEALS) {
    txns.push({ date: _parse(d.redeemed), dateStr: d.redeemed, type: "Capital in (redemption)", facility: d.id, desc: d.title, in: d.position, out: 0 });
    txns.push({ date: _parse(d.redeemed), dateStr: d.redeemed, type: "Interest in (paid)", facility: d.id, desc: d.title + " - interest paid on redemption", in: Number(d.interestEarned.toFixed(2)), out: 0 });
  }
  txns.sort((a, b) => a.date - b.date);

  let netDeployed = 0;
  let cumInterest = 0;
  const ledger = [
    ["Date", "Type", "Facility", "Description", "In (GBP)", "Out (GBP)", "Net capital out (GBP)", "Cumulative interest received (GBP)"],
    ...txns.map(t => {
      netDeployed += t.out - (t.type === "Capital in (redemption)" ? t.in : 0);
      if (t.type === "Interest in (paid)") cumInterest += t.in;
      return [
        t.dateStr, t.type, t.facility, t.desc,
        t.in || "", t.out || "",
        Number(netDeployed.toFixed(2)),
        Number(cumInterest.toFixed(2)),
      ];
    }),
    [],
    ["AT STATEMENT DATE", "Interest accruing on live facilities", "", "Not yet paid", Number(interestAccrued.toFixed(2)), "", Number(netDeployed.toFixed(2)), Number((cumInterest + interestAccrued).toFixed(2))],
  ];

  // ── Sheet 7: Events & defaults register ────────────────────
  const events = DEFAULT_EVENTS.length === 0
    ? [
        ["Date", "Facility", "Category", "Title", "Status", "Realised impact (GBP)", "Note"],
        ["", "", "", "No reportable default or loss events to date", "", 0, "Period covered: Inception to " + todayStr],
      ]
    : [
        ["Date", "Facility", "Category", "Title", "Status", "Realised impact (GBP)", "Note"],
        ...DEFAULT_EVENTS.map(e => [e.date, e.facility, e.category, e.title, e.status, e.impactGBP || 0, e.note || ""]),
      ];

  return { summary, active, redeemed, solicitorTransfers, capitalReturns, ledger, events, todayStr };
}

function exportStatement() {
  const today = new Date().toISOString().slice(0, 10);
  const { summary, active, redeemed, solicitorTransfers, capitalReturns, ledger, events } = _buildStatement();

  const wb = XLSX.utils.book_new();

  const mk = (rows, opts = {}) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // sensible default column widths
    if (opts.colWidths) ws["!cols"] = opts.colWidths.map(w => ({ wch: w }));
    return ws;
  };

  XLSX.utils.book_append_sheet(wb, mk(summary, { colWidths: [34, 28, 8, 48] }),                        "Summary");
  XLSX.utils.book_append_sheet(wb, mk(active, { colWidths: [13, 34, 38, 13, 16, 10, 8, 10, 14, 14, 18, 30, 16, 12] }),  "Active positions");
  XLSX.utils.book_append_sheet(wb, mk(redeemed, { colWidths: [13, 34, 38, 13, 16, 10, 8, 10, 14, 14, 14, 18, 18, 18] }), "Redeemed");
  XLSX.utils.book_append_sheet(wb, mk(solicitorTransfers, { colWidths: [14, 13, 34, 38, 30, 22, 30, 16] }),   "Solicitor transfers");
  XLSX.utils.book_append_sheet(wb, mk(capitalReturns, { colWidths: [14, 13, 34, 20, 18, 20, 30] }),           "Capital returns");
  XLSX.utils.book_append_sheet(wb, mk(ledger, { colWidths: [14, 24, 13, 50, 14, 14, 18, 26] }),               "Transaction ledger");
  XLSX.utils.book_append_sheet(wb, mk(events, { colWidths: [14, 13, 22, 40, 14, 18, 40] }),                   "Events & defaults");

  XLSX.writeFile(wb, `CredX_Statement_${INVESTOR.accountId}_${today}.xlsx`);
}

// ─────────────────────────────────────────────────────────────────
// Per-deal statement - narrow Excel workbook scoped to one facility.
// Used by the Statement button inside the deal-detail drawer.
//   1. Summary       - investor + facility headline metrics
//   2. Transactions  - drawdown, interest payments, redemption (if done),
//                      accrued interest (if live)
//   3. Schedule      - monthly interest payments + final redemption
//   4. Documents     - files linked to this facility
// ─────────────────────────────────────────────────────────────────
function exportDealStatement(deal) {
  if (!deal) return;
  const today = new Date();
  const todayStr = _fmtDate(today);
  const isActive = !deal.redeemed; // completed deals carry .redeemed
  const monthlyInterest = (deal.position * deal.rate / 100) / 12;

  // ── Sheet 1: Summary ────────────────────────────────────────
  const summary = [
    ["CredX - Facility Statement"],
    [],
    ["Investor",       INVESTOR.name],
    ["Account ID",     INVESTOR.accountId],
    ["Statement date", todayStr],
    [],
    ["FACILITY"],
    ["Facility ID",    deal.id],
    ["Title",          deal.title],
    ["Property",       deal.property],
    ["Type",           deal.type + " bridging"],
    ["Status",         isActive ? (deal.status === "pending" ? "Closing" : "Active") : "Redeemed in full"],
    ["Borrower",       deal.borrower || "-"],
    ["Security",       deal.security || "First legal charge"],
    ["Facility ref",   deal.facilityRef || "-"],
    ["Solicitor",      "JMW Solicitors - Client Account"],
    [],
    ["TERMS"],
    ["Principal funded", deal.position, "GBP"],
    ["Coupon",           Number(deal.rate.toFixed(2)), "% p.a."],
    ["LTV at drawdown",  Math.round(deal.ltv * 100), "%"],
    ["Term (agreed)",    deal.term, "months"],
    ["Drawn",            deal.drawn, ""],
    ["Maturity / Redeemed", isActive ? deal.maturity : deal.redeemed, ""],
    isActive ? null : ["Actual term", deal.actualTerm, "months"],
    [],
    ["RETURNS ON THIS FACILITY"],
    isActive
      ? ["Interest accrued (not yet paid)", Number(deal.interestAccrued.toFixed(2)), "GBP", "As at " + todayStr]
      : ["Interest realised (paid to you)", Number(deal.interestEarned.toFixed(2)), "GBP", "Paid in full on redemption"],
    isActive
      ? ["Expected interest at maturity",   Number(((deal.position * deal.rate / 100) * (deal.term / 12)).toFixed(2)), "GBP", "On full-term assumption"]
      : ["Realised yield (this facility)", Number(((deal.interestEarned / (deal.position * deal.actualTerm / 12)) * 100).toFixed(2)), "% p.a.", ""],
    isActive ? ["Next scheduled event", deal.nextEvent ? deal.nextEvent.label : "-", "", deal.nextEvent ? deal.nextEvent.date : ""] : null,
    [],
    ["NOTES"],
    ["1.", "Capital was transferred directly from your nominated account to JMW Solicitors' client account on the drawdown date. CredX did not hold your funds at any point."],
    ["2.", "This facility is secured by a first legal charge over the property described above, registered at HM Land Registry."],
    ["3.", "Facility governed by a bespoke Facility Agreement drafted by JMW (reference " + (deal.facilityRef || "-") + ")."],
  ].filter(Boolean);

  // ── Sheet 2: Transactions on this facility only ────────────
  const txnRows = [];
  // Drawdown
  txnRows.push([deal.drawn, "Capital out (drawdown)", deal.title + " - transferred to JMW client account", "", Number(deal.position.toFixed(2))]);
  if (isActive) {
    // Paid interest so far (estimate: months elapsed × monthly interest)
    const monthsElapsed = Math.floor(deal.term * deal.progress);
    for (let i = 1; i <= monthsElapsed; i++) {
      txnRows.push([_fmtDate(_addMonths(_parse(deal.drawn), i)), "Interest in (paid)", "Scheduled interest payment #" + i, Number(monthlyInterest.toFixed(2)), ""]);
    }
    // Accrued (current pro-rata)
    if (deal.interestAccrued > 0) {
      txnRows.push([todayStr, "Interest accrued (not yet paid)", "Pro-rata accrual to statement date", Number(deal.interestAccrued.toFixed(2)), ""]);
    }
  } else {
    // Completed - interest paid over the term, then redemption
    for (let i = 1; i <= deal.actualTerm; i++) {
      txnRows.push([_fmtDate(_addMonths(_parse(deal.drawn), i)), "Interest in (paid)", "Scheduled interest payment #" + i, Number(monthlyInterest.toFixed(2)), ""]);
    }
    txnRows.push([deal.redeemed, "Capital in (redemption)", deal.title + " - capital returned in full from JMW client account", Number(deal.position.toFixed(2)), ""]);
  }

  // running balances
  let netOut = 0, cumIn = 0;
  const txns = [
    ["Date", "Type", "Description", "In (GBP)", "Out (GBP)", "Net capital out (GBP)", "Cumulative cash received (GBP)"],
    ...txnRows.map(([date, type, desc, inV, outV]) => {
      const n = parseFloat(inV) || 0;
      const o = parseFloat(outV) || 0;
      netOut += o - (type === "Capital in (redemption)" ? n : 0);
      if (type === "Interest in (paid)" || type === "Capital in (redemption)") cumIn += n;
      return [date, type, desc, inV, outV, Number(netOut.toFixed(2)), Number(cumIn.toFixed(2))];
    }),
  ];

  // ── Sheet 3: Repayment schedule ────────────────────────────
  const scheduleRows = [];
  const totalMonths = isActive ? deal.term : deal.actualTerm;
  for (let i = 1; i <= totalMonths; i++) {
    const isPast = isActive ? i <= Math.floor(deal.term * deal.progress) : true;
    const isNext = isActive && i === Math.ceil(deal.term * deal.progress) && !isPast;
    const dateStr = _fmtDate(_addMonths(_parse(deal.drawn), i));
    scheduleRows.push([
      i,
      dateStr,
      i === totalMonths ? "Redemption + interest" : "Interest payment",
      Number(monthlyInterest.toFixed(2)),
      i === totalMonths ? Number(deal.position.toFixed(2)) : 0,
      i === totalMonths ? Number((monthlyInterest + deal.position).toFixed(2)) : Number(monthlyInterest.toFixed(2)),
      isPast ? "Paid" : isNext ? "Next" : "Scheduled",
    ]);
  }
  const schedule = [
    ["#", "Date", "Event", "Interest (GBP)", "Capital (GBP)", "Total (GBP)", "Status"],
    ...scheduleRows,
  ];

  // ── Sheet 4: Documents on this facility ────────────────────
  const docs = DOCUMENTS.filter(d => d.deal === deal.id);
  const docsSheet = [
    ["Document", "Category", "Date", "Size"],
    ...(docs.length === 0
      ? [["No facility-specific documents on file at statement date", "", "", ""]]
      : docs.map(d => [d.name, d.category, d.date, d.size])),
  ];

  // ── Build workbook ─────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const mk = (rows, cw) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    if (cw) ws["!cols"] = cw.map(w => ({ wch: w }));
    return ws;
  };

  XLSX.utils.book_append_sheet(wb, mk(summary,    [34, 32, 12, 40]),                      "Summary");
  XLSX.utils.book_append_sheet(wb, mk(txns,       [14, 28, 60, 14, 14, 18, 22]),          "Transactions");
  XLSX.utils.book_append_sheet(wb, mk(schedule,   [6, 14, 28, 14, 14, 14, 14]),           "Schedule");
  XLSX.utils.book_append_sheet(wb, mk(docsSheet,  [50, 24, 14, 10]),                      "Documents");

  const safeId = deal.id.replace(/[^A-Za-z0-9_-]/g, "");
  const todayIso = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `CredX_${safeId}_${todayIso}.xlsx`);
}

function _addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// ─────────────────────────────────────────────────────────────────
// Official statement model — normalises the investor's book into the
// shared `model` consumed by credx-statement-doc.js. Honours a custom
// date range + a section-include map so the investor can build exactly
// the statement they want, then download it as an official PDF or data.
// ─────────────────────────────────────────────────────────────────
function _ukTaxYear(d) {
  // UK tax year runs 6 April → 5 April.
  const y = d.getFullYear();
  const beforeApr6 = (d.getMonth() < 3) || (d.getMonth() === 3 && d.getDate() < 6);
  const start = beforeApr6 ? y - 1 : y;
  return start + "/" + String(start + 1).slice(2);
}

function buildPortalStatementModel(opts = {}) {
  const inc = Object.assign(
    { summary: true, active: true, redeemed: true, ledger: true, tax: true },
    opts.include || {}
  );
  const fromD = opts.from ? new Date(opts.from + "T00:00:00") : null;
  const toD   = opts.to   ? new Date(opts.to   + "T23:59:59") : null;
  const today = new Date();
  const endD  = toD || today;
  const inRange = (d) => (!fromD || d >= fromD) && (!toD || d <= toD);
  const gbp = (n) => fmtGBP(n, { decimals: 0 });

  const periodLabel = (fromD || toD)
    ? ((fromD ? _fmtDate(fromD) : "Inception") + " – " + _fmtDate(endD))
    : ("Inception to " + _fmtDate(today));

  // ── aggregates ──
  const activeCapital    = LIVE_DEALS.reduce((s, d) => s + d.position, 0);
  const interestAccrued  = LIVE_DEALS.reduce((s, d) => s + d.interestAccrued, 0);
  const redeemedInRange  = COMPLETED_DEALS.filter(d => inRange(_parse(d.redeemed)));
  const capitalReturned  = redeemedInRange.reduce((s, d) => s + d.position, 0);
  const interestRealised = redeemedInRange.reduce((s, d) => s + d.interestEarned, 0);

  const tables = [];

  // ── Active positions ──
  if (inc.active) {
    tables.push({
      id: "Active positions",
      title: "Active positions",
      note: "As at " + _fmtDate(endD),
      columns: [
        { label: "Facility" }, { label: "Property" }, { label: "Type" },
        { label: "Coupon", align: "right" }, { label: "Drawn", align: "right" },
        { label: "Maturity", align: "right" }, { label: "Principal", align: "right" },
        { label: "Interest accrued", align: "right" },
      ],
      rows: LIVE_DEALS.map(d => [
        d.id, d.property, d.type, d.rate.toFixed(2) + "%",
        d.drawn, d.maturity, gbp(d.position), gbp(d.interestAccrued),
      ]),
      total: ["Total", LIVE_DEALS.length + " facilities", "", "", "", "", gbp(activeCapital), gbp(interestAccrued)],
    });
  }

  // ── Redeemed positions ──
  if (inc.redeemed) {
    tables.push({
      id: "Redeemed positions",
      title: "Redeemed positions",
      note: redeemedInRange.length + " in period",
      columns: [
        { label: "Facility" }, { label: "Property" }, { label: "Type" },
        { label: "Coupon", align: "right" }, { label: "Drawn", align: "right" },
        { label: "Redeemed", align: "right" }, { label: "Principal", align: "right" },
        { label: "Interest realised", align: "right" },
      ],
      rows: redeemedInRange
        .sort((a, b) => _parse(b.redeemed) - _parse(a.redeemed))
        .map(d => [
          d.id, d.property, d.type, d.rate.toFixed(2) + "%",
          d.drawn, d.redeemed, gbp(d.position), gbp(d.interestEarned),
        ]),
      total: ["Total", redeemedInRange.length + " facilities", "", "", "", "", gbp(capitalReturned), gbp(interestRealised)],
    });
  }

  // ── Transaction ledger ──
  if (inc.ledger) {
    const txns = [];
    const all = [...LIVE_DEALS, ...COMPLETED_DEALS];
    for (const d of all) {
      txns.push({ date: _parse(d.drawn), dateStr: d.drawn, ref: d.id, desc: "Capital deployed", out: d.position, in: 0 });
    }
    for (const d of COMPLETED_DEALS) {
      txns.push({ date: _parse(d.redeemed), dateStr: d.redeemed, ref: d.id, desc: "Capital returned", out: 0, in: d.position });
      txns.push({ date: _parse(d.redeemed), dateStr: d.redeemed, ref: d.id, desc: "Interest received", out: 0, in: d.interestEarned });
    }
    txns.sort((a, b) => a.date - b.date);
    // running net deployed across the WHOLE history, but only show in-range rows
    let net = 0;
    const rows = [];
    let inSum = 0, outSum = 0;
    for (const t of txns) {
      net += t.out - t.in;
      if (!inRange(t.date)) continue;
      inSum += t.in; outSum += t.out;
      rows.push([
        t.dateStr, t.ref, t.desc,
        t.out ? gbp(t.out) : "—",
        t.in ? gbp(t.in) : "—",
        gbp(net),
      ]);
    }
    tables.push({
      id: "Transaction ledger",
      title: "Transaction ledger",
      note: rows.length + " transactions",
      columns: [
        { label: "Date" }, { label: "Reference" }, { label: "Description" },
        { label: "Out", align: "right" }, { label: "In", align: "right" },
        { label: "Net deployed", align: "right" },
      ],
      rows: rows.length ? rows : [["—", "—", "No transactions in this period", "—", "—", "—"]],
      total: rows.length ? ["", "", "Period total", gbp(outSum), gbp(inSum), ""] : null,
    });
  }

  // ── Interest by UK tax year ──
  if (inc.tax) {
    const byYear = {};
    redeemedInRange.forEach(d => {
      const ty = _ukTaxYear(_parse(d.redeemed));
      if (!byYear[ty]) byYear[ty] = { interest: 0, count: 0 };
      byYear[ty].interest += d.interestEarned;
      byYear[ty].count += 1;
    });
    const years = Object.keys(byYear).sort();
    const totalInt = years.reduce((s, y) => s + byYear[y].interest, 0);
    const totalCnt = years.reduce((s, y) => s + byYear[y].count, 0);
    tables.push({
      id: "Interest by tax year",
      title: "Interest summary by UK tax year",
      note: "Realised interest · for your records / HMRC",
      columns: [
        { label: "UK tax year" }, { label: "Interest realised", align: "right" },
        { label: "Facilities redeemed", align: "right" },
      ],
      rows: years.length
        ? years.map(y => [y, gbp(byYear[y].interest), String(byYear[y].count)])
        : [["—", "No interest realised in this period", "—"]],
      total: years.length ? ["Total", gbp(totalInt), String(totalCnt)] : null,
    });
  }

  const summary = inc.summary ? [
    { label: "Capital currently active", value: gbp(activeCapital), sub: LIVE_DEALS.length + " active facilities" },
    { label: "Interest realised", value: gbp(interestRealised), sub: "Paid to you in period" },
    { label: "Interest accruing", value: gbp(interestAccrued), sub: "Live facilities, to date" },
    { label: "Capital returned", value: gbp(capitalReturned), sub: redeemedInRange.length + " redeemed in period" },
  ] : [];

  return {
    docTitle: "Investor Statement",
    period: { label: periodLabel },
    investor: {
      name: INVESTOR.name,
      ref: INVESTOR.accountId,
      classification: INVESTOR.classification,
      email: INVESTOR.email,
    },
    company: COMPANY,
    summary,
    tables,
    signatory: {
      name: "For and on behalf of " + COMPANY.name,
      title: "Funder Relations · Authorised signatory",
    },
  };
}

function hydrateInvestorPortfolio(payload) {
  const allocations = Array.isArray(payload?.allocations) ? payload.allocations : [];
  const formatDate = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  };
  const hydrated = allocations.map((allocation) => ({
    id: allocation.loan_id,
    title: allocation.title,
    property: `${allocation.property} · ${allocation.asset}`,
    type: allocation.type,
    position: Number(allocation.amount) || 0,
    rate: Number(allocation.rate) || Number(allocation.coupon) || 0,
    term: 0,
    drawn: "-",
    maturity: formatDate(allocation.maturity),
    progress: 0,
    status: allocation.loan_status === "ACTIVE" ? "live" : "pending",
    ltv: Number(allocation.ltv) || 0,
    interestAccrued: 0,
    nextEvent: null,
    security: "CredX facility security",
    borrower: "Available from CredX",
    purpose: "Investor allocation held in the CredX portfolio.",
    facilityRef: allocation.loan_id,
  }));
  LIVE_DEALS.splice(0, LIVE_DEALS.length, ...hydrated);
  const capital = hydrated.reduce((sum, deal) => sum + deal.position, 0);
  KPIS.capitalDeployed = capital;
  KPIS.weightedLtv = capital ? hydrated.reduce((sum, deal) => sum + deal.ltv * deal.position, 0) / capital : 0;
}

function hydrateInvestorIdentity(user) {
  if (!user) return;
  if (user.displayName) INVESTOR.name = user.displayName;
  if (user.email) INVESTOR.email = user.email;
  if (user.reference) INVESTOR.accountId = user.reference;
  if (user.classification) INVESTOR.classification = user.classification;
}

Object.assign(window, {
  INVESTOR, COMPANY, LIVE_DEALS, COMPLETED_DEALS, OPPORTUNITIES, UPDATES, DOCUMENTS, DISTRIBUTIONS, PERF_SERIES, CUMULATIVE_INTEREST, GEO_EXPOSURE, KPIS,
  fmtGBP, fmtPct, compactGBPValue, downloadCSV, exportPositions, exportStatement, exportDealStatement, hydrateInvestorPortfolio, hydrateInvestorIdentity,
  buildPortalStatementModel,
});

// ─────────────────────────────────────────────────────────────────
// Bridge sync — pull deals the employee backend has POSTED to the
// platform, plus their "new deal" updates, into the investor-facing
// data. Idempotent: safe to call repeatedly. Runs once at load AND
// again whenever the bridge changes (see App), so a deal posted while
// the portal is already open appears without a manual reload, and a
// deal flipped to "live" updates its card in place.
// ─────────────────────────────────────────────────────────────────
function CredXSyncBridge() {
  if (!window.CredXBridge) return;
  try {
    const posted = window.CredXBridge.getPostedDeals();
    // Oldest-first so unshift leaves newest posted deal at the very top.
    posted.slice().reverse().forEach(d => {
      const i = OPPORTUNITIES.findIndex(o => o.id === d.id);
      if (i === -1) OPPORTUNITIES.unshift(d);
      else OPPORTUNITIES[i] = Object.assign(OPPORTUNITIES[i], d); // pick up lifecycle / edits
    });
    // Drop deals that were unpublished in the backend.
    const postedIds = new Set(posted.map(d => d.id));
    for (let i = OPPORTUNITIES.length - 1; i >= 0; i--) {
      if (OPPORTUNITIES[i].loanId && !postedIds.has(OPPORTUNITIES[i].id)) OPPORTUNITIES.splice(i, 1);
    }
    // Allocation-driven funding: the backend is the source of truth for who
    // is committed to each loan (seed book + live allocations − removals). It
    // publishes a per-loan committed-capital map to the bridge; we read it and
    // reflect it as the deal's "% funded" / amount remaining. Falls back to
    // summing live bridge allocations if the backend hasn't published yet.
    // Matches an opportunity to a loan by its loanId (backend-posted deals) or
    // its DIP reference (authored opportunities whose DIP ref is a loan id).
    const published = (window.CredXBridge.getFundingByLoan && window.CredXBridge.getFundingByLoan()) || {};
    const committedByLoan = Object.assign({}, published);
    if (!Object.keys(committedByLoan).length) {
      const allocs = (window.CredXBridge.getAllocations && window.CredXBridge.getAllocations()) || [];
      allocs.forEach(a => {
        if (!a || !a.loanId) return;
        committedByLoan[a.loanId] = (committedByLoan[a.loanId] || 0) + (Number(a.amount) || 0);
      });
    }
    const loanKeyFor = (o) => {
      if (o.loanId && committedByLoan[o.loanId] != null) return o.loanId;
      const dipRef = o.dip && o.dip.reference;
      if (dipRef && committedByLoan[dipRef] != null) return dipRef;
      return null;
    };
    OPPORTUNITIES.forEach(o => {
      const key = loanKeyFor(o);
      if (key == null) return;
      const committed = committedByLoan[key];
      const target = o.fundingRequirement || o.facility;
      if (!target) return;
      o.committedCapital = committed;
      o.raisedPct = Math.min(1, committed / target);
    });
    const upd = window.CredXBridge.getUpdates();
    upd.slice().reverse().forEach(u => {
      if (!UPDATES.some(x => x.id === u.id)) UPDATES.unshift(u);
    });
    const nda = window.CredXBridge.getNda(INVESTOR.accountId);
    if (nda && nda.signed && !INVESTOR.institutionalNda) {
      INVESTOR.platformNdaFromBackend = { signedAt: nda.signedAt, by: nda.by };
    }
  } catch (e) { /* bridge optional - never block the portal */ }
}
window.CredXSyncBridge = CredXSyncBridge;
CredXSyncBridge();

