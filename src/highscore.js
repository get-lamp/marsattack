
function getHighScores() {
  if (localStorage.getItem("highscores")) {
    return JSON.parse(localStorage.getItem("highscores"));
  } else {
    return [];
  }
}

function saveHighScore(score, waves, player) {
  const highscores = getHighScores();
  const newScore = { score, waves, player };
  highscores.push(newScore);
  highscores.sort((a, b) => b.score - a.score);
  localStorage.setItem("highscores", JSON.stringify(highscores));
}

function getRank(score) {
  const highscores = getHighScores();
  let rank = highscores.findIndex(highscore => score > highscore.score);
  if (rank === -1) {
    rank = highscores.length;
  }
  return rank + 1;
}

function showRanking() {
  const highscores = getHighScores();
  let rankingHTML = "<table><thead><td colspan='4'>TOP SCORES</td></tr><tr><td>rank</td><td>waves</td><td>score</td><td>player</td></thead>";
  highscores.forEach((score, index) => {
    rankingHTML += `<tr><td>${index + 1}</td><td>${score.waves}</td><td>${score.score}</td><td>${score.player}</td></tr>`;
  });
  rankingHTML += "</table>";
  $("#ranking").html(rankingHTML);
  $("#ranking").toggle();
}

function getHiScore() {
    const highscores = getHighScores();
    if (highscores.length > 0) {
        return "HI-SCORE: " + highscores[0].score;
    }
    return "HI-SCORE: 0";
}
