// ============================================
// RANKING (Top 10 Drag & Drop)
// ============================================
const Ranking = {
  fruits: [],
  draggedItem: null,

  init() {
    this.fruits = [...FRUITS].sort(() => Math.random() - 0.5).slice(0, 10);
    this.render();
    this.loadGlobalVotes();
  },

  render() {
    const list = document.getElementById('ranking-list');
    if (!list) return;
    list.innerHTML = this.fruits.map((fruit, index) => {
      const position = index + 1;
      const locked = Premium.isRankLocked(position);
      const isTopThree = position <= 3;
      return `
        <div class="ranking-item ${isTopThree ? 'top-three' : ''} ${locked ? 'locked' : ''}"
             draggable="${!locked}" data-index="${index}"
             ondragstart="Ranking.onDragStart(event, ${index})"
             ondragover="Ranking.onDragOver(event)"
             ondrop="Ranking.onDrop(event, ${index})"
             ondragend="Ranking.onDragEnd(event)">
          ${locked ? `
            <div class="locked-overlay" onclick="Premium.showPaywall('Passe en Premium pour debloquer le Top 3!')">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">Premium requis</span>
            </div>` : ''}
          <div class="rank-number">
            <span class="rank-pos font-mono">#${position}</span>
          </div>
          <div class="rank-fruit">
            <img src="${fruit.image}" alt="${fruit.name}" class="rank-img" onerror="this.style.display='none'">
            <span class="rank-name">${fruit.emoji} ${fruit.name}</span>
          </div>
          <div class="rank-actions">
            ${locked ? '<span class="lock-badge">🔒</span>' : '<span class="drag-handle">⠿</span>'}
          </div>
        </div>`;
    }).join('');
  },

  onDragStart(e, index) {
    this.draggedItem = index;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  },

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  },

  onDrop(e, targetIndex) {
    e.preventDefault();
    if (this.draggedItem === null || this.draggedItem === targetIndex) return;
    if (Premium.isRankLocked(targetIndex + 1)) {
      Premium.showPaywall('Passe en Premium pour debloquer le Top 3!');
      return;
    }
    const item = this.fruits.splice(this.draggedItem, 1)[0];
    this.fruits.splice(targetIndex, 0, item);
    this.draggedItem = null;
    this.render();
  },

  onDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedItem = null;
  },

  async saveRanking() {
    if (!Auth.isLoggedIn()) {
      Premium.showToast('Connecte-toi pour sauvegarder!');
      App.navigate('auth');
      return;
    }
    try {
      for (let i = 0; i < this.fruits.length; i++) {
        await Airtable.saveVote(Auth.currentUser.id, this.fruits[i].name, 10 - i);
      }
      Premium.showToast('Classement sauvegarde! 🍎');
    } catch(e) {
      Premium.showToast('Erreur de sauvegarde');
    }
  },

  shareRanking() {
    const text = 'Mon classement FruitRanker:\n' + this.fruits.map((f, i) =>
      '#' + (i + 1) + ' ' + f.emoji + ' ' + f.name
    ).join('\n') + '\n\nFais le tien sur FruitRanker!';

    if (navigator.share) {
      navigator.share({ title: 'Mon classement FruitRanker', text: text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        Premium.showToast('Classement copie dans le presse-papier!');
      });
    }
  },

  async loadGlobalVotes() {
    try {
      const count = await Airtable.getGlobalVoteCount();
      const el = document.getElementById('global-vote-count');
      if (el) el.textContent = count;
    } catch(e) {
      // Silently fail
    }
  }
};
