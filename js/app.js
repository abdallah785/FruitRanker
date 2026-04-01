// ============================================
// APP ROUTER & MAIN
// ============================================
const App = {
  currentPage: 'home',

  init() {
    Auth.loadSession();
    Chatbot.init();
    this.setupNav();
    this.navigate(window.location.hash.slice(1) || 'home');
    window.addEventListener('hashchange', () => {
      this.navigate(window.location.hash.slice(1) || 'home');
    });
  },

  setupNav() {
    document.getElementById('nav-links').innerHTML =
      '<a href="#home" class="nav-link" data-page="home">🏠 Accueil</a>' +
      '<a href="#ranking" class="nav-link" data-page="ranking">🏆 Classement</a>' +
      '<a href="#tournament" class="nav-link" data-page="tournament">⚔️ Tournoi</a>' +
      '<a href="#premium" class="nav-link" data-page="premium">🌟 Premium</a>';
    this.updateAuthNav();
  },

  updateAuthNav() {
    const authArea = document.getElementById('auth-area');
    if (Auth.isLoggedIn()) {
      authArea.innerHTML =
        '<div class="user-info">' +
          (Auth.isPremium() ? '<span class="premium-badge-nav">🌟</span>' : '') +
          '<span class="user-email">' + Auth.currentUser.email.split('@')[0] + '</span>' +
          '<button class="btn btn-sm btn-secondary" onclick="Auth.logout()">Deconnexion</button>' +
        '</div>';
    } else {
      authArea.innerHTML = '<button class="btn btn-sm btn-accent" onclick="App.navigate(\'auth\')">Connexion</button>';
    }
  },

  navigate(page) {
    this.currentPage = page || 'home';
    window.location.hash = this.currentPage;

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(function(l) {
      l.classList.toggle('active', l.dataset.page === App.currentPage);
    });

    var main = document.getElementById('main-content');

    switch(this.currentPage) {
      case 'home': main.innerHTML = this.renderHome(); Ranking.loadGlobalVotes(); break;
      case 'ranking': main.innerHTML = this.renderRanking(); Ranking.init(); break;
      case 'tournament': main.innerHTML = this.renderTournament(); Tournament.init(); break;
      case 'premium': main.innerHTML = this.renderPremium(); break;
      case 'auth': main.innerHTML = this.renderAuth(); break;
      default: main.innerHTML = this.renderHome();
    }

    window.scrollTo(0, 0);
    this.updateAuthNav();
  },

  // ---- PAGES ----

  renderHome() {
    return '<section class="hero">' +
      '<div class="hero-content">' +
        '<h1 class="hero-title">Fruit<span class="accent">Ranker</span></h1>' +
        '<p class="hero-subtitle">Classe tes fruits preferes, affronte-les en tournoi, et decouvre le champion! 🍎🏆</p>' +
        '<div class="hero-buttons">' +
          '<button class="btn btn-primary btn-lg" onclick="App.navigate(\'ranking\')">🏆 Classement</button>' +
          '<button class="btn btn-secondary btn-lg" onclick="App.navigate(\'tournament\')">⚔️ Tournoi</button>' +
        '</div>' +
      '</div>' +
    '</section>' +
    FruitDay.render() +
        '<section class="stats-section">' +
      '<h2 class="section-title">📊 Statistiques</h2>' +
      '<div class="stats-grid">' +
        '<div class="stat-card">' +
          '<span class="stat-number font-mono" id="global-vote-count">0</span>' +
          '<span class="stat-label">Votes au total</span>' +
        '</div>' +
        '<div class="stat-card">' +
          '<span class="stat-number font-mono">' + FRUITS.length + '</span>' +
          '<span class="stat-label">Fruits disponibles</span>' +
        '</div>' +
        '<div class="stat-card">' +
          '<span class="stat-number font-mono">4</span>' +
          '<span class="stat-label">Categories</span>' +
        '</div>' +
      '</div>' +
    '</section>';
  },

  renderRanking() {
    return '<section class="page-section">' +
      '<div class="page-header">' +
        '<h1>🏆 Classement Top 10</h1>' +
        '<p>Choisis et classe tes fruits preferes!</p>' +
        (!Auth.isPremium() ?
          '<p class="free-notice">🔒 Mode gratuit : places 4 a 10 uniquement. <a href="#premium" class="accent-link">Passe en Premium</a> pour le Top 3!</p>' :
          '<p class="premium-notice">🌟 Mode Premium : classement complet!</p>') +
      '</div>' +
      '<div id="ranking-list" class="ranking-list"></div>' +
      '<div class="ranking-actions">' +
        '<button class="btn btn-primary" onclick="Ranking.saveRanking()">💾 Sauvegarder</button>' +
        '<button class="btn btn-secondary" onclick="Ranking.shareRanking()">🔗 Partager</button>' +
        '<button class="btn btn-secondary" onclick="Ranking.init()">🔄 Melanger</button>' +
      '</div>' +
    '</section>';
  },

  renderTournament() {
    return '<section class="page-section">' +
      '<div class="page-header">' +
        '<h1>⚔️ Tournoi de Fruits</h1>' +
        '<p>16 fruits s\'affrontent ! Choisis ton favori a chaque match!</p>' +
        (!Auth.isPremium() ?
          '<p class="free-notice">🔒 Mode gratuit : huitiemes et quarts uniquement. <a href="#premium" class="accent-link">Passe en Premium</a> pour les demi-finales et la finale!</p>' :
          '<p class="premium-notice">🌟 Mode Premium : tournoi complet!</p>') +
      '</div>' +
      '<div id="tournament-bracket"></div>' +
      '<button class="btn btn-secondary" onclick="Tournament.init()" style="margin-top:2rem;">🔄 Nouveau tournoi</button>' +
    '</section>';
  },

  renderPremium() {
    return '<section class="page-section premium-page">' +
      '<div class="premium-hero">' +
        '<h1>🌟 FruitRanker Premium</h1>' +
        '<p class="premium-price font-mono">' + CONFIG.PREMIUM_PRICE + '</p>' +
      '</div>' +
      '<div class="premium-features">' +
        '<div class="feature-card"><div class="feature-icon">🏆</div><h3>Classement Complet</h3><p>Accede aux places 1, 2 et 3 du classement. Definis ton vrai Top 3!</p></div>' +
        '<div class="feature-card"><div class="feature-icon">⚔️</div><h3>Tournoi Complet</h3><p>Joue les demi-finales et la finale pour couronner ton fruit champion!</p></div>' +
        '<div class="feature-card"><div class="feature-icon">🤖</div><h3>FruitBot Illimite</h3><p>Questions illimitees a notre expert IA des fruits. Zero limite!</p></div>' +
        '<div class="feature-card"><div class="feature-icon">🌟</div><h3>Badge Premium</h3><p>Badge exclusif visible sur ton profil. Montre ton statut!</p></div>' +
      '</div>' +
      '<div class="premium-cta">' +
        (Auth.isPremium() ?
          '<div class="already-premium"><span class="premium-badge-big">🌟</span><h2>Tu es deja Premium!</h2><p>Profite de toutes les fonctionnalites sans limite.</p></div>' :
          '<a href="' + CONFIG.STRIPE_PAYMENT_LINK + '" target="_blank" class="btn btn-premium btn-xl">Passer Premium - ' + CONFIG.PREMIUM_PRICE + '</a>' +
          '<p class="premium-note">Paiement securise via Stripe. Annulable a tout moment.</p>') +
      '</div>' +
      '<div class="premium-comparison">' +
        '<h2>Gratuit vs Premium</h2>' +
        '<table class="comparison-table">' +
          '<thead><tr><th>Fonctionnalite</th><th>Gratuit</th><th>Premium 🌟</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>Classement</td><td>Places 4-10</td><td class="accent">Places 1-10 ✅</td></tr>' +
            '<tr><td>Tournoi</td><td>Huitiemes + Quarts</td><td class="accent">Complet ✅</td></tr>' +
            '<tr><td>FruitBot</td><td>3 questions/jour</td><td class="accent">Illimite ✅</td></tr>' +
            '<tr><td>Fruit du jour</td><td>✅</td><td>✅</td></tr>' +
            '<tr><td>Badge Premium</td><td>❌</td><td class="accent">🌟 ✅</td></tr>' +
            '<tr><td>Partage</td><td>✅</td><td>✅</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
    '</section>';
  },

  renderAuth() {
    return '<section class="page-section auth-page">' +
      '<div class="auth-card">' +
        '<h2>🍎 Connexion / Inscription</h2>' +
        '<div class="auth-tabs">' +
          '<button class="auth-tab active" onclick="App.switchAuthTab(\'login\', this)">Connexion</button>' +
          '<button class="auth-tab" onclick="App.switchAuthTab(\'register\', this)">Inscription</button>' +
        '</div>' +
        '<form id="auth-form" onsubmit="App.handleAuth(event)">' +
          '<input type="email" id="auth-email" placeholder="Email" required class="input">' +
          '<input type="password" id="auth-password" placeholder="Mot de passe" required class="input" minlength="6">' +
          '<input type="hidden" id="auth-mode" value="login">' +
          '<button type="submit" class="btn btn-primary btn-full" id="auth-submit">Se connecter</button>' +
          '<p id="auth-error" class="error-text"></p>' +
        '</form>' +
      '</div>' +
    '</section>';
  },

  switchAuthTab(mode, btn) {
    document.querySelectorAll('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('auth-mode').value = mode;
    document.getElementById('auth-submit').textContent = mode === 'login' ? 'Se connecter' : "S'inscrire";
    document.getElementById('auth-error').textContent = '';
  },

  async handleAuth(e) {
    e.preventDefault();
    var email = document.getElementById('auth-email').value;
    var password = document.getElementById('auth-password').value;
    var mode = document.getElementById('auth-mode').value;
    var errorEl = document.getElementById('auth-error');

    try {
      if (mode === 'login') {
        await Auth.login(email, password);
      } else {
        await Auth.register(email, password);
      }
      this.navigate('home');
    } catch(err) {
      errorEl.textContent = err.message;
    }
  }
};

// ---- BOOT ----
document.addEventListener('DOMContentLoaded', function() { App.init(); });
