
/*
  BUBBLE POP — COLLABORATIVE PLAYTEST

  Shared:
  - Circular collaborative drawing
  - Persistent room
  - Shared tilt-triggered glitch
  - Shared shake effect

  Individual:
  - Floating bubbles
  - Bubble popping animation
  - Drawing during your turn

  Hidden interaction:
  Tilt your phone to glitch the shared drawing.

  Room: a1-glade
  App: bubble-pop
*/

// ==================================================
// 1. SHARE SETTINGS
// ==================================================

const SHARE_HOST = "https://p5-phone-share.npuckett.workers.dev";
const SHARE_ROOM = "a1-glade";
const SHARE_APP = "bubble-pop";

const INITIAL_SHARED_STATE = {
  strokes: [],
  version: 0,
  turnCount: 0,
  lastAction: "created",

  glitchStartedAt: 0,
  glitchDuration: 0,
  glitchStrength: 0,
  glitchPulse: 0,
  shakeUntil: 0,
  glitchSource: ""
};

// ==================================================
// 2. VISUAL SETTINGS
// ==================================================

const BACKGROUND = "#000000";
const PAPER = "#080808";
const WHITE = "#FFFFFF";
const MUTED = "#B5B5B5";

const STROKE_COLOR = "#FFFFFF";
const STROKE_WEIGHT = 4;

const POP_DURATION = 1500;
const WAITING_BUBBLE_COUNT = 40;

// ==================================================
// 3. LOCAL VARIABLES
// ==================================================

let drawingMode = false;

let localStrokes = [];
let currentStroke = null;

let canvasArea;

let leftButton;
let middleButton;

let waitingBubbles = [];
let bubblePopAnimations = [];

let lastShake = 0;

// Tilt calibration and detection
let tiltCalibrationFrames = 0;
let tiltCalibrationTotalX = 0;
let tiltCalibrationTotalY = 0;

let tiltBaselineX = 0;
let tiltBaselineY = 0;

let tiltCalibrated = false;
let tiltArmed = true;

let tiltNeutralSince = 0;
let lastTiltTrigger = 0;

const TILT_CALIBRATION_SAMPLES = 30;
const TILT_TRIGGER_ANGLE = 28;
const TILT_RESET_ANGLE = 12;
const TILT_COOLDOWN = 1800;
const TILT_RESET_TIME = 500;

// ==================================================
// 4. SETUP
// ==================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(displayDensity());

  textFont("Arial");
  angleMode(DEGREES);

  lockGestures();

  shareSetup({
    host: SHARE_HOST,
    room: SHARE_ROOM,
    app: SHARE_APP,
    shared: INITIAL_SHARED_STATE,
    me: {
      role: "participant"
    },
    keep: true
  });

  showDesktopQr();

  // One permission prompt for room sharing
  // and phone motion sensors.
  enablePermissionsTap(
    ["gyro", "share"],
    "Tap to join Bubble Pop and enable motion"
  );

  setShakeThreshold(110);

  updateLayout();
  createWaitingBubbles();
}

// ==================================================
// 5. SHARE CALLBACK
// ==================================================

function shareReady() {
  console.log("Bubble Pop connected.");
}

// ==================================================
// 6. MAIN DRAW LOOP
// ==================================================

function draw() {
  background(BACKGROUND);

  updateLayout();

  // Check for a hidden tilt gesture.
  checkForTiltDistortion();

  const effect = getSharedEffect();

  // Shared shake movement.
  let shakeX = 0;
  let shakeY = 0;

  if (effect.shaking) {
    const elapsed = Date.now() - effect.startedAt;

    shakeX = Math.sin(elapsed * 0.07) * 5 * effect.level;
    shakeY = Math.cos(elapsed * 0.09) * 4 * effect.level;
  }

  push();
  translate(shakeX, shakeY);

  drawHeader();
  drawCanvasCircle();

  drawSharedArtwork(effect.level);
  drawLocalArtwork();

  if (!drawingMode) {
    updateWaitingBubbles();
    drawWaitingBubbles();
    drawBubblePopAnimations();
  }

  drawFooter();

  pop();
}

