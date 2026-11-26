/*
  BUBBLE POP — TWO-MODE APPLICATION
  BUILD VERSION: 0.7 — TEMPORARY ARTWORK CREATOR

  GROUP:
  - Shared collaborative drawing and turn-taking.
  - Completed drawings are saved as numbered snapshots.
  - Snapshots appear as floating version bubbles.
  - Each version bubble contains a miniature of its drawing.
  - Tap to expand a local preview; shake to pop it.

  DRAWING:
  - Shared colour palette and brush-size settings.
  - Tilt controls brush size.
  - Zoom can only be changed during your turn.
  - Eraser removes only your own unsaved strokes.

  WORLDWIDE:
  - Placeholder for future randomized-media mode.

  TEMPORARY CREATOR:
  - Draw initial Worldwide artworks.
  - Save each artwork to shared.worldwide.artworks.
  - Download a JSON backup of each artwork.
  - Remove the TEMPORARY CREATOR sections after
    the starting artwork collection is complete.
*/

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
    zoomLevel: 2.5,
    zoomSetupVersion: 1,
    bubblePopCount: 0,
    sessionActive: true
  },
  worldwide: {
    artworks: [],
    prompts: [],
    brushColor: "#FFFFFF",
    brushSize: 4,
    zoomLevel: 2.5,
    zoomSetupVersion: 1,
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

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const ZOOM_SETUP_VERSION = 1;

const VERSION_BUBBLE_MIN_SIZE = 58;
const VERSION_BUBBLE_MAX_SIZE = 76;
const VERSION_BUBBLE_SPEED_MIN = 0.35;
const VERSION_BUBBLE_SPEED_MAX = 0.75;

const VERSION_PREVIEW_EXPAND_TIME = 450;
const VERSION_PREVIEW_POP_TIME = 550;
const VERSION_PREVIEW_SHAKE_COOLDOWN = 850;
const VERSION_SHAKE_THRESHOLD = 40;

// --------------------------------------------------
// LOCAL APPLICATION STATE
// --------------------------------------------------

let activeMode = "menu";
let drawingMode = false;
let eraserMode = false;

let localStrokes = [];
let currentStroke = null;
let canvasArea = null;

let leftButton = null;
let rightButton = null;
let modeButton = null;
let groupMenuButton = null;
let worldwideMenuButton = null;
let creatorMenuButton = null;
let worldwideBackButton = null;

let waitingBubbles = [];
let bubblePopAnimations = [];

let sharedStructureReady = false;

let versionBubbles = [];
let seenVersionIds = new Set();
let activeVersionPreview = null;
let lastVersionShake = 0;

let paletteButtons = [];
let brushSizeButton = null;
let brushSizeTrack = null;
let eraserButton = null;
let zoomOutButton = null;
let zoomInButton = null;

let brushAdjustmentActive = false;
let brushPermissionPending = false;
let tiltBaseline = 0;

// ==================================================
// TEMPORARY CREATOR — START
// Used only to make the initial Worldwide artworks.
// Remove this entire section after the collection
// has been created and exported.
// ==================================================

let creatorStrokes = [];
let creatorCurrentStroke = null;
let creatorEraserMode = false;

let creatorBackButton = null;
let creatorSaveButton = null;
let creatorClearButton = null;

let creatorStatus = "Draw an artwork, then save and export it.";
let creatorStatusTime = 0;

let creatorToolSettings = {
  brushColor: "#FFFFFF",
  brushSize: 4,
  zoomLevel: MAX_ZOOM
};

// ==================================================
// TEMPORARY CREATOR — END
// ==================================================


// --------------------------------------------------
// SETUP AND SHARE CONNECTION
// --------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(displayDensity());

  textFont("Arial");
  angleMode(DEGREES);

  lockGestures();

  enableGyroTap("Tap to enable motion sensors");
  setShakeThreshold(VERSION_SHAKE_THRESHOLD);

  shareSetup({
    host: SHARE_HOST,
    room: SHARE_ROOM,
    app: SHARE_APP,
    shared: INITIAL_SHARED_STATE,
    me: { role: "participant" },
    keep: true
  });

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
    shareConnect();
  }
}

// --------------------------------------------------
// SHARED STATE AND LEGACY MIGRATION
// --------------------------------------------------

function ensureSharedStructure() {
  const room = window.shared;
  if (!room || typeof room !== "object") return false;

  const legacyStrokes = Array.isArray(room.strokes)
    ? room.strokes
    : [];

  const legacyVersion = Number(room.version) || 0;
  const legacyTurnCount = Number(room.turnCount) || 0;
  const legacyLastAction = room.lastAction || "created";

  const legacyHasData =
    legacyStrokes.length > 0 ||
    legacyVersion > 0 ||
    legacyTurnCount > 0;

  if (!room.group || typeof room.group !== "object") {
    room.group = {};
  }

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
  if (typeof group.bubblePopCount !== "number") group.bubblePopCount = 0;
  if (typeof group.sessionActive !== "boolean") group.sessionActive = true;

  if (group.zoomSetupVersion !== ZOOM_SETUP_VERSION) {
    group.zoomLevel = MAX_ZOOM;
    group.zoomSetupVersion = ZOOM_SETUP_VERSION;
  }

  if (typeof group.zoomLevel !== "number") {
    group.zoomLevel = MAX_ZOOM;
  }

  group.zoomLevel = constrain(group.zoomLevel, MIN_ZOOM, MAX_ZOOM);

  if (!room.worldwide || typeof room.worldwide !== "object") {
    room.worldwide = {};
  }

  const worldwide = room.worldwide;

  if (!Array.isArray(worldwide.artworks)) worldwide.artworks = [];
  if (!Array.isArray(worldwide.prompts)) worldwide.prompts = [];
  if (!worldwide.brushColor) worldwide.brushColor = "#FFFFFF";

  if (typeof worldwide.brushSize !== "number") worldwide.brushSize = 4;
  if (typeof worldwide.bubblePopCount !== "number") {
    worldwide.bubblePopCount = 0;
  }

  if (worldwide.zoomSetupVersion !== ZOOM_SETUP_VERSION) {
    worldwide.zoomLevel = MAX_ZOOM;
    worldwide.zoomSetupVersion = ZOOM_SETUP_VERSION;
  }

  if (typeof worldwide.zoomLevel !== "number") {
    worldwide.zoomLevel = MAX_ZOOM;
  }

  worldwide.zoomLevel = constrain(
    worldwide.zoomLevel,
    MIN_ZOOM,
    MAX_ZOOM
  );

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
  zoomLevel: MAX_ZOOM
};

