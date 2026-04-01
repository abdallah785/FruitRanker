// ============================================
// TOURNAMENT (Bracket system)
// ============================================
const Tournament = {
  rounds: [],
  currentRound: 0,
  currentMatch: 0,

  init() {
    const shuffled = [...FRUITS].sort(() => Math.random() - 0.5);
    this.rounds = [[]];
    // Create 8 matches of 2 fruits each (round of 16)
    for (let i = 0; i < 16; i += 2) {
      this.rounds[0].push({
        fighters: [shuffled[i], shuffled[i + 1]],
        winner: null
      });
    }
    this.currentRound = 0;
    this.currentMatch = 0;
    this.render();
  },

  getRoundName(index) {
    const names = ['Huitiemes', 'Quarts de finale', 'Demi-finales', 'Finale'];
    return names[index] || 'Tour ' + (index + 1);
  },

  render() {
    const container = document.getElementById('tournament-bracket');
    if (!container) return;

    let html = '<div class="bracket">';

    for (let r = 0; r < this.rounds.length; r++) {
      const locked = Premium.isTournamentRoundLocked(r);
      html += '<div class="bracket-round">';
      html += '<div class="round-title">' + this.getRoundName(r) + '</div>';

      this.rounds[r].forEach((match, m) => {
        const isActive = r === this.currentRound && !match.winner;
        html += '<div class="bracket-match ' + (locked && !match.winner ? 'match-locked' : '') + '" style="position:relative">';

        if (locked && !match.winner) {
          html += '<div class="match-locked-overlay" onclick="Premium.showPaywall(\'Passe en Premium pour les ' + this.getRoundName(r) + '!\')">';
          html += '<span class="lock-icon-big">🔒</span>';
          html += '<p>Premium requis</p>';
          html += '</div>';
        }

        match.fighters.forEach((fighter, f) => {
          if (!fighter) {
            html += '<div class="fighter"><span style="color:var(--text-dim)">En attente...</span></div>';
          } else {
            const isWinner = match.winner && match.winner.id === fighter.id;
            const canClick = isActive && !locked && !match.winner;
            html += '<div class="fighter ' + (isWinner ? 'fighter-winner' : '') + ' ' + (canClick ? 'fighter-clickable' : '') + '"';
            if (canClick) {
              html += ' onclick="Tournament.selectWinner(' + r + ',' + m + ',' + f + ')"';
            }
            html += '>';
            html += '<img src="' + fighter.image + '" alt="' + fighter.name + '" class="fighter-img" onerror="this.style.display=\'none\'">';
            html += '<span>' + fighter.emoji + ' ' + fighter.name + '</span>';
            html += '</div>';
          }
          if (f === 0) html += '<div class="vs-badge">VS</div>';
        });

        html += '</div>';
      });

      html += '</div>';
    }

    html += '</div>';

    // Show winner
    if (this.rounds.length === 4 && this.rounds[3] && this.rounds[3][0] && this.rounds[3][0].winner) {
      const winner = this.rounds[3][0].winner;
      html += '<div class="tournament-winner">';
      html += '<div class="winner-crown">👑</div>';
      html += '<img src="' + winner.image + '" alt="' + winner.name + '" class="winner-img" onerror="this.style.display=\'none\'">';
      html += '<h2>' + winner.emoji + ' ' + winner.name + ' est le champion!</h2>';
      html += '<button class="btn btn-secondary" onclick="Tournament.shareResult()" style="margin-top:1rem">🔗 Partager</button>';
      html += '</div>';
    }

    container.innerHTML = html;
  },

  selectWinner(roundIndex, matchIndex, fighterIndex) {
    const match = this.rounds[roundIndex][matchIndex];
    if (match.winner) return;

    match.winner = match.fighters[fighterIndex];

    // Check if round is complete
    const roundComplete = this.rounds[roundIndex].every(m => m.winner !== null);

    if (roundComplete && roundIndex < 3) {
      // Create next round
      const winners = this.rounds[roundIndex].map(m => m.winner);
      const nextRound = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextRound.push({
          fighters: [winners[i], winners[i + 1] || null],
          winner: null
        });
      }
      this.rounds.push(nextRound);
      this.currentRound = roundIndex + 1;
    }

    // Save result if final
    if (roundIndex === 3 && match.winner) {
      this.saveFinalResult(match.winner);
    }

    this.render();
  },

  async saveFinalResult(winner) {
    if (Auth.isLoggedIn()) {
      try {
        await Airtable.saveTournamentResult(Auth.currentUser.id, winner.name);
      } catch(e) { /* silently fail */ }
    }
  },

  shareResult() {
    const finalMatch = this.rounds[3] && this.rounds[3][0];
    if (!finalMatch || !finalMatch.winner) return;

    const text = 'Mon champion FruitRanker : ' + finalMatch.winner.emoji + ' ' + finalMatch.winner.name + ' !\nFais ton propre tournoi sur FruitRanker!';

    if (navigator.share) {
      navigator.share({ title: 'Mon champion FruitRanker', text: text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        Premium.showToast('Resultat copie!');
      });
    }
  }
};