// ==================================================
// 7. LAYOUT
// ==================================================

function updateLayout() {
  const areaTop = 135;
  const areaBottom = height - 145;

  const availableHeight = areaBottom - areaTop;

  const diameter = min(
    width * 0.70,
    availableHeight * 0.68
  );

  canvasArea = {
    x: width / 2,
    y: (areaTop + areaBottom) / 2,
    radius: diameter / 2,
    diameter: diameter
  };

  // Two buttons instead of three.
  const buttonY = height - 86;
  const buttonH = 52;
  const gap = 12;
  const buttonW = (width - 36 - gap) / 2;

  leftButton = {
    x: 18,
    y: buttonY,
    w: buttonW,
    h: buttonH
  };

  middleButton = {
    x: 18 + buttonW + gap,
    y: buttonY,
    w: buttonW,
    h: buttonH
  };
}

// ==================================================
// 8. HEADER
// ==================================================

function drawHeader() {
  const data = getSharedData();

  noStroke();
  fill(WHITE);

  textAlign(LEFT, TOP);
  textSize(25);
  text("bubble pop", 20, 18);

  fill(MUTED);
  textSize(13);
  text("A drawing passed between people.", 21, 53);

  textAlign(RIGHT, TOP);
  textSize(12);

  if (window.shareConnected) {
    fill(WHITE);
    text("CONNECTED", width - 20, 25);
  } else {
    fill(MUTED);
    text("CONNECTING...", width - 20, 25);
  }

  textAlign(LEFT, TOP);
  fill(MUTED);
  textSize(13);

  text(
    "Version " + data.version +
    "   ·   " + data.turnCount + " turns",
    21,
    88
  );
}

// ==================================================
// 9. CIRCULAR CANVAS
// ==================================================

function drawCanvasCircle() {
  push();

  noStroke();
  fill(PAPER);

  circle(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter
  );

  // Iridescent edge.
  noFill();
  strokeWeight(2);

  stroke(0, 220, 255, 150);
  arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter - 5,
    canvasArea.diameter - 5,
    200,
    270
  );

  stroke(170, 80, 255, 150);
  arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter - 5,
    canvasArea.diameter - 5,
    270,
    340
  );

  stroke(255, 80, 180, 150);
  arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter - 5,
    canvasArea.diameter - 5,
    340,
    55
  );

  stroke(100, 255, 190, 150);
  arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter - 5,
    canvasArea.diameter - 5,
    55,
    130
  );

  stroke(70, 130, 255, 150);
  arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter - 5,
    canvasArea.diameter - 5,
    130,
    200
  );

  // Small reflections.
  noStroke();
  fill(255, 255, 255, 100);

  ellipse(
    canvasArea.x - canvasArea.radius * 0.65,
    canvasArea.y - canvasArea.radius * 0.67,
    15,
    6
  );

  pop();

  const data = getSharedData();

  if (
    data.strokes.length === 0 &&
    localStrokes.length === 0
  ) {
    noStroke();
    fill(MUTED);

    textAlign(CENTER, CENTER);
    textSize(16);

    text(
      "A drawing will begin here.",
      canvasArea.x,
      canvasArea.y
    );
  }
}

// ==================================================
// 10. SHARED DRAWING
// ==================================================

function drawSharedArtwork(glitchLevel) {
  const data = getSharedData();

  if (data.strokes.length === 0) return;

  if (glitchLevel <= 0.01) {
    for (const strokeData of data.strokes) {
      drawStroke(strokeData);
    }

    return;
  }

  drawGlitchedArtwork(
    data.strokes,
    glitchLevel,
    data.glitchPulse
  );
}

// ==================================================
// 11. GLITCH EFFECT
// RGB separation, horizontal slicing,
// pixelation, missing sections and glitch bars.
// ==================================================

