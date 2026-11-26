
/*
  BUBBLE POP — TWO-MODE APPLICATION
  GROUP: shared collaborative drawing.
  WORLDWIDE: working placeholder for the randomized-media mode.

  Uses the existing p5-phone Share room:
  host: p5-phone-share.npuckett.workers.dev
  room: a1-glade
  app: bubble-pop
*/

// --------------------------------------------------
// SHARE SETTINGS
// --------------------------------------------------

const SHARE_HOST = "https://p5-phone-share.npuckett.workers.dev";
const SHARE_ROOM = "a1-glade";
const SHARE_APP = "bubble-pop";

const INITIAL_SHARED_STATE = {
  group: {
    strokes: [],
    version: 0,
    turnCount: 0,
    lastAction: "created",
    versions: [],
    brushColor: "#FFFFFF",
    brushSize: 4,
    zoomLevel: 1,
    bubblePopCount: 0,
    sessionActive: true
  },
  worldwide: {
    artworks: [],
    prompts: [],
    brushColor: "#FFFFFF",
    brushSize: 4,
    zoomLevel: 1,
    bubblePopCount: 0
  }
};

// --------------------------------------------------
// VISUAL SETTINGS
// --------------------------------------------------

const BACKGROUND = "#000000";
const PAPER = "#101010";
const WHITE = "#FFFFFF";
const MUTED = "#B5B5B5";
const BORDER = "#555555";
const WAITING_BUBBLE_COUNT = 24;

const DRAWING_PALETTE = [
  { name: "Teal", color: "#62D6CE" },
  { name: "Purple", color: "#B69BFF" },
  { name: "Pink", color: "#FF9CCB" },
  { name: "Electric blue", color: "#287BFF" },
  { name: "Yellow", color: "#FFE66D" },
  { name: "White", color: "#FFFFFF" },
  { name: "Deep green", color: "#168B63" },
  { name: "Mellow orange", color: "#FFB45C" }
];

const MIN_BRUSH_SIZE = 2;
const MAX_BRUSH_SIZE = 16;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

// --------------------------------------------------
// LOCAL APPLICATION STATE
// --------------------------------------------------

let activeMode = "menu"; // menu, group, worldwide
let drawingMode = false;
let localStrokes = [];
let currentStroke = null;
let canvasArea = null;
let leftButton = null;
let rightButton = null;
let modeButton = null;
let groupMenuButton = null;
let worldwideMenuButton = null;
let worldwideBackButton = null;
let waitingBubbles = [];
let bubblePopAnimations = [];
let sharedStructureReady = false;

// Tool controls are local hit areas; their settings are shared per mode.
let paletteButtons = [];
let brushSizeButton = null;
let brushSizeTrack = null;
let zoomOutButton = null;
let zoomInButton = null;
let brushAdjustmentActive = false;
let brushPermissionPending = false;
let tiltBaseline = 0;

// --------------------------------------------------
// SETUP AND SHARE CONNECTION
// --------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(displayDensity());
  textFont("Arial");
  angleMode(DEGREES);

  // Prevent browser gestures from interrupting drawing on phones.
  lockGestures();

  shareSetup({
    host: SHARE_HOST,
    room: SHARE_ROOM,
    app: SHARE_APP,
    shared: INITIAL_SHARED_STATE,
    me: { role: "participant" },
    keep: true
  });

  // Desktop QR remains available. Joining happens when a participant
  // chooses GROUP or WORLDWIDE, not through a separate join overlay.
  showDesktopQr();

  updateLayout();
  createWaitingBubbles();
}

function shareReady() {
  ensureSharedStructure();
  console.log("Bubble Pop connected.");
}

function connectToShare() {
  if (!window.shareConnected) {
    // p5-phone requires shareConnect() to run from a user gesture.
    shareConnect();
  }
}

// --------------------------------------------------
// SHARED STATE AND LEGACY MIGRATION
// --------------------------------------------------

