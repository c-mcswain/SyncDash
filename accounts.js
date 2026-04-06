/**
 * accounts.js — SyncDash Account Data Layer
 * ─────────────────────────────────────────
 * Single source of truth for all account data.
 * Seed data lives here; live edits + history are persisted to localStorage.
 *
 * Usage:
 *   <script src="accounts.js"></script>
 *   const accounts = SyncDash.getAccounts();
 *
 * Exports:
 *   SyncDash.exportAccount(id, format)     // 'csv' | 'json'
 *   SyncDash.exportBookOfBusiness(format)  // 'csv' | 'json'
 */

const SyncDash = (() => {

  // ── STORAGE KEYS ─────────────────────────────────────────────────────────
  const STORAGE_KEY = 'syncdash_accounts';
  const HISTORY_KEY = 'syncdash_history';


  // ── SEED DATA ─────────────────────────────────────────────────────────────
  // Canonical starting state. Live edits layer on top via localStorage.

  const SEED_ACCOUNTS = [
    {
      id:             'payflow',
      name:           'PayFlow',
      industry:       'Payroll Automation SaaS',
      employees:      260,
      licensedSeats:  143,
      healthScore:    91,
      healthTier:     'green',
      adoptionPct:    88,
      arr:            84084,
      renewalMonths:  8,
      renewalTier:    'green',
      nps:            72,
      lastTouchDays:  2,
      lastTouchNote:  'QBR completed',
      openTickets:    0,
      escalationOpen: false,
      riskFlags: [
        { type: 'ok', text: 'Fully onboarded across all departments' },
        { type: 'ok', text: 'Expansion signal — UK entity in planning' },
      ],
      departments: [
        { name: 'Finance',           users: 68, adoptionPct: 94, trend: 'up',   trendPct: 2  },
        { name: 'HR & People Ops',   users: 52, adoptionPct: 91, trend: 'up',   trendPct: 1  },
        { name: 'Operations',        users: 48, adoptionPct: 88, trend: 'flat', trendPct: 0  },
        { name: 'Engineering / IT',  users: 41, adoptionPct: 85, trend: 'up',   trendPct: 3  },
        { name: 'Sales & Revenue',   users: 35, adoptionPct: 79, trend: 'down', trendPct: 1  },
        { name: 'Legal & Compliance',users: 22, adoptionPct: 72, trend: 'flat', trendPct: 0  },
      ],
      novaSignal: {
        type:  'info',
        title: 'Expansion Opportunity',
        text:  'High adoption + 8-month runway suggests strong upsell timing for UK entity expansion in Q3.',
      },
      activityFeed: [
        { date: '2026-03-04', type: 'green', icon: '✓', text: 'QBR completed. Expansion discussion initiated for UK entity in Q3. Follow-up scheduled.' },
        { date: '2026-03-02', type: 'teal',  icon: '⟳', text: 'SyncToScale sync — workflow execution data refreshed.' },
      ],
      contract: {
        plan:           'Growth',
        pricePerSeat:   49,
        billingCycle:   'Annual — Invoice, Net 30',
        startDate:      'March 1, 2024',
        endDate:        'March 1, 2027',
        termYears:      3,
        autoRenew:      true,
        cancelDeadline: 'January 1, 2027',
        novaAddon:      false,
        modules:        'Payroll Core, Tax Filing, Direct Deposit, API Access',
        orderRef:       'OF-2024-0301-PF-002',
        msaRef:         'MSA-2024-PF-002',
        signerCustomer: { name: 'Alex Morgan', title: 'VP of Finance' },
        signerVendor:   { name: 'Jordan Ellis', title: 'Account Executive' },
        signedDate:     'March 1, 2024 at 09:45 AM PDT',
        sigIdCustomer:  'PF-SIG-20240301-AM-3312',
        sigIdVendor:    'STS-SIG-20240301-JE-3311',
        hq:             'Austin, TX',
      },
      qbr: {
        quarter:      'Q1 2026',
        preparedBy:   'Christy M.',
        wins: [
          '88% platform adoption — highest in portfolio',
          'QBR completed March 4 with no escalations',
          'UK entity expansion scoped and in planning for Q3',
          'Zero open support tickets — full operational stability',
        ],
        risks: [
          { type: 'ok', text: 'No active risks — account is fully healthy' },
          { type: 'ok', text: 'Renewal runway of 8 months provides strong planning window' },
        ],
        goals: [
          'Formalize UK entity expansion scope by end of Q2',
          'Maintain adoption above 85% through department growth',
          'Begin renewal conversation no later than Q3 kickoff',
        ],
        renewalNote: 'Contract renews March 1, 2027 — 8 months out. Auto-renew is active. Ideal window to introduce expansion pricing for UK entity.',
        tldr: {
          working:    'Adoption is strong at 88%, the team is fully onboarded, and there are zero open tickets. PayFlow is your benchmark healthy account.',
          attention:  'No urgent risks. The only thing to stay ahead of is formalizing the UK expansion timeline before it becomes reactive.',
          committing: 'We will scope the UK entity expansion by end of Q2 and keep you informed on any product updates that affect your current workflows.',
        },
        sagePrep: {
          health:    'This is a strong account — open with that confidence. Let them hear the 91 score before anything else. Set a high tone early.',
          adoption:  'Finance leads at 94% and Engineering is trending up at 85% — name both. Sales is your only mild laggard at 79% and down 1%. Worth a light mention: "Sales is slightly below the rest — anything we can do to support that team?" Don\'t dwell on it. The story here is strength.',
          risks:     'There are no real risks here. Use this slide to reinforce stability, not to manufacture concern. You can use the time to ask what\'s coming up internally for them.',
          renewal:   'Eight months out is the sweet spot — early enough to plan, not so early it feels like a sales call. Float the UK expansion conversation naturally here.',
          nextSteps: 'Keep the ask light. This account doesn\'t need pressure — it needs to feel valued. Confirm the Q2 expansion scoping call and thank them for being a strong partner.',
        },
        prompts: {
          health: [
            'Your health score is sitting at 91 — what does your team feel is driving that?',
            'We\'re seeing strong numbers across the board. What would a 95+ look like for you internally?',
            'Is there anything on the health side you\'d want us to be watching more closely?',
          ],
          adoption: [
            'Finance is your highest-adopting team at 94% — what\'s made it work so well there?',
            'Sales is slightly below the rest at 79%. Is there anything your team needs to get more value from the platform?',
            'Engineering is trending up — are there any new workflows or integrations your team is exploring?',
          ],
          risks: [
            'No active risks to flag today — what\'s coming up on your end we should be planning around?',
            'Are there any internal changes — team, process, or org — we should know about heading into Q2?',
            'Everything looks stable. Is there anything you wish you were getting from us that you\'re not?',
          ],
          renewal: [
            'We\'re 8 months out from renewal — when would you want to start that conversation formally?',
            'The UK entity expansion is something we\'d love to support. What does the timeline look like on your end?',
            'Are there other teams or use cases you\'ve been thinking about expanding to?',
          ],
          nextSteps: [
            'Let\'s lock in a Q2 scoping call for the UK expansion — what does your calendar look like in April?',
            'Is there anything we can do between now and Q3 to make sure adoption stays above 85%?',
            'Who else on your team should we be looping in as you grow?',
          ],
        },
      },
    },

    {
      id:             'benefitbridge',
      name:           'BenefitBridge',
      industry:       'Employee Benefits Platform',
      employees:      310,
      licensedSeats:  88,
      healthScore:    63,
      healthTier:     'amber',
      adoptionPct:    61,
      arr:            51744,
      renewalMonths:  3,
      renewalTier:    'amber',
      nps:            41,
      lastTouchDays:  11,
      lastTouchNote:  'Check-in overdue',
      openTickets:    2,
      escalationOpen: false,
      riskFlags: [
        { type: 'warn', text: 'Adoption dropped 14% (Finance dept)' },
        { type: 'warn', text: '2 open support tickets — workflow blocked' },
      ],
      departments: [
        { name: 'HR & People Ops',   users: 82, adoptionPct: 91, trend: 'up',   trendPct: 3  },
        { name: 'Benefits Admin',    users: 44, adoptionPct: 86, trend: 'flat', trendPct: 0  },
        { name: 'Operations',        users: 61, adoptionPct: 72, trend: 'down', trendPct: 4  },
        { name: 'Engineering / IT',  users: 58, adoptionPct: 65, trend: 'up',   trendPct: 2  },
        { name: 'Finance',           users: 38, adoptionPct: 34, trend: 'down', trendPct: 14 },
        { name: 'Sales & Revenue',   users: 27, adoptionPct: 59, trend: 'down', trendPct: 2  },
      ],
      novaSignal: {
        type:  'warn',
        title: 'Adoption Regression',
        text:  'Finance dept usage down 14% over 30 days. Likely tied to blocked workflow in ticket #1042.',
      },
      activityFeed: [
        { date: '2026-03-06', type: 'amber', icon: '⚠', text: 'Adoption drop flagged in Finance department. Check-in recommended within 48hrs.' },
        { date: '2026-03-03', type: 'blue',  icon: '📋', text: 'Support ticket #1042 escalated. Engineering loop opened for blocked workflow.' },
        { date: '2026-03-02', type: 'teal',  icon: '⟳', text: 'SyncToScale sync — workflow execution data refreshed.' },
      ],
      contract: {
        plan:           'Growth',
        pricePerSeat:   49,
        billingCycle:   'Annual — Invoice, Net 30',
        startDate:      'June 4, 2023',
        endDate:        'June 4, 2026',
        termYears:      3,
        autoRenew:      true,
        cancelDeadline: 'April 5, 2026',
        novaAddon:      false,
        modules:        'HR Core, Benefits Administration, Compliance Reporting, API Access',
        orderRef:       'OF-2023-0604-BB-001',
        msaRef:         'MSA-2023-BB-001',
        signerCustomer: { name: 'Dana Reyes', title: 'HR Director' },
        signerVendor:   { name: 'Jordan Ellis', title: 'Account Executive' },
        signedDate:     'June 4, 2023 at 11:32 AM PDT',
        sigIdCustomer:  'BB-SIG-20230604-DR-4829',
        sigIdVendor:    'STS-SIG-20230604-JE-7741',
        hq:             'San Francisco, CA',
      },
      qbr: {
        quarter:      'Q1 2026',
        preparedBy:   'Christy M.',
        wins: [
          'HR and Operations departments remain at 80%+ adoption',
          'Compliance Reporting module fully utilized — zero audit gaps',
          'Ticket #1042 escalated same-day — engineering loop active',
          'API integrations stable across all connected systems',
        ],
        risks: [
          { type: 'warn', text: 'Finance dept adoption dropped 14% over 30 days' },
          { type: 'warn', text: '2 open support tickets including blocked workflow (#1042)' },
          { type: 'warn', text: 'Renewal in 3 months — needs attention before it becomes urgent' },
          { type: 'warn', text: 'Last touchpoint was 11 days ago — check-in overdue' },
        ],
        goals: [
          'Resolve ticket #1042 and restore Finance dept workflow within 2 weeks',
          'Recover Finance adoption to above 70% before renewal conversation',
          'Schedule renewal discussion no later than end of April',
          'Re-establish weekly check-in cadence with Dana Reyes',
        ],
        renewalNote: 'Contract ends June 4, 2026 — 3 months out. Cancellation deadline was April 5. This is an urgent renewal window that requires proactive outreach now.',
        tldr: {
          working:    'HR and Ops adoption are solid, compliance reporting is being used well, and your API connections are stable. The foundation is strong.',
          attention:  'Finance department adoption dropped after a workflow got blocked in ticket #1042. We\'re actively working on it — but we want to make sure it doesn\'t affect your renewal confidence.',
          committing: 'We will resolve the Finance workflow issue within two weeks and schedule a dedicated renewal conversation before end of April.',
        },
        sagePrep: {
          health:    'The 63 score will be visible — don\'t avoid it. Acknowledge it directly and immediately connect it to the specific cause (Finance workflow block). Owning it builds more trust than softening it.',
          adoption:  'Lead with HR at 91% and Benefits Admin at 86% — those are your proof points that the platform works. Then pivot: "Finance is where we need to focus." Finance dropped from ~48% to 34% — a 14-point fall tied directly to the blocked workflow in ticket #1042. Operations is also slipping at 72% and down 4%. Ask: "What\'s getting in the way for your Finance team?" before you offer anything. Let them tell you.',
          risks:     'Two risks, both connected: the ticket and the adoption drop. Frame them as one story, not two separate problems. You caught it, you escalated it, you\'re here talking about it. That\'s the point.',
          renewal:   'Three months out with a past cancellation deadline is tight. Don\'t hide that. Be direct: "I want to make sure we earn the renewal — let\'s talk about what that looks like." Then listen.',
          nextSteps: 'You need two firm commitments from them: a follow-up call in two weeks on the ticket resolution, and a renewal conversation before end of April. Get both on the calendar before you leave.',
        },
        prompts: {
          health: [
            'Our health score dropped to 63 this quarter — most of that is tied to the Finance workflow issue. Can we walk through what happened and what we\'re doing about it?',
            'I want to be upfront about where we are. The score reflects a real blocker we\'re actively resolving. What would it take for you to feel confident heading into renewal?',
            'The 63 is a reflection of one specific issue, not the overall relationship. HR and Benefits Admin are strong. Where do you feel the platform is working best for your team?',
          ],
          adoption: [
            'HR is at 91% and Benefits Admin at 86% — what\'s made those teams so successful with the platform?',
            'Finance dropped 14 points this quarter. We believe it\'s tied to the workflow block — but what are you hearing from that team directly?',
            'Operations is also slipping slightly. Are there any workflow or process changes on your end that might be contributing?',
          ],
          risks: [
            'Ticket #1042 is our top priority right now. Can we align on what resolution looks like and a realistic timeline?',
            'The Finance adoption drop and the support ticket are connected — once the workflow is fixed, we expect usage to recover. Does that match your team\'s experience?',
            'Are there any other blockers your team is running into that haven\'t made it into a support ticket yet?',
          ],
          renewal: [
            'We\'re 3 months out and I want to get ahead of this. What would need to be true for renewal to be a straightforward yes?',
            'I\'d rather have an honest conversation now than wait — are there concerns about continuing that we should address directly?',
            'Can we schedule a dedicated renewal conversation before end of April, once we have the ticket resolved?',
          ],
          nextSteps: [
            'Can we commit to a follow-up in two weeks to confirm the Finance workflow is resolved and adoption is recovering?',
            'Who needs to be in the room for the renewal conversation — is that you and Marcus Kim, or are there others?',
            'What would make this the easiest renewal decision you\'ve made?',
          ],
        },
      },
    },

    {
      id:             'shifthr',
      name:           'ShiftHR',
      industry:       'Workforce Scheduling & Compliance',
      employees:      180,
      licensedSeats:  167,
      healthScore:    31,
      healthTier:     'red',
      adoptionPct:    28,
      arr:            38076,
      renewalMonths:  1.5,
      renewalTier:    'red',
      nps:            18,
      lastTouchDays:  23,
      lastTouchNote:  'Escalation open',
      openTickets:    1,
      escalationOpen: true,
      riskFlags: [
        { type: 'crit', text: 'No logins in 23 days' },
        { type: 'crit', text: 'Champion contact left company' },
      ],
      departments: [
        { name: 'Operations',        users: 54, adoptionPct: 31, trend: 'down', trendPct: 18 },
        { name: 'Scheduling',        users: 48, adoptionPct: 28, trend: 'down', trendPct: 22 },
        { name: 'HR & People Ops',   users: 32, adoptionPct: 24, trend: 'down', trendPct: 9  },
        { name: 'Legal & Compliance',users: 18, adoptionPct: 38, trend: 'down', trendPct: 5  },
        { name: 'Finance',           users: 22, adoptionPct: 19, trend: 'down', trendPct: 8  },
        { name: 'Engineering / IT',  users: 16, adoptionPct: 12, trend: 'down', trendPct: 11 },
      ],
      novaSignal: {
        type:  'crit',
        title: 'Churn Risk — High',
        text:  'Champion departure + 23-day login gap indicates likely non-renewal without intervention.',
      },
      activityFeed: [
        { date: '2026-03-05', type: 'red',  icon: '🔴', text: 'Champion contact departure detected via HRIS sync. Re-engagement plan needed.' },
        { date: '2026-03-02', type: 'teal', icon: '⟳',  text: 'SyncToScale sync — workflow execution data refreshed.' },
      ],
      contract: {
        plan:           'Starter',
        pricePerSeat:   19,
        billingCycle:   'Annual — Invoice, Net 30',
        startDate:      'September 12, 2024',
        endDate:        'April 18, 2026',
        termYears:      1.5,
        autoRenew:      true,
        cancelDeadline: 'February 18, 2026',
        novaAddon:      false,
        modules:        'Workforce Scheduling, Shift Management, Compliance Reporting',
        orderRef:       'OF-2024-0912-SH-003',
        msaRef:         'MSA-2024-SH-003',
        signerCustomer: { name: 'Marcus Webb', title: 'COO' },
        signerVendor:   { name: 'Jordan Ellis', title: 'Account Executive' },
        signedDate:     'September 12, 2024 at 02:17 PM PDT',
        sigIdCustomer:  'SH-SIG-20240912-MW-9901',
        sigIdVendor:    'STS-SIG-20240912-JE-9900',
        hq:             'Chicago, IL',
      },
      qbr: {
        quarter:      'Q1 2026',
        preparedBy:   'Christy M.',
        wins: [
          'Compliance Reporting module configured and audit-ready',
          'Shift Management workflows built out for core scheduling team',
          'Initial onboarding completed on time at contract start',
        ],
        risks: [
          { type: 'crit', text: 'No platform logins in 23 days — full usage gap' },
          { type: 'crit', text: 'Champion contact (Marcus Webb) has left the company' },
          { type: 'crit', text: 'Renewal in approximately 6 weeks — escalation open' },
          { type: 'crit', text: 'NPS at 18 — significant dissatisfaction risk' },
        ],
        goals: [
          'Identify and connect with new internal champion within 1 week',
          'Understand root cause of platform abandonment before renewal decision',
          'Present a re-engagement or transition plan based on new stakeholder needs',
          'Make a renewal decision — no ambiguity past April 1',
        ],
        renewalNote: 'Contract ends April 18, 2026 — approximately 6 weeks out. Cancellation deadline has already passed (Feb 18). This QBR is a re-engagement conversation, not a standard review.',
        tldr: {
          working:    'The platform was set up correctly and compliance workflows are in place. The early implementation went smoothly and the foundation is solid.',
          attention:  'We haven\'t seen logins in 23 days and the primary contact has left. We\'re here because we want to understand what happened and whether we can help before the renewal window closes.',
          committing: 'We\'re not here to pressure a renewal. We want to meet whoever is now responsible, understand the current state, and figure out together if this is still the right fit.',
        },
        sagePrep: {
          health:    'A 31 score is hard to spin — don\'t try. Come in with honesty: "We\'re concerned about what we\'re seeing, and we wanted to be here in person to understand it." That\'s the only credible opening.',
          adoption:  'Every department is in decline. Scheduling dropped 22 points, Operations 18, Engineering 11. The only department above 30% is Legal & Compliance at 38% — and even that is down 5%. Don\'t present this as a metrics slide. Present it as a question: "We can see usage across every team has dropped significantly since [date]. Can you help us understand what changed internally?" You need them to tell you the story, not the other way around.',
          risks:     'Everything on this slide is critical. Don\'t soften the language. The goal isn\'t to make them feel bad — it\'s to show that you see the situation clearly and aren\'t pretending otherwise.',
          renewal:   'Six weeks out with a past cancellation deadline. This is not a standard renewal conversation — it\'s a decision point. Be direct: "We want to earn the next term, but we need to understand where things stand first."',
          nextSteps: 'The only goal of this meeting is to identify the new decision-maker and schedule a follow-up within one week. Don\'t try to close anything today. Listen more than you talk.',
        },
        prompts: {
          health: [
            'We\'re seeing a health score of 31 and wanted to come to you directly. Can you help us understand what\'s been happening on your end?',
            'I\'m not going to sugarcoat what we\'re seeing — usage has dropped significantly. We\'re here because we want to fix it if we can. What changed?',
            'Before we go through the data, I want to ask — how is the team feeling about the platform right now?',
          ],
          adoption: [
            'Usage has dropped across every department over the past 30 days. Scheduling is at 28% and Operations at 31%. Can you walk us through what\'s been happening internally?',
            'Legal & Compliance is your only team holding above 30% at 38%. What\'s different about how that team is using the platform?',
            'Engineering is at 12% — that\'s a significant drop. Is there something specific that\'s blocking that team from logging in?',
          ],
          risks: [
            'Marcus Webb has left the company and we haven\'t been able to connect with anyone new. Who is the right person for us to be working with going forward?',
            'There\'s been no platform activity in 23 days. We want to understand whether that\'s a temporary gap or something bigger.',
            'We have an open escalation and a renewal in 6 weeks. What would need to happen for us to get back on track?',
          ],
          renewal: [
            'We\'re 6 weeks out from renewal and I want to be direct — what does the path forward look like from your perspective?',
            'We\'re not here to pressure a decision. We\'re here to understand if there\'s a way to make this work for your team. What would that look like?',
            'If you were to not renew, what would be the primary reason? I\'d rather know now so we can address it.',
          ],
          nextSteps: [
            'Can we get 30 minutes on the calendar next week with whoever is now responsible for this platform decision?',
            'We\'d like to do a re-onboarding session with your Scheduling and Operations teams if you\'re open to it. Would that be valuable?',
            'What would you need to see from us in the next 4 weeks to feel confident about continuing?',
          ],
        },
      },
    },
  ];


  // ── CHANGE HISTORY ────────────────────────────────────────────────────────

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function appendHistory(entry) {
    const history = getHistory();
    history.push({ ...entry, timestamp: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }


  // ── ACCOUNT CRUD ──────────────────────────────────────────────────────────

  function getSeedAccounts() {
    return JSON.parse(JSON.stringify(SEED_ACCOUNTS));
  }

  function getStoredAccounts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }

  function getAccounts() {
    return getStoredAccounts() || getSeedAccounts();
  }

  function getAccount(id) {
    return getAccounts().find(a => a.id === id) || null;
  }

  function updateAccount(id, changes, note = '') {
    const accounts = getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) {
      console.warn(`SyncDash: account "${id}" not found`);
      return null;
    }

    const account = accounts[idx];

    Object.entries(changes).forEach(([field, newValue]) => {
      const oldValue = account[field];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        appendHistory({ accountId: id, field, oldValue, newValue, note });
        account[field] = newValue;
      }
    });

    if (changes.healthScore   !== undefined) account.healthTier  = deriveTier(account.healthScore, [80, 50]);
    if (changes.renewalMonths !== undefined) account.renewalTier = deriveRenewalTier(account.renewalMonths);

    accounts[idx] = account;
    saveAccounts(accounts);
    return account;
  }

  function resetToSeed() {
    appendHistory({
      accountId: 'ALL',
      field:     'reset',
      oldValue:  'live',
      newValue:  'seed',
      note:      'Manual reset to seed data',
    });
    localStorage.removeItem(STORAGE_KEY);
  }


  // ── TIER HELPERS ──────────────────────────────────────────────────────────

  function deriveTier(score, [high, low]) {
    if (score >= high) return 'green';
    if (score >= low)  return 'amber';
    return 'red';
  }

  function deriveRenewalTier(months) {
    if (months >= 6) return 'green';
    if (months >= 2) return 'amber';
    return 'red';
  }


  // ── PORTFOLIO SUMMARY ─────────────────────────────────────────────────────

  function getPortfolioSummary() {
    const accounts = getAccounts();
    return {
      total:       accounts.length,
      healthy:     accounts.filter(a => a.healthTier === 'green').length,
      atRisk:      accounts.filter(a => a.healthTier === 'amber').length,
      critical:    accounts.filter(a => a.healthTier === 'red').length,
      totalARR:    accounts.reduce((sum, a) => sum + a.arr, 0),
      avgHealth:   Math.round(accounts.reduce((sum, a) => sum + a.healthScore, 0) / accounts.length),
      avgAdoption: Math.round(accounts.reduce((sum, a) => sum + a.adoptionPct, 0) / accounts.length),
    };
  }


  // ── EXPORTS ───────────────────────────────────────────────────────────────

  function exportAccount(id, format = 'json') {
    const account = getAccount(id);
    if (!account) {
      console.warn(`SyncDash: account "${id}" not found`);
      return;
    }
    const history  = getHistory().filter(h => h.accountId === id);
    const filename = `syncdash_${id}_${_today()}`;

    if (format === 'json') {
      _downloadJSON({ account, changeHistory: history }, `${filename}.json`);
    } else {
      _downloadCSV(_buildAccountCSV([account], history), `${filename}.csv`);
    }
  }

  function exportBookOfBusiness(format = 'json') {
    const accounts = getAccounts();
    const history  = getHistory();
    const summary  = getPortfolioSummary();
    const filename = `syncdash_book_of_business_${_today()}`;

    if (format === 'json') {
      _downloadJSON({ summary, accounts, changeHistory: history }, `${filename}.json`);
    } else {
      _downloadCSV(_buildBookOfBusinessCSV(accounts, summary, history), `${filename}.csv`);
    }
  }


  // ── CSV BUILDERS ─────────────────────────────────────────────────────────

  const ACCOUNT_HEADERS = [
    'ID', 'Name', 'Industry', 'Employees',
    'Health Score', 'Health Tier', 'Adoption %',
    'ARR ($)', 'Renewal Months', 'Renewal Tier',
    'NPS', 'Last Touch (days)', 'Last Touch Note',
    'Open Tickets', 'Escalation Open',
    'Risk Flags', 'Nova Signal Title', 'Nova Signal Type',
  ];

  function _accountToRow(a) {
    return [
      a.id, a.name, a.industry, a.employees,
      a.healthScore, a.healthTier, a.adoptionPct,
      a.arr, a.renewalMonths, a.renewalTier,
      a.nps, a.lastTouchDays, a.lastTouchNote,
      a.openTickets, a.escalationOpen,
      (a.riskFlags || []).map(r => r.text).join(' | '),
      a.novaSignal?.title || '',
      a.novaSignal?.type  || '',
    ];
  }

  const HISTORY_HEADERS = ['Account ID', 'Field', 'Old Value', 'New Value', 'Note', 'Timestamp'];

  function _historyToRow(h) {
    return [
      h.accountId, h.field,
      JSON.stringify(h.oldValue),
      JSON.stringify(h.newValue),
      h.note || '',
      h.timestamp,
    ];
  }

  function _buildAccountCSV(accounts, history) {
    return [
      ['ACCOUNT DATA'],
      ACCOUNT_HEADERS,
      ...accounts.map(_accountToRow),
      [],
      ['CHANGE HISTORY'],
      HISTORY_HEADERS,
      ...history.map(_historyToRow),
    ];
  }

  function _buildBookOfBusinessCSV(accounts, summary, history) {
    const summaryRows = [
      ['PORTFOLIO SUMMARY'],
      ['Total Accounts',    summary.total],
      ['Healthy',           summary.healthy],
      ['At Risk',           summary.atRisk],
      ['Critical',          summary.critical],
      ['Total ARR ($)',      summary.totalARR],
      ['Avg Health Score',  summary.avgHealth],
      ['Avg Adoption %',    summary.avgAdoption],
      [],
    ];
    return [...summaryRows, ..._buildAccountCSV(accounts, history)];
  }


  // ── DOWNLOAD UTILITIES ────────────────────────────────────────────────────

  function _rowsToCSVString(rows) {
    return rows.map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  function _downloadCSV(rows, filename) {
    _triggerDownload(
      new Blob([_rowsToCSVString(rows)], { type: 'text/csv;charset=utf-8;' }),
      filename
    );
  }

  function _downloadJSON(payload, filename) {
    _triggerDownload(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      filename
    );
  }

  function _triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function _today() {
    return new Date().toISOString().slice(0, 10);
  }


  // ── PUBLIC API ────────────────────────────────────────────────────────────
  return {
    getAccounts,
    getAccount,
    getPortfolioSummary,
    updateAccount,
    resetToSeed,
    getHistory,
    exportAccount,
    exportBookOfBusiness,
  };

})();