function drawGlitchedArtwork(strokes, intensity, pulse) {
  const elapsed = Date.now() - getSharedData().glitchStartedAt;

  const seed = Math.floor(elapsed / 65) + pulse * 1000;

  const shift = intensity * 9;

  // RGB separation.
  for (const strokeData of strokes) {
    drawStroke(
      strokeData,
      color(255, 50, 90, 120 * intensity),
      -shift,
      0
    );

    drawStroke(
      strokeData,
      color(40, 210, 255, 120 * intensity),
      shift,
      0
    );
  }

  // Normal drawing.
  for (const strokeData of strokes) {
    drawStroke(strokeData);
  }

  // Horizontal slices.
  const sliceCount = 3 + floor(intensity * 9);

  for (let i = 0; i < sliceCount; i++) {
    const sliceHeight = canvasArea.diameter / sliceCount;

    const sliceY =
      canvasArea.y -
      canvasArea.radius +
      i * sliceHeight;

    const direction = i % 2 === 0 ? 1 : -1;

    const sliceShift =
      direction * intensity *
      (12 + hashRandom(seed, i) * 38);

    for (const strokeData of strokes) {
      drawStroke(
        strokeData,
        color(255, 255, 255, 210),
        sliceShift,
        0,
        {
          top: sliceY,
          bottom: sliceY + sliceHeight + 2
        }
      );
    }
  }

  // Pixelation and missing sections.
  drawingContext.save();
  drawingContext.beginPath();

  drawingContext.arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.radius,
    0,
    Math.PI * 2
  );

  drawingContext.clip();

  noStroke();

  const pixelCount = floor(intensity * 65);

  for (let i = 0; i < pixelCount; i++) {
    const px =
      canvasArea.x -
      canvasArea.radius +
      hashRandom(seed, i * 3) * canvasArea.diameter;

    const py =
      canvasArea.y -
      canvasArea.radius +
      hashRandom(seed, i * 3 + 1) * canvasArea.diameter;

    const blockSize =
      2 + hashRandom(seed, i * 3 + 2) * intensity * 17;

    fill(0, 0, 0, 170);
    rect(px, py, blockSize, blockSize);
  }

  // Glitch bars.
  const barCount = floor(intensity * 22);

  for (let i = 0; i < barCount; i++) {
    const barY =
      canvasArea.y -
      canvasArea.radius +
      hashRandom(seed, i + 300) * canvasArea.diameter;

    const barX =
      canvasArea.x -
      canvasArea.radius +
      hashRandom(seed, i + 400) * canvasArea.diameter;

    const barWidth =
      10 + hashRandom(seed, i + 500) * canvasArea.diameter * 0.8;

    const barHeight =
      2 + hashRandom(seed, i + 600) * 9;

    fill(0, 0, 0, 190);
    rect(barX, barY, barWidth, barHeight);
  }

  // Coloured horizontal bars.
  for (let i = 0; i < floor(intensity * 7); i++) {
    const barY =
      canvasArea.y -
      canvasArea.radius +
      hashRandom(seed, i + 700) * canvasArea.diameter;

    fill(0, 220, 255, 120);

    rect(
      canvasArea.x - canvasArea.radius,
      barY,
      canvasArea.diameter * 0.65,
      2
    );
  }

  drawingContext.restore();
}

function hashRandom(seed, index) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

// ==================================================
// 12. DRAW STROKES
// ==================================================

