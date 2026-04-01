// ============================================
// AUTH (Email/Password with Airtable)
// ============================================
const Auth = {
  currentUser: null,

  // Simple hash function for demo (NOT secure for production)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  loadSession() {
    const saved = localStorage.getItem('fruitranker_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  },

  saveSession() {
    if (this.currentUser) {
      localStorage.setItem('fruitranker_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('fruitranker_user');
    }
  },

  isLoggedIn() {
    return this.currentUser !== null;
  },

  isPremium() {
    return this.currentUser && this.currentUser.plan === 'premium';
  },

  async login(email, password) {
    const hash = await this.hashPassword(password);
    const user = await Airtable.findUserByEmail(email);
    if (!user) throw new Error('Aucun compte avec cet email');
    if (user.fields.password_hash !== hash) throw new Error('Mot de passe incorrect');
    this.currentUser = {
      id: user.id,
      email: user.fields.email,
      plan: user.fields.plan || 'free',
      date_inscription: user.fields.date_inscription
    };
    this.saveSession();
    return this.currentUser;
  },

  async register(email, password) {
    const existing = await Airtable.findUserByEmail(email);
    if (existing) throw new Error('Cet email est deja utilise');
    const hash = await this.hashPassword(password);
    const result = await Airtable.createUser(email, hash);
    if (result.error) throw new Error('Erreur lors de l inscription');
    this.currentUser = {
      id: result.id,
      email: email,
      plan: 'free',
      date_inscription: new Date().toISOString().split('T')[0]
    };
    this.saveSession();
    return this.currentUser;
  },

  logout() {
    this.currentUser = null;
    this.saveSession();
    App.navigate('home');
  }
};
