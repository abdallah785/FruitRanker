// ==============================================
// TOURNAMENT (Bracket system - Dual Layout)
// ==============================================
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

  selectWinner(roundIdx, matchIdx, fighterIdx) {
    const match = this.rounds[roundIdx][matchIdx];
    const user = Auth.currentUser;

    // Freemium: block semi-finals and finals for free users
    const totalRounds = Math.ceil(Math.log2(16)); // 4 rounds
    const isSemiFinal = roundIdx === totalRounds - 2;
    const isFinal = roundIdx === totalRounds - 1;

    if (user && user.plan !== 'premium' && (isSemiFinal || isFinal)) {
      App.showToast('Passe en Premium pour jouer les demi-finales et la finale !', 'warning');
      return;
    }

    match.winner = match.fighters[fighterIdx];

    // Check if all matches in the current round are done
    const allDone = this.rounds[roundIdx].every(m => m.winner);
    if (allDone) {
      // Create next round
      const winners = this.rounds[roundIdx].map(m => m.winner);
      if (winners.length > 1) {
        const nextRound = [];
        for (let i = 0; i < winners.length; i += 2) {
          nextRound.push({
            fighters: [winners[i], winners[i + 1]],
            winner: null
          });
        }
        this.rounds.push(nextRound);
      } else {
        // Tournament finished - save winner
        this.saveTournamentResult(winners[0]);
      }
    }
    this.render();
  },

  async saveTournamentResult(winner) {
    const user = Auth.currentUser;
    if (user) {
      await AirtableDB.addRecord('Tournaments', {
        user_id: user.email,
        gagnant: winner.name,
        date: new Date().toISOString()
      });
    }
    setTimeout(() => {
      App.showToast('Tournoi termin\u00e9 ! ' + winner.emoji + ' ' + winner.name + ' est le champion !', 'success');
    }, 500);
  },

  renderMatchHTML(match, r, m, isActive, locked, roundLabel) {
    let html = '<div class="match">';
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
    return html;
  },

  render() {
    const container = document.getElementById('tournament-bracket');
    if (!container) return;

    const user = Auth.currentUser;
    const totalRounds = Math.ceil(Math.log2(16)); // 4 rounds
    const roundNames = ['Huitièmes', 'Quarts', 'Demi-finales', 'Finale'];

    // Build bracket-dual layout: left side and right side
    let leftHTML = '';
    let rightHTML = '';
    let centerHTML = '';

    this.rounds.forEach((round, r) => {
      const isActive = r === this.rounds.length - 1;
      const isSemiFinal = r === totalRounds - 2;
      const isFinal = r === totalRounds - 1;
      const locked = user && user.plan !== 'premium' && (isSemiFinal || isFinal);

      const roundLabel = roundNames[r] || 'Tour ' + (r + 1);
      let roundHTML = '<div class="round">';
      roundHTML += '<h3 class="round-title">' + roundLabel;
      if (locked) roundHTML += ' <span class="lock-icon">\ud83d\udd12</span>';
      roundHTML += '</h3>';

      if (locked) {
        roundHTML += '<div class="locked-overlay"><p>\ud83d\udd12 Passe en Premium pour d\u00e9bloquer</p>';
        roundHTML += '<button class="btn-premium-sm" onclick="App.navigate(\'premium\')">D\u00e9bloquer Premium</button></div>';
      }

      round.forEach((match, m) => {
        roundHTML += this.renderMatchHTML(match, r, m, isActive, locked, roundLabel);
      });

      roundHTML += '</div>';

      // Split rounds: first half on left, second half on right
      const halfMatches = Math.ceil(round.length / 2);

      if (r < totalRounds - 1) {
        // For non-final rounds: split matches left and right
        let leftRoundHTML = '<div class="round">';
        leftRoundHTML += '<h3 class="round-title">' + roundLabel;
        if (locked) leftRoundHTML += ' <span class="lock-icon">\ud83d\udd12</span>';
        leftRoundHTML += '</h3>';
        if (locked) {
          leftRoundHTML += '<div class="locked-overlay"><p>\ud83d\udd12 Passe en Premium</p>';
          leftRoundHTML += '<button class="btn-premium-sm" onclick="App.navigate(\'premium\')">D\u00e9bloquer</button></div>';
        }

        let rightRoundHTML = '<div class="round">';
        rightRoundHTML += '<h3 class="round-title">' + roundLabel;
        if (locked) rightRoundHTML += ' <span class="lock-icon">\ud83d\udd12</span>';
        rightRoundHTML += '</h3>';
        if (locked) {
          rightRoundHTML += '<div class="locked-overlay"><p>\ud83d\udd12 Passe en Premium</p>';
          rightRoundHTML += '<button class="btn-premium-sm" onclick="App.navigate(\'premium\')">D\u00e9bloquer</button></div>';
        }

        round.forEach((match, m) => {
          const matchHTML = this.renderMatchHTML(match, r, m, isActive, locked, roundLabel);
          if (m < halfMatches) {
            leftRoundHTML += matchHTML;
          } else {
            rightRoundHTML += matchHTML;
          }
        });

        leftRoundHTML += '</div>';
        rightRoundHTML += '</div>';
        leftHTML += leftRoundHTML;
        rightHTML += rightRoundHTML;
      } else {
        // Final round goes in center
        centerHTML += roundHTML;
      }
    });

    // Check if there is a tournament winner
    const lastRound = this.rounds[this.rounds.length - 1];
    const winner = lastRound && lastRound.length === 1 && lastRound[0].winner ? lastRound[0].winner : null;

    if (winner) {
      centerHTML += '<div class="bracket-trophy">';
      centerHTML += '<div class="trophy-icon">\ud83c\udfc6</div>';
      centerHTML += '<h2>Champion</h2>';
      centerHTML += '<img src="' + winner.image + '" alt="' + winner.name + '" class="trophy-fruit-img" onerror="this.style.display=\'none\'">';
      centerHTML += '<p class="trophy-name">' + winner.emoji + ' ' + winner.name + '</p>';
      centerHTML += '</div>';
    }

    container.innerHTML = '<div class="bracket-dual">'
      + '<div class="bracket-side bracket-left">' + leftHTML + '</div>'
      + '<div class="bracket-center">' + centerHTML + '</div>'
      + '<div class="bracket-side bracket-right">' + rightHTML + '</div>'
      + '</div>';
  }
};