function drawStroke(
  strokeData,
  strokeColour = WHITE,
  offsetX = 0,
  offsetY = 0,
  slice = null
) {
  if (!strokeData || !strokeData.points) return;

  const points = strokeData.points;

  if (points.length === 0) return;

  push();

  drawingContext.save();
  drawingContext.beginPath();

  drawingContext.arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.radius,
    0,
    Math.PI * 2
  );

  drawingContext.clip();

  if (slice) {
    drawingContext.beginPath();

    drawingContext.rect(
      canvasArea.x - canvasArea.radius - 30,
      slice.top,
      canvasArea.diameter + 60,
      slice.bottom - slice.top
    );

    drawingContext.clip();
  }

  translate(offsetX, offsetY);

  stroke(strokeColour);
  strokeWeight(strokeData.weight || STROKE_WEIGHT);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  if (points.length === 1) {
    const px =
      canvasArea.x +
      (points[0].x - 0.5) * canvasArea.diameter;

    const py =
      canvasArea.y +
      (points[0].y - 0.5) * canvasArea.diameter;

    noStroke();
    fill(strokeColour);

    circle(
      px,
      py,
      strokeData.weight || STROKE_WEIGHT
    );
  } else {
    beginShape();

    for (const point of points) {
      const px =
        canvasArea.x +
        (point.x - 0.5) * canvasArea.diameter;

      const py =
        canvasArea.y +
        (point.y - 0.5) * canvasArea.diameter;

      vertex(px, py);
    }

    endShape();
  }

  drawingContext.restore();
  pop();
}

// ==================================================
// 13. LOCAL ARTWORK
// ==================================================

function drawLocalArtwork() {
  for (const strokeData of localStrokes) {
    drawStroke(strokeData);
  }

  if (currentStroke) {
    drawStroke(currentStroke);
  }
}

// ==================================================
// 14. HIDDEN TILT INTERACTION
// ==================================================

function checkForTiltDistortion() {
  // Wait until the user has enabled motion permissions.
  if (!window.sensorsEnabled) return;

  if (
    typeof rotationX !== "number" ||
    typeof rotationY !== "number"
  ) {
    return;
  }

  // Calibrate the phone's starting position.
  // This makes the gesture relative to how each
  // participant is naturally holding their phone.
  if (!tiltCalibrated) {
    tiltCalibrationTotalX += rotationX;
    tiltCalibrationTotalY += rotationY;

    tiltCalibrationFrames++;

    if (tiltCalibrationFrames >= TILT_CALIBRATION_SAMPLES) {
      tiltBaselineX =
        tiltCalibrationTotalX / TILT_CALIBRATION_SAMPLES;

      tiltBaselineY =
        tiltCalibrationTotalY / TILT_CALIBRATION_SAMPLES;

      tiltCalibrated = true;

      console.log("Tilt position calibrated.");
    }

    return;
  }

  const differenceX = angleDifference(
    rotationX,
    tiltBaselineX
  );

  const differenceY = angleDifference(
    rotationY,
    tiltBaselineY
  );

  const tiltAmount = Math.sqrt(
    differenceX * differenceX +
    differenceY * differenceY
  );

  // Trigger once when the phone is tilted far enough.
  if (
    tiltArmed &&
    tiltAmount >= TILT_TRIGGER_ANGLE &&
    Date.now() - lastTiltTrigger > TILT_COOLDOWN
  ) {
    tiltArmed = false;
    lastTiltTrigger = Date.now();

    triggerSharedDistortion("tilt");

    console.log("Hidden tilt interaction triggered.");
  }

  // The phone must return close to its starting
  // position before the gesture can be used again.
  if (tiltAmount <= TILT_RESET_ANGLE) {
    if (tiltNeutralSince === 0) {
      tiltNeutralSince = Date.now();
    }

    if (
      !tiltArmed &&
      Date.now() - tiltNeutralSince >= TILT_RESET_TIME
    ) {
      tiltArmed = true;
      console.log("Tilt interaction ready again.");
    }
  } else {
    tiltNeutralSince = 0;
  }
}

// Handles angle wraparound.
function angleDifference(current, baseline) {
  let difference = current - baseline;

  while (difference > 180) difference -= 360;
  while (difference < -180) difference += 360;

  return difference;
}

// ==================================================
// 15. SHARED DISTORTION
// ==================================================