function getActiveToolSettings() {
  // TEMPORARY CREATOR integration.
  if (activeMode === "creator") {
    return creatorToolSettings;
  }

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
    lastAction: group.lastAction || "created",
    versions: Array.isArray(group.versions) ? group.versions : []
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

  // TEMPORARY CREATOR mode.
  if (activeMode === "creator") {
    drawCreator();
    return;
  }

  if (activeMode === "group") {
    syncVersionBubbles();

    drawHeader();
    drawCanvasCircle();
    drawSharedArtwork();
    drawLocalArtwork();

    if (drawingMode && eraserMode) {
      drawEraserCursor();
    }

    if (!drawingMode && !activeVersionPreview) {
      updateWaitingBubbles();
      drawWaitingBubbles();
      drawBubblePopAnimations();

      updateVersionBubbles();
      drawVersionBubbles();
    }

    drawSharedToolControls();
    drawFooter();

    drawVersionPreview();
  }
}

// --------------------------------------------------
// MODE SELECTION
// --------------------------------------------------

function drawModeSelection() {
  const buttonWidth = min(width - 48, 360);
  const buttonHeight = 76;
  const gap = 13;

  const x = (width - buttonWidth) / 2;
  const totalHeight = buttonHeight * 3 + gap * 2;
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

  // TEMPORARY CREATOR menu button.
  creatorMenuButton = {
    x,
    y: startY + (buttonHeight + gap) * 2,
    w: buttonWidth,
    h: buttonHeight
  };

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(min(40, width * 0.1));
  text("bubble pop", width / 2, startY - 85);

  fill(MUTED);
  textSize(14);
  text("Choose your experience", width / 2, startY - 50);

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

  // TEMPORARY CREATOR menu card.
  drawMenuCard(
    creatorMenuButton,
    "CREATE STARTING ARTWORK",
    "Temporary tool for making the first collection."
  );

  fill(MUTED);
  textSize(11);
  textAlign(CENTER, CENTER);

  text(
    window.shareConnected ? "CONNECTED" : "TAP A MODE TO JOIN",
    width / 2,
    height - 20
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
  textSize(16);
  text(heading, button.x + button.w / 2, button.y + 25);

  fill(MUTED);
  textSize(11);
  text(
    description,
    button.x + button.w / 2,
    button.y + 51
  );

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
  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );

  pop();
}

// --------------------------------------------------
// LAYOUT
// --------------------------------------------------

