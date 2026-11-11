
/*
  BUBBLE POP — PLAYTEST 1
  Collaborative drawing passed between phones.

  Room: a1-glade
  App: bubble-pop

  Playtest sequence:
  1. Person A starts the drawing.
  2. Person B receives it and adds to it, or passes.
  3. Person C receives the latest version and adds to it, or passes.
  4. Continue passing the drawing between participants.

  IMPORTANT:
  Only one person should take a turn at a time.
  The facilitator guides the order manually.
*/

// --------------------------------------------------
// SHARE SETTINGS
// --------------------------------------------------

const SHARE_HOST = "https://p5-phone-share.npuckett.workers.dev";
const SHARE_ROOM = "a1-glade";
const SHARE_APP = "bubble-pop";

// This is the starting state for a new shared room.
// Existing room state is not automatically erased.
const INITIAL_SHARED_STATE = {
  strokes: [],
  version: 0,
  turnCount: 0,
  lastAction: "created"
};

// --------------------------------------------------
// LOCAL VARIABLES
// --------------------------------------------------

let drawingMode = false;
let localStrokes = [];
let currentStroke = null;

let canvasArea;
let leftButton;
let rightButton;

let message = "Waiting for the room...";
let lastConnectionState = false;

// Visual settings
const BACKGROUND = "#F3F0E9";
const PAPER = "#FFFFFF";
const INK = "#252525";
const MUTED = "#77736E";
const ACCENT = "#596D80";
const BORDER = "#DCD8D0";

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(1);
  textFont("Georgia");
  angleMode(DEGREES);

  // Configure the shared room.
  shareSetup({
    host: SHARE_HOST,
    room: SHARE_ROOM,
    app: SHARE_APP,
    shared: INITIAL_SHARED_STATE,
    me: {
      role: "participant"
    }
  });

  // Show a QR code when the sketch is opened on a computer.
  showDesktopQr({
    label: "Scan to join Bubble Pop"
  });

  // Each phone joins through a tap.
  enableShareTap({
    label: "Tap to join Bubble Pop"
  });

  updateLayout();
}

// Called when the room has connected and its shared state is ready.
function shareReady() {
  message = "You're connected. Waiting for your turn.";
}

// --------------------------------------------------
// MAIN DRAW LOOP
// --------------------------------------------------

function draw() {
  background(BACKGROUND);

  updateLayout();

  drawHeader();
  drawDrawingArea();
  drawSharedArtwork();
  drawLocalArtwork();
  drawFooter();
}

// --------------------------------------------------
// LAYOUT
// --------------------------------------------------

function updateLayout() {
  const areaTop = 125;
  const areaBottom = height - 105;

  canvasArea = {
    x: 18,
    y: areaTop,
    w: width - 36,
    h: max(100, areaBottom - areaTop)
  };

  const buttonY = height - 76;
  const buttonH = 54;
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
}

// --------------------------------------------------
// HEADER
// --------------------------------------------------

function drawHeader() {
  noStroke();
  fill(INK);

  textAlign(LEFT, TOP);
  textSize(25);
  text("bubble pop", 20, 18);

  textSize(12);
  fill(MUTED);
  text("A drawing passed between people.", 21, 51);

  // Shared room connection status.
  const connected = Boolean(window.shareConnected);

  textAlign(RIGHT, TOP);
  textSize(11);

  if (connected) {
    fill("#55765D");
    text("CONNECTED", width - 20, 23);
  } else {
    fill("#A46B55");
    text("CONNECTING...", width - 20, 23);
  }

  // Version and turn information.
  const data = getSharedData();

  textAlign(LEFT, TOP);
  fill(MUTED);
  textSize(12);

  text(
    "Version " + data.version + "  ·  " +
    data.turnCount + " turns",
    21,
    82
  );
}

// --------------------------------------------------
// DRAWING AREA
// --------------------------------------------------

