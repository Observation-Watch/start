window.canvas = document.getElementById('gameCanvas');
window.ctx = canvas.getContext('2d');
window.fullscreenBtn = document.getElementById('fullscreenBtn');

// --- GAME STATE ---
let inCamera = false;
let flipping = false;
let flipProgress = 0; // 0 = bedroom, 1 = camera view
let flipDirection = 1; // 1 = to camera, -1 = to bedroom

let currentRoom = "Hallway";
let showActions = false;

// --- MOSAIC ANIMATION ---
let mosaicAnimating = true;
const mosaicRows = 8, mosaicCols = 12;
let mosaicTiles = [];
let mosaicStartTime = 0;

// Prepare tile reveal times
function initMosaic() {
  mosaicTiles = [];
  for (let row = 0; row < mosaicRows; row++) {
    for (let col = 0; col < mosaicCols; col++) {
      // Staggered reveal, random for more effect
      let delay = (row + col) * 40 + Math.random() * 80;
      mosaicTiles.push({
        row, col,
        delay,
        alpha: 0
      });
    }
  }
  mosaicStartTime = performance.now();
  mosaicAnimating = true;
}
initMosaic();

// --- BUTTONS ---
const cameraBtn = { x: canvas.width - 70, y: 30, w: 40, h: 40 };
const actionBtn = { x: canvas.width/2 - 60, y: 500, w: 120, h: 40 };
const roomBtns = [
  { name: "Hallway" },
  { name: "Garage" },
  { name: "Kitchen" },
  { name: "Office" },
  { name: "Living Room" }
];
const actionBtns = [
  { name: "Flash Light" },
  { name: "Make Loud Noise" }
];

// --- DRAW FUNCTIONS ---
function drawBedroom() {
  // Background
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Simple bed
  ctx.fillStyle = "#444";
  ctx.fillRect(150, 400, 500, 80);
  ctx.fillStyle = "#666";
  ctx.fillRect(200, 370, 200, 40);
  ctx.fillStyle = "#888";
  ctx.fillRect(420, 370, 180, 40);

  // Window
  ctx.fillStyle = "#333";
  ctx.fillRect(600, 100, 120, 80);
  ctx.strokeStyle = "#666";
  ctx.strokeRect(600, 100, 120, 80);
  ctx.beginPath();
  ctx.moveTo(660, 100); ctx.lineTo(660, 180);
  ctx.moveTo(600, 140); ctx.lineTo(720, 140);
  ctx.stroke();

  // Door
  ctx.fillStyle = "#333";
  ctx.fillRect(80, 220, 60, 140);
  ctx.strokeRect(80, 220, 60, 140);

  // Camera button
  drawCameraButton();
}