function ensureSharedStructure() {
  const room = window.shared;
  if (!room || typeof room !== "object") return false;

  // Preserve the original flat Group data if an older room is loaded.
  const legacyStrokes = Array.isArray(room.strokes) ? room.strokes : [];
  const legacyVersion = Number(room.version) || 0;
  const legacyTurnCount = Number(room.turnCount) || 0;
  const legacyLastAction = room.lastAction || "created";
  const legacyHasData = legacyStrokes.length > 0 ||
    legacyVersion > 0 || legacyTurnCount > 0;

  if (!room.group || typeof room.group !== "object") room.group = {};
  const group = room.group;
  const groupHasData =
    (Array.isArray(group.strokes) && group.strokes.length > 0) ||
    (Number(group.version) || 0) > 0 ||
    (Number(group.turnCount) || 0) > 0;

  if (legacyHasData && !groupHasData) {
    group.strokes = legacyStrokes;
    group.version = legacyVersion;
    group.turnCount = legacyTurnCount;
    group.lastAction = legacyLastAction;
    console.log("Existing drawing migrated into Group.");
  }

  if (!Array.isArray(group.strokes)) group.strokes = [];
  if (!Array.isArray(group.versions)) group.versions = [];
  if (typeof group.version !== "number") group.version = 0;
  if (typeof group.turnCount !== "number") group.turnCount = 0;
  if (!group.lastAction) group.lastAction = "created";
  if (!group.brushColor) group.brushColor = "#FFFFFF";
  if (typeof group.brushSize !== "number") group.brushSize = 4;
  if (typeof group.zoomLevel !== "number") group.zoomLevel = 1;
  if (typeof group.bubblePopCount !== "number") group.bubblePopCount = 0;
  if (typeof group.sessionActive !== "boolean") group.sessionActive = true;

  if (!room.worldwide || typeof room.worldwide !== "object") {
    room.worldwide = {};
  }

  const worldwide = room.worldwide;
  if (!Array.isArray(worldwide.artworks)) worldwide.artworks = [];
  if (!Array.isArray(worldwide.prompts)) worldwide.prompts = [];
  if (!worldwide.brushColor) worldwide.brushColor = "#FFFFFF";
  if (typeof worldwide.brushSize !== "number") worldwide.brushSize = 4;
  if (typeof worldwide.zoomLevel !== "number") worldwide.zoomLevel = 1;
  if (typeof worldwide.bubblePopCount !== "number") worldwide.bubblePopCount = 0;

  // Remove legacy root fields only after their values have been copied.
  delete room.strokes;
  delete room.version;
  delete room.turnCount;
  delete room.lastAction;

  sharedStructureReady = true;
  return true;
}

const fallbackToolSettings = {
  brushColor: "#FFFFFF",
  brushSize: 4,
  zoomLevel: 1
};

function getActiveToolSettings() {
  if (!window.shared) return fallbackToolSettings;
  const key = activeMode === "worldwide" ? "worldwide" : "group";
  if (!window.shared[key]) return fallbackToolSettings;
  return window.shared[key];
}

function getGroupState() {
  if (!window.shared || !window.shared.group) return null;
  return window.shared.group;
}

function getSharedData() {
  const room = window.shared || {};
  const group = room.group || room;

  return {
    strokes: Array.isArray(group.strokes) ? group.strokes : [],
    version: Number(group.version) || 0,
    turnCount: Number(group.turnCount) || 0,
    lastAction: group.lastAction || "created"
  };
}

// --------------------------------------------------
// MAIN DRAW LOOP
// --------------------------------------------------

function draw() {
  background(BACKGROUND);

  if (window.shareConnected && !sharedStructureReady) {
    ensureSharedStructure();
  }

  updateBrushSizeFromTilt();

  if (activeMode === "menu") {
    drawModeSelection();
    return;
  }

  updateLayout();

  if (activeMode === "worldwide") {
    drawWorldwidePlaceholder();
    drawSharedToolControls();
    return;
  }

  if (activeMode === "group") {
    drawHeader();
    drawCanvasCircle();
    drawSharedArtwork();
    drawLocalArtwork();

    if (!drawingMode) {
      updateWaitingBubbles();
      drawWaitingBubbles();
      drawBubblePopAnimations();
    }

    drawSharedToolControls();
    drawFooter();
  }
}