function drawDrawingArea() {
  // White paper background.
  noStroke();
  fill(PAPER);

  rect(
    canvasArea.x,
    canvasArea.y,
    canvasArea.w,
    canvasArea.h,
    12
  );

  // Light border.
  noFill();
  stroke(BORDER);
  strokeWeight(1);

  rect(
    canvasArea.x,
    canvasArea.y,
    canvasArea.w,
    canvasArea.h,
    12
  );

  noStroke();

  // Instructions inside an empty drawing area.
  const data = getSharedData();

  if (data.strokes.length === 0 && localStrokes.length === 0) {
    fill("#B0AAA1");
    textAlign(CENTER, CENTER);
    textSize(17);
    text(
      "A drawing will begin here.",
      width / 2,
      canvasArea.y + canvasArea.h / 2
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
// DRAW A STROKE
// --------------------------------------------------

function drawStroke(strokeData) {
  if (!strokeData || !strokeData.points) return;

  const points = strokeData.points;

  if (points.length === 0) return;

  stroke(strokeData.color || INK);
  strokeWeight(strokeData.weight || 4);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  if (points.length === 1) {
    const px = canvasArea.x + points[0].x * canvasArea.w;
    const py = canvasArea.y + points[0].y * canvasArea.h;

    fill(strokeData.color || INK);
    noStroke();

    circle(px, py, strokeData.weight || 4);
    return;
  }

  beginShape();

  for (const point of points) {
    const px = canvasArea.x + point.x * canvasArea.w;
    const py = canvasArea.y + point.y * canvasArea.h;

    vertex(px, py);
  }

  endShape();
}

// --------------------------------------------------
// FOOTER / BUTTONS
// --------------------------------------------------

function drawFooter() {
  const connected = Boolean(window.shareConnected);

  drawButton(
    leftButton,
    drawingMode ? "DRAWING..." : "MY TURN",
    drawingMode,
    connected
  );

  drawButton(
    rightButton,
    drawingMode ? "FINISH TURN" : "PASS",
    false,
    connected
  );

  // Small instruction beneath the buttons.
  fill(MUTED);
  textAlign(CENTER, TOP);
  textSize(10);

  if (drawingMode) {
    text(
      "Draw on the paper, then finish your turn.",
      width / 2,
      height - 17
    );
  } else {
    text(
      "Wait until the facilitator calls on you.",
      width / 2,
      height - 17
    );
  }
}

function drawButton(button, label, active, connected) {
  noStroke();

  if (!connected) {
    fill("#D6D2CB");
  } else if (active) {
    fill("#8494A1");
  } else {
    fill(ACCENT);
  }

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    10
  );

  fill("#FFFFFF");
  textAlign(CENTER, CENTER);
  textSize(13);

  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );
}

// --------------------------------------------------
// TOUCH / MOUSE INPUT
// --------------------------------------------------

function mousePressed() {
  // Do nothing until connected.
  if (!window.shareConnected) return;

  // Left button: begin a turn.
  if (insideButton(mouseX, mouseY, leftButton)) {
    if (!drawingMode) {
      startTurn();
    }
    return;
  }

  // Right button: finish or pass.
  if (insideButton(mouseX, mouseY, rightButton)) {
    if (drawingMode) {
      finishTurn();
    } else {
      passTurn();
    }
    return;
  }

  // Start a drawing stroke.
  if (drawingMode && insideDrawingArea(mouseX, mouseY)) {
    currentStroke = {
      color: INK,
      weight: 4,
      points: []
    };

    addDrawingPoint(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (!drawingMode || !currentStroke) return;

  if (insideDrawingArea(mouseX, mouseY)) {
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
// DRAWING HELPERS
// --------------------------------------------------

function addDrawingPoint(x, y) {
  if (!currentStroke) return;

  // Store points as normalized values.
  // This allows drawings to scale between different phone sizes.

  const normalizedX = constrain(
    (x - canvasArea.x) / canvasArea.w,
    0,
    1
  );

  const normalizedY = constrain(
    (y - canvasArea.y) / canvasArea.h,
    0,
    1
  );

  currentStroke.points.push({
    x: normalizedX,
    y: normalizedY
  });
}

function insideDrawingArea(x, y) {
  return (
    x >= canvasArea.x &&
    x <= canvasArea.x + canvasArea.w &&
    y >= canvasArea.y &&
    y <= canvasArea.y + canvasArea.h
  );
}

function insideButton(x, y, button) {
  return (
    x >= button.x &&
    x <= button.x + button.w &&
    y >= button.y &&
    y <= button.y + button.h
  );
}

// --------------------------------------------------
// TURN SYSTEM
// --------------------------------------------------

function startTurn() {
  if (!window.shareConnected) return;

  drawingMode = true;
  localStrokes = [];
  currentStroke = null;

  message = "You're editing the shared drawing.";
}

function finishTurn() {
  if (!window.shareConnected) return;

  // Include the final stroke if the pointer is still down.
  if (currentStroke && currentStroke.points.length > 0) {
    localStrokes.push(currentStroke);
  }

  currentStroke = null;

  const data = getSharedData();

  // Only update the shared artwork if something was drawn.
  if (localStrokes.length > 0) {
    const updatedStrokes = data.strokes.concat(localStrokes);

    window.shared.strokes = updatedStrokes;
    window.shared.version = data.version + 1;
    window.shared.lastAction = "edited";
  } else {
    // A turn can be completed without changing the drawing.
    window.shared.lastAction = "passed";
  }

  window.shared.turnCount = data.turnCount + 1;

  // Return to observation mode.
  drawingMode = false;
  localStrokes = [];
  currentStroke = null;

  message = "Your turn is finished. Pass the phone's turn to someone else.";
}

function passTurn() {
  if (!window.shareConnected) return;

  const data = getSharedData();

  window.shared.lastAction = "passed";
  window.shared.turnCount = data.turnCount + 1;

  message = "You passed. The drawing stays unchanged.";
}

// --------------------------------------------------
// SHARED DATA
// --------------------------------------------------

function getSharedData() {
  const room = window.shared || {};

  return {
    strokes: Array.isArray(room.strokes) ? room.strokes : [],
    version: Number(room.version) || 0,
    turnCount: Number(room.turnCount) || 0,
    lastAction: room.lastAction || "created"
  };
}

// --------------------------------------------------
// RESIZE
// --------------------------------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}