function drawCameraButton() {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(cameraBtn.x + cameraBtn.w/2, cameraBtn.y + cameraBtn.h/2, 22, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Camera icon
  ctx.fillStyle = "#fff";
  ctx.fillRect(cameraBtn.x+10, cameraBtn.y+15, 20, 12);
  ctx.beginPath();
  ctx.moveTo(cameraBtn.x+30, cameraBtn.y+18);
  ctx.lineTo(cameraBtn.x+36, cameraBtn.y+21);
  ctx.lineTo(cameraBtn.x+30, cameraBtn.y+24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCameraView() {
  // Camera screen background
  ctx.fillStyle = "#111";
  ctx.fillRect(80, 60, 640, 400);

  // Room name
  ctx.font = "32px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(currentRoom, 400, 100);

  // Camera image (placeholder: colored rectangle)
  ctx.fillStyle = "#222";
  ctx.fillRect(140, 140, 520, 220);
  ctx.strokeStyle = "#444";
  ctx.strokeRect(140, 140, 520, 220);

  // Room buttons
  let btnX = 120, btnY = 380;
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  roomBtns.forEach((btn, i) => {
    ctx.fillStyle = currentRoom === btn.name ? "#48f" : "#222";
    ctx.fillRect(btnX + i*120, btnY, 100, 34);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(btnX + i*120, btnY, 100, 34);
    ctx.fillStyle = "#fff";
    ctx.fillText(btn.name, btnX + i*120 + 50, btnY + 20);
  });

  // Actions button
  ctx.fillStyle = "#333";
  ctx.fillRect(actionBtn.x, actionBtn.y, actionBtn.w, actionBtn.h);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(actionBtn.x, actionBtn.y, actionBtn.w, actionBtn.h);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Actions", actionBtn.x + actionBtn.w/2, actionBtn.y + 25);

  // Show action buttons if toggled
  if (showActions) {
    actionBtns.forEach((btn, i) => {
      let bx = actionBtn.x, by = actionBtn.y + 50 + i*50;
      ctx.fillStyle = "#444";
      ctx.fillRect(bx, by, actionBtn.w, 40);
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(bx, by, actionBtn.w, 40);
      ctx.font = "18px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(btn.name, bx + actionBtn.w/2, by + 25);
    });
  }
}

// --- FLIP ANIMATION ---
function drawFlip() {
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  // Flip effect: scaleX from 1 (bedroom) to 0 (mid) to -1 (camera)
  let scaleX = Math.cos(flipProgress * Math.PI);
  ctx.scale(scaleX, 1);
  ctx.translate(-canvas.width/2, -canvas.height/2);
  if (flipDirection === 1) {
    // To camera
    if (flipProgress < 0.5) drawBedroom();
    else drawCameraView();
  } else {
    // To bedroom
    if (flipProgress < 0.5) drawCameraView();
    else drawBedroom();
  }
  ctx.restore();
}

// --- MOSAIC ANIMATION ---
function drawMosaicReveal() {
  // Draw the full game screen to an offscreen canvas
  let offCanvas = document.createElement('canvas');
  offCanvas.width = canvas.width;
  offCanvas.height = canvas.height;
  let offCtx = offCanvas.getContext('2d');
  // Draw the bedroom as the initial screen
  drawBedroom.call({ ctx: offCtx });

  // Now reveal tiles one by one
  let tileW = Math.ceil(canvas.width / mosaicCols);
  let tileH = Math.ceil(canvas.height / mosaicRows);
  let now = performance.now();
  let allDone = true;
  for (let tile of mosaicTiles) {
    let elapsed = now - mosaicStartTime - tile.delay;
    if (elapsed > 0) tile.alpha = Math.min(1, elapsed / 200);
    else tile.alpha = 0;
    if (tile.alpha < 1) allDone = false;
    if (tile.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = tile.alpha;
      ctx.drawImage(
        offCanvas,
        tile.col * tileW, tile.row * tileH, tileW, tileH,
        tile.col * tileW, tile.row * tileH, tileW, tileH
      );
      ctx.restore();
    }
  }
  if (allDone) mosaicAnimating = false;
}

// --- MAIN DRAW LOOP ---
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mosaicAnimating) {
    drawMosaicReveal();
  } else if (flipping) {
    drawFlip();
    flipProgress += 0.08;
    if (flipProgress >= 1) {
      flipping = false;
      inCamera = flipDirection === 1;
      flipProgress = 0;
    }
  } else {
    if (inCamera) drawCameraView();
    else drawBedroom();
  }

  requestAnimationFrame(drawGame);
}

// --- MOUSE HANDLING ---
canvas.addEventListener('mousedown', function(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  if (mosaicAnimating || flipping) return;

  if (!inCamera) {
    // Check camera button
    if (
      mx >= cameraBtn.x && mx <= cameraBtn.x + cameraBtn.w &&
      my >= cameraBtn.y && my <= cameraBtn.y + cameraBtn.h
    ) {
      flipping = true;
      flipDirection = 1;
      flipProgress = 0;
      return;
    }
  } else {
    // Check close camera (click camera button again)
    if (
      mx >= cameraBtn.x && mx <= cameraBtn.x + cameraBtn.w &&
      my >= cameraBtn.y && my <= cameraBtn.y + cameraBtn.h
    ) {
      flipping = true;
      flipDirection = -1;
      flipProgress = 0;
      showActions = false;
      return;
    }
    // Room buttons
    let btnX = 120, btnY = 380;
    roomBtns.forEach((btn, i) => {
      let bx = btnX + i*120, by = btnY, bw = 100, bh = 34;
      if (
        mx >= bx && mx <= bx + bw &&
        my >= by && my <= by + bh
      ) {
        currentRoom = btn.name;
      }
    });
    // Actions button
    if (
      mx >= actionBtn.x && mx <= actionBtn.x + actionBtn.w &&
      my >= actionBtn.y && my <= actionBtn.y + actionBtn.h
    ) {
      showActions = !showActions;
    }
    // Action buttons (if visible)
    if (showActions) {
      actionBtns.forEach((btn, i) => {
        let bx = actionBtn.x, by = actionBtn.y + 50 + i*50, bw = actionBtn.w, bh = 40;
        if (
          mx >= bx && mx <= bx + bw &&
          my >= by && my <= by + bh
        ) {
          // For now, just highlight the button
          ctx.fillStyle = "#0f0";
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = "#fff";
          ctx.strokeRect(bx, by, bw, bh);
          ctx.font = "18px Arial";
          ctx.fillStyle = "#fff";
          ctx.fillText(btn.name + "!", bx + bw/2, by + 25);
          // You can add sound or effect here later!
        }
      });
    }
  }
});

// --- START GAME LOOP ---
drawGame();
