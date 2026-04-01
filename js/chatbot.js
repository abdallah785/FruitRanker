// ============================================
// CHATBOT (FruitBot - Claude API)
// ============================================
const Chatbot = {
  isOpen: false,

  init() {
    // Create chatbot HTML
    const btn = document.createElement('div');
    btn.id = 'chatbot-btn';
    btn.textContent = '🍎 FruitBot';
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);

    const win = document.createElement('div');
    win.id = 'chatbot-window';
    win.innerHTML = `
      <div class="chatbot-header">
        <span>🍎 FruitBot</span>
        <span class="chatbot-close" onclick="Chatbot.toggle()">✕</span>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chat-msg bot">
          <div class="chat-bubble">Salut! Je suis FruitBot 🍎 Pose-moi toutes tes questions sur les fruits!</div>
        </div>
      </div>
      <div class="chatbot-limit" id="chatbot-limit">
        ${Auth.isPremium() ? '🌟 Premium - Illimite' : Premium.getChatCount() + '/' + Premium.CHATBOT_FREE_LIMIT + ' questions gratuites'}
      </div>
      <div class="chatbot-input-area">
        <input type="text" id="chatbot-input" placeholder="Pose ta question sur les fruits..." onkeypress="if(event.key==='Enter')Chatbot.send()">
        <button class="chatbot-send" onclick="Chatbot.send()">🍎</button>
      </div>
    `;
    document.body.appendChild(win);
  },

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('chatbot-window').classList.toggle('open', this.isOpen);
    document.getElementById('chatbot-btn').classList.toggle('hidden', this.isOpen);
    if (this.isOpen) {
      document.getElementById('chatbot-input').focus();
    }
  },

  async send() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    // Check free limit
    if (!Premium.canUseChat()) {
      this.addMessage('bot', 'Tu as utilise tes 3 questions gratuites aujourd\'hui! 🍎 Passe en Premium pour un acces illimite!');
      this.addPaywallButton();
      return;
    }

    this.addMessage('user', message);
    input.value = '';
    this.addMessage('bot', '🍎 Je reflechis...', true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: "Tu es FruitBot, un expert passionne des fruits. Tu parles UNIQUEMENT de fruits : nutrition, saisons, recettes, bienfaits, comparaisons, records, faits surprenants. Si quelqu'un pose une question hors-sujet, reponds poliment 'Je suis FruitBot, je ne parle que de fruits ! 🍎'. JAMAIS de contenu lie au shirk, a la voyance, a l'astrologie ou a quoi que ce soit de haram. JAMAIS d'emoji visage, tete ou personne. Utilise uniquement des emojis fruits, plantes, nature, etoiles, feu. Ton est fun, passionne, bienveillant. Reponds en francais.",
          messages: [{ role: 'user', content: message }]
        })
      });

      const data = await response.json();
      this.removeTyping();

      if (data.content && data.content[0]) {
        this.addMessage('bot', data.content[0].text);
      } else {
        this.addMessage('bot', 'Oups, je n\'ai pas pu repondre 🍎 Reessaie!');
      }

      if (!Auth.isPremium()) {
        Premium.incrementChatCount();
        this.updateLimitDisplay();
      }
    } catch(e) {
      this.removeTyping();
      this.addMessage('bot', 'Oups, erreur de connexion 🍎 Reessaie!');
    }
  },

  addMessage(role, text, isTyping = false) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role + (isTyping ? ' typing' : '');
    div.innerHTML = '<div class="chat-bubble">' + text + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  removeTyping() {
    const typing = document.querySelector('.chat-msg.typing');
    if (typing) typing.remove();
  },

  addPaywallButton() {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = '<div class="chat-bubble"><a href="' + CONFIG.STRIPE_PAYMENT_LINK + '" target="_blank" class="btn btn-premium btn-sm">Passer Premium - ' + CONFIG.PREMIUM_PRICE + '</a></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  updateLimitDisplay() {
    const limit = document.getElementById('chatbot-limit');
    if (limit && !Auth.isPremium()) {
      limit.textContent = Premium.getChatCount() + '/' + Premium.CHATBOT_FREE_LIMIT + ' questions gratuites';
    }
  }
};
