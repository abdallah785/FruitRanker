// ============================================
// AIRTABLE API WRAPPER
// ============================================
const Airtable = {
  baseUrl: '',

  init() {
    this.baseUrl = 'https://api.airtable.com/v0/' + CONFIG.AIRTABLE_BASE_ID;
  },

  headers() {
    return {
      'Authorization': 'Bearer ' + CONFIG.AIRTABLE_API_KEY,
      'Content-Type': 'application/json'
    };
  },

  // Generic GET
  async getRecords(table, filterFormula) {
    this.init();
    let url = this.baseUrl + '/' + encodeURIComponent(table);
    if (filterFormula) {
      url += '?filterByFormula=' + encodeURIComponent(filterFormula);
    }
    const res = await fetch(url, { headers: this.headers() });
    const data = await res.json();
    return data.records || [];
  },

  // Generic CREATE
  async createRecord(table, fields) {
    this.init();
    const url = this.baseUrl + '/' + encodeURIComponent(table);
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ fields })
    });
    return await res.json();
  },

  // Generic UPDATE
  async updateRecord(table, recordId, fields) {
    this.init();
    const url = this.baseUrl + '/' + encodeURIComponent(table) + '/' + recordId;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ fields })
    });
    return await res.json();
  },

  // ---- Users ----
  async findUserByEmail(email) {
    const records = await this.getRecords('Users', "{email}='" + email + "'");
    return records.length > 0 ? records[0] : null;
  },

  async createUser(email, passwordHash) {
    return await this.createRecord('Users', {
      email: email,
      password_hash: passwordHash,
      plan: 'free',
      date_inscription: new Date().toISOString().split('T')[0]
    });
  },

  async updateUserPlan(recordId, plan) {
    return await this.updateRecord('Users', recordId, { plan: plan });
  },

  // ---- Votes ----
  async saveVote(userId, fruit, score) {
    return await this.createRecord('Votes', {
      user_id: userId,
      fruit: fruit,
      score: score,
      date: new Date().toISOString().split('T')[0]
    });
  },

  async getGlobalVoteCount() {
    const records = await this.getRecords('Votes');
    return records.length;
  },

  // ---- Tournaments ----
  async saveTournamentResult(userId, winner) {
    return await this.createRecord('Tournaments', {
      user_id: userId,
      gagnant: winner,
      date: new Date().toISOString().split('T')[0]
    });
  },

  // ---- Payments ----
  async savePayment(userId, stripeId, statut) {
    return await this.createRecord('Payments', {
      user_id: userId,
      stripe_id: stripeId,
      date: new Date().toISOString().split('T')[0],
      statut: statut
    });
  }
};