function triggerSharedDistortion(source) {
  if (!window.shareConnected) return;

  const data = getSharedData();
  const now = Date.now();

  const isShake = source === "shake";

  window.shared.glitchStartedAt = now;

  window.shared.glitchDuration =
    isShake ? 2300 : 3800;

  window.shared.glitchStrength =
    isShake ? 1 : 0.85;

  window.shared.glitchPulse =
    data.glitchPulse + 1;

  window.shared.shakeUntil =
    isShake ? now + 750 : now;

  window.shared.glitchSource = source;

  console.log("Shared distortion:", source);
}

// ==================================================
// 16. SHARED EFFECT STATE
// ==================================================

function getSharedEffect() {
  const data = getSharedData();

  if (!data.glitchStartedAt || !data.glitchDuration) {
    return {
      level: 0,
      shaking: false,
      startedAt: 0
    };
  }

  const now = Date.now();

  const elapsed = max(
    0,
    now - data.glitchStartedAt
  );

  const progress = constrain(
    elapsed / data.glitchDuration,
    0,
    1
  );

  const level =
    progress >= 1
      ? 0
      : data.glitchStrength * (1 - progress * 0.65);

  return {
    level: level,
    shaking: now < data.shakeUntil,
    startedAt: data.glitchStartedAt
  };
}

// ==================================================
// 17. WAITING BUBBLES
// ==================================================

function createWaitingBubbles() {
  waitingBubbles = [];

  for (let i = 0; i < WAITING_BUBBLE_COUNT; i++) {
    waitingBubbles.push(makeWaitingBubble());
  }
}

function makeWaitingBubble() {
  const size = random(
    min(width, height) * 0.025,
    min(width, height) * 0.065
  );

  let x = width / 2;
  let y = height / 2;

  let found = false;

  for (let attempt = 0; attempt < 120; attempt++) {
    x = random(size, width - size);
    y = random(115 + size, height - 125 - size);

    const distance = dist(
      x,
      y,
      canvasArea.x,
      canvasArea.y
    );

    if (distance > canvasArea.radius + size * 0.65) {
      found = true;
      break;
    }
  }

  if (!found) {
    x = random(size, width - size);
    y = random(height - 150, height - 110);
  }

  return {
    x: x,
    y: y,
    size: size,
    speed: random(0.6, 2),
    phase: random(360),
    rotation: random(360),
    rotationSpeed: random(-0.5, 0.5),
    alpha: random(90, 210),
    popping: false
  };
}

// ==================================================
// 18. UPDATE WAITING BUBBLES
// ==================================================

function updateWaitingBubbles() {
  for (let i = 0; i < waitingBubbles.length; i++) {
    const b = waitingBubbles[i];

    if (b.popping) continue;

    b.y -= b.speed;

    b.x += Math.sin(frameCount * 0.7 + b.phase) * 0.25;

    b.rotation += b.rotationSpeed;

    b.x = constrain(
      b.x,
      b.size / 2,
      width - b.size / 2
    );

    const distance = dist(
      b.x,
      b.y,
      canvasArea.x,
      canvasArea.y
    );

    if (distance < canvasArea.radius + b.size * 0.65) {
      b.y -= b.speed * 1.5;
    }

    if (b.y < -b.size) {
      waitingBubbles[i] = makeWaitingBubble();

      waitingBubbles[i].y =
        height + random(30, 200);
    }
  }
}

// ==================================================
// 19. DRAW WAITING BUBBLES
// ==================================================

function drawWaitingBubbles() {
  for (const b of waitingBubbles) {
    if (!b.popping) {
      drawOriginalStyleBubble(b);
    }
  }
}

