/**
 * contract-generator.js — SyncDash Contract Generator
 * ─────────────────────────────────────────────────────
 * Generates a downloadable PDF contract (Order Form + MSA) for any account
 * directly in the browser using jsPDF. Reads all data from accounts.js.
 *
 * Dependencies:
 *   - accounts.js (must load first)
 *   - jsPDF via CDN: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
 *
 * Usage:
 *   SyncDash.generateContract('benefitbridge')  // triggers PDF download
 *   SyncDash.generateContract('payflow')
 *   SyncDash.generateContract('shifthr')
 */

// ── PATCH generateContract ONTO SyncDash ─────────────────────────────────────
// accounts.js exposes a stub; this file replaces it with the real implementation.

(function () {

  // ── COLORS ──────────────────────────────────────────────────────────────────
  const C = {
    navy:      [13,  27,  46],
    teal:      [0,   163, 137],
    tealLight: [230, 247, 244],
    mid:       [61,  80,  104],
    muted:     [122, 143, 168],
    border:    [221, 227, 237],
    lightBg:   [244, 247, 250],
    sigBg:     [249, 251, 253],
    amber:     [245, 166, 35],
    amberBg:   [255, 248, 237],
    amberBdr:  [245, 166, 35],
    white:     [255, 255, 255],
    black:     [26,  26,  46],
    red:       [255, 92,  106],
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────────

  function rgb(arr) {
    return { r: arr[0], g: arr[1], b: arr[2] };
  }

  function setFill(doc, arr) {
    doc.setFillColor(arr[0], arr[1], arr[2]);
  }

  function setDraw(doc, arr) {
    doc.setDrawColor(arr[0], arr[1], arr[2]);
  }

  function setFont(doc, arr) {
    doc.setTextColor(arr[0], arr[1], arr[2]);
  }

  function calcARR(seats, pricePerSeat) {
    return (seats * pricePerSeat * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pageW(doc) { return doc.internal.pageSize.getWidth(); }
  function pageH(doc) { return doc.internal.pageSize.getHeight(); }
  const ML = 18; // margin left
  const MR = 18; // margin right
  function contentW(doc) { return pageW(doc) - ML - MR; }

  // ── DRAW HELPERS ─────────────────────────────────────────────────────────────

  function hLine(doc, y, color = C.border, thickness = 0.3) {
    setDraw(doc, color);
    doc.setLineWidth(thickness);
    doc.line(ML, y, pageW(doc) - MR, y);
  }

  function rect(doc, x, y, w, h, fillColor, strokeColor, radius = 0) {
    if (fillColor) { setFill(doc, fillColor); }
    if (strokeColor) { setDraw(doc, strokeColor); doc.setLineWidth(0.3); }
    const style = fillColor && strokeColor ? 'FD' : fillColor ? 'F' : 'D';
    if (radius > 0) {
      doc.roundedRect(x, y, w, h, radius, radius, style);
    } else {
      doc.rect(x, y, w, h, style);
    }
  }

  function text(doc, str, x, y, opts = {}) {
    const { color = C.black, size = 9, bold = false, italic = false,
            align = 'left', maxWidth } = opts;
    setFont(doc, color);
    doc.setFontSize(size);
    doc.setFont('helvetica', bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal');
    const textOpts = { align };
    if (maxWidth) textOpts.maxWidth = maxWidth;
    doc.text(str, x, y, textOpts);
  }

  function wrappedText(doc, str, x, y, maxWidth, opts = {}) {
    const { color = C.black, size = 9, bold = false, lineHeight = 4.5 } = opts;
    setFont(doc, color);
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(str, maxWidth);
    lines.forEach((line, i) => {
      doc.text(line, x, y + (i * lineHeight));
    });
    return y + (lines.length * lineHeight);
  }

  // ── PAGE FOOTER ───────────────────────────────────────────────────────────────

  function drawFooter(doc, pageNum, totalPages, accountName) {
    const y = pageH(doc) - 10;
    hLine(doc, y - 3, C.border, 0.3);
    text(doc, `${accountName} & SyncToScale, Inc. — Master Subscription Agreement — CONFIDENTIAL`,
      ML, y, { color: C.muted, size: 7 });
    text(doc, `Page ${pageNum} of ${totalPages}`,
      pageW(doc) - MR, y, { color: C.muted, size: 7, align: 'right' });
  }

  // ── PAGE HEADER (logo + doc type) ─────────────────────────────────────────────

  function drawPageHeader(doc) {
    const y = 14;
    // SyncToScale wordmark
    text(doc, 'Sync', ML, y, { color: C.navy, size: 16, bold: true });
    const syncW = doc.getTextWidth('Sync');
    text(doc, 'ToScale', ML + syncW, y, { color: C.teal, size: 16, bold: true });

    // Doc type right-aligned
    text(doc, 'MASTER SUBSCRIPTION AGREEMENT',
      pageW(doc) - MR, y, { color: C.navy, size: 9, bold: true, align: 'right' });

    // Teal rule
    hLine(doc, y + 3, C.teal, 1.2);

    return y + 8; // return Y after header
  }

  // ── SECTION HEADING ───────────────────────────────────────────────────────────

  function sectionHeading(doc, label, y) {
    text(doc, label, ML, y, { color: C.navy, size: 9, bold: true });
    return y + 6;
  }

  // ── ORDER FORM TABLE ROW ──────────────────────────────────────────────────────

  function ofRow(doc, label, value, y, valueColor = C.black, isShaded = false) {
    const rowH = 7;
    const col1W = 58;
    const col2W = contentW(doc) - col1W;

    if (isShaded) {
      rect(doc, ML, y - 5, contentW(doc), rowH, C.lightBg);
    }
    setDraw(doc, C.border);
    doc.setLineWidth(0.2);
    doc.rect(ML, y - 5, contentW(doc), rowH, 'S');

    text(doc, label, ML + 2, y, { color: C.muted, size: 7.5, bold: true });
    text(doc, value, ML + col1W + 2, y, { color: valueColor, size: 8 });
    return y + rowH;
  }

  // ── SIGNATURE BLOCK ───────────────────────────────────────────────────────────

  function sigBlock(doc, x, y, w, party, signerName, title, company, signedDate, sigId) {
    const h = 38;
    rect(doc, x, y, w, h, C.sigBg, C.border);

    // Party label
    text(doc, party, x + 4, y + 5, { color: C.muted, size: 7, bold: true });

    // Cursive-style signature simulation
    text(doc, signerName, x + 4, y + 14, { color: C.teal, size: 13, italic: true, bold: true });

    // Divider
    hLine(doc, y + 17, C.border, 0.3);

    // Details
    text(doc, signerName, x + 4, y + 22, { color: C.navy, size: 8.5, bold: true });
    text(doc, title, x + 4, y + 27, { color: C.mid, size: 7.5 });
    text(doc, company, x + 4, y + 31, { color: C.mid, size: 7.5 });
    text(doc, `Signed: ${signedDate}`, x + 4, y + 36, { color: C.teal, size: 7 });

    // Sig ID — small, below box
    text(doc, `ID: ${sigId}`, x + 4, y + h + 4, { color: C.muted, size: 6.5 });

    return y + h + 8;
  }

  // ── CLAUSE ────────────────────────────────────────────────────────────────────

  function clause(doc, heading, body, y, checkPageBreak) {
    y = checkPageBreak(y, 20);
    text(doc, heading, ML, y, { color: C.black, size: 8.5, bold: true });
    y += 5;
    y = checkPageBreak(y, 10);
    y = wrappedText(doc, body, ML, y, contentW(doc), { color: C.black, size: 8.5, lineHeight: 4.5 }) + 5;
    return y;
  }

  // ── MAIN GENERATOR ────────────────────────────────────────────────────────────

  function generateContract(accountId) {
    const account = SyncDash.getAccount(accountId);
    if (!account) {
      console.warn(`SyncDash: account "${accountId}" not found`);
      return;
    }

    const c = account.contract;
    if (!c) {
      console.warn(`SyncDash: no contract data for "${accountId}"`);
      return;
    }

    // jsPDF must be loaded
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
      console.error('SyncDash: jsPDF not loaded. Add the jsPDF CDN script before contract-generator.js');
      return;
    }

    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });

    const arr = calcARR(account.licensedSeats, c.pricePerSeat);
    const cW  = contentW(doc);

    // We'll do 2 passes — first pass builds content, second adds footers
    // jsPDF doesn't support deferred page numbering natively, so we track pages manually
    const pages = [];
    let currentPage = 1;

    function addPage() {
      doc.addPage();
      currentPage++;
    }

    function checkPageBreak(y, needed = 15) {
      if (y + needed > pageH(doc) - 18) {
        addPage();
        y = drawPageHeader(doc) + 4;
      }
      return y;
    }

    // ── PAGE 1: ORDER FORM ──────────────────────────────────────────────────

    let y = drawPageHeader(doc);

    // Legal notice
    text(doc,
      'This document constitutes a binding legal agreement. Please read carefully.',
      pageW(doc) / 2, y + 2,
      { color: C.muted, size: 7.5, italic: true, align: 'center' });
    y += 10;

    // ORDER FORM title
    text(doc, 'ORDER FORM', ML, y, { color: C.navy, size: 13, bold: true });
    y += 5;
    text(doc, 'Incorporated into and subject to the Master Subscription Agreement below.',
      ML, y, { color: C.muted, size: 7.5 });
    y += 8;

    // PARTIES section
    y = sectionHeading(doc, 'PARTIES', y);

    const halfW = (cW / 2) - 2;
    // Vendor box
    rect(doc, ML, y, halfW, 24, C.lightBg, C.border);
    text(doc, 'VENDOR', ML + 3, y + 5, { color: C.muted, size: 7, bold: true });
    text(doc, 'SyncToScale, Inc.', ML + 3, y + 11, { color: C.navy, size: 9.5, bold: true });
    text(doc, '340 Pine Street, Suite 800', ML + 3, y + 16, { color: C.mid, size: 8 });
    text(doc, 'San Francisco, CA 94104', ML + 3, y + 20, { color: C.mid, size: 8 });

    // Customer box
    const cx = ML + halfW + 4;
    rect(doc, cx, y, halfW, 24, C.lightBg, C.border);
    text(doc, 'CUSTOMER', cx + 3, y + 5, { color: C.muted, size: 7, bold: true });
    text(doc, account.name, cx + 3, y + 11, { color: C.navy, size: 9.5, bold: true });
    text(doc, c.hq, cx + 3, y + 16, { color: C.mid, size: 8 });
    text(doc, account.industry, cx + 3, y + 20, { color: C.mid, size: 8 });

    y += 30;

    // SUBSCRIPTION DETAILS table
    y = sectionHeading(doc, 'SUBSCRIPTION DETAILS', y);

    // Table header
    rect(doc, ML, y - 5, cW, 7, C.navy);
    text(doc, 'FIELD', ML + 2, y, { color: C.white, size: 7.5, bold: true });
    text(doc, 'DETAIL', ML + 60, y, { color: C.white, size: 7.5, bold: true });
    y += 2;

    const rows = [
      ['Subscription Plan',             `${c.plan} — $${c.pricePerSeat}/user/month`],
      ['Total Employees',               account.employees.toLocaleString()],
      ['Licensed Seats',                `${account.licensedSeats} seats`],
      ['Annual Recurring Revenue (ARR)',`$${arr} USD (${account.licensedSeats} seats × $${c.pricePerSeat}/mo × 12)`, C.navy],
      ['Billing Frequency',             c.billingCycle],
      ['Contract Start Date',           c.startDate],
      ['Initial Term',                  `${c.termYears} year${c.termYears !== 1 ? 's' : ''}`],
      ['Contract End Date',             c.endDate, C.amber],
      ['Auto-Renewal',                  `Yes — 12-month terms unless cancelled per Section 8.2`],
      ['Cancellation Deadline',         c.cancelDeadline, C.red],
      ['Modules Included',              c.modules],
      ['Nova AI Add-On',                c.novaAddon ? 'Included (+$15/user/month)' : 'Not included — available at +$15/user/month'],
      ['SyncToScale Integration',       'Enabled — Workflow Automation via SyncToScale API'],
      ['Support Tier',                  c.plan === 'Starter' ? 'Standard — Email, 8x5, 8-hour SLA' : 'Business — Email + Slack, 8x5, 4-hour SLA'],
      ['Governing Law',                 'State of California, United States'],
      ['Order Form Reference',          c.orderRef],
    ];

    rows.forEach(([label, value, valColor], i) => {
      y = checkPageBreak(y, 8);
      y = ofRow(doc, label, value, y, valColor || C.black, i % 2 === 0);
    });

    y += 8;

    // ORDER FORM SIGNATURES
    y = checkPageBreak(y, 55);
    y = sectionHeading(doc, 'AUTHORIZED SIGNATURES — ORDER FORM', y);
    text(doc,
      'By signing below, each party agrees to be bound by this Order Form and the Master Subscription Agreement.',
      ML, y, { color: C.muted, size: 7.5 });
    y += 8;

    const sigW = (cW / 2) - 4;
    sigBlock(doc, ML, y, sigW,
      'VENDOR — SyncToScale, Inc.',
      c.signerVendor.name, c.signerVendor.title, 'SyncToScale, Inc.',
      c.signedDate, c.sigIdVendor);

    sigBlock(doc, ML + sigW + 8, y, sigW,
      `CUSTOMER — ${account.name}`,
      c.signerCustomer.name, c.signerCustomer.title, account.name,
      c.signedDate, c.sigIdCustomer);

    y += 52;

    // E-sig note
    text(doc,
      'Executed electronically. Timestamp verification available upon request. Signature IDs recorded in SyncToScale contract management system.',
      pageW(doc) / 2, y,
      { color: C.muted, size: 7, italic: true, align: 'center' });

    // Footer page 1
    drawFooter(doc, 1, '—', account.name);

    // ── PAGE 2+: MSA ────────────────────────────────────────────────────────

    addPage();
    y = drawPageHeader(doc);

    text(doc, 'MASTER SUBSCRIPTION AGREEMENT',
      pageW(doc) / 2, y,
      { color: C.navy, size: 13, bold: true, align: 'center' });
    y += 5;
    text(doc, `Effective Date: ${c.startDate}  |  Agreement Reference: ${c.msaRef}`,
      pageW(doc) / 2, y,
      { color: C.muted, size: 8, align: 'center' });
    y += 8;

    y = wrappedText(doc,
      `This Master Subscription Agreement ("Agreement") is entered into as of the Effective Date by and between SyncToScale, Inc., a Delaware corporation ("Vendor"), and ${account.name} ("Customer"). This Agreement governs Customer's access to and use of the SyncToScale platform and related services as described in the accompanying Order Form.`,
      ML, y, cW, { size: 8.5, lineHeight: 4.5 }) + 6;

    // ── SECTION 1
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '1. DEFINITIONS', y);
    const defs = [
      ['1.1 "Platform"', 'The SyncToScale workflow automation and account intelligence software, including all updates, enhancements, and integrations made available to Customer under this Agreement.'],
      ['1.2 "Subscription Term"', 'The period during which Customer is authorized to access the Platform, as specified in the Order Form.'],
      ['1.3 "Authorized Users"', `Customer's employees, contractors, or agents authorized to access the Platform under a purchased seat license. Customer's current licensed seat count is ${account.licensedSeats} seats.`],
      ['1.4 "Customer Data"', 'All data, content, and information submitted by Customer or its Authorized Users to the Platform.'],
      ['1.5 "Order Form"', 'The ordering document executed by both parties specifying subscription details, pricing, and term, incorporated herein by reference.'],
    ];
    for (const [h, b] of defs) {
      y = clause(doc, h, b, y, checkPageBreak);
    }

    // ── SECTION 2
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '2. SUBSCRIPTION AND ACCESS', y);
    y = clause(doc, '2.1 Grant of License',
      'Subject to the terms of this Agreement and timely payment of all fees, Vendor grants Customer a non-exclusive, non-transferable, limited right to access and use the Platform solely for Customer\'s internal business operations during the Subscription Term.',
      y, checkPageBreak);
    y = clause(doc, '2.2 Seat Licenses',
      `Customer's use is limited to ${account.licensedSeats} Authorized User seats. Additional seats may be purchased at $${c.pricePerSeat}/user/month by executing a written amendment to the Order Form.`,
      y, checkPageBreak);
    y = clause(doc, '2.3 Restrictions',
      'Customer shall not: (a) sublicense, resell, or transfer access to the Platform; (b) reverse engineer or decompile the Platform; (c) use the Platform to develop a competing product; or (d) remove any proprietary notices.',
      y, checkPageBreak);

    // ── SECTION 3
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '3. FEES AND PAYMENT', y);
    y = clause(doc, '3.1 Subscription Fees',
      `Customer agrees to pay $${arr} USD annually as specified in the Order Form. All fees are due within thirty (30) days of invoice date. Fees are non-refundable except as provided in Section 8.`,
      y, checkPageBreak);
    y = clause(doc, '3.2 Late Payments',
      'Overdue amounts accrue interest at 1.5% per month. Vendor reserves the right to suspend access upon thirty (30) days written notice for non-payment.',
      y, checkPageBreak);
    y = clause(doc, '3.3 Price Adjustments',
      'Vendor may adjust subscription pricing at renewal with no less than sixty (60) days prior written notice. Price increases shall not exceed 7% annually without Customer\'s written consent.',
      y, checkPageBreak);

    // ── SECTION 4
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '4. CUSTOMER DATA AND PRIVACY', y);
    y = clause(doc, '4.1 Customer Ownership',
      'Customer retains all rights, title, and interest in and to Customer Data. Vendor acquires no ownership rights by virtue of this Agreement.',
      y, checkPageBreak);
    y = clause(doc, '4.2 Data Security',
      'Vendor shall implement commercially reasonable security measures to protect Customer Data. Vendor maintains SOC 2 Type II compliance and shall notify Customer within 72 hours of any confirmed data breach.',
      y, checkPageBreak);
    y = clause(doc, '4.3 Data Retention',
      'Upon termination, Vendor shall make Customer Data available for export for thirty (30) days, after which Vendor may delete Customer Data per its retention policies.',
      y, checkPageBreak);

    // ── SECTION 5
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '5. SERVICE LEVELS AND SUPPORT', y);
    y = clause(doc, '5.1 Uptime Commitment',
      'Vendor commits to 99.5% monthly uptime, excluding scheduled maintenance. Customer shall receive a 5% monthly fee credit for each 0.5% below the SLA.',
      y, checkPageBreak);
    y = clause(doc, '5.2 Support',
      `Vendor shall provide support per Customer's Support Tier (${c.plan} Plan). ${c.plan === 'Starter' ? 'Standard support includes email access during business hours with an 8-hour response SLA for critical issues.' : 'Business support includes email and Slack access during business hours with a 4-hour response SLA for critical issues.'}`,
      y, checkPageBreak);

    // ── SECTION 6
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '6. CONFIDENTIALITY', y);
    y = clause(doc, '6.1 Mutual Confidentiality',
      'Each party agrees to hold in confidence and not disclose to third parties any Confidential Information received from the other party, using no less than reasonable care.',
      y, checkPageBreak);
    y = clause(doc, '6.2 Survival',
      'Confidentiality obligations shall survive termination of this Agreement for three (3) years.',
      y, checkPageBreak);

    // ── SECTION 7
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '7. INTELLECTUAL PROPERTY', y);
    y = clause(doc, '7.1 Vendor IP',
      'Vendor retains all right, title, and interest in the Platform and all underlying technology. No rights are granted except as expressly set forth in this Agreement.',
      y, checkPageBreak);

    // ── SECTION 8 — CANCELLATION (highlighted)
    y = checkPageBreak(y, 50);
    y = sectionHeading(doc, '8. CANCELLATION AND TERMINATION', y);

    // Amber warning box
    const warnH = 14;
    rect(doc, ML, y, cW, warnH, C.amberBg, C.amberBdr);
    text(doc, 'IMPORTANT — CANCELLATION NOTICE REQUIREMENT:', ML + 3, y + 5,
      { color: [124, 56, 0], size: 8, bold: true });
    wrappedText(doc,
      `Customer must provide written notice of non-renewal no less than sixty (60) days prior to term end to avoid automatic renewal. For this contract ending ${c.endDate}, the cancellation deadline is ${c.cancelDeadline}.`,
      ML + 3, y + 10, cW - 6, { color: [124, 56, 0], size: 7.5, lineHeight: 4 });
    y += warnH + 6;

    y = clause(doc, '8.1 Term',
      `This Agreement commences on ${c.startDate} and continues for ${c.termYears} year${c.termYears !== 1 ? 's' : ''}. Following the Initial Term, this Agreement automatically renews for successive 12-month periods unless either party provides written notice per Section 8.2.`,
      y, checkPageBreak);
    y = clause(doc, '8.2 Cancellation — Non-Renewal Notice',
      `Either party may elect not to renew by providing written notice no less than sixty (60) days prior to term end. For this Agreement, the cancellation deadline is ${c.cancelDeadline}. Notice must be delivered via email with written confirmation or certified mail. Verbal notice shall not constitute valid cancellation.`,
      y, checkPageBreak);
    y = clause(doc, '8.3 Termination for Cause',
      'Either party may terminate for material breach upon thirty (30) days written notice if the breach is not cured within the notice period.',
      y, checkPageBreak);
    y = clause(doc, '8.4 Effect of Termination',
      'Upon termination: all licenses terminate; Customer shall cease use of the Platform; Customer Data is available for export for 30 days. Fees for prepaid periods are non-refundable except in cases of Vendor-caused termination.',
      y, checkPageBreak);
    y = clause(doc, '8.5 Early Termination Fee',
      'If Customer terminates prior to term end for any reason other than Vendor\'s uncured material breach, Customer shall pay an early termination fee equal to fifty percent (50%) of remaining unpaid subscription fees.',
      y, checkPageBreak);

    // ── SECTION 9
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '9. WARRANTIES AND DISCLAIMERS', y);
    y = clause(doc, '9.1 Vendor Warranty',
      'Vendor warrants the Platform will perform materially per the Documentation. Customer\'s sole remedy for breach is the service credit in Section 5.1.',
      y, checkPageBreak);
    y = clause(doc, '9.2 Disclaimer',
      'EXCEPT AS SET FORTH IN SECTION 9.1, THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. VENDOR DISCLAIMS ALL IMPLIED WARRANTIES.',
      y, checkPageBreak);

    // ── SECTION 10
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '10. LIMITATION OF LIABILITY', y);
    y = clause(doc, '',
      `VENDOR'S TOTAL LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM ($${(account.arr / 12).toLocaleString('en-US', {maximumFractionDigits: 0})} USD). NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.`,
      y, checkPageBreak);

    // ── SECTION 11
    y = checkPageBreak(y, 10);
    y = sectionHeading(doc, '11. GENERAL PROVISIONS', y);
    const generals = [
      ['11.1 Governing Law', 'This Agreement is governed by the laws of the State of California. Disputes shall be resolved by binding arbitration in San Francisco, CA.'],
      ['11.2 Entire Agreement', 'This Agreement and all executed Order Forms constitute the entire agreement between the parties.'],
      ['11.3 Amendments', 'Amendments require written instruments signed by authorized representatives of both parties.'],
      ['11.4 Assignment', 'Neither party may assign this Agreement without written consent, except in connection with a merger or acquisition.'],
      ['11.5 Force Majeure', 'Neither party is liable for delays caused by circumstances beyond reasonable control.'],
    ];
    for (const [h, b] of generals) {
      y = clause(doc, h, b, y, checkPageBreak);
    }

    // ── MSA SIGNATURES
    y = checkPageBreak(y, 65);
    hLine(doc, y, C.border, 0.4);
    y += 6;
    y = sectionHeading(doc, 'AUTHORIZED SIGNATURES — MASTER SUBSCRIPTION AGREEMENT', y);
    text(doc,
      'Electronic signatures are legally binding under E-SIGN and UETA.',
      ML, y, { color: C.muted, size: 7.5 });
    y += 8;

    sigBlock(doc, ML, y, sigW,
      'VENDOR — SyncToScale, Inc.',
      c.signerVendor.name, c.signerVendor.title, 'SyncToScale, Inc.',
      c.signedDate, c.sigIdVendor);

    sigBlock(doc, ML + sigW + 8, y, sigW,
      `CUSTOMER — ${account.name}`,
      c.signerCustomer.name, c.signerCustomer.title, account.name,
      c.signedDate, c.sigIdCustomer);

    y += 52;

    // Verification footer box
    y = checkPageBreak(y, 18);
    rect(doc, ML, y, cW, 14, C.tealLight, C.teal);
    text(doc,
      `Agreement Ref: ${c.msaRef}  |  Order Form Ref: ${c.orderRef}  |  Executed via SyncToScale Contract Management System`,
      pageW(doc) / 2, y + 6,
      { color: C.mid, size: 7.5, align: 'center' });
    text(doc,
      'Timestamp Authority: SyncToScale Legal Ops  |  Verification: contracts@synctoscale.com',
      pageW(doc) / 2, y + 11,
      { color: C.mid, size: 7.5, align: 'center' });

    // ── ADD FOOTERS TO ALL PAGES ────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(doc, i, totalPages, account.name);
    }

    // ── SAVE ────────────────────────────────────────────────────────────────
    const filename = `${account.name.replace(/\s+/g, '_')}_SyncToScale_MSA_${c.startDate.replace(/[^0-9]/g, '').slice(0, 8) || 'Contract'}.pdf`;
    doc.save(filename);
  }

  // ── PATCH ONTO SyncDash ──────────────────────────────────────────────────────
  // accounts.js exposes generateContract as a stub — replace it here
  if (typeof SyncDash !== 'undefined') {
    SyncDash.generateContract = generateContract;
  } else {
    console.error('contract-generator.js: SyncDash not found. Make sure accounts.js loads first.');
  }

})();
