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
      healthScore:    91,
      healthTier:     'green',       // 'green' | 'amber' | 'red'
      adoptionPct:    88,
      arr:            84000,
      renewalMonths:  8,
      renewalTier:    'green',       // 'green' (6m+) | 'amber' (2-5m) | 'red' (<2m)
      nps:            72,
      lastTouchDays:  2,
      lastTouchNote:  'QBR completed',
      openTickets:    0,
      escalationOpen: false,
      riskFlags: [
        { type: 'ok',   text: 'Fully onboarded across all departments' },
        { type: 'ok',   text: 'Expansion signal — UK entity in planning' },
      ],
      novaSignal: {
        type:  'info',
        title: 'Expansion Opportunity',
        text:  'High adoption + 8-month runway suggests strong upsell timing for UK entity expansion in Q3.',
      },
      activityFeed: [
        { date: '2026-03-04', type: 'green', icon: '✓',  text: 'QBR completed. Expansion discussion initiated for UK entity in Q3. Follow-up scheduled.' },
        { date: '2026-03-02', type: 'teal',  icon: '⟳',  text: 'SyncToScale sync — workflow execution data refreshed.' },
      ],
    },

    {
      id:             'benefitbridge',
      name:           'BenefitBridge',
      industry:       'Employee Benefits Platform',
      employees:      310,
      healthScore:    63,
      healthTier:     'amber',
      adoptionPct:    61,
      arr:            52000,
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
      novaSignal: {
        type:  'warn',
        title: 'Adoption Regression',
        text:  'Finance dept usage down 14% over 30 days. Likely tied to blocked workflow in ticket #1042.',
      },
      activityFeed: [
        { date: '2026-03-06', type: 'amber', icon: '⚠',  text: 'Adoption drop flagged in Finance department. Check-in recommended within 48hrs.' },
        { date: '2026-03-03', type: 'blue',  icon: '📋', text: 'Support ticket #1042 escalated. Engineering loop opened for blocked workflow.' },
        { date: '2026-03-02', type: 'teal',  icon: '⟳',  text: 'SyncToScale sync — workflow execution data refreshed.' },
      ],
    },

    {
      id:             'shifthr',
      name:           'ShiftHR',
      industry:       'Workforce Scheduling & Compliance',
      employees:      180,
      healthScore:    31,
      healthTier:     'red',
      adoptionPct:    28,
      arr:            38000,
      renewalMonths:  1.5,           // ~6 weeks
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
      novaSignal: {
        type:  'crit',
        title: 'Churn Risk — High',
        text:  'Champion departure + 23-day login gap indicates likely non-renewal without intervention.',
      },
      activityFeed: [
        { date: '2026-03-05', type: 'red',  icon: '🔴', text: 'Champion contact departure detected via HRIS sync. Re-engagement plan needed.' },
        { date: '2026-03-02', type: 'teal', icon: '⟳',  text: 'SyncToScale sync — workflow execution data refreshed.' },
      ],
    },
  ];


  // ── CHANGE HISTORY ────────────────────────────────────────────────────────
  // Each edit appends: { timestamp, accountId, field, oldValue, newValue, note }

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
    return JSON.parse(JSON.stringify(SEED_ACCOUNTS)); // deep clone
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

  /**
   * Returns the current accounts array.
   * localStorage takes precedence over seed data.
   */
  function getAccounts() {
    return getStoredAccounts() || getSeedAccounts();
  }

  /**
   * Returns a single account by id.
   */
  function getAccount(id) {
    return getAccounts().find(a => a.id === id) || null;
  }

  /**
   * Updates fields on an account and records each change in history.
   * @param {string} id      - account id
   * @param {object} changes - { field: newValue, ... }
   * @param {string} note    - optional note describing why the change was made
   */
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

    // Auto-derive health and renewal tiers from updated numeric scores
    if (changes.healthScore  !== undefined) account.healthTier  = deriveTier(account.healthScore, [80, 50]);
    if (changes.renewalMonths !== undefined) account.renewalTier = deriveRenewalTier(account.renewalMonths);

    accounts[idx] = account;
    saveAccounts(accounts);
    return account;
  }

  /**
   * Resets all live edits to seed data. History is preserved.
   */
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

  /**
   * Export a single account as CSV or JSON.
   * Includes full account data + that account's change history.
   * @param {string} id     - account id
   * @param {string} format - 'csv' | 'json'
   */
  function exportAccount(id, format = 'json') {
    const account = getAccount(id);
    if (!account) {
      console.warn(`SyncDash: account "${id}" not found`);
      return;
    }
    const history = getHistory().filter(h => h.accountId === id);
    const filename = `syncdash_${id}_${_today()}`;

    if (format === 'json') {
      _downloadJSON({ account, changeHistory: history }, `${filename}.json`);
    } else {
      _downloadCSV(_buildAccountCSV([account], history), `${filename}.csv`);
    }
  }

  /**
   * Export the full book of business as CSV or JSON.
   * Includes portfolio summary, all accounts, and full change history.
   * @param {string} format - 'csv' | 'json'
   */
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
      a.id,
      a.name,
      a.industry,
      a.employees,
      a.healthScore,
      a.healthTier,
      a.adoptionPct,
      a.arr,
      a.renewalMonths,
      a.renewalTier,
      a.nps,
      a.lastTouchDays,
      a.lastTouchNote,
      a.openTickets,
      a.escalationOpen,
      (a.riskFlags || []).map(r => r.text).join(' | '),
      a.novaSignal?.title || '',
      a.novaSignal?.type  || '',
    ];
  }

  const HISTORY_HEADERS = ['Account ID', 'Field', 'Old Value', 'New Value', 'Note', 'Timestamp'];

  function _historyToRow(h) {
    return [
      h.accountId,
      h.field,
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
      ['Total Accounts', summary.total],
      ['Healthy',        summary.healthy],
      ['At Risk',        summary.atRisk],
      ['Critical',       summary.critical],
      ['Total ARR ($)',  summary.totalARR],
      ['Avg Health Score', summary.avgHealth],
      ['Avg Adoption %',   summary.avgAdoption],
      [],
    ];
    return [
      ...summaryRows,
      ..._buildAccountCSV(accounts, history),
    ];
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
