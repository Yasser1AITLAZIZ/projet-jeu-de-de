// ----- VARIABLES / ÉTAT -----
let players = []; // { name, score }
let currentRollerIndex = 0;
let rollsForThisRound = [];
let designatedPlayerIndex = null;

// ----- ÉLÉMENTS DOM -----
// Accueil
const accueilSection = document.getElementById("accueil");
const btnAddPlayer = document.getElementById("btnAddPlayer");
const playerNameInput = document.getElementById("playerNameInput");
const playerList = document.getElementById("playerList");
const btnStartSession = document.getElementById("btnStartSession");

// Jeu
const jeuSection = document.getElementById("jeu");
const dice = document.getElementById("dice");
const btnRoll = document.getElementById("btnRoll");
const resultatElem = document.getElementById("resultat");
const tourInfoElem = document.getElementById("tourInfo");

const noteArea = document.getElementById("noteArea");
const performancePrompt = document.getElementById("performancePrompt");
const noteInput = document.getElementById("noteInput");
const btnSubmitNote = document.getElementById("btnSubmitNote");
const scoreTableBody = document.getElementById("scoreTableBody");
const btnEndSession = document.getElementById("btnEndSession");

// Finale
const finalSection = document.getElementById("final");
const winnerInfoElem = document.getElementById("winnerInfo");
const finalScoreTableBody = document.getElementById("finalScoreTableBody");

// ----- FONCTIONS -----

function refreshPlayerList() {
  playerList.innerHTML = "";
  players.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (score: ${p.score})`;
    playerList.appendChild(li);
  });
}

function refreshScoreTable() {
  scoreTableBody.innerHTML = "";
  players.forEach((p) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdScore = document.createElement("td");
    tdName.textContent = p.name;
    tdScore.textContent = p.score;
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    scoreTableBody.appendChild(tr);
  });
}

function updateTourInfo() {
  if (currentRollerIndex < players.length) {
    tourInfoElem.textContent = `Joueur en train de lancer : ${players[currentRollerIndex].name}`;
  } else {
    tourInfoElem.textContent = "Tous les joueurs ont lancé ce tour.";
  }
}

function rollDiceValue() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * On applique une rotation correspondant à la face:
 * 1 => front => rotateX(0) rotateY(0)
 * 2 => right => rotateY(-90)
 * 3 => bottom => rotateX(90)
 * 4 => top => rotateX(-90)
 * 5 => left => rotateY(90)
 * 6 => back => rotateY(180)
 */
function rotateDiceToValue(value) {
  let rotateX = 0, rotateY = 0;
  switch (value) {
    case 1: rotateX = 0; rotateY = 0; break;
    case 2: rotateX = 0; rotateY = -90; break;
    case 3: rotateX = 90; rotateY = 0; break;
    case 4: rotateX = -90; rotateY = 0; break;
    case 5: rotateX = 0; rotateY = 90; break;
    case 6: rotateX = 0; rotateY = 180; break;
  }
  dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Trouver la plus petite valeur dans rollsForThisRound
function findMinRollPlayerIndex() {
  let minVal = Infinity;
  let minPlayerIndex = null;
  rollsForThisRound.forEach(r => {
    if (r.value < minVal) {
      minVal = r.value;
      minPlayerIndex = r.playerIndex;
    }
  });
  return minPlayerIndex;
}

// ----- ÉCOUTEURS D'ÉVÉNEMENTS -----

// (1) Ajouter un joueur
btnAddPlayer.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (name) {
    players.push({ name, score: 0 });
    playerNameInput.value = "";
    refreshPlayerList();
    if (players.length > 0) {
      btnStartSession.disabled = false;
    }
  }
});

// (2) Commencer la session
btnStartSession.addEventListener("click", () => {
  accueilSection.style.display = "none";
  jeuSection.style.display = "block";
  currentRollerIndex = 0;
  rollsForThisRound = [];
  refreshScoreTable();
  updateTourInfo();
});

// (3) Lancer le dé (joueur suivant)
btnRoll.addEventListener("click", () => {
  if (currentRollerIndex >= players.length) {
    alert("Tous les joueurs ont déjà lancé ce tour. Veuillez noter la performance, ou démarrer un nouveau tour.");
    return;
  }
  const value = rollDiceValue();
  resultatElem.textContent = `Résultat du dé : ${value}`;
  rotateDiceToValue(value);

  rollsForThisRound.push({ playerIndex: currentRollerIndex, value });
  currentRollerIndex++;
  if (currentRollerIndex < players.length) {
    updateTourInfo();
  } else {
    updateTourInfo();
    alert("Tous les joueurs ont lancé. Le plus petit résultat sera désigné !");
    designatedPlayerIndex = findMinRollPlayerIndex();
    noteArea.style.display = "block";
    performancePrompt.textContent = `Noter la performance de ${players[designatedPlayerIndex].name} :`;
  }
});

// (4) Valider la note
btnSubmitNote.addEventListener("click", () => {
  const noteValue = parseInt(noteInput.value, 10);
  if (!isNaN(noteValue) && noteValue >= 1 && noteValue <= 10) {
    players[designatedPlayerIndex].score += noteValue;
    noteInput.value = "";
    noteArea.style.display = "none";
    refreshScoreTable();

    // Prépare un nouveau tour
    rollsForThisRound = [];
    currentRollerIndex = 0;
    designatedPlayerIndex = null;
    resultatElem.textContent = "Résultat du dé : --";
    rotateDiceToValue(1); // réinitialise visuellement (optionnel)
    updateTourInfo();
    alert("Nouveau tour : on repart avec le premier joueur !");
  } else {
    alert("Veuillez saisir une note entre 1 et 10.");
  }
});

// (5) Terminer la session
btnEndSession.addEventListener("click", () => {
  jeuSection.style.display = "none";
  finalSection.style.display = "block";

  // Trouver le gagnant
  let winner = null;
  let maxScore = -Infinity;
  players.forEach(p => {
    if (p.score > maxScore) {
      maxScore = p.score;
      winner = p;
    }
  });
  winnerInfoElem.textContent = `Le gagnant est ${winner.name} avec ${winner.score} points !`;

  // Afficher le tableau final (trié par score décroissant)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  finalScoreTableBody.innerHTML = "";
  sortedPlayers.forEach(p => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdScore = document.createElement("td");
    tdName.textContent = p.name;
    tdScore.textContent = p.score;
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    finalScoreTableBody.appendChild(tr);
  });
});