// --------------------------------------------------
// MODE SELECTION
// --------------------------------------------------

function drawModeSelection() {
  const buttonWidth = min(width - 48, 360);
  const buttonHeight = 100;
  const gap = 18;
  const x = (width - buttonWidth) / 2;
  const totalHeight = buttonHeight * 2 + gap;
  const startY = height / 2 - totalHeight / 2 + 30;

  groupMenuButton = {
    x,
    y: startY,
    w: buttonWidth,
    h: buttonHeight
  };

  worldwideMenuButton = {
    x,
    y: startY + buttonHeight + gap,
    w: buttonWidth,
    h: buttonHeight
  };

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(min(40, width * 0.1));
  text("bubble pop", width / 2, startY - 105);

  fill(MUTED);
  textSize(14);
  text("Choose your experience", width / 2, startY - 65);

  drawMenuCard(
    groupMenuButton,
    "GROUP",
    "A shared artwork developed by a group."
  );

  drawMenuCard(
    worldwideMenuButton,
    "WORLDWIDE",
    "Discover drawings and prompts left by others."
  );

  fill(MUTED);
  textSize(11);
  textAlign(CENTER, CENTER);
  text(
    window.shareConnected ? "CONNECTED" : "TAP A MODE TO JOIN",
    width / 2,
    height - 35
  );
}

function drawMenuCard(button, heading, description) {
  push();
  rectMode(CORNER);
  stroke(110, 110, 110, 180);
  strokeWeight(1);
  fill(16, 16, 16);
  rect(button.x, button.y, button.w, button.h, 14);

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(heading, button.x + button.w / 2, button.y + 35);

  fill(MUTED);
  textSize(12);
  text(description, button.x + button.w / 2, button.y + 68);
  pop();
}

function drawWorldwidePlaceholder() {
  noStroke();
  fill(PAPER);
  circle(canvasArea.x, canvasArea.y, canvasArea.diameter);

  noFill();
  stroke(BORDER);
  strokeWeight(1.2);
  circle(canvasArea.x, canvasArea.y, canvasArea.diameter);

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(27);
  text("WORLDWIDE", width / 2, canvasArea.y - 42);

  fill(MUTED);
  textSize(13);
  text(
    "Randomized drawings and prompts will appear here.",
    width / 2,
    canvasArea.y + 4,
    width - 70,
    60
  );

  worldwideBackButton = {
    x: width - 142,
    y: 22,
    w: 122,
    h: 34
  };

  drawSmallTextButton(worldwideBackButton, "BACK TO MODES");
}

function drawSmallTextButton(button, label) {
  push();
  rectMode(CORNER);
  stroke(BORDER);
  strokeWeight(1);
  fill(PAPER);
  rect(button.x, button.y, button.w, button.h, 8);

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(label, button.x + button.w / 2, button.y + button.h / 2);
  pop();
}

// --------------------------------------------------
// LAYOUT
// --------------------------------------------------

