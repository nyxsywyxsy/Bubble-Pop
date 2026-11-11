
/*
  BUBBLE POP — COLLABORATIVE PLAYTEST

  Shared drawing:
  - Circular drawing canvas
  - Shared between all phones
  - Persistent room state
  - Manual turn-taking

  Waiting interaction:
  - Floating bubbles around the canvas
  - Tap bubbles to pop them
  - New bubbles appear as others pop
  - Bubble popping is individual to each phone

  Room: a1-glade
  App: bubble-pop
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
// LOCAL VARIABLES
// --------------------------------------------------

let drawingMode = false;

let localStrokes = [];
let currentStroke = null;

let canvasArea;

let leftButton;
let rightButton;

let waitingBubbles = [];
let bubblePopAnimations = [];

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
  console.log("Bubble Pop connected.");
}

// --------------------------------------------------
// MAIN DRAW LOOP
// --------------------------------------------------

function draw() {
  background(BACKGROUND);

  updateLayout();

  drawHeader();
  drawCanvasCircle();

  drawSharedArtwork();
  drawLocalArtwork();

  // Bubbles are individual interactions.
  // They appear while someone is waiting.
  if (!drawingMode) {
    updateWaitingBubbles();
    drawWaitingBubbles();
    drawBubblePopAnimations();
  }

  drawFooter();
}

// --------------------------------------------------
// LAYOUT
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

  // Dark circular drawing surface.
  noStroke();
  fill(PAPER);

  circle(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter
  );

  // Outer border.
  noFill();
  stroke(BORDER);
  strokeWeight(1.2);

  circle(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter
  );

  // Subtle bubble-like highlight.
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

  // Clip everything to the circular canvas.
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

    circle(px, py, strokeData.weight || STROKE_WEIGHT);
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

  // Try to find a position outside the main circle.
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

  // Fallback position if the screen is too small.
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

    // Gentle upward movement.
    b.y -= b.speed;

    // Gentle sideways movement.
    b.x += sin(frameCount * 0.7 + b.phase) * b.drift;

    b.rotation += b.rotationSpeed;

    // Keep inside the screen horizontally.
    b.x = constrain(
      b.x,
      b.size / 2,
      width - b.size / 2
    );

    // Avoid floating through the drawing circle.
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

    // Reappear at the bottom.
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

  // Transparent dark interior.
  noStroke();
  fill(255, 255, 255, 8);

  circle(0, 0, b.size);

  // Iridescent bubble edge.
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

  // Main white reflection.
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

    // Small white particles.
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

      // Replace the popped bubble.
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
  if (!window.shareConnected) return;

  // First check whether a waiting bubble was tapped.
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

  // MY TURN
  if (insideButton(mouseX, mouseY, leftButton)) {
    if (!drawingMode) {
      startTurn();
    }

    return;
  }

  // FINISH / PASS
  if (insideButton(mouseX, mouseY, rightButton)) {
    if (drawingMode) {
      finishTurn();
    } else {
      passTurn();
    }

    return;
  }

  // Start a stroke inside the circular canvas.
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
    x >= button.x &&
    x <= button.x + button.w &&
    y >= button.y &&
    y <= button.y + button.h
  );
}

function addDrawingPoint(x, y) {
  if (!currentStroke) return;

  // Store normalized coordinates relative to the circle.
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

// --------------------------------------------------
// SHARED DATA
// --------------------------------------------------

function getSharedData() {
  const room = window.shared || {};

  return {
    strokes: Array.isArray(room.strokes)
      ? room.strokes
      : [],

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

  // Reposition the bubbles for the new screen size.
  createWaitingBubbles();
}
