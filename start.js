const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// --- Fullscreen Logic (same as in game.js) ---
fullscreenBtn.addEventListener('click', () => {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === canvas) {
    fullscreenBtn.style.display = 'none';
    resizeCanvasToWindow();
  } else {
    fullscreenBtn.style.display = '';
    resetCanvasSize();
  }
});
document.addEventListener('webkitfullscreenchange', () => {
  if (document.webkitFullscreenElement === canvas) {
    fullscreenBtn.style.display = 'none';
    resizeCanvasToWindow();
  } else {
    fullscreenBtn.style.display = '';
    resetCanvasSize();
  }
});
function resizeCanvasToWindow() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function resetCanvasSize() {
  canvas.width = 800;
  canvas.height = 600;
}
window.addEventListener('resize', () => {
  if (document.fullscreenElement === canvas || document.webkitFullscreenElement === canvas) {
    resizeCanvasToWindow();
  }
});

// --- Example Game Loop ---
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "36px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("Game Started!", canvas.width/2, canvas.height/2);

  // Your main game logic goes here

  requestAnimationFrame(drawGame);
}

drawGame();