function updateLayout() {
  const settings = getActiveToolSettings();
  const areaTop = 125;
  const areaBottom = height - 245;
  const availableHeight = max(180, areaBottom - areaTop);
  const baseDiameter = max(
    180,
    min(width - 72, availableHeight * 0.88)
  );

  const zoom = constrain(
    Number(settings.zoomLevel) || 1,
    MIN_ZOOM,
    MAX_ZOOM
  );

  const diameter = baseDiameter * zoom;

  canvasArea = {
    x: width / 2,
    y: (areaTop + areaBottom) / 2,
    radius: diameter / 2,
    diameter,
    baseDiameter
  };

  const buttonY = height - 84;
  const buttonH = 50;
  const gap = 10;
  const buttonW = (width - 36 - gap) / 2;

  leftButton = {
    x: 18,
    y: buttonY,
    w: buttonW,
    h: buttonH
  };

  rightButton = {
    x: 18 + buttonW + gap,
    y: buttonY,
    w: buttonW,
    h: buttonH
  };

  modeButton = {
    x: width - 86,
    y: 58,
    w: 66,
    h: 25
  };

  // Palette is centred above the brush controls.
  paletteButtons = [];

  const swatchSize = min(27, (width - 66) / 10);
  const swatchGap = max(
    3,
    min(8, (width - 66 - swatchSize * 8) / 7)
  );

  const paletteWidth = swatchSize * 8 + swatchGap * 7;
  const paletteStartX = (width - paletteWidth) / 2;
  const paletteY = height - 215;

  for (let i = 0; i < DRAWING_PALETTE.length; i++) {
    paletteButtons.push({
      x: paletteStartX + i * (swatchSize + swatchGap),
      y: paletteY,
      w: swatchSize,
      h: swatchSize
    });
  }

  brushSizeButton = {
    x: 18,
    y: height - 174,
    w: min(width - 150, 210),
    h: 32
  };

  brushSizeTrack = {
    x: 18,
    y: height - 129,
    w: min(width - 150, 210),
    h: 7
  };

  zoomOutButton = {
    x: width - 105,
    y: height - 174,
    w: 36,
    h: 32
  };

  zoomInButton = {
    x: width - 60,
    y: height - 174,
    w: 36,
    h: 32
  };
}

// --------------------------------------------------
// GROUP HEADER AND CANVAS
// --------------------------------------------------

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
  fill(window.shareConnected ? WHITE : MUTED);
  text(
    window.shareConnected ? "CONNECTED" : "CONNECTING...",
    width - 20,
    25
  );

  if (!drawingMode) {
    noFill();
    stroke(BORDER);
    strokeWeight(1);
    rect(modeButton.x, modeButton.y, modeButton.w, modeButton.h, 6);

    noStroke();
    fill(MUTED);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(
      "MODES",
      modeButton.x + modeButton.w / 2,
      modeButton.y + modeButton.h / 2
    );
  }

  textAlign(LEFT, TOP);
  fill(MUTED);
  textSize(13);
  text(
    "Version " + data.version + "   ·   " + data.turnCount + " turns",
    21,
    88
  );
}

function drawCanvasCircle() {
  push();
  noStroke();
  fill(PAPER);
  circle(canvasArea.x, canvasArea.y, canvasArea.diameter);

  noFill();
  stroke(BORDER);
  strokeWeight(1.2);
  circle(canvasArea.x, canvasArea.y, canvasArea.diameter);
  pop();

  const data = getSharedData();

  if (data.strokes.length === 0 && localStrokes.length === 0) {
    noStroke();
    fill(MUTED);
    textAlign(CENTER, CENTER);
    textSize(15);
    text("A drawing will begin here.", canvasArea.x, canvasArea.y);
  }
}

function drawSharedArtwork() {
  const data = getSharedData();
  for (const strokeData of data.strokes) {
    drawStroke(strokeData);
  }
}

function drawLocalArtwork() {
  for (const strokeData of localStrokes) {
    drawStroke(strokeData);
  }

  if (currentStroke) {
    drawStroke(currentStroke);
  }
}

function drawStroke(strokeData) {
  if (
    !strokeData ||
    !Array.isArray(strokeData.points) ||
    strokeData.points.length === 0
  ) {
    return;
  }

  const points = strokeData.points;
  const zoom = getActiveToolSettings().zoomLevel || 1;

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

  stroke(strokeData.color || WHITE);
  strokeWeight(strokeData.weight || 4);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  if (points.length === 1) {
    const px =
      canvasArea.x +
      (points[0].x - 0.5) * canvasArea.baseDiameter * zoom;

    const py =
      canvasArea.y +
      (points[0].y - 0.5) * canvasArea.baseDiameter * zoom;

    noStroke();
    fill(strokeData.color || WHITE);
    circle(px, py, strokeData.weight || 4);
  } else {
    beginShape();

    for (const point of points) {
      const px =
        canvasArea.x +
        (point.x - 0.5) * canvasArea.baseDiameter * zoom;

      const py =
        canvasArea.y +
        (point.y - 0.5) * canvasArea.baseDiameter * zoom;

      vertex(px, py);
    }

    endShape();
  }

  drawingContext.restore();
  pop();
}

