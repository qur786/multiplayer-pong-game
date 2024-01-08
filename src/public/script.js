import { isMobile } from "./utils.js";

const socket = io();

// Canvas
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

const width = 500;
const height = 400;
const screenWidth = window.innerWidth;
const canvasPosition = screenWidth / 2 - width / 2;
const container = document.getElementById("container");
const gameOverEl = document.createElement("div");
const startGameEl = document.createElement("div");
const playerTitle = document.createElement("h5");

// Paddle
const paddle = {
  height: 10,
  width: 50,
  diff: 25,
  bottomX: 225,
  topX: 225,
};

let paddleContact = false;
let playerMoved = false;
let isRefree;

// Ball
const ball = {
  x: 250,
  y: 250,
  radius: 5,
  speedX: 0,
  speedY: 0,
  trajectoryX: 0,
};

// Change Mobile Settings
if (isMobile() === true) {
  ball.speedY = ball.speedX = -2;
} else {
  ball.speedY = ball.speedX = -1;
}

// Score
let player1Score = 0;
let player2Score = 0;
const winningScore = 5;
let isGameOver = true;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas() {
  if (context !== null) {
    // Canvas Background
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // Paddle Color
    context.fillStyle = "white";

    // Player Paddle (Bottom)
    context.fillRect(paddle.bottomX, height - 20, paddle.width, paddle.height);

    // Computer Paddle (Top)
    context.fillRect(paddle.topX, 10, paddle.width, paddle.height);

    // Dashed Center Line
    context.beginPath();
    context.setLineDash([5]);
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.strokeStyle = "grey";
    context.stroke();

    // Ball
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
    context.fillStyle = "white";
    context.fill();

    // Score
    context.font = "32px Courier New";
    context.fillText(player1Score.toString(), 20, canvas.height / 2 + 50);
    context.fillText(player2Score.toString(), 20, canvas.height / 2 - 30);
  }
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ball.x = width / 2;
  ball.y = height / 2;
  ball.speedY = -3;
  paddleContact = false;
}

function resetToDefault() {
  isGameOver = false;
  isNewGame = false;
  player1Score = 0;
  player2Score = 0;
  paddle.topX = 225;
  paddle.bottomX = 225;
  ballReset();
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ball.y += -ball.speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ball.x += ball.speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ball.x < 0 && ball.speedX < 0) {
    ball.speedX = -ball.speedX;
  }
  // Bounce off Right Wall
  if (ball.x > width && ball.speedX > 0) {
    ball.speedX = -ball.speedX;
  }
  // Bounce off player paddle (bottom)
  if (ball.y > height - paddle.diff) {
    if (ball.x > paddle.bottomX && ball.x < paddle.bottomX + paddle.width) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        ball.speedY -= 1;
        // Max Speed
        if (ball.speedY < -5) {
          ball.speedY = -5;
        }
      }
      ball.speedY = -ball.speedY;
      ball.trajectoryX = ball.x - (paddle.bottomX + paddle.diff);
      ball.speedX = ball.trajectoryX * 0.3;
    } else if (ball.y > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      player2Score++;
    }
  }
  // Bounce off computer paddle (top)
  if (ball.y < paddle.diff) {
    if (ball.x > paddle.topX && ball.x < paddle.topX + paddle.width) {
      // Add Speed on Hit
      if (playerMoved) {
        ball.speedY += 1;
        // Max Speed
        if (ball.speedY > 5) {
          ball.speedY = 5;
        }
      }
      ball.speedY = -ball.speedY;
    } else if (ball.y < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      player1Score++;
    }
  }
}

function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden = true;

  // Container
  gameOverEl.textContent = "";
  gameOverEl.classList.add("game-over-container");
  // Title
  const title = document.createElement("h1");
  title.textContent = `${winner} Won!`;
  // Button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.addEventListener("click", () => {
    socket.emit("play", socket.id);
    gameOverEl.removeChild(playAgainBtn);
    gameOverEl.removeChild(title);
    const waitingTitle = document.createElement("p");
    waitingTitle.textContent = "Waiting for the oponent...";
    gameOverEl.append(waitingTitle);
  });
  playAgainBtn.textContent = "Play Again";
  // Append
  gameOverEl.append(title);
  gameOverEl.append(playAgainBtn);
  container.append(gameOverEl);
  playerTitle.textContent = "";
}

function showStartGameEl() {
  // Hide Canvas
  canvas.hidden = true;

  // Container
  startGameEl.textContent = "";
  startGameEl.classList.add("game-start-container");

  // Button
  const startGameBtn = document.createElement("button");
  startGameBtn.addEventListener("click", () => {
    socket.emit("play", socket.id);
    startGameEl.removeChild(startGameBtn);
    const waitingTitle = document.createElement("p");
    waitingTitle.textContent = "Waiting for the oponent...";
    startGameEl.append(waitingTitle);
  });
  startGameBtn.textContent = "Start game";
  // Append
  startGameEl.append(startGameBtn);
  container.append(startGameEl);
  playerTitle.textContent = "";
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (player1Score === winningScore) {
    isGameOver = true;
    // Set Winner
    let winner = isRefree === true ? "You" : "Player1";
    socket.emit("game-over", socket.id);
    showGameOverEl(winner);
  }

  if (player2Score === winningScore) {
    isGameOver = true;
    // Set Winner
    let winner = isRefree === true ? "Player2" : "You";
    socket.emit("game-over", socket.id);
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  gameOver();
  if (isRefree) {
    ballMove();
    ballBoundaries();
    socket.emit("ball-move", [ball.x, ball.y, player1Score, player2Score]);
  }
  if (isGameOver !== true) {
    window.requestAnimationFrame(animate);
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) {
    canvas.hidden = false;
    container.removeChild(gameOverEl);
  }

  if (isNewGame === true) {
    canvas.hidden = false;
    container.removeChild(startGameEl);
  }

  resetToDefault();
  createCanvas();
  animate();
  canvas.addEventListener("mousemove", (e) => {
    playerMoved = true;
    if (isRefree) {
      // Compensate for canvas being centered
      paddle.bottomX = e.clientX - canvasPosition - paddle.diff;
      if (paddle.bottomX < paddle.diff) {
        paddle.bottomX = 0;
      }
      if (paddle.bottomX > width - paddle.width) {
        paddle.bottomX = width - paddle.width;
      }
    } else {
      // Compensate for canvas being centered
      paddle.topX = e.clientX - canvasPosition - paddle.diff;
      if (paddle.bottomX < paddle.diff) {
        paddle.bottomX = 0;
      }
      if (paddle.topX > width - paddle.width) {
        paddle.topX = width - paddle.width;
      }
    }
    socket.emit("paddle-move", { topX: paddle.topX, bottomX: paddle.bottomX });
    // Hide Cursor
    canvas.style.cursor = "none";
  });
}

// On Load
if (isNewGame === true) {
  showStartGameEl();
  container.appendChild(playerTitle);
}

socket.on("start", (playerID) => {
  isRefree = playerID === socket.id;
  startGame();
  playerTitle.textContent = isRefree === true ? "Player 1" : "Player 2";
});

socket.on("paddle-move", ({ topX, bottomX }) => {
  paddle.topX = topX;
  paddle.bottomX = bottomX;
});

socket.on("ball-move", ([x, y, score1, score2]) => {
  ball.x = x;
  ball.y = y;
  player1Score = score1;
  player2Score = score2;
});