function drawOriginalStyleBubble(b) {
  push();

  translate(b.x, b.y);
  rotate(b.rotation);

  const alpha = b.alpha;

  noStroke();

  fill(5, 25, 35, 150);
  ellipse(0, 0, b.size, b.size);

  fill(0, 220, 255, 25);
  ellipse(
    -b.size * 0.15,
    -b.size * 0.15,
    b.size * 0.7,
    b.size * 0.6
  );

  fill(170, 80, 255, 25);
  ellipse(
    b.size * 0.15,
    0,
    b.size * 0.65,
    b.size * 0.7
  );

  fill(255, 80, 180, 20);
  ellipse(
    0,
    b.size * 0.18,
    b.size * 0.7,
    b.size * 0.5
  );

  noFill();

  strokeWeight(max(1, b.size * 0.012));

  stroke(0, 220, 255, alpha);
  arc(0, 0, b.size * 0.94, b.size * 0.94, 200, 285);

  stroke(170, 80, 255, alpha);
  arc(0, 0, b.size * 0.94, b.size * 0.94, 285, 350);

  stroke(255, 90, 190, alpha);
  arc(0, 0, b.size * 0.94, b.size * 0.94, 350, 55);

  stroke(80, 150, 255, alpha);
  arc(0, 0, b.size * 0.94, b.size * 0.94, 55, 130);

  stroke(100, 255, 190, alpha);
  arc(0, 0, b.size * 0.94, b.size * 0.94, 130, 200);

  noStroke();

  fill(255, 255, 255, 120);
  ellipse(
    -b.size * 0.22,
    -b.size * 0.25,
    b.size * 0.18,
    b.size * 0.09
  );

  fill(255, 255, 255, 70);
  ellipse(
    b.size * 0.25,
    b.size * 0.25,
    b.size * 0.06,
    b.size * 0.06
  );

  pop();
}

// ==================================================
// 20. POP A WAITING BUBBLE
// ==================================================

function popWaitingBubble(b) {
  if (b.popping) return;

  const droplets = [];

  for (let i = 0; i < 20; i++) {
    const angle = random(360);
    const speed = random(1, 4.5);

    droplets.push({
      x: b.x,
      y: b.y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(2, 6),
      r: random(100, 255),
      g: random(100, 255),
      blue: random(180, 255),
      alpha: 220
    });
  }

  bubblePopAnimations.push({
    x: b.x,
    y: b.y,
    startTime: millis(),
    droplets: droplets,
    bubble: b
  });

  b.popping = true;
}

// ==================================================
// 21. BUBBLE POP ANIMATION
// ==================================================

function drawBubblePopAnimations() {
  for (
    let i = bubblePopAnimations.length - 1;
    i >= 0;
    i--
  ) {
    const animation = bubblePopAnimations[i];

    drawOriginalPopAnimation(animation);

    if (millis() - animation.startTime > POP_DURATION) {
      bubblePopAnimations.splice(i, 1);

      const index = waitingBubbles.indexOf(animation.bubble);

      if (index !== -1) {
        waitingBubbles[index] = makeWaitingBubble();

        waitingBubbles[index].y =
          height + random(30, 200);
      }
    }
  }
}

