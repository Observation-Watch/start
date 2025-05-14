// Shared variables (declare ONCE)
window.canvas = document.getElementById('gameCanvas');
window.ctx = canvas.getContext('2d');
window.fullscreenBtn = document.getElementById('fullscreenBtn');

let screen = "start";
let brightness = 1;
let volume = 1;

const buttons = {
  start: [
    { text: "Play", x: 300, y: 250, w: 200, h: 50, screen: "game" },
    { text: "Settings", x: 300, y: 320, w: 200, h: 50, screen: "settings" },
    { text: "How To Play", x: 300, y: 390, w: 200, h: 50, screen: "howto" },
  ],
  settings: [
    { text: "Back", x: 300, y: 500, w: 200, h: 50, screen: "start" }
  ],
  howto: [
    { text: "Back", x: 300, y: 500, w: 200, h: 50, screen: "start" }
  ]
};

let draggingSlider = null;

// --- LOADING STATE ---
let loading = false;
let loadingStart = 0;
let loadingDuration = 0;

function drawButton(btn) {
  ctx.fillStyle = "#222";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + btn.h/2);
}

function draw() {
  ctx.save();
  ctx.globalAlpha = Math.max(0.5, Math.min(brightness, 1.5));
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  if (loading) {
    drawLoadingAnimation();
    // Check if loading is done
    if (performance.now() - loadingStart > loadingDuration) {
      // Switch to start.js with mosaic animation
      const oldScript = document.getElementById('menuScript');
      if (oldScript) oldScript.remove();
      const newScript = document.createElement('script');
      newScript.src = 'start.js';
      newScript.id = 'gameScript';
      document.body.appendChild(newScript);
      return; // Stop this draw loop
    }
  } else if (screen === "start") {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Surveillance Horror Game", 400, 150);

    buttons.start.forEach(drawButton);

  } else if (screen === "settings") {
    ctx.font = "36px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Settings", 400, 120);

    ctx.font = "24px Arial";
    ctx.fillText("Brightness", 400, 220);
    drawSlider(400, 250, 300, brightness, 0.5, 1.5, "brightness");

    ctx.fillText("Game Volume", 400, 320);
    drawSlider(400, 350, 300, volume, 0, 1, "volume");

    buttons.settings.forEach(drawButton);

  } else if (screen === "howto") {
    ctx.font = "36px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("How To Play", 400, 120);

    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("- Watch the cameras for creatures.", 120, 200);
    ctx.fillText("- Use different actions to stop each creature.", 120, 240);
    ctx.fillText("- Survive as long as possible!", 120, 280);

    buttons.howto.forEach(drawButton);
  }

  requestAnimationFrame(draw);
}

// --- Loading Animation (Spinner) ---
function drawLoadingAnimation() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Spinner
  let cx = canvas.width/2, cy = canvas.height/2, r = 40;
  let now = performance.now();
  let angle = ((now / 500) % 1) * 2 * Math.PI;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 6);
    ctx.globalAlpha = i / 12;
    ctx.fillStyle = "#48f";
    ctx.fillRect(r, -6, 18, 12);
    ctx.restore();
  }
  ctx.restore();

  // Loading text
  ctx.font = "28px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  let dots = ".".repeat(Math.floor(now / 400) % 4);
  ctx.fillText("Loading" + dots, canvas.width/2, canvas.height/2 + 70);
}

function drawSlider(x, y, width, value, min, max, type) {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - width/2, y);
  ctx.lineTo(x + width/2, y);
  ctx.stroke();

  const t = (value - min) / (max - min);
  const thumbX = x - width/2 + t * width;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(thumbX, y, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "18px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(value.toFixed(2), x, y + 30);

  if (!drawSlider.areas) drawSlider.areas = {};
  drawSlider.areas[type] = { x: x - width/2, y: y - 15, w: width, h: 30, min, max, value, sliderY: y, type };
}

canvas.addEventListener('mousedown', function(e) {
  const { offsetX, offsetY } = e;

  if (loading) return;

  let btns = [];
  if (screen === "start") btns = buttons.start;
  else if (screen === "settings") btns = buttons.settings;
  else if (screen === "howto") btns = buttons.howto;

  for (const btn of btns) {
    if (
      offsetX >= btn.x && offsetX <= btn.x + btn.w &&
      offsetY >= btn.y && offsetY <= btn.y + btn.h
    ) {
      if (btn.text === "Play") {
        // Start loading
        loading = true;
        loadingStart = performance.now();
        loadingDuration = 3000 + Math.random() * 2000; // 3-5 seconds
        return;
      }
      screen = btn.screen;
      return;
    }
  }

  if (screen === "settings" && drawSlider.areas) {
    for (const key in drawSlider.areas) {
      const area = drawSlider.areas[key];
      if (
        offsetX >= area.x && offsetX <= area.x + area.w &&
        offsetY >= area.y && offsetY <= area.y + area.h
      ) {
        draggingSlider = area.type;
        updateSliderValue(offsetX, area);
        return;
      }
    }
  }
});

canvas.addEventListener('mousemove', function(e) {
  if (draggingSlider && drawSlider.areas) {
    const area = drawSlider.areas[draggingSlider];
    updateSliderValue(e.offsetX, area);
  }
});

canvas.addEventListener('mouseup', function() {
  draggingSlider = null;
});

function updateSliderValue(mouseX, area) {
  let t = (mouseX - area.x) / area.w;
  t = Math.max(0, Math.min(1, t));
  const newValue = area.min + t * (area.max - area.min);
  if (area.type === "brightness") brightness = newValue;
  if (area.type === "volume") volume = newValue;
}

// --- Fullscreen Logic ---
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

draw();