// --------------------------------------------------
// SHARED DRAWING TOOLS — USED IN BOTH MODES
// --------------------------------------------------

function drawSharedToolControls() {
  const settings = getActiveToolSettings();

  for (let i = 0; i < paletteButtons.length; i++) {
    const button = paletteButtons[i];
    const selected = settings.brushColor === DRAWING_PALETTE[i].color;

    push();

    if (selected) {
      noFill();
      stroke(WHITE);
      strokeWeight(2);
      circle(
        button.x + button.w / 2,
        button.y + button.h / 2,
        button.w + 7
      );
    }

    stroke(220, 220, 220, 100);
    strokeWeight(1);
    fill(DRAWING_PALETTE[i].color);
    circle(
      button.x + button.w / 2,
      button.y + button.h / 2,
      button.w
    );

    pop();
  }

  push();
  rectMode(CORNER);
  stroke(brushAdjustmentActive ? "#FFE66D" : BORDER);
  strokeWeight(brushAdjustmentActive ? 2 : 1);
  fill(brushAdjustmentActive ? "#29251A" : PAPER);

  rect(
    brushSizeButton.x,
    brushSizeButton.y,
    brushSizeButton.w,
    brushSizeButton.h,
    8
  );

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(10);

  text(
    brushAdjustmentActive
      ? "TILT LEFT / RIGHT TO CHANGE SIZE"
      : "BRUSH SIZE · TAP, THEN TILT",
    brushSizeButton.x + brushSizeButton.w / 2,
    brushSizeButton.y + brushSizeButton.h / 2
  );

  pop();

  const ratio = constrain(
    (settings.brushSize - MIN_BRUSH_SIZE) /
      (MAX_BRUSH_SIZE - MIN_BRUSH_SIZE),
    0,
    1
  );

  noStroke();
  fill("#444444");
  rect(
    brushSizeTrack.x,
    brushSizeTrack.y,
    brushSizeTrack.w,
    brushSizeTrack.h,
    4
  );

  fill(brushAdjustmentActive ? "#FFE66D" : WHITE);
  rect(
    brushSizeTrack.x,
    brushSizeTrack.y,
    brushSizeTrack.w * ratio,
    brushSizeTrack.h,
    4
  );

  circle(
    brushSizeTrack.x + brushSizeTrack.w * ratio,
    brushSizeTrack.y + brushSizeTrack.h / 2,
    12
  );

  fill(MUTED);
  textAlign(LEFT, CENTER);
  textSize(10);
  text(
    "SIZE " + Math.round(settings.brushSize),
    brushSizeTrack.x,
    brushSizeTrack.y + 17
  );

  drawSmallControlButton(zoomOutButton, "−");
  drawSmallControlButton(zoomInButton, "+");

  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(10);
  text(
    Math.round((settings.zoomLevel || 1) * 100) + "%",
    width - 63,
    height - 128
  );
}

function drawSmallControlButton(button, label) {
  push();
  rectMode(CORNER);
  stroke(BORDER);
  strokeWeight(1);
  fill(PAPER);
  rect(button.x, button.y, button.w, button.h, 7);

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2 - 1
  );
  pop();
}

function handleToolControlPress(x, y) {
  const settings = getActiveToolSettings();

  for (let i = 0; i < paletteButtons.length; i++) {
    if (insideButton(x, y, paletteButtons[i])) {
      settings.brushColor = DRAWING_PALETTE[i].color;
      return true;
    }
  }

  if (insideButton(x, y, brushSizeButton)) {
    if (brushAdjustmentActive) {
      brushAdjustmentActive = false;
      brushPermissionPending = false;
    } else if (window.sensorsEnabled) {
      brushAdjustmentActive = true;
      tiltBaseline = rotationY;
    } else {
      brushPermissionPending = true;
      enableGyroTap("Tap to enable tilt controls");
    }

    return true;
  }

  const sliderHitArea = {
    x: brushSizeTrack.x,
    y: brushSizeTrack.y - 10,
    w: brushSizeTrack.w,
    h: 28
  };

  if (insideButton(x, y, sliderHitArea)) {
    const ratio = constrain(
      (x - brushSizeTrack.x) / brushSizeTrack.w,
      0,
      1
    );

    settings.brushSize = Math.round(
      map(ratio, 0, 1, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE)
    );

    return true;
  }

  if (insideButton(x, y, zoomOutButton)) {
    settings.zoomLevel = max(
      MIN_ZOOM,
      (settings.zoomLevel || 1) - ZOOM_STEP
    );

    return true;
  }

  if (insideButton(x, y, zoomInButton)) {
    settings.zoomLevel = min(
      MAX_ZOOM,
      (settings.zoomLevel || 1) + ZOOM_STEP
    );

    return true;
  }

  return false;
}