function drawOriginalPopAnimation(animation) {
  const elapsed = millis() - animation.startTime;

  const progress = constrain(
    elapsed / POP_DURATION,
    0,
    1
  );

  const eased = 1 - pow(1 - progress, 3);

  const centerX = animation.x;
  const centerY = animation.y;

  // White splash streaks.
  for (let i = 0; i < 14; i++) {
    const angle =
      i * (360 / 14) +
      sin(i * 41) * 12;

    const delay = (i % 4) * 0.035;

    const splashProgress = constrain(
      (progress - delay) / (1 - delay),
      0,
      1
    );

    const splashEased =
      1 - pow(1 - splashProgress, 2.5);

    const innerDistance =
      min(width, height) * 0.02;

    const outerDistance =
      min(width, height) *
      (0.10 + (i % 3) * 0.035);

    const startDistance =
      innerDistance + splashEased * outerDistance;

    const streakLength =
      min(width, height) *
      (0.015 + splashEased * 0.035);

    const startX =
      centerX + cos(angle) * startDistance;

    const startY =
      centerY + sin(angle) * startDistance;

    const endX =
      centerX + cos(angle) *
      (startDistance + streakLength);

    const endY =
      centerY + sin(angle) *
      (startDistance + streakLength);

    stroke(
      255,
      255,
      255,
      190 * (1 - splashProgress)
    );

    strokeWeight(min(width, height) * 0.004);
    strokeCap(ROUND);

    line(startX, startY, endX, endY);
  }

  // Coloured splash streaks.
  const splashColours = [
    [0, 220, 255],
    [170, 80, 255],
    [255, 80, 180],
    [100, 255, 190],
    [255, 230, 100]
  ];

  for (let i = 0; i < splashColours.length; i++) {
    const angle = i * 72 + 18;

    const splashProgress = constrain(
      progress - i * 0.045,
      0,
      1
    );

    const splashEased =
      1 - pow(1 - splashProgress, 2.5);

    const distance =
      min(width, height) *
      (0.035 + splashEased * 0.18);

    const length =
      min(width, height) *
      (0.02 + splashEased * 0.02);

    const x1 = centerX + cos(angle) * distance;
    const y1 = centerY + sin(angle) * distance;

    const x2 = centerX + cos(angle) * (distance + length);
    const y2 = centerY + sin(angle) * (distance + length);

    stroke(
      splashColours[i][0],
      splashColours[i][1],
      splashColours[i][2],
      170 * (1 - splashProgress)
    );

    strokeWeight(min(width, height) * 0.006);
    strokeCap(ROUND);

    line(x1, y1, x2, y2);
  }

  // Central flash.
  noStroke();

  fill(255, 255, 255, 170 * (1 - progress));

  const flashSize =
    min(width, height) * 0.07 * eased;

  ellipse(centerX, centerY, flashSize, flashSize);

  // Moving droplets.
  for (const d of animation.droplets) {
    d.x += d.vx;
    d.y += d.vy;
    d.vy += 0.018;

    d.alpha *= 0.985;

    const direction = atan2(d.vy, d.vx);

    push();

    translate(d.x, d.y);
    rotate(direction);

    noStroke();

    fill(
      d.r,
      d.g,
      d.blue,
      d.alpha * (1 - progress * 0.5)
    );

    ellipse(
      0,
      0,
      d.size * 2.8,
      d.size * 1.7
    );

    fill(
      255,
      255,
      255,
      d.alpha * 0.35 * (1 - progress)
    );

    ellipse(
      -d.size * 0.35,
      -d.size * 0.25,
      d.size * 0.55,
      d.size * 0.25
    );

    pop();
  }
}

// ==================================================
// 22. BUTTONS
// ==================================================

function drawFooter() {
  drawButton(
    leftButton,
    drawingMode ? "DRAWING" : "MY TURN"
  );

  drawButton(
    middleButton,
    drawingMode ? "FINISH" : "PASS"
  );

  noStroke();
  fill(MUTED);

  textAlign(CENTER, TOP);
  textSize(11);

  if (drawingMode) {
    text(
      "Draw inside the bubble, then finish your turn.",
      width / 2,
      height - 23
    );
  } else {
    text(
      "Take your time. Pass when you're ready.",
      width / 2,
      height - 23
    );
  }
}

function drawButton(button, label) {
  noStroke();

  fill(window.shareConnected ? WHITE : "#555555");

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    8
  );

  fill(window.shareConnected ? "#000000" : WHITE);

  textAlign(CENTER, CENTER);
  textSize(12);

  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );
}

// ==================================================
// 23. INPUT
// ==================================================

function mousePressed() {
  if (!window.shareConnected) return;

  // Pop a floating bubble.
  if (!drawingMode) {
    for (let i = waitingBubbles.length - 1; i >= 0; i--) {
      const b = waitingBubbles[i];

      if (b.popping) continue;

      if (
        dist(mouseX, mouseY, b.x, b.y) <=
        b.size / 2 + 10
      ) {
        popWaitingBubble(b);
        return false;
      }
    }
  }

  // MY TURN.
  if (insideButton(mouseX, mouseY, leftButton)) {
    if (!drawingMode) {
      startTurn();
    }

    return false;
  }

  // FINISH / PASS.
  if (insideButton(mouseX, mouseY, middleButton)) {
    if (drawingMode) {
      finishTurn();
    } else {
      passTurn();
    }

    return false;
  }

  // Start a drawing stroke inside the circle.
  if (
    drawingMode &&
    insideDrawingCircle(mouseX, mouseY)
  ) {
    currentStroke = {
      color: STROKE_COLOR,
      weight: STROKE_WEIGHT,
      points: []
    };

    addDrawingPoint(mouseX, mouseY);
  }

  return false;
}

