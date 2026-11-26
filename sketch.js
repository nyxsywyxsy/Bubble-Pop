
/*
  BUBBLE POP — TWO-MODE APPLICATION

  Modes:
  - GROUP: Existing collaborative drawing prototype.
  - WORLDWIDE: Placeholder for the upcoming collection experience.

  Shared state:
  - group: Group drawing and future Group features.
  - worldwide: Future artwork collection and counter.

  Existing Share room:
  - Room: a1-glade
  - App: bubble-pop
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
    bubblePopCount: 0,
    sessionActive: true
  },

  worldwide: {
    artworks: [],
    prompts: [],
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

const STROKE_COLOR = "#FFFFFF";
const STROKE_WEIGHT = 4;

const WAITING_BUBBLE_COUNT = 24;

// --------------------------------------------------
// APPLICATION STATE
// --------------------------------------------------

// Each phone chooses its own mode.
// This selection is not shared with other participants.

let activeMode = "menu";

// --------------------------------------------------
// GROUP LOCAL VARIABLES
// --------------------------------------------------

let drawingMode = false;

let localStrokes = [];
let currentStroke = null;

let canvasArea;

let leftButton;
let rightButton;
let modeButton;

let waitingBubbles = [];
let bubblePopAnimations = [];

// --------------------------------------------------
// MENU VARIABLES
// --------------------------------------------------

let groupMenuButton;
let worldwideMenuButton;
let worldwideBackButton;

// --------------------------------------------------
// SHARED STATE INITIALIZATION
// --------------------------------------------------

let sharedStructureReady = false;

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(displayDensity());

  textFont("Arial");
  angleMode(DEGREES);

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

  enableShareTap({
    label: "Tap to join Bubble Pop"
  });

  updateLayout();
  createWaitingBubbles();
}

// --------------------------------------------------
// SHARE CALLBACK
// --------------------------------------------------

function shareReady() {
  ensureSharedStructure();

  console.log("Bubble Pop connected.");
}

// --------------------------------------------------
// SHARED STATE MIGRATION
// --------------------------------------------------

function ensureSharedStructure() {
  const room = window.shared;

  if (!room || typeof room !== "object") {
    return false;
  }

  // Check whether this room still contains the old
  // flat shared-state structure.

  const legacyStrokes = Array.isArray(room.strokes)
    ? room.strokes
    : [];

  const legacyVersion = Number(room.version) || 0;
  const legacyTurnCount = Number(room.turnCount) || 0;
  const legacyLastAction = room.lastAction || "created";

  const legacyHasData =
    legacyStrokes.length > 0 ||
    legacyVersion > 0 ||
    legacyTurnCount > 0 ||
    legacyLastAction !== "created";

  // Make sure the Group section exists.

  if (!room.group || typeof room.group !== "object") {
    room.group = {};
  }

  const group = room.group;

  const groupHasData =
    (Array.isArray(group.strokes) && group.strokes.length > 0) ||
    (Number(group.version) || 0) > 0 ||
    (Number(group.turnCount) || 0) > 0;

  // If the old drawing exists but the new Group section
  // is still empty, migrate the old drawing into Group.

  if (legacyHasData && !groupHasData) {
    group.strokes = legacyStrokes;
    group.version = legacyVersion;
    group.turnCount = legacyTurnCount;
    group.lastAction = legacyLastAction;

    console.log("Existing drawing migrated into Group.");
  }

  // Fill in any missing Group values.

  if (!Array.isArray(group.strokes)) {
    group.strokes = [];
  }

  if (!Array.isArray(group.versions)) {
    group.versions = [];
  }

  if (typeof group.version !== "number") {
    group.version = 0;
  }

  if (typeof group.turnCount !== "number") {
    group.turnCount = 0;
  }

  if (!group.lastAction) {
    group.lastAction = "created";
  }

  if (!group.brushColor) {
    group.brushColor = "#FFFFFF";
  }

  if (typeof group.brushSize !== "number") {
    group.brushSize = 4;
  }

  if (typeof group.bubblePopCount !== "number") {
    group.bubblePopCount = 0;
  }

  if (typeof group.sessionActive !== "boolean") {
    group.sessionActive = true;
  }

  // Make sure the Worldwide section exists.

  if (!room.worldwide || typeof room.worldwide !== "object") {
    room.worldwide = {};
  }

  const worldwide = room.worldwide;

  if (!Array.isArray(worldwide.artworks)) {
    worldwide.artworks = [];
  }

  if (!Array.isArray(worldwide.prompts)) {
    worldwide.prompts = [];
  }

  if (typeof worldwide.bubblePopCount !== "number") {
    worldwide.bubblePopCount = 0;
  }

  // Remove the old root-level fields after migration.
  // The drawing now lives inside room.group.

  delete room.strokes;
  delete room.version;
  delete room.turnCount;
  delete room.lastAction;

  sharedStructureReady = true;

  return true;
}

// --------------------------------------------------
// MAIN DRAW LOOP
// --------------------------------------------------

function draw() {
  background(BACKGROUND);

  // Make sure the shared state is organized once
  // the phone has connected to the room.

  if (
    window.shareConnected &&
    !sharedStructureReady
  ) {
    ensureSharedStructure();
  }

  // Opening screen.

  if (activeMode === "menu") {
    drawModeSelection();
    return;
  }

  // Worldwide placeholder.
  // Its actual experience will be developed later.

  if (activeMode === "worldwide") {
    drawWorldwidePlaceholder();
    return;
  }

  // Existing Group experience.

  if (activeMode === "group") {
    updateLayout();

    drawHeader();
    drawCanvasCircle();

    drawSharedArtwork();
    drawLocalArtwork();

    if (!drawingMode) {
      updateWaitingBubbles();
      drawWaitingBubbles();
      drawBubblePopAnimations();
    }

    drawFooter();
  }
}

// --------------------------------------------------
// OPENING SCREEN
// --------------------------------------------------

function drawModeSelection() {
  const buttonWidth = min(width - 48, 360);
  const buttonHeight = 100;
  const gap = 18;

  const x = (width - buttonWidth) / 2;

  const totalHeight = buttonHeight * 2 + gap;
  const startY = height / 2 - totalHeight / 2 + 30;

  groupMenuButton = {
    x: x,
    y: startY,
    w: buttonWidth,
    h: buttonHeight
  };

  worldwideMenuButton = {
    x: x,
    y: startY + buttonHeight + gap,
    w: buttonWidth,
    h: buttonHeight
  };

  // Title.

  noStroke();
  fill(WHITE);

  textAlign(CENTER, CENTER);
  textSize(min(40, width * 0.1));

  text("bubble pop", width / 2, startY - 105);

  fill(MUTED);
  textSize(14);

  text(
    "Choose your experience",
    width / 2,
    startY - 65
  );

  // Group option.

  drawMenuCard(
    groupMenuButton,
    "GROUP",
    "A shared artwork developed by a group."
  );

  // Worldwide option.

  drawMenuCard(
    worldwideMenuButton,
    "WORLDWIDE",
    "Discover drawings and prompts left by others."
  );

  // Connection status.

  fill(MUTED);
  textSize(11);
  textAlign(CENTER, CENTER);

  text(
    window.shareConnected
      ? "CONNECTED"
      : "CONNECTING...",
    width / 2,
    height - 35
  );
}

// --------------------------------------------------
// MENU CARD
// --------------------------------------------------

function drawMenuCard(button, heading, description) {
  push();

  rectMode(CORNER);

  stroke(110, 110, 110, 180);
  strokeWeight(1);

  fill(16, 16, 16);

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    14
  );

  noStroke();

  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(18);

  text(
    heading,
    button.x + button.w / 2,
    button.y + 35
  );

  fill(MUTED);
  textSize(12);

  text(
    description,
    button.x + button.w / 2,
    button.y + 68
  );

  pop();
}

// --------------------------------------------------
// WORLDWIDE PLACEHOLDER
// --------------------------------------------------

function drawWorldwidePlaceholder() {
  noStroke();

  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(30);

  text("WORLDWIDE", width / 2, height / 2 - 85);

  fill(MUTED);
  textSize(14);

  text(
    "The Worldwide experience will be built in a later step.",
    width / 2,
    height / 2 - 40,
    width - 60,
    60
  );

  worldwideBackButton = {
    x: width / 2 - 115,
    y: height / 2 + 35,
    w: 230,
    h: 48
  };

  drawMenuCardButton(
    worldwideBackButton,
    "BACK TO MODES"
  );
}

// --------------------------------------------------
// SIMPLE MENU BUTTON
// --------------------------------------------------

function drawMenuCardButton(button, label) {
  push();

  rectMode(CORNER);

  stroke(BORDER);
  strokeWeight(1);

  fill(PAPER);

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    9
  );

  noStroke();
  fill(WHITE);

  textAlign(CENTER, CENTER);
  textSize(13);

  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );

  pop();
}

// --------------------------------------------------
// GROUP LAYOUT
// --------------------------------------------------

function updateLayout() {
  const areaTop = 125;
  const areaBottom = height - 125;
  const availableHeight = areaBottom - areaTop;

  const diameter = min(
    width - 72,
    availableHeight * 0.76
  );

  const circleSize = max(190, diameter);

  canvasArea = {
    x: width / 2,
    y: (areaTop + areaBottom) / 2,
    radius: circleSize / 2,
    diameter: circleSize
  };

  const buttonY = height - 85;
  const buttonH = 52;
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
}

// --------------------------------------------------
// GROUP HEADER
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

  text(
    "A drawing passed between people.",
    21,
    53
  );

  textAlign(RIGHT, TOP);
  textSize(12);

  if (window.shareConnected) {
    fill(WHITE);
    text("CONNECTED", width - 20, 25);
  } else {
    fill(MUTED);
    text("CONNECTING...", width - 20, 25);
  }

  // Return to the mode-selection screen.
  // This button is hidden while someone is drawing.

  if (!drawingMode) {
    noFill();
    stroke(BORDER);
    strokeWeight(1);

    rect(
      modeButton.x,
      modeButton.y,
      modeButton.w,
      modeButton.h,
      6
    );

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
    "Version " + data.version +
    "   ·   " + data.turnCount + " turns",
    21,
    88
  );
}

// --------------------------------------------------
// CIRCULAR CANVAS
// --------------------------------------------------

function drawCanvasCircle() {
  push();

  noStroke();
  fill(PAPER);

  circle(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter
  );

  noFill();
  stroke(BORDER);
  strokeWeight(1.2);

  circle(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter
  );

  stroke(255, 255, 255, 65);
  strokeWeight(2);

  arc(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter - 8,
    canvasArea.diameter - 8,
    205,
    255
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

// --------------------------------------------------
// SHARED ARTWORK
// --------------------------------------------------

function drawSharedArtwork() {
  const data = getSharedData();

  for (const strokeData of data.strokes) {
    drawStroke(strokeData);
  }
}

// --------------------------------------------------
// LOCAL ARTWORK
// --------------------------------------------------

function drawLocalArtwork() {
  for (const strokeData of localStrokes) {
    drawStroke(strokeData);
  }

  if (currentStroke) {
    drawStroke(currentStroke);
  }
}

// --------------------------------------------------
// DRAW STROKES INSIDE THE CIRCLE
// --------------------------------------------------

function drawStroke(strokeData) {
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

  stroke(strokeData.color || STROKE_COLOR);
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
    fill(strokeData.color || STROKE_COLOR);

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

// --------------------------------------------------
// WAITING BUBBLES — CREATE
// --------------------------------------------------

function createWaitingBubbles() {
  waitingBubbles = [];

  for (let i = 0; i < WAITING_BUBBLE_COUNT; i++) {
    waitingBubbles.push(makeWaitingBubble());
  }
}

function makeWaitingBubble() {
  let x;
  let y;
  let size;

  let foundPosition = false;

  size = random(25, 55);

  for (let attempt = 0; attempt < 100; attempt++) {
    x = random(18 + size / 2, width - 18 - size / 2);
    y = random(110 + size / 2, height - 115 - size / 2);

    const distance = dist(
      x,
      y,
      canvasArea.x,
      canvasArea.y
    );

    if (
      distance >
      canvasArea.radius + size * 0.55
    ) {
      foundPosition = true;
      break;
    }
  }

  if (!foundPosition) {
    x = random(width);
    y = random(height);
  }

  return {
    x: x,
    y: y,
    size: size,

    speed: random(0.35, 1.15),

    phase: random(360),
    drift: random(0.2, 0.65),

    rotation: random(360),
    rotationSpeed: random(-0.35, 0.35),

    alpha: random(100, 190),

    popping: false
  };
}

// --------------------------------------------------
// WAITING BUBBLES — UPDATE
// --------------------------------------------------

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

    const distance = dist(
      b.x,
      b.y,
      canvasArea.x,
      canvasArea.y
    );

    if (
      distance <
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

// --------------------------------------------------
// WAITING BUBBLES — DRAW
// --------------------------------------------------

function drawWaitingBubbles() {
  for (const b of waitingBubbles) {
    if (!b.popping) {
      drawWaitingBubble(b);
    }
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

// --------------------------------------------------
// BUBBLE POPPING
// --------------------------------------------------

function popWaitingBubble(b) {
  if (b.popping) return;

  b.popping = true;

  bubblePopAnimations.push({
    x: b.x,
    y: b.y,
    size: b.size,
    startTime: millis()
  });
}

function drawBubblePopAnimations() {
  for (
    let i = bubblePopAnimations.length - 1;
    i >= 0;
    i--
  ) {
    const animation = bubblePopAnimations[i];

    const elapsed = millis() - animation.startTime;
    const progress = constrain(elapsed / 400, 0, 1);

    const size = animation.size * (1 + progress * 0.8);
    const alpha = 180 * (1 - progress);

    noFill();
    stroke(255, 255, 255, alpha);
    strokeWeight(2);

    circle(
      animation.x,
      animation.y,
      size
    );

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
        b => b.popping &&
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
// FOOTER / BUTTONS
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
  textSize(12);

  if (drawingMode) {
    text(
      "Add to the drawing, then finish your turn.",
      width / 2,
      height - 23
    );
  } else {
    text(
      "Tap the floating bubbles while you wait.",
      width / 2,
      height - 23
    );
  }
}

function drawButton(button, label) {
  noStroke();

  fill(
    window.shareConnected
      ? WHITE
      : "#555555"
  );

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    8
  );

  fill(
    window.shareConnected
      ? "#000000"
      : WHITE
  );

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

  // MODE SELECTION SCREEN.

  if (activeMode === "menu") {

    if (
      groupMenuButton &&
      insideButton(mouseX, mouseY, groupMenuButton)
    ) {
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
      activeMode = "worldwide";
      return;
    }

    return;
  }

  // WORLDWIDE PLACEHOLDER.

  if (activeMode === "worldwide") {

    if (
      worldwideBackButton &&
      insideButton(mouseX, mouseY, worldwideBackButton)
    ) {
      activeMode = "menu";
    }

    return;
  }

  // GROUP MODE.

  if (activeMode !== "group") return;

  // Return to the mode selection screen.
  // This is only available when not drawing.

  if (
    !drawingMode &&
    modeButton &&
    insideButton(mouseX, mouseY, modeButton)
  ) {
    activeMode = "menu";
    return;
  }

  if (!window.shareConnected) return;

  // Check waiting bubbles first.

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

  // MY TURN.

  if (insideButton(mouseX, mouseY, leftButton)) {
    if (!drawingMode) {
      startTurn();
    }

    return;
  }

  // FINISH / PASS.

  if (insideButton(mouseX, mouseY, rightButton)) {
    if (drawingMode) {
      finishTurn();
    } else {
      passTurn();
    }

    return;
  }

  // Start a drawing stroke.

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
}

function mouseDragged() {
  if (activeMode !== "group") return;

  if (!drawingMode || !currentStroke) return;

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
// CIRCULAR DRAWING HELPERS
// --------------------------------------------------

function insideDrawingCircle(x, y) {
  return (
    dist(
      x,
      y,
      canvasArea.x,
      canvasArea.y
    ) <= canvasArea.radius
  );
}

function insideButton(x, y, button) {
  return (
    button &&
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
// SHARED DATA ACCESS
// --------------------------------------------------

function getGroupState() {
  if (!window.shared || !window.shared.group) {
    return null;
  }

  return window.shared.group;
}

function getSharedData() {
  const room = window.shared || {};

  // During migration, fall back to the old root-level
  // drawing if the Group section is not ready yet.

  const group = room.group || room;

  return {
    strokes: Array.isArray(group.strokes)
      ? group.strokes
      : [],

    version: Number(group.version) || 0,

    turnCount: Number(group.turnCount) || 0,

    lastAction: group.lastAction || "created"
  };
}

// --------------------------------------------------
// RESIZE
// --------------------------------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  if (activeMode === "group") {
    updateLayout();
    createWaitingBubbles();
  }
}