function updateBrushSizeFromTilt() {
  if (
    !brushAdjustmentActive ||
    !window.sensorsEnabled ||
    !window.shareConnected
  ) {
    return;
  }

  let difference = rotationY - tiltBaseline;

  if (difference > 180) difference -= 360;
  if (difference < -180) difference += 360;

  difference = constrain(difference, -30, 30);

  const newSize = Math.round(
    map(difference, -30, 30, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE)
  );

  const settings = getActiveToolSettings();

  if (settings.brushSize !== newSize) {
    settings.brushSize = newSize;
  }
}

function userSetupComplete() {
  if (brushPermissionPending) {
    brushPermissionPending = false;
    brushAdjustmentActive = true;
    tiltBaseline = rotationY;
  }
}

// --------------------------------------------------
// WAITING BUBBLES
// --------------------------------------------------

function createWaitingBubbles() {
  waitingBubbles = [];

  for (let i = 0; i < WAITING_BUBBLE_COUNT; i++) {
    waitingBubbles.push(makeWaitingBubble());
  }
}

function makeWaitingBubble() {
  const size = random(25, 55);
  let x = width / 2;
  let y = height / 2;
  let found = false;

  for (let attempt = 0; attempt < 100; attempt++) {
    x = random(18 + size / 2, width - 18 - size / 2);
    y = random(110 + size / 2, height - 115 - size / 2);

    if (
      !canvasArea ||
      dist(x, y, canvasArea.x, canvasArea.y) >
        canvasArea.radius + size * 0.55
    ) {
      found = true;
      break;
    }
  }

  if (!found) {
    x = random(width);
    y = random(height);
  }

  return {
    x,
    y,
    size,
    speed: random(0.35, 1.15),
    phase: random(360),
    drift: random(0.2, 0.65),
    rotation: random(360),
    rotationSpeed: random(-0.35, 0.35),
    alpha: random(100, 190),
    popping: false
  };
}

function updateWaitingBubbles() {
  for (let i = 0; i < waitingBubbles.length; i++) {
    const b = waitingBubbles[i];
    if (b.popping) continue;

    b.y -= b.speed;
    b.x += sin(frameCount * 0.7 + b.phase) * b.drift;
    b.rotation += b.rotationSpeed;

    b.x = constrain(
      b.x,
      b.size / 2,
      width - b.size / 2
    );

    if (
      canvasArea &&
      dist(b.x, b.y, canvasArea.x, canvasArea.y) <
        canvasArea.radius + b.size * 0.55
    ) {
      b.y -= b.speed + 0.5;
    }

    if (b.y < -b.size) {
      waitingBubbles[i] = makeWaitingBubble();
      waitingBubbles[i].y = height + random(20, 100);
    }
  }
}

function drawWaitingBubbles() {
  for (const b of waitingBubbles) {
    if (!b.popping) drawWaitingBubble(b);
  }
}