function updateLayout() {
  const areaTop = 125;
  const areaBottom = height - 245;
  const availableHeight = max(180, areaBottom - areaTop);

  const baseDiameter = max(
    180,
    min(width - 72, availableHeight * 0.88)
  );

  canvasArea = {
    x: width / 2,
    y: (areaTop + areaBottom) / 2,
    radius: baseDiameter / 2,
    diameter: baseDiameter,
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
    w: min(width - 190, 210),
    h: 32
  };

  brushSizeTrack = {
    x: 18,
    y: height - 129,
    w: min(width - 190, 210),
    h: 7
  };

  eraserButton = {
    x: width - 153,
    y: height - 174,
    w: 42,
    h: 32
  };

  zoomOutButton = {
    x: width - 103,
    y: height - 174,
    w: 36,
    h: 32
  };

  zoomInButton = {
    x: width - 58,
    y: height - 174,
    w: 36,
    h: 32
  };

  // TEMPORARY CREATOR buttons.
  creatorBackButton = {
    x: width - 142,
    y: 22,
    w: 122,
    h: 34
  };

  creatorSaveButton = {
    x: 18,
    y: height - 84,
    w: (width - 46) * 0.65,
    h: 50
  };

  creatorClearButton = {
    x: creatorSaveButton.x + creatorSaveButton.w + 10,
    y: height - 84,
    w: width - (creatorSaveButton.x + creatorSaveButton.w + 28),
    h: 50
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
    text(
      "A drawing will begin here.",
      canvasArea.x,
      canvasArea.y
    );
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

function drawStroke(strokeData, zoomOverride, targetArea) {
  if (
    !strokeData ||
    !Array.isArray(strokeData.points) ||
    strokeData.points.length === 0
  ) {
    return;
  }

  const points = strokeData.points;
  const area = targetArea || canvasArea;

  const zoom = constrain(
    Number(
      zoomOverride !== undefined
        ? zoomOverride
        : getActiveToolSettings().zoomLevel
    ) || MAX_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM
  );

  push();
  drawingContext.save();

  drawingContext.beginPath();
  drawingContext.arc(
    area.x,
    area.y,
    area.radius,
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
      area.x +
      (points[0].x - 0.5) * area.baseDiameter * zoom;

    const py =
      area.y +
      (points[0].y - 0.5) * area.baseDiameter * zoom;

    noStroke();
    fill(strokeData.color || WHITE);
    circle(px, py, strokeData.weight || 4);
  } else {
    beginShape();

    for (const point of points) {
      const px =
        area.x +
        (point.x - 0.5) * area.baseDiameter * zoom;

      const py =
        area.y +
        (point.y - 0.5) * area.baseDiameter * zoom;

      vertex(px, py);
    }

    endShape();
  }

  drawingContext.restore();
  pop();
}

// --------------------------------------------------
// SHARED DRAWING TOOLS
// --------------------------------------------------

function drawSharedToolControls() {
  const settings = getActiveToolSettings();

  for (let i = 0; i < paletteButtons.length; i++) {
    const button = paletteButtons[i];

    const selected =
      settings.brushColor === DRAWING_PALETTE[i].color;

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

  // Group eraser is available only during a Group turn.
  // Creator eraser is temporary and only affects its own drawing.
  if (
    (activeMode === "group" && drawingMode) ||
    activeMode === "creator"
  ) {
    drawEraserButton();
  }

  const zoomAllowed =
    activeMode !== "group" || drawingMode;

  drawZoomButton(zoomOutButton, "−", zoomAllowed);
  drawZoomButton(zoomInButton, "+", zoomAllowed);

  fill(zoomAllowed ? MUTED : "#666666");
  textAlign(CENTER, CENTER);
  textSize(10);

  text(
    zoomAllowed
      ? Math.round((settings.zoomLevel || MAX_ZOOM) * 100) + "%"
      : "TURN ONLY",
    width - 63,
    height - 128
  );
}

function drawEraserButton() {
  const isOn =
    activeMode === "creator"
      ? creatorEraserMode
      : eraserMode;

  push();

  rectMode(CORNER);
  stroke(isOn ? "#FFE66D" : BORDER);
  strokeWeight(isOn ? 2 : 1);
  fill(isOn ? "#29251A" : PAPER);

  rect(
    eraserButton.x,
    eraserButton.y,
    eraserButton.w,
    eraserButton.h,
    7
  );

  noStroke();
  fill(isOn ? "#FFE66D" : WHITE);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(
    isOn ? "ON" : "ER",
    eraserButton.x + eraserButton.w / 2,
    eraserButton.y + eraserButton.h / 2
  );

  pop();
}

function drawZoomButton(button, label, enabled) {
  push();

  rectMode(CORNER);
  stroke(enabled ? BORDER : "#333333");
  strokeWeight(1);
  fill(enabled ? PAPER : "#080808");
  rect(button.x, button.y, button.w, button.h, 7);

  noStroke();
  fill(enabled ? WHITE : "#555555");
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

  if (
    activeMode === "group" &&
    drawingMode &&
    insideButton(x, y, eraserButton)
  ) {
    if (currentStroke && currentStroke.points.length > 0) {
      localStrokes.push(currentStroke);
    }

    currentStroke = null;
    eraserMode = !eraserMode;
    brushAdjustmentActive = false;

    return true;
  }

  // TEMPORARY CREATOR eraser toggle.
  if (
    activeMode === "creator" &&
    insideButton(x, y, eraserButton)
  ) {
    if (
      creatorCurrentStroke &&
      creatorCurrentStroke.points.length > 0
    ) {
      creatorStrokes.push(creatorCurrentStroke);
    }

    creatorCurrentStroke = null;
    creatorEraserMode = !creatorEraserMode;
    brushAdjustmentActive = false;

    return true;
  }

  const zoomAllowed =
    activeMode !== "group" || drawingMode;

  if (insideButton(x, y, zoomOutButton)) {
    if (zoomAllowed) {
      settings.zoomLevel = max(
        MIN_ZOOM,
        (Number(settings.zoomLevel) || MAX_ZOOM) - ZOOM_STEP
      );
    }

    return true;
  }

  if (insideButton(x, y, zoomInButton)) {
    if (zoomAllowed) {
      settings.zoomLevel = min(
        MAX_ZOOM,
        (Number(settings.zoomLevel) || MAX_ZOOM) + ZOOM_STEP
      );
    }

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
    map(
      difference,
      -30,
      30,
      MIN_BRUSH_SIZE,
      MAX_BRUSH_SIZE
    )
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
// LOCAL ERASER
// --------------------------------------------------

function getEraserRadius() {
  const settings = getActiveToolSettings();
  return max(12, (Number(settings.brushSize) || 4) * 2.5);
}

function getStrokeScreenPoint(point) {
  const zoom = constrain(
    Number(getActiveToolSettings().zoomLevel) || MAX_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM
  );

  return {
    x: canvasArea.x +
      (point.x - 0.5) * canvasArea.baseDiameter * zoom,
    y: canvasArea.y +
      (point.y - 0.5) * canvasArea.baseDiameter * zoom
  };
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return dist(px, py, ax, ay);
  }

  const t = constrain(
    ((px - ax) * dx + (py - ay) * dy) /
    (dx * dx + dy * dy),
    0,
    1
  );

  const closestX = ax + t * dx;
  const closestY = ay + t * dy;

  return dist(px, py, closestX, closestY);
}

function strokeTouchesEraser(strokeData, x, y) {
  if (
    !strokeData ||
    !Array.isArray(strokeData.points) ||
    strokeData.points.length === 0
  ) {
    return false;
  }

  const radius =
    getEraserRadius() + (Number(strokeData.weight) || 4) / 2;

  const points = strokeData.points;

  if (points.length === 1) {
    const point = getStrokeScreenPoint(points[0]);
    return dist(x, y, point.x, point.y) <= radius;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a = getStrokeScreenPoint(points[i]);
    const b = getStrokeScreenPoint(points[i + 1]);

    if (
      distanceToSegment(
        x, y,
        a.x, a.y,
        b.x, b.y
      ) <= radius
    ) {
      return true;
    }
  }

  return false;
}

function eraseLocalStrokesAt(x, y) {
  if (!drawingMode || !eraserMode) return;

  for (let i = localStrokes.length - 1; i >= 0; i--) {
    if (strokeTouchesEraser(localStrokes[i], x, y)) {
      localStrokes.splice(i, 1);
    }
  }

  if (
    currentStroke &&
    strokeTouchesEraser(currentStroke, x, y)
  ) {
    currentStroke = null;
  }
}

function drawEraserCursor() {
  if (!insideDrawingCircle(mouseX, mouseY)) return;

  noFill();
  stroke(255, 230, 109, 210);
  strokeWeight(1.5);
  circle(
    mouseX,
    mouseY,
    getEraserRadius() * 2
  );
}

// ==================================================
// TEMPORARY CREATOR — START
// Drawing interface, local erasing, saving and export.
// Remove this section after the initial collection
// has been created and exported.
// ==================================================

function drawCreator() {
  drawCreatorHeader();

  noStroke();
  fill(PAPER);
  circle(canvasArea.x, canvasArea.y, canvasArea.diameter);

  noFill();
  stroke(BORDER);
  strokeWeight(1.2);
  circle(canvasArea.x, canvasArea.y, canvasArea.diameter);

  for (const strokeData of creatorStrokes) {
    drawStroke(strokeData);
  }

  if (creatorCurrentStroke) {
    drawStroke(creatorCurrentStroke);
  }

  if (creatorEraserMode) {
    drawEraserCursor();
  }

  if (
    creatorStrokes.length === 0 &&
    !creatorCurrentStroke
  ) {
    noStroke();
    fill(MUTED);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(
      "Draw your starting artwork here.",
      canvasArea.x,
      canvasArea.y
    );
  }

  drawSharedToolControls();
  drawCreatorFooter();
}

function drawCreatorHeader() {
  noStroke();
  fill(WHITE);
  textAlign(LEFT, TOP);
  textSize(22);
  text("create artwork", 20, 18);

  fill(MUTED);
  textSize(12);
  text("Temporary starting collection tool", 21, 49);

  drawSmallTextButton(creatorBackButton, "BACK TO MODES");

  textAlign(LEFT, TOP);
  fill(MUTED);
  textSize(11);

  const savedCount = getCreatorSavedCount();

  text(
    "ARTWORKS SAVED: " + savedCount,
    21,
    83
  );
}

function drawCreatorFooter() {
  drawButton(creatorSaveButton, "SAVE & EXPORT");

  push();

  rectMode(CORNER);
  stroke(BORDER);
  strokeWeight(1);
  fill(PAPER);

  rect(
    creatorClearButton.x,
    creatorClearButton.y,
    creatorClearButton.w,
    creatorClearButton.h,
    8
  );

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(12);

  text(
    "CLEAR",
    creatorClearButton.x + creatorClearButton.w / 2,
    creatorClearButton.y + creatorClearButton.h / 2
  );

  pop();

  noStroke();
  fill(MUTED);
  textAlign(CENTER, TOP);
  textSize(10);

  text(
    creatorStatus,
    width / 2,
    height - 25
  );
}

function getCreatorSavedCount() {
  if (
    !window.shared ||
    !window.shared.worldwide ||
    !Array.isArray(window.shared.worldwide.artworks)
  ) {
    return 0;
  }

  return window.shared.worldwide.artworks.filter(
    artwork =>
      artwork &&
      typeof artwork.id === "string" &&
      artwork.id.startsWith("starting-artwork-")
  ).length;
}

function eraseCreatorStrokesAt(x, y) {
  if (!creatorEraserMode) return;

  for (let i = creatorStrokes.length - 1; i >= 0; i--) {
    if (strokeTouchesEraser(creatorStrokes[i], x, y)) {
      creatorStrokes.splice(i, 1);
    }
  }

  if (
    creatorCurrentStroke &&
    strokeTouchesEraser(creatorCurrentStroke, x, y)
  ) {
    creatorCurrentStroke = null;
  }
}

function addCreatorDrawingPoint(x, y) {
  if (!creatorCurrentStroke || !canvasArea) return;

  const zoom = constrain(
    Number(creatorToolSettings.zoomLevel) || MAX_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM
  );

  const baseDiameter = canvasArea.baseDiameter;

  const normalizedX =
    (x - canvasArea.x) / (baseDiameter * zoom) + 0.5;

  const normalizedY =
    (y - canvasArea.y) / (baseDiameter * zoom) + 0.5;

  creatorCurrentStroke.points.push({
    x: normalizedX,
    y: normalizedY
  });
}

function clearCreatorArtwork() {
  if (
    creatorStrokes.length === 0 &&
    !creatorCurrentStroke
  ) {
    creatorStatus = "The canvas is already empty.";
    creatorStatusTime = millis();
    return;
  }

  const shouldClear = confirm(
    "Clear this artwork? This cannot be undone."
  );

  if (!shouldClear) return;

  creatorStrokes = [];
  creatorCurrentStroke = null;
  creatorEraserMode = false;

  creatorStatus = "Canvas cleared. Start a new artwork.";
  creatorStatusTime = millis();
}

function saveCreatorArtwork() {
  if (!window.shareConnected) {
    creatorStatus = "Not connected yet. Wait for the connection.";
    creatorStatusTime = millis();
    return;
  }

  if (!ensureSharedStructure()) {
    creatorStatus = "Shared data is not ready yet. Try again.";
    creatorStatusTime = millis();
    return;
  }

  if (
    creatorCurrentStroke &&
    creatorCurrentStroke.points.length > 0
  ) {
    creatorStrokes.push(creatorCurrentStroke);
  }

  creatorCurrentStroke = null;

  if (creatorStrokes.length === 0) {
    creatorStatus = "Draw something before saving.";
    creatorStatusTime = millis();
    return;
  }

  const worldwide = window.shared.worldwide;

  if (!Array.isArray(worldwide.artworks)) {
    worldwide.artworks = [];
  }

  const nextNumber = getCreatorSavedCount() + 1;
  const artworkId = "starting-artwork-" + nextNumber;

  const savedStrokes = JSON.parse(
    JSON.stringify(creatorStrokes)
  );

  const artwork = {
    id: artworkId,
    title: "Starting Artwork " + nextNumber,
    version: 1,
    zoomLevel: Number(creatorToolSettings.zoomLevel) || MAX_ZOOM,
    strokes: savedStrokes,
    versions: [
      {
        version: 1,
        zoomLevel: Number(creatorToolSettings.zoomLevel) || MAX_ZOOM,
        strokes: JSON.parse(JSON.stringify(savedStrokes))
      }
    ],
    createdAt: new Date().toISOString()
  };

  // Save into the existing Worldwide shared namespace.
  worldwide.artworks.push(artwork);

  // Export the same artwork as a separate JSON backup.
  const exportData = {
    format: "bubble-pop-artwork",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    artwork: artwork
  };

  const filename =
    "bubble-pop-starting-artwork-" +
    String(nextNumber).padStart(3, "0") +
    ".json";

  try {
    downloadCreatorJSON(exportData, filename);

    creatorStrokes = [];
    creatorCurrentStroke = null;
    creatorEraserMode = false;

    creatorStatus =
      "Saved! JSON file downloaded. Make your next artwork.";

    creatorStatusTime = millis();

    console.log("Worldwide artwork saved:", artwork);
  } catch (error) {
    console.error("Artwork export failed:", error);

    creatorStatus =
      "Saved to the room, but download failed. Check the browser.";

    creatorStatusTime = millis();
  }
}

function downloadCreatorJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob(
    [json],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// ==================================================
// TEMPORARY CREATOR — END
// ==================================================


// --------------------------------------------------
// ORDINARY WAITING BUBBLES
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

    b.x = constrain(b.x, b.size / 2, width - b.size / 2);

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
  ellipse(-b.size * 0.22, -b.size * 0.25, b.size * 0.22, b.size * 0.10);

  fill(255, 255, 255, 100);
  circle(b.size * 0.24, b.size * 0.22, b.size * 0.07);

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
// GROUP VERSION HISTORY — SHARED SNAPSHOTS
// --------------------------------------------------

function getVersionId(snapshot) {
  if (snapshot && snapshot.id !== undefined) {
    return String(snapshot.id);
  }

  if (snapshot && snapshot.version !== undefined) {
    return "version-" + snapshot.version;
  }

  return null;
}

function syncVersionBubbles() {
  if (activeMode !== "group" || !window.shareConnected) return;

  const data = getSharedData();

  for (const snapshot of data.versions) {
    const id = getVersionId(snapshot);

    if (!id || seenVersionIds.has(id)) continue;

    seenVersionIds.add(id);
    versionBubbles.push(makeVersionBubble(snapshot, id));
  }
}

function makeVersionBubble(snapshot, id) {
  const size = random(
    VERSION_BUBBLE_MIN_SIZE,
    VERSION_BUBBLE_MAX_SIZE
  );

  return {
    id,
    snapshot,
    x: random(size / 2 + 12, width - size / 2 - 12),
    y: height + random(30, 100),
    size,
    speed: random(
      VERSION_BUBBLE_SPEED_MIN,
      VERSION_BUBBLE_SPEED_MAX
    ),
    drift: random(0.2, 0.55),
    phase: random(360),
    rotation: random(360),
    rotationSpeed: random(-0.25, 0.25),
    alpha: random(150, 210)
  };
}

function updateVersionBubbles() {
  for (let i = versionBubbles.length - 1; i >= 0; i--) {
    const b = versionBubbles[i];

    b.y -= b.speed;
    b.x += sin(frameCount * 0.6 + b.phase) * b.drift;
    b.rotation += b.rotationSpeed;

    b.x = constrain(b.x, b.size / 2, width - b.size / 2);

    if (b.y < -b.size) {
      versionBubbles.splice(i, 1);
    }
  }
}

function drawVersionBubbles() {
  for (const b of versionBubbles) {
    drawVersionBubble(b);
  }
}

function drawVersionBubble(b) {
  const drawingDiameter = b.size * 0.66;

  const previewArea = {
    x: b.x,
    y: b.y,
    radius: drawingDiameter / 2,
    diameter: drawingDiameter,
    baseDiameter: drawingDiameter
  };

  noStroke();
  fill(12, 18, 25, 220);
  circle(b.x, b.y, b.size * 0.82);

  const snapshot = b.snapshot;

  if (snapshot && Array.isArray(snapshot.strokes)) {
    for (const strokeData of snapshot.strokes) {
      drawStroke(
        strokeData,
        snapshot.zoomLevel || MAX_ZOOM,
        previewArea
      );
    }
  }

  push();

  translate(b.x, b.y);
  rotate(b.rotation);

  noFill();
  strokeWeight(2.5);

  stroke(98, 214, 206, b.alpha);
  arc(0, 0, b.size, b.size, 190, 265);

  stroke(182, 155, 255, b.alpha);
  arc(0, 0, b.size, b.size, 265, 335);

  stroke(255, 156, 203, b.alpha);
  arc(0, 0, b.size, b.size, 335, 50);

  stroke(40, 123, 255, b.alpha);
  arc(0, 0, b.size, b.size, 50, 120);

  stroke(255, 230, 109, b.alpha);
  arc(0, 0, b.size, b.size, 120, 190);

  noStroke();
  fill(255, 255, 255, 180);
  ellipse(-b.size * 0.22, -b.size * 0.25, b.size * 0.22, b.size * 0.10);

  pop();

  noFill();
  stroke(255, 255, 255, 125);
  strokeWeight(1);
  circle(b.x, b.y, drawingDiameter);
}

// --------------------------------------------------
// GROUP VERSION HISTORY — LOCAL PREVIEW
// --------------------------------------------------

function openVersionPreview(bubble) {
  if (!bubble || activeVersionPreview) return;

  const index = versionBubbles.indexOf(bubble);

  if (index !== -1) {
    versionBubbles.splice(index, 1);
  }

  const blurredBackground = get();
  blurredBackground.filter(BLUR, 2);

  activeVersionPreview = {
    snapshot: bubble.snapshot,
    x: bubble.x,
    y: bubble.y,
    startSize: bubble.size,
    startTime: millis(),
    background: blurredBackground,
    popping: false,
    popStartTime: 0,
    droplets: []
  };
}

function drawVersionPreview() {
  if (!activeVersionPreview) return;

  const preview = activeVersionPreview;
  const elapsed = millis() - preview.startTime;

  if (preview.background) {
    image(preview.background, 0, 0, width, height);
  }

  noStroke();
  fill(0, 185);
  rect(0, 0, width, height);

  const maximumSize = min(
    width - 64,
    height * 0.42,
    330
  );

  const expandProgress = constrain(
    elapsed / VERSION_PREVIEW_EXPAND_TIME,
    0,
    1
  );

  const easedExpansion =
    1 - pow(1 - expandProgress, 3);

  let previewSize = lerp(
    preview.startSize,
    maximumSize,
    easedExpansion
  );

  const previewX = constrain(
    preview.x,
    previewSize / 2 + 12,
    width - previewSize / 2 - 12
  );

  const previewY = constrain(
    preview.y,
    previewSize / 2 + 65,
    height - previewSize / 2 - 65
  );

  let alpha = 255;

  if (preview.popping) {
    const popProgress = constrain(
      (millis() - preview.popStartTime) /
      VERSION_PREVIEW_POP_TIME,
      0,
      1
    );

    previewSize *= 1 - popProgress;
    alpha = 255 * (1 - popProgress);

    drawVersionPreviewPop(preview);

    if (popProgress >= 1) {
      activeVersionPreview = null;
      return;
    }
  }

  if (previewSize <= 1) return;

  const drawingDiameter = previewSize * 0.82;

  const previewArea = {
    x: previewX,
    y: previewY,
    radius: drawingDiameter / 2,
    diameter: drawingDiameter,
    baseDiameter: drawingDiameter
  };

  noStroke();
  fill(8, 18, 28, 245 * alpha / 255);
  circle(previewX, previewY, previewSize);

  fill(16, 16, 16, 245 * alpha / 255);
  circle(previewX, previewY, drawingDiameter);

  const snapshot = preview.snapshot;

  if (snapshot && Array.isArray(snapshot.strokes)) {
    for (const strokeData of snapshot.strokes) {
      drawStroke(
        strokeData,
        snapshot.zoomLevel || MAX_ZOOM,
        previewArea
      );
    }
  }

  noFill();
  strokeWeight(3);

  stroke(98, 214, 206, alpha);
  arc(previewX, previewY, previewSize, previewSize, 190, 265);

  stroke(182, 155, 255, alpha);
  arc(previewX, previewY, previewSize, previewSize, 265, 335);

  stroke(255, 156, 203, alpha);
  arc(previewX, previewY, previewSize, previewSize, 335, 50);

  stroke(40, 123, 255, alpha);
  arc(previewX, previewY, previewSize, previewSize, 50, 120);

  stroke(255, 230, 109, alpha);
  arc(previewX, previewY, previewSize, previewSize, 120, 190);

  noFill();
  stroke(255, 255, 255, 170 * alpha / 255);
  strokeWeight(1.5);
  circle(previewX, previewY, drawingDiameter);

  if (
    expandProgress >= 0.92 &&
    !preview.popping
  ) {
    const labelAlpha = map(
      expandProgress,
      0.92,
      1,
      0,
      255
    );

    drawCurvedVersionLabel(
      "VERSION " + snapshot.version,
      previewX,
      previewY,
      previewSize * 0.57,
      labelAlpha
    );

    noStroke();
    fill(255, 255, 255, labelAlpha);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(
      "SHAKE TO POP",
      previewX,
      previewY + previewSize / 2 + 30
    );
  }
}

function drawCurvedVersionLabel(label, x, y, radius, alpha) {
  push();

  textFont("Arial");
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(255, 255, 255, alpha);
  noStroke();

  const totalWidth = textWidth(label);
  const angleSpan = min(
    125,
    (totalWidth / radius) * 57.2958
  );

  let currentWidth = 0;

  for (let i = 0; i < label.length; i++) {
    const character = label[i];
    const characterWidth = textWidth(character);

    const characterCenter =
      currentWidth + characterWidth / 2;

    const angle = map(
      characterCenter,
      0,
      totalWidth,
      -90 - angleSpan / 2,
      -90 + angleSpan / 2
    );

    const letterX = x + cos(angle) * radius;
    const letterY = y + sin(angle) * radius;

    push();
    translate(letterX, letterY);
    rotate(angle + 90);
    text(character, 0, 0);
    pop();

    currentWidth += characterWidth;
  }

  pop();
}

function createVersionPreviewDroplets(x, y, size) {
  const droplets = [];

  for (let i = 0; i < 30; i++) {
    const angle = random(360);
    const speed = random(1.5, 5.5);

    droplets.push({
      x,
      y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(3, 8),
      r: random(100, 255),
      g: random(100, 255),
      b: random(180, 255),
      alpha: 230
    });
  }

  return droplets;
}

function drawVersionPreviewPop(preview) {
  const elapsed = millis() - preview.popStartTime;

  const progress = constrain(
    elapsed / VERSION_PREVIEW_POP_TIME,
    0,
    1
  );

  const eased = 1 - pow(1 - progress, 3);

  const centerX = preview.x;
  const centerY = preview.y;
  const baseSize = preview.startSize;

  for (let i = 0; i < 14; i++) {
    const angle = i * (360 / 14) + sin(i * 41) * 12;
    const delay = (i % 4) * 0.035;

    const splashProgress = constrain(
      (progress - delay) / (1 - delay),
      0,
      1
    );

    const splashEased =
      1 - pow(1 - splashProgress, 2.5);

    const distance =
      baseSize * (0.12 + splashEased * 0.48);

    const streakLength =
      baseSize * (0.06 + splashEased * 0.12);

    const x1 = centerX + cos(angle) * distance;
    const y1 = centerY + sin(angle) * distance;
    const x2 = centerX + cos(angle) * (distance + streakLength);
    const y2 = centerY + sin(angle) * (distance + streakLength);

    stroke(255, 255, 255, 190 * (1 - splashProgress));
    strokeWeight(2.5);
    strokeCap(ROUND);
    line(x1, y1, x2, y2);
  }

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
      baseSize * (0.12 + splashEased * 0.48);

    const length = baseSize * 0.12;

    stroke(
      splashColours[i][0],
      splashColours[i][1],
      splashColours[i][2],
      180 * (1 - splashProgress)
    );

    strokeWeight(4);
    strokeCap(ROUND);

    line(
      centerX + cos(angle) * distance,
      centerY + sin(angle) * distance,
      centerX + cos(angle) * (distance + length),
      centerY + sin(angle) * (distance + length)
    );
  }

  noStroke();
  fill(255, 255, 255, 180 * (1 - progress));

  const flashSize = baseSize * 0.2 * eased;
  circle(centerX, centerY, flashSize);

  for (const d of preview.droplets) {
    d.x += d.vx;
    d.y += d.vy;
    d.vy += 0.025;
    d.alpha *= 0.985;

    const direction = atan2(d.vy, d.vx);

    push();
    translate(d.x, d.y);
    rotate(direction);

    noStroke();
    fill(
      d.r,
      d.g,
      d.b,
      d.alpha * (1 - progress * 0.5)
    );

    ellipse(0, 0, d.size * 2.8, d.size * 1.7);

    fill(255, 255, 255, d.alpha * 0.35 * (1 - progress));
    ellipse(
      -d.size * 0.35,
      -d.size * 0.25,
      d.size * 0.55,
      d.size * 0.25
    );

    pop();
  }
}

function deviceShaken() {
  if (
    activeMode !== "group" ||
    !activeVersionPreview ||
    activeVersionPreview.popping
  ) {
    return;
  }

  const preview = activeVersionPreview;

  if (
    millis() - preview.startTime <
    VERSION_PREVIEW_EXPAND_TIME
  ) {
    return;
  }

  if (
    millis() - lastVersionShake <
    VERSION_PREVIEW_SHAKE_COOLDOWN
  ) {
    return;
  }

  lastVersionShake = millis();

  preview.popping = true;
  preview.popStartTime = millis();

  preview.droplets = createVersionPreviewDroplets(
    preview.x,
    preview.y,
    preview.startSize
  );

  console.log("VERSION PREVIEW POPPED");
}

// --------------------------------------------------
// GROUP FOOTER AND TURN CONTROLS
// --------------------------------------------------

function drawFooter() {
  drawButton(leftButton, drawingMode ? "DRAWING" : "MY TURN");
  drawButton(rightButton, drawingMode ? "FINISH" : "PASS");

  noStroke();
  fill(MUTED);
  textAlign(CENTER, TOP);
  textSize(11);

  text(
    drawingMode
      ? (eraserMode
          ? "Erasing your own strokes. Tap ER to draw again."
          : "Add to the drawing, then finish your turn.")
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
      eraserMode = false;
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
      updateLayout();
      return;
    }

    // TEMPORARY CREATOR entry.
    if (
      creatorMenuButton &&
      insideButton(mouseX, mouseY, creatorMenuButton)
    ) {
      connectToShare();

      activeMode = "creator";

      creatorStrokes = [];
      creatorCurrentStroke = null;
      creatorEraserMode = false;

      creatorToolSettings = {
        brushColor: "#FFFFFF",
        brushSize: 4,
        zoomLevel: MAX_ZOOM
      };

      creatorStatus = "Draw an artwork, then save and export it.";
      creatorStatusTime = millis();

      brushAdjustmentActive = false;
      brushPermissionPending = false;

      updateLayout();
      return;
    }

    return;
  }

  // TEMPORARY CREATOR input.
  if (activeMode === "creator") {
    if (handleToolControlPress(mouseX, mouseY)) return;

    if (
      creatorBackButton &&
      insideButton(mouseX, mouseY, creatorBackButton)
    ) {
      const hasUnsavedArtwork =
        creatorStrokes.length > 0 ||
        !!creatorCurrentStroke;

      if (
        hasUnsavedArtwork &&
        !confirm("Leave Creator mode without saving this artwork?")
      ) {
        return;
      }

      activeMode = "menu";
      creatorStrokes = [];
      creatorCurrentStroke = null;
      creatorEraserMode = false;
      brushAdjustmentActive = false;
      return;
    }

    if (
      creatorSaveButton &&
      insideButton(mouseX, mouseY, creatorSaveButton)
    ) {
      saveCreatorArtwork();
      return;
    }

    if (
      creatorClearButton &&
      insideButton(mouseX, mouseY, creatorClearButton)
    ) {
      clearCreatorArtwork();
      return;
    }

    if (insideDrawingCircle(mouseX, mouseY)) {
      if (creatorEraserMode) {
        eraseCreatorStrokesAt(mouseX, mouseY);
        return;
      }

      const settings = creatorToolSettings;

      creatorCurrentStroke = {
        color: settings.brushColor || WHITE,
        weight: settings.brushSize || 4,
        points: []
      };

      addCreatorDrawingPoint(mouseX, mouseY);
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

  if (activeVersionPreview) return;

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
    for (let i = versionBubbles.length - 1; i >= 0; i--) {
      const b = versionBubbles[i];

      if (
        dist(mouseX, mouseY, b.x, b.y) <
        b.size / 2 + 12
      ) {
        openVersionPreview(b);
        return;
      }
    }

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
    if (eraserMode) {
      eraseLocalStrokesAt(mouseX, mouseY);
      return;
    }

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
  // TEMPORARY CREATOR drawing input.
  if (activeMode === "creator") {
    if (!insideDrawingCircle(mouseX, mouseY)) return;

    if (creatorEraserMode) {
      eraseCreatorStrokesAt(mouseX, mouseY);
      return;
    }

    if (creatorCurrentStroke) {
      addCreatorDrawingPoint(mouseX, mouseY);
    }

    return;
  }

  if (
    activeMode !== "group" ||
    !drawingMode ||
    activeVersionPreview
  ) {
    return;
  }

  if (!insideDrawingCircle(mouseX, mouseY)) return;

  if (eraserMode) {
    eraseLocalStrokesAt(mouseX, mouseY);
    return;
  }

  if (currentStroke) {
    addDrawingPoint(mouseX, mouseY);
  }
}

function mouseReleased() {
  // TEMPORARY CREATOR stroke completion.
  if (activeMode === "creator") {
    if (
      creatorCurrentStroke &&
      creatorCurrentStroke.points.length > 0
    ) {
      creatorStrokes.push(creatorCurrentStroke);
    }

    creatorCurrentStroke = null;
    return;
  }

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

  const zoom = constrain(
    Number(getActiveToolSettings().zoomLevel) || MAX_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM
  );

  const baseDiameter = canvasArea.baseDiameter;

  const normalizedX =
    (x - canvasArea.x) / (baseDiameter * zoom) + 0.5;

  const normalizedY =
    (y - canvasArea.y) / (baseDiameter * zoom) + 0.5;

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
  eraserMode = false;
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
    const nextVersion = data.version + 1;
    const nextTurn = data.turnCount + 1;

    const completedStrokes =
      data.strokes.concat(localStrokes);

    group.strokes = completedStrokes;
    group.version = nextVersion;
    group.lastAction = "edited";

    const snapshot = {
      id: "version-" + nextVersion + "-turn-" + nextTurn,
      version: nextVersion,
      turn: nextTurn,
      zoomLevel: Number(group.zoomLevel) || MAX_ZOOM,
      strokes: JSON.parse(JSON.stringify(completedStrokes))
    };

    group.versions = data.versions.concat([snapshot]);
  } else {
    group.lastAction = "passed";
  }

  group.turnCount = data.turnCount + 1;

  drawingMode = false;
  eraserMode = false;
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