function mouseDragged() {
  if (!drawingMode || !currentStroke) return;

  if (insideDrawingCircle(mouseX, mouseY)) {
    addDrawingPoint(mouseX, mouseY);
  }

  return false;
}

function mouseReleased() {
  if (currentStroke) {
    if (currentStroke.points.length > 0) {
      localStrokes.push(currentStroke);
    }

    currentStroke = null;
  }

  return false;
}

// ==================================================
// 24. DRAWING HELPERS
// ==================================================

function insideDrawingCircle(x, y) {
  return dist(
    x,
    y,
    canvasArea.x,
    canvasArea.y
  ) <= canvasArea.radius;
}

function insideButton(x, y, button) {
  return (
    x >= button.x &&
    x <= button.x + button.w &&
    y >= button.y &&
    y <= button.y + button.h
  );
}

function addDrawingPoint(x, y) {
  if (!currentStroke) return;

  const normalizedX = constrain(
    (x - canvasArea.x) / canvasArea.diameter + 0.5,
    0,
    1
  );

  const normalizedY = constrain(
    (y - canvasArea.y) / canvasArea.diameter + 0.5,
    0,
    1
  );

  currentStroke.points.push({
    x: normalizedX,
    y: normalizedY
  });
}

// ==================================================
// 25. TURN SYSTEM
// ==================================================

function startTurn() {
  if (!window.shareConnected) return;

  drawingMode = true;
  localStrokes = [];
  currentStroke = null;
}

function finishTurn() {
  if (!window.shareConnected) return;

  if (currentStroke && currentStroke.points.length > 0) {
    localStrokes.push(currentStroke);
  }

  currentStroke = null;

  const data = getSharedData();

  if (localStrokes.length > 0) {
    window.shared.strokes =
      data.strokes.concat(localStrokes);

    window.shared.version =
      data.version + 1;

    window.shared.lastAction = "edited";
  } else {
    window.shared.lastAction = "passed";
  }

  window.shared.turnCount =
    data.turnCount + 1;

  drawingMode = false;
  localStrokes = [];
  currentStroke = null;
}

function passTurn() {
  if (!window.shareConnected) return;

  const data = getSharedData();

  window.shared.lastAction = "passed";
  window.shared.turnCount = data.turnCount + 1;
}

// ==================================================
// 26. PHONE SHAKE
// ==================================================

function deviceShaken() {
  if (!window.shareConnected) return;

  if (millis() - lastShake < 1200) return;

  lastShake = millis();

  triggerSharedDistortion("shake");

  console.log("SHARED SHAKE");
}

// ==================================================
// 27. SHARED DATA
// ==================================================

function getSharedData() {
  const room = window.shared || {};

  return {
    strokes: Array.isArray(room.strokes)
      ? room.strokes
      : [],

    version: Number(room.version) || 0,

    turnCount: Number(room.turnCount) || 0,

    lastAction: room.lastAction || "created",

    glitchStartedAt: Number(room.glitchStartedAt) || 0,

    glitchDuration: Number(room.glitchDuration) || 0,

    glitchStrength: Number(room.glitchStrength) || 0,

    glitchPulse: Number(room.glitchPulse) || 0,

    shakeUntil: Number(room.shakeUntil) || 0,

    glitchSource: room.glitchSource || ""
  };
}

// ==================================================
// 28. RESIZE
// ==================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  updateLayout();
  createWaitingBubbles();
}