function drawWaitingBubble(b) {
  push();
  translate(b.x, b.y);
  rotate(b.rotation);

  noStroke();
  fill(255, 255, 255, 8);
  circle(0, 0, b.size);

  noFill();
  strokeWeight(2.2);

  stroke(0, 220, 255, b.alpha);
  arc(0, 0, b.size, b.size, 190, 270);

  stroke(170, 80, 255, b.alpha);
  arc(0, 0, b.size, b.size, 270, 340);

  stroke(255, 80, 180, b.alpha);
  arc(0, 0, b.size, b.size, 340, 55);

  stroke(70, 130, 255, b.alpha);
  arc(0, 0, b.size, b.size, 55, 120);

  stroke(100, 255, 190, b.alpha);
  arc(0, 0, b.size, b.size, 120, 190);

  noStroke();
  fill(255, 255, 255, 155);
  ellipse(
    -b.size * 0.22,
    -b.size * 0.25,
    b.size * 0.22,
    b.size * 0.10
  );

  fill(255, 255, 255, 100);
  circle(
    b.size * 0.24,
    b.size * 0.22,
    b.size * 0.07
  );

  pop();
}

function popWaitingBubble(b) {
  if (b.popping) return;

  b.popping = true;

  bubblePopAnimations.push({
    x: b.x,
    y: b.y,
    size: b.size,
    startTime: millis()
  });

  // Simple shared increment. Concurrent taps may occasionally
  // overwrite one another because Share uses last-write-wins.
  const group = getGroupState();

  if (group) {
    group.bubblePopCount =
      (Number(group.bubblePopCount) || 0) + 1;
  }
}

function drawBubblePopAnimations() {
  for (
    let i = bubblePopAnimations.length - 1;
    i >= 0;
    i--
  ) {
    const animation = bubblePopAnimations[i];

    const progress = constrain(
      (millis() - animation.startTime) / 400,
      0,
      1
    );

    const size = animation.size * (1 + progress * 0.8);
    const alpha = 180 * (1 - progress);

    noFill();
    stroke(255, 255, 255, alpha);
    strokeWeight(2);
    circle(animation.x, animation.y, size);

    for (let j = 0; j < 5; j++) {
      const angle = j * 72;
      const distance = progress * animation.size * 0.55;

      noStroke();
      fill(255, 255, 255, alpha);

      circle(
        animation.x + cos(angle) * distance,
        animation.y + sin(angle) * distance,
        3 * (1 - progress)
      );
    }

    if (progress >= 1) {
      bubblePopAnimations.splice(i, 1);

      const index = waitingBubbles.findIndex(
        b =>
          b.popping &&
          dist(b.x, b.y, animation.x, animation.y) < 1
      );

      if (index !== -1) {
        waitingBubbles[index] = makeWaitingBubble();
        waitingBubbles[index].y = height + random(30, 100);
      }
    }
  }
}

// --------------------------------------------------
// GROUP FOOTER AND TURN CONTROLS
// --------------------------------------------------

function drawFooter() {
  drawButton(
    leftButton,
    drawingMode ? "DRAWING" : "MY TURN"
  );

  drawButton(
    rightButton,
    drawingMode ? "FINISH" : "PASS"
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, TOP);
  textSize(11);

  text(
    drawingMode
      ? "Add to the drawing, then finish your turn."
      : "Tap the floating bubbles while you wait.",
    width / 2,
    height - 22
  );
}

function drawButton(button, label) {
  noStroke();
  fill(window.shareConnected ? WHITE : "#555555");
  rect(button.x, button.y, button.w, button.h, 8);

  fill(window.shareConnected ? "#000000" : WHITE);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );
}

// --------------------------------------------------
// INPUT
// --------------------------------------------------

