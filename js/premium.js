// ============================================
// PREMIUM / FREEMIUM SYSTEM
// ============================================
const Premium = {
  CHATBOT_FREE_LIMIT: 3,
  RANKING_FREE_MIN: 4, // Positions 4-10 free, 1-3 locked
  TOURNAMENT_FREE_ROUNDS: 2, // Round of 16 + Quarters free

  getChatCount() {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem('fruitranker_chat_count') || '{}');
    return data.date === today ? data.count : 0;
  },

  incrementChatCount() {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem('fruitranker_chat_count') || '{}');
    const count = data.date === today ? data.count + 1 : 1;
    localStorage.setItem('fruitranker_chat_count', JSON.stringify({ date: today, count }));
  },

  canUseChat() {
    if (Auth.isPremium()) return true;
    return this.getChatCount() < this.CHATBOT_FREE_LIMIT;
  },

  isRankLocked(position) {
    if (Auth.isPremium()) return false;
    return position <= 3;
  },

  isTournamentRoundLocked(roundIndex) {
    if (Auth.isPremium()) return false;
    return roundIndex >= this.TOURNAMENT_FREE_ROUNDS;
  },

  showPaywall(message) {
    const modal = document.getElementById('paywall-modal');
    const msgEl = document.getElementById('paywall-message');
    if (msgEl) msgEl.textContent = message || 'Passe en Premium pour debloquer!';
    modal.classList.add('active');
  },

  hidePaywall() {
    document.getElementById('paywall-modal').classList.remove('active');
  },

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
};
