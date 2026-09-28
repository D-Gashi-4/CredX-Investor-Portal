// Seed content for the investor Updates feed. Plain script so both the
// portal and the documents generator can read it before Babel runs.
// Each entry: summary `body` for the feed, `article` blocks for the reader,
// and `attachments` — each with a `doc` model rendered by credx-update-doc.js.
//
// Block types: ["h", text] · ["p", text] · ["kpis", [[label, value, sub]]]
//              ["table", { cols:[...], align:[...], rows:[[...]], total:[...] }]
//              ["list", [text, ...]] · ["note", text]
(function () {
  const BOOK_KPIS = ["kpis", [
    ["Capital deployed", "£18.4m", "41 facilities"],
    ["Weighted avg. LTV", "56%", "Day-one valuations"],
    ["Weighted avg. rate", "11.2%", "Per annum, gross"],
    ["Capital losses", "£0", "Since inception"],
  ]];

  const BOOK_TABLE = ["table", {
    cols: ["Segment", "Facilities", "Deployed", "Share", "Avg. LTV"],
    align: ["left", "right", "right", "right", "right"],
    rows: [
      ["Refurbishment bridge", "17", "£7.36m", "40%", "58%"],
      ["Residential bridge (chain break / auction)", "11", "£4.42m", "24%", "54%"],
      ["Light development", "6", "£3.68m", "20%", "61%"],
      ["Commercial / mixed-use", "5", "£2.21m", "12%", "52%"],
      ["Land with planning", "2", "£0.73m", "4%", "45%"],
    ],
    total: ["Total book", "41", "£18.40m", "100%", "56%"],
  }];

  const GEO_TABLE = ["table", {
    cols: ["Region", "Facilities", "Deployed", "Share"],
    align: ["left", "right", "right", "right"],
    rows: [
      ["Kent", "22", "£9.94m", "54%"],
      ["Sussex", "7", "£3.13m", "17%"],
      ["Greater London", "5", "£2.76m", "15%"],
      ["Essex", "4", "£1.47m", "8%"],
      ["Surrey", "3", "£1.10m", "6%"],
    ],
  }];

  const DISCLAIMER = "Capital is at risk. Past performance is not a reliable indicator of future results. This document is provided for information only to registered CredX funders and does not constitute financial advice or an offer of investment.";

  window.CREDX_UPDATES_SEED = [
    {
      id: "u-026", date: "20 May 2026", timeAgo: "yesterday", kind: "Platform", pinned: true,
      author: "CredX Investor Team", readTime: "4 min read",
      title: "May investor letter - book composition and pipeline",
      body: "Capital deployed at month-end stands at £18.4m across 41 facilities. Weighted average LTV is 56%. Six new facilities funded in May with three resolutions in the pipeline; redemption performance remains in line with prior quarters.",
      article: [
        ["p", "Capital deployed at month-end stands at £18.4m across 41 facilities, up from £16.9m at the end of April. Six new facilities completed in May, with a combined advance of £2.1m. Four facilities redeemed during the month, returning £1.6m of principal to funders."],
        BOOK_KPIS,
        ["h", "Book composition"],
        ["p", "Refurbishment bridging remains the largest segment at 40% of the book. Light development exposure has grown to 20% following two completions in Maidstone and Ashford, both within our 65% LTGDV ceiling."],
        BOOK_TABLE,
        ["h", "Redemptions and arrears"],
        ["p", "Average time to redemption across facilities closed in the last twelve months is 10.4 months against an average term of 12. No facility is in payment arrears. One facility (CX-2519-S, Hastings) has been granted a three-month extension to allow a refinance to complete; the extension fee has been collected and interest continues to be serviced."],
        ["h", "Pipeline"],
        ["p", "We have £6.8m of applications in underwriting, of which £3.2m has passed credit committee and is awaiting valuation or legal completion. Three facilities, totalling £1.4m, are expected to be offered to funders before the end of June."],
      ],
      attachments: [{
        name: "May 2026 investor letter", pages: 2, size: "412 KB",
        doc: { title: "Investor Letter", subtitle: "May 2026", ref: "CX-IL-2605", date: "20 May 2026", author: "CredX Investor Team",
          blocks: [
            ["p", "Dear Funder,"],
            ["p", "Thank you for your continued support. This letter summarises the position of the CredX loan book at 31 May 2026, activity during the month and the pipeline for June."],
            BOOK_KPIS,
            ["h", "Book composition by segment"], BOOK_TABLE,
            ["h", "Geographic exposure"], GEO_TABLE,
            ["h", "Activity in May"],
            ["list", ["Six new facilities completed, total advance £2.1m, average LTV 57%.", "Four facilities redeemed in full, returning £1.6m of principal plus accrued interest.", "One three-month extension granted (CX-2519-S); extension fee collected.", "No payment arrears; no facilities on the watch list."]],
            ["h", "Pipeline for June"],
            ["p", "£6.8m of applications are in underwriting. £3.2m has passed credit committee. We expect to offer three facilities, totalling £1.4m, to funders before the end of June."],
            ["p", "Yours faithfully,"], ["p", "The CredX Investor Team"],
          ] },
      }],
    },
    {
      id: "u-025", date: "18 May 2026", timeAgo: "3 days ago", kind: "Deal update", dealId: "CX-2540-K",
      author: "CredX Servicing", readTime: "2 min read",
      title: "Canterbury HMO conversion - works signed off, redemption booked",
      body: "Foundation Home Loans has issued the formal mortgage offer. Solicitors are instructed for redemption on 12 June. No remedial items outstanding from the monitoring surveyor's final inspection.",
      article: [
        ["p", "The monitoring surveyor completed the final inspection of the six-bed HMO conversion on 14 May and has confirmed all works are complete to specification. Building control sign-off and the HMO licence from Canterbury City Council were received the same week."],
        ["kpis", [["Facility", "£140,000", "First charge"], ["Post-works value", "£395,000", "RICS, May 2026"], ["Exit LTV", "35%", "Gross"], ["Redemption", "12 Jun 2026", "Booked"]]],
        ["h", "Exit"],
        ["p", "Foundation Home Loans has issued a formal buy-to-let mortgage offer of £276,500 on the completed HMO. The borrower's solicitors have been instructed and the redemption statement has been issued. Funds, including interest to the redemption date, will be returned to funders' nominated accounts on completion."],
      ],
      attachments: [{
        name: "Monitoring surveyor final report", pages: 3, size: "1.4 MB",
        doc: { title: "Monitoring Surveyor Report", subtitle: "Final inspection · CX-2540-K, Canterbury", ref: "CX-MS-2540-F", date: "14 May 2026", author: "Independent monitoring surveyor, on behalf of CredX Ltd",
          blocks: [
            ["kpis", [["Inspection", "14 May 2026", "Final"], ["Works complete", "100%", "To specification"], ["Budget spent", "£86,200", "of £88,000"], ["Outstanding items", "0", "Nil retentions"]]],
            ["h", "Scope of works"],
            ["table", { cols: ["Element", "Budget", "Certified", "Status"], align: ["left", "right", "right", "left"],
              rows: [["Strip-out and structural", "£14,000", "£13,650", "Complete"], ["Electrics and fire alarm (Grade D LD2)", "£18,500", "£18,500", "Complete"], ["Plumbing and 3 en-suites", "£21,000", "£20,400", "Complete"], ["Kitchen and communal areas", "£12,500", "£12,150", "Complete"], ["Decoration, flooring, fire doors", "£16,000", "£15,800", "Complete"], ["Contingency", "£6,000", "£5,700", "Used"]],
              total: ["Total", "£88,000", "£86,200", ""] }],
            ["h", "Compliance"],
            ["list", ["Building control completion certificate issued 12 May 2026.", "HMO licence granted by Canterbury City Council for six occupants.", "Fire risk assessment, EICR and gas safety certificates on file."]],
            ["h", "Conclusion"],
            ["p", "Works are complete and the property is suitable for letting as a licensed HMO. We have no remaining concerns and recommend release of any retained security on redemption."],
          ] },
      }],
    },
    {
      id: "u-0245", date: "15 May 2026", timeAgo: "6 days ago", kind: "Market insight",
      author: "CredX Credit Team", readTime: "5 min read",
      title: "South East bridging market - Q2 2026 briefing",
      body: "Transaction volumes in Kent and Sussex are up on Q1, driven by auction purchases and refurbishment exits into buy-to-let. We have held our maximum LTV at 70% and continue to price for term rather than volume.",
      article: [
        ["p", "Bridging completions across the South East rose in the first half of Q2, supported by a busier auction calendar and improved buy-to-let mortgage availability for refurbished stock. Competition among lenders remains strong at the lower end of the LTV range."],
        ["kpis", [["Bank Rate", "3.75%", "Held in May"], ["Avg. market bridge rate", "0.86% pm", "Industry surveys"], ["CredX avg. rate", "0.93% pm", "Q2 completions"], ["Kent house prices", "+2.1%", "Year on year"]]],
        ["h", "What we are seeing"],
        ["list", ["More auction purchases requiring 28-day completion, where our turnaround gives us an advantage.", "Buy-to-let lenders offering better terms on refurbished HMOs, which shortens our exit timelines.", "Longer planning timescales in some districts; we now require planning to be granted, not pending, for land facilities."]],
        ["h", "Our position"],
        ["p", "We have kept our maximum day-one LTV at 70% and our light development ceiling at 65% of gross development value. We continue to decline facilities where the exit depends on a single buyer or on planning still to be decided."],
      ],
      attachments: [{
        name: "Q2 2026 market briefing", pages: 3, size: "780 KB",
        doc: { title: "Market Briefing", subtitle: "South East bridging · Q2 2026", ref: "CX-MB-2602", date: "15 May 2026", author: "CredX Credit Team",
          blocks: [
            ["kpis", [["Bank Rate", "3.75%", "Held in May"], ["Avg. market bridge rate", "0.86% pm", ""], ["CredX avg. rate", "0.93% pm", "Q2 completions"], ["Kent house prices", "+2.1%", "Year on year"]]],
            ["h", "Regional house price movement"],
            ["table", { cols: ["Area", "Avg. price", "Annual change", "Avg. days to sell"], align: ["left", "right", "right", "right"],
              rows: [["Kent", "£398,000", "+2.1%", "61"], ["East Sussex", "£372,000", "+1.6%", "66"], ["West Sussex", "£421,000", "+1.9%", "63"], ["Essex", "£411,000", "+1.4%", "58"], ["Surrey", "£585,000", "+0.8%", "72"]] }],
            ["h", "Lending conditions"],
            ["p", "Buy-to-let product availability has improved, particularly for HMO and multi-unit freehold blocks. This supports the refinance exit that most of our refurbishment facilities rely on."],
            ["h", "Credit stance for Q3"],
            ["list", ["Maximum day-one LTV held at 70%.", "Light development capped at 65% LTGDV with monitoring on every drawdown.", "Planning must be granted for land facilities.", "Minimum two viable exit routes evidenced at underwriting."]],
          ] },
      }],
    },
    {
      id: "u-024", date: "14 May 2026", timeAgo: "1 week ago", kind: "Deal update", dealId: "CX-2604-K",
      author: "CredX Servicing", readTime: "1 min read",
      title: "Sevenoaks Mixed-Use - onward sale exchanged on Unit 3",
      body: "Borrower has exchanged on the sale of Unit 3 at £210k. Funds expected to support a partial redemption of the facility in Q3, reducing exposure ahead of maturity.",
      article: [
        ["p", "The borrower has exchanged contracts on the sale of Unit 3, a one-bed flat above the ground-floor commercial unit, at £210,000. Completion is set for 8 July."],
        ["p", "Net sale proceeds will be applied to a partial redemption of the facility. Once received, the outstanding balance falls to approximately £485,000 and the LTV against the remaining units drops from 61% to 48%."],
        ["kpis", [["Sale price", "£210,000", "Unit 3"], ["Completion", "08 Jul 2026", "Contracted"], ["LTV after", "48%", "From 61%"]]],
      ],
      attachments: [],
    },
    {
      id: "u-023", date: "07 May 2026", timeAgo: "2 weeks ago", kind: "Platform",
      author: "CredX Legal & Compliance", readTime: "3 min read",
      title: "JMW facility agreement template - annual review issued",
      body: "Our solicitors have issued the FY26 update to the facility agreement template, with refreshed event-of-default language and ICO-aligned data processing terms. No action required from existing investors; the new template applies to deployments from 01 June.",
      article: [
        ["p", "JMW Solicitors has completed its annual review of the CredX facility agreement template. Version 6.0 applies to all facilities completing from 01 June 2026. Existing facilities remain on the terms under which they were written."],
        ["h", "Main changes"],
        ["list", ["Events of default now expressly include failure to maintain buildings insurance naming CredX as loss payee.", "Clearer cure periods: 10 business days for non-payment, 20 for other remediable breaches.", "Data processing schedule updated to reflect current ICO guidance.", "Extension fees and default interest set out in a single schedule."]],
        ["p", "No action is needed from funders. The marked-up template is attached for reference."],
      ],
      attachments: [{
        name: "Facility agreement v6.0 summary of changes", pages: 2, size: "320 KB",
        doc: { title: "Facility Agreement v6.0", subtitle: "Summary of changes from v5.2", ref: "CX-FA-60", date: "07 May 2026", author: "Prepared with JMW Solicitors LLP",
          blocks: [
            ["table", { cols: ["Clause", "Change", "Effect"], align: ["left", "left", "left"],
              rows: [["19.1(f)", "Insurance default added", "Lapse of cover is an event of default"], ["19.3", "Cure periods defined", "10 / 20 business days"], ["22", "Data processing schedule", "Aligned to current ICO guidance"], ["Sch. 4", "Fees consolidated", "Extension and default rates in one place"], ["25.2", "Notices by email", "Email is valid notice to registered address"]] }],
            ["h", "Application"],
            ["p", "Version 6.0 applies to facilities completing on or after 01 June 2026. Facilities completed before that date continue on the version under which they were executed."],
          ] },
      }],
    },
    {
      id: "u-0225", date: "02 May 2026", timeAgo: "3 weeks ago", kind: "Platform",
      author: "CredX Credit Team", readTime: "3 min read",
      title: "Lending policy refresh - what has changed",
      body: "Credit committee has approved the 2026 lending policy. Headline limits are unchanged; we have tightened concentration limits per borrower and added a second valuation for facilities above £750k.",
      article: [
        ["p", "Credit committee approved the 2026 lending policy on 28 April. It sets the limits every facility on the platform is underwritten against."],
        ["table", { cols: ["Limit", "2025", "2026"], align: ["left", "right", "right"],
          rows: [["Maximum day-one LTV", "70%", "70%"], ["Light development (LTGDV)", "65%", "65%"], ["Single borrower exposure", "10% of book", "7.5% of book"], ["Second valuation required", "Above £1m", "Above £750k"], ["Maximum term", "18 months", "18 months"]] }],
        ["p", "The lower single-borrower limit reduces concentration as the book grows. The second valuation threshold brings our largest facilities under closer review."],
      ],
      attachments: [{
        name: "Lending policy summary 2026", pages: 2, size: "260 KB",
        doc: { title: "Lending Policy Summary", subtitle: "Approved by credit committee, 28 April 2026", ref: "CX-LP-2026", date: "02 May 2026", author: "CredX Credit Team",
          blocks: [
            ["h", "Security"], ["list", ["First legal charge over UK property in England and Wales.", "Personal guarantees from all directors of corporate borrowers.", "Debenture where the borrower is a special purpose vehicle."]],
            ["h", "Limits"],
            ["table", { cols: ["Limit", "Policy"], align: ["left", "right"], rows: [["Maximum day-one LTV", "70%"], ["Light development (LTGDV)", "65%"], ["Single borrower exposure", "7.5% of book"], ["Second valuation", "Facilities above £750k"], ["Term", "3 to 18 months"]] }],
            ["h", "Exclusions"], ["list", ["Owner-occupied residential lending regulated by the FCA.", "Properties outside England and Wales.", "Facilities where the only exit is a sale to a single identified buyer."]],
          ] },
      }],
    },
    {
      id: "u-022", date: "30 Apr 2026", timeAgo: "3 weeks ago", kind: "Statement",
      author: "CredX Investor Team", readTime: "1 min read",
      title: "Q1 2026 investor statement available",
      body: "Your quarterly statement is now available in the document vault. Interest credited for the period: £14,229.83 across five facilities.",
      article: [
        ["p", "Your statement for 1 January to 31 March 2026 is available in the document vault and attached below."],
        ["kpis", [["Interest credited", "£14,229.83", "Q1 2026"], ["Facilities", "5", "Active in period"], ["Arrears", "£0.00", ""]]],
      ],
      attachments: [{
        name: "Q1 2026 statement summary", pages: 1, size: "612 KB",
        doc: { title: "Quarterly Statement Summary", subtitle: "1 January to 31 March 2026", ref: "CX-QS-2601", date: "30 Apr 2026", author: "CredX Investor Team",
          blocks: [
            ["table", { cols: ["Facility", "Location", "Interest credited"], align: ["left", "left", "right"],
              rows: [["CX-2604-K", "Sevenoaks", "£5,343.75"], ["CX-2572-D", "Maidstone", "£3,525.00"], ["CX-2540-K", "Canterbury", "£2,730.00"], ["CX-2511-R", "Folkestone", "£1,818.75"], ["CX-2598-K", "Tunbridge Wells", "£812.33"]],
              total: ["Total", "", "£14,229.83"] }],
            ["note", "The full statement, with transaction-level detail, is available in Documents."],
          ] },
      }],
    },
    {
      id: "u-021", date: "22 Apr 2026", timeAgo: "1 month ago", kind: "Deal update", dealId: "CX-2511-R",
      author: "CredX Servicing", readTime: "1 min read",
      title: "Folkestone refurb - practical completion certified",
      body: "Works are signed off and Together Money has issued the formal remortgage offer. Redemption is scheduled for 29 May with funds returning to your client account same day.",
      article: [
        ["p", "Practical completion of the two-flat refurbishment was certified on 17 April. Together Money has issued a formal remortgage offer based on a post-works valuation of £305,000."],
        ["kpis", [["Post-works value", "£305,000", "Up from £205,000"], ["Exit LTV", "49%", ""], ["Redemption", "29 May 2026", "Scheduled"]]],
      ],
      attachments: [{
        name: "Practical completion certificate", pages: 1, size: "190 KB",
        doc: { title: "Practical Completion", subtitle: "CX-2511-R · Folkestone", ref: "CX-PC-2511", date: "17 Apr 2026", author: "Independent monitoring surveyor",
          blocks: [
            ["p", "We certify that the works at the property have reached practical completion in accordance with the approved schedule of works dated October 2025."],
            ["table", { cols: ["Item", "Detail"], align: ["left", "left"], rows: [["Works", "Conversion to two self-contained flats"], ["Building control", "Completion certificate issued 15 Apr 2026"], ["Post-works valuation", "£305,000 (RICS)"], ["Retentions", "None"]] }],
          ] },
      }],
    },
    {
      id: "u-020", date: "15 Apr 2026", timeAgo: "5 weeks ago", kind: "Platform",
      author: "CredX Investor Team", readTime: "6 min read",
      title: "Annual review 2025 - our first full year",
      body: "In 2025 we completed 58 facilities, returned £11.2m of principal to funders and paid £1.46m of interest, with no capital losses. The review sets out how the book performed and our plans for 2026.",
      article: [
        ["p", "2025 was CredX's first full year of lending. We completed 58 facilities with a total advance of £21.6m, and 34 facilities redeemed in full during the year."],
        ["kpis", [["Facilities completed", "58", "2025"], ["Total advanced", "£21.6m", ""], ["Interest paid to funders", "£1.46m", ""], ["Capital losses", "£0", ""]]],
        ["h", "Performance"],
        ["p", "The average net return to funders on redeemed facilities was 9.4% per annum. Average time to redemption was 10.1 months. Two facilities required extensions; both have since redeemed in full."],
        ["h", "2026 priorities"],
        ["list", ["Grow the funder base while holding lending criteria unchanged.", "Launch the secondary market so funders can exit positions before redemption.", "Move investor reporting fully onto the portal, including tax summaries."]],
      ],
      attachments: [{
        name: "Annual review 2025", pages: 4, size: "2.1 MB",
        doc: { title: "Annual Review", subtitle: "Year ended 31 December 2025", ref: "CX-AR-2025", date: "15 Apr 2026", author: "CredX Ltd",
          blocks: [
            ["kpis", [["Facilities completed", "58", ""], ["Total advanced", "£21.6m", ""], ["Principal returned", "£11.2m", "34 redemptions"], ["Interest paid", "£1.46m", "To funders"]]],
            ["h", "Quarterly activity"],
            ["table", { cols: ["Quarter", "Completions", "Advanced", "Redemptions", "Interest paid"], align: ["left", "right", "right", "right", "right"],
              rows: [["Q1 2025", "11", "£3.9m", "4", "£228k"], ["Q2 2025", "14", "£5.2m", "7", "£334k"], ["Q3 2025", "15", "£5.8m", "10", "£418k"], ["Q4 2025", "18", "£6.7m", "13", "£480k"]],
              total: ["Year", "58", "£21.6m", "34", "£1.46m"] }],
            ["h", "Credit performance"],
            ["list", ["No capital losses and no facilities in enforcement.", "Two extensions granted; both redeemed in full with fees collected.", "Average day-one LTV of completed facilities: 57%."]],
            ["h", "Outlook"],
            ["p", "We expect to grow deployment in 2026 while holding lending criteria unchanged. Our priorities are the secondary market, portal-based tax reporting and a broader funder base."],
          ] },
      }],
    },
    {
      id: "u-019", date: "08 Apr 2026", timeAgo: "6 weeks ago", kind: "Deal update", dealId: "CX-2598-K",
      author: "CredX Servicing", readTime: "1 min read",
      title: "Tunbridge Wells - month-three valuation refresh",
      body: "A desktop valuation refresh confirms the property value at £640k, unchanged from day one. Works are 40% complete and on budget.",
      article: [
        ["p", "As part of our standard month-three review, the valuer has confirmed the as-is value at £640,000, unchanged from the day-one valuation. The monitoring surveyor reports works 40% complete and within budget."],
        ["kpis", [["Current value", "£640,000", "Unchanged"], ["Works complete", "40%", "On budget"], ["Current LTV", "55%", ""]]],
      ],
      attachments: [{
        name: "Valuation refresh summary", pages: 1, size: "240 KB",
        doc: { title: "Valuation Refresh", subtitle: "CX-2598-K · Tunbridge Wells", ref: "CX-VR-2598-3", date: "08 Apr 2026", author: "RICS registered valuer, on behalf of CredX Ltd",
          blocks: [["table", { cols: ["Measure", "Day one", "Month three"], align: ["left", "right", "right"], rows: [["Market value (as is)", "£640,000", "£640,000"], ["Gross development value", "£860,000", "£860,000"], ["Facility drawn", "£330,000", "£352,000"], ["LTV", "52%", "55%"]] }], ["p", "Local comparable evidence supports the day-one value. No change to the GDV assumption."]] },
      }],
    },
    {
      id: "u-018", date: "18 Mar 2026", timeAgo: "2 months ago", kind: "Events",
      author: "CredX Credit Team", readTime: "Recording · 38 min",
      title: "Investor webinar: how we underwrite a bridging loan",
      body: "The slides from our March webinar walk through a real facility from application to redemption, including valuation, legal and exit checks. The recording is available on request.",
      article: [
        ["p", "Our March webinar took 64 funders through the full underwriting process on a recent refurbishment facility, from the first broker enquiry to the redemption statement."],
        ["list", ["How we assess the borrower and their track record.", "Valuation, and when we require a second one.", "Legal due diligence and the charge.", "How exits are tested before we lend."]],
        ["p", "The slides are attached. Contact the investor team at info@credx.co.uk for the recording."],
      ],
      attachments: [{
        name: "Webinar slides - how we underwrite", pages: 3, size: "3.4 MB",
        doc: { title: "How We Underwrite", subtitle: "Investor webinar · 18 March 2026", ref: "CX-WB-2603", date: "18 Mar 2026", author: "CredX Credit Team",
          blocks: [
            ["h", "1. Enquiry and triage"], ["p", "Broker enquiries are screened within 24 hours against our lending policy. Around one in four proceeds to full application."],
            ["h", "2. Borrower assessment"], ["list", ["Identity, AML and source of deposit.", "Track record on comparable projects.", "Personal guarantees from all directors."]],
            ["h", "3. Valuation"], ["p", "RICS valuation instructed from our panel. A second valuation is required above £750k."],
            ["h", "4. Legal"], ["p", "Title, searches and the first legal charge are handled by panel solicitors. Funds go directly to the solicitor's client account on completion."],
            ["h", "5. Exit"], ["p", "At least two viable exits must be evidenced. Refinance exits are checked against current buy-to-let lending criteria."],
          ] },
      }],
    },
    {
      id: "u-017", date: "12 Feb 2026", timeAgo: "3 months ago", kind: "Deal update", dealId: "CX-2572-D",
      author: "CredX Servicing", readTime: "1 min read",
      title: "Maidstone - planning granted for an additional unit",
      body: "Maidstone Borough Council has approved a variation adding a fourth unit to the scheme. The revised GDV of £1.18m lowers the facility's LTGDV from 63% to 54%.",
      article: [
        ["p", "Maidstone Borough Council has approved the borrower's application to add a fourth two-bed house to the scheme. The build programme extends by six weeks and remains within the facility term."],
        ["kpis", [["Revised GDV", "£1.18m", "From £1.02m"], ["LTGDV", "54%", "From 63%"], ["Term impact", "+6 weeks", "Within term"]]],
      ],
      attachments: [],
    },
  ];
})();