function mousePressed() {
  if (activeMode === "menu") {
    if (
      groupMenuButton &&
      insideButton(mouseX, mouseY, groupMenuButton)
    ) {
      connectToShare();
      activeMode = "group";
      drawingMode = false;
      localStrokes = [];
      currentStroke = null;
      updateLayout();
      createWaitingBubbles();
      return;
    }

    if (
      worldwideMenuButton &&
      insideButton(mouseX, mouseY, worldwideMenuButton)
    ) {
      connectToShare();
      activeMode = "worldwide";
      return;
    }

    return;
  }

  if (activeMode === "worldwide") {
    if (handleToolControlPress(mouseX, mouseY)) return;

    if (
      worldwideBackButton &&
      insideButton(mouseX, mouseY, worldwideBackButton)
    ) {
      activeMode = "menu";
      brushAdjustmentActive = false;
    }

    return;
  }

  if (activeMode !== "group") return;

  if (handleToolControlPress(mouseX, mouseY)) return;

  if (
    !drawingMode &&
    modeButton &&
    insideButton(mouseX, mouseY, modeButton)
  ) {
    activeMode = "menu";
    brushAdjustmentActive = false;
    return;
  }

  if (!window.shareConnected) return;

  if (!drawingMode) {
    for (let i = waitingBubbles.length - 1; i >= 0; i--) {
      const b = waitingBubbles[i];

      if (b.popping) continue;

      if (
        dist(mouseX, mouseY, b.x, b.y) <
        b.size / 2 + 12
      ) {
        popWaitingBubble(b);
        return;
      }
    }
  }

  if (insideButton(mouseX, mouseY, leftButton)) {
    if (!drawingMode) startTurn();
    return;
  }

  if (insideButton(mouseX, mouseY, rightButton)) {
    if (drawingMode) finishTurn();
    else passTurn();
    return;
  }

  if (
    drawingMode &&
    insideDrawingCircle(mouseX, mouseY)
  ) {
    const settings = getActiveToolSettings();

    currentStroke = {
      color: settings.brushColor || WHITE,
      weight: settings.brushSize || 4,
      points: []
    };

    addDrawingPoint(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (
    activeMode !== "group" ||
    !drawingMode ||
    !currentStroke
  ) {
    return;
  }

  if (insideDrawingCircle(mouseX, mouseY)) {
    addDrawingPoint(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (currentStroke) {
    if (currentStroke.points.length > 0) {
      localStrokes.push(currentStroke);
    }

    currentStroke = null;
  }
}

// --------------------------------------------------
// DRAWING AND HIT-TEST HELPERS
// --------------------------------------------------

function insideDrawingCircle(x, y) {
  return (
    canvasArea &&
    dist(x, y, canvasArea.x, canvasArea.y) <= canvasArea.radius
  );
}

function insideButton(x, y, button) {
  return (
    !!button &&
    x >= button.x &&
    x <= button.x + button.w &&
    y >= button.y &&
    y <= button.y + button.h
  );
}

function addDrawingPoint(x, y) {
  if (!currentStroke || !canvasArea) return;

  const zoom = getActiveToolSettings().zoomLevel || 1;
  const baseDiameter = canvasArea.baseDiameter;

  const normalizedX = constrain(
    (x - canvasArea.x) / (baseDiameter * zoom) + 0.5,
    0,
    1
  );

  const normalizedY = constrain(
    (y - canvasArea.y) / (baseDiameter * zoom) + 0.5,
    0,
    1
  );

  currentStroke.points.push({
    x: normalizedX,
    y: normalizedY
  });
}

// --------------------------------------------------
// TURN SYSTEM
// --------------------------------------------------

function startTurn() {
  if (!window.shareConnected) return;

  drawingMode = true;
  localStrokes = [];
  currentStroke = null;
}

function finishTurn() {
  if (!window.shareConnected) return;

  const group = getGroupState();
  if (!group) return;

  if (currentStroke && currentStroke.points.length > 0) {
    localStrokes.push(currentStroke);
  }

  currentStroke = null;

  const data = getSharedData();

  if (localStrokes.length > 0) {
    group.strokes = data.strokes.concat(localStrokes);
    group.version = data.version + 1;
    group.lastAction = "edited";
  } else {
    group.lastAction = "passed";
  }

  group.turnCount = data.turnCount + 1;

  drawingMode = false;
  localStrokes = [];
  currentStroke = null;
}

function passTurn() {
  if (!window.shareConnected) return;

  const group = getGroupState();
  if (!group) return;

  const data = getSharedData();

  group.lastAction = "passed";
  group.turnCount = data.turnCount + 1;
}

// --------------------------------------------------
// RESIZE
// --------------------------------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();

  if (activeMode === "group") {
    createWaitingBubbles();
  }
}
