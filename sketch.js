
/*
  BUBBLE POP — PLAYTEST 1
  Collaborative drawing passed between phones.

  Room: a1-glade
  App: bubble-pop

  Features:
  - Shared drawing across phones
  - Persistent room state
  - Turn-by-turn drawing and passing
  - End session / reset room
  - Black and white visual style
*/

// --------------------------------------------------
// SHARE SETTINGS
// --------------------------------------------------

const SHARE_HOST = "https://p5-phone-share.npuckett.workers.dev";
const SHARE_ROOM = "a1-glade";
const SHARE_APP = "bubble-pop";

const INITIAL_SHARED_STATE = {
  strokes: [],
  version: 0,
  turnCount: 0,
  lastAction: "created"
};

// --------------------------------------------------
// COLOURS
// --------------------------------------------------

const BACKGROUND = "#000000";
const PAPER = "#101010";
const INK = "#FFFFFF";
const WHITE = "#FFFFFF";
const MUTED = "#B5B5B5";
const BORDER = "#555555";
const BUTTON = "#FFFFFF";
const BUTTON_TEXT = "#000000";

// --------------------------------------------------
// LOCAL VARIABLES
// --------------------------------------------------

let drawingMode = false;
let localStrokes = [];
let currentStroke = null;

let canvasArea;
let leftButton;
let middleButton;
let endButton;

let endSessionArmed = false;

let message = "Waiting for the room...";

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Use the device's display density for sharper text.
  // Do not force pixelDensity(1), which can blur text
  // on high-density phone screens.
  pixelDensity(displayDensity());

  textFont("Arial");
  angleMode(DEGREES);

  // Set up shared room and enable persistence.
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

  showDesktopQr({
    label: "Scan to join Bubble Pop"
  });

  enableShareTap({
    label: "Tap to join Bubble Pop"
  });

  updateLayout();
}

// --------------------------------------------------
// SHARE CALLBACK
// --------------------------------------------------

function shareReady() {
  message = "Connected";
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
  const areaBottom = height - 120;

  canvasArea = {
    x: 18,
    y: areaTop,
    w: width - 36,
    h: max(100, areaBottom - areaTop)
  };

  const buttonY = height - 85;
  const buttonH = 52;
  const gap = 7;
  const buttonW = (width - 36 - gap * 2) / 3;

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

  endButton = {
    x: 18 + (buttonW + gap) * 2,
    y: buttonY,
    w: buttonW,
    h: buttonH
  };
}

// --------------------------------------------------
// HEADER
// --------------------------------------------------

function drawHeader() {
  const data = getSharedData();

  noStroke();
  fill(WHITE);

  textAlign(LEFT, TOP);
  textSize(25);
  text("bubble pop", 20, 18);

  textSize(13);
  fill(MUTED);
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
    "Version " + data.version + "   ·   " +
    data.turnCount + " turns",
    21,
    88
  );
}

// --------------------------------------------------
// DRAWING AREA
// --------------------------------------------------

function drawDrawingArea() {
  noStroke();
  fill(PAPER);

  rect(
    canvasArea.x,
    canvasArea.y,
    canvasArea.w,
    canvasArea.h,
    10
  );

  noFill();
  stroke(BORDER);
  strokeWeight(1);

  rect(
    canvasArea.x,
    canvasArea.y,
    canvasArea.w,
    canvasArea.h,
    10
  );

  const data = getSharedData();

  if (data.strokes.length === 0 && localStrokes.length === 0) {
    noStroke();
    fill(MUTED);

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

    noStroke();
    fill(strokeData.color || INK);

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
    drawingMode ? "DRAWING" : "MY TURN",
    connected
  );

  drawButton(
    middleButton,
    drawingMode ? "FINISH" : "PASS",
    connected
  );

  drawButton(
    endButton,
    endSessionArmed ? "CONFIRM?" : "END SESSION",
    connected
  );

  fill(MUTED);
  noStroke();

  textAlign(CENTER, TOP);
  textSize(12);

  if (drawingMode) {
    text(
      "Draw on the paper, then finish your turn.",
      width / 2,
      height - 23
    );
  } else if (endSessionArmed) {
    text(
      "Tap CONFIRM? again to erase this session.",
      width / 2,
      height - 23
    );
  } else {
    text(
      "Wait until the facilitator calls on you.",
      width / 2,
      height - 23
    );
  }
}

function drawButton(button, label, connected) {
  noStroke();

  if (!connected) {
    fill("#555555");
  } else {
    fill(BUTTON);
  }

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    8
  );

  fill(connected ? BUTTON_TEXT : WHITE);

  textAlign(CENTER, CENTER);
  textSize(12);

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
  if (!window.shareConnected) return;

  // END SESSION
  if (insideButton(mouseX, mouseY, endButton)) {
    if (endSessionArmed) {
      endSession();
    } else {
      endSessionArmed = true;
    }

    return;
  }

  // Any other action cancels the end-session confirmation.
  endSessionArmed = false;

  // MY TURN
  if (insideButton(mouseX, mouseY, leftButton)) {
    if (!drawingMode) {
      startTurn();
    }

    return;
  }

  // FINISH / PASS
  if (insideButton(mouseX, mouseY, middleButton)) {
    if (drawingMode) {
      finishTurn();
    } else {
      passTurn();
    }

    return;
  }

  // START DRAWING
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
}

function finishTurn() {
  if (!window.shareConnected) return;

  if (currentStroke && currentStroke.points.length > 0) {
    localStrokes.push(currentStroke);
  }

  currentStroke = null;

  const data = getSharedData();

  if (localStrokes.length > 0) {
    const updatedStrokes = data.strokes.concat(localStrokes);

    window.shared.strokes = updatedStrokes;
    window.shared.version = data.version + 1;
    window.shared.lastAction = "edited";
  } else {
    window.shared.lastAction = "passed";
  }

  window.shared.turnCount = data.turnCount + 1;

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

// --------------------------------------------------
// END SESSION
// --------------------------------------------------

function endSession() {
  if (!window.shareConnected) return;

  // Clear the drawing for EVERY phone in the room.
  // This also erases the server's saved copy.
  shareClear();

  // Reset local interface.
  drawingMode = false;
  localStrokes = [];
  currentStroke = null;
  endSessionArmed = false;
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
