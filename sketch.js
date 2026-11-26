
/*
  BUBBLE POP
  BUILD 1.1 — COLLECTIVE & ANONYMOUS

  A temporary creative ecosystem.

  COLLECTIVE:
  Participants take turns developing a shared artwork.
  Completed versions appear as floating preview bubbles.
  Tap a version bubble to expand it.
  Shake the phone to pop the preview.

  ANONYMOUS:
  Mystery bubbles continuously flow across the screen.

  Four types of bubbles:
  1. Collaborative artworks
  2. Original written prompts
  3. Independent prompt responses
  4. Free drawing bubbles

  Every Anonymous bubble displays a question mark.

  Collaborative artwork bubbles display the latest version.
  Prompt responses remain separate artworks.

  This is a complete, standalone sketch.js.
*/

// ==================================================
// SHARE CONNECTION
// ==================================================

const SHARE_HOST =
  "https://p5-phone-share.npuckett.workers.dev";

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

// ==================================================
// VISUAL SETTINGS
// ==================================================

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

// ==================================================
// ANONYMOUS BUBBLE SETTINGS
// ==================================================

const ANONYMOUS_BUBBLE_COUNT = 14;

// Only two bubbles offer unrestricted drawing.

const ANONYMOUS_FREE_COUNT = 2;

const ANONYMOUS_POP_DURATION = 350;

const ANONYMOUS_MIN_SIZE = 48;
const ANONYMOUS_MAX_SIZE = 92;

const ANONYMOUS_MIN_SPEED = 0.45;
const ANONYMOUS_MAX_SPEED = 1.15;

// ==================================================
// STARTING ARTWORKS
// ==================================================

const STARTING_ARTWORK_FILES = [
  "bubble-pop-starting-artwork-001.json",
  "bubble-pop-starting-artwork-002.json",
  "bubble-pop-starting-artwork-003.json",
  "bubble-pop-starting-artwork-004.json",
  "bubble-pop-starting-artwork-005.json"
];

// ==================================================
// WRITTEN PROMPTS
// ==================================================

/*
  Edit this list whenever you want to change
  the original written prompts.

  Each prompt remains unchanged when someone responds.
  Every response becomes its own independent bubble.
*/

const DEFAULT_PROMPTS = [
  "Draw your favourite food.",
  "Draw your favourite flower.",
  "Draw a person.",
  "Draw your favourite animal.",
  "Draw your pet.",
  "Draw a silly face.",
  "Draw your favourite fruit.",
  "Draw a funny-looking monster."
];

const FREE_DRAWING_PROMPT =
  "Draw anything you'd like.";

// ==================================================
// LOCAL APPLICATION STATE
// ==================================================

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
let worldwideBackButton = null;

let waitingBubbles = [];
let bubblePopAnimations = [];

let sharedStructureReady = false;

// ==================================================
// INITIAL MODE SELECTION
// ==================================================

let initialModeConfirmed = false;

let pendingModeSelection = null;
let pendingModeTime = 0;

let modeInputBlockedUntil = 0;

// ==================================================
// COLLECTIVE VERSION PREVIEW STATE
// ==================================================

let versionBubbles = [];
let seenVersionIds = new Set();

let activeVersionPreview = null;
let lastVersionShake = -10000;

// ==================================================
// DRAWING TOOL STATE
// ==================================================

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
// ANONYMOUS STATE
// ==================================================

/*
  The internal namespace remains "worldwide".

  This preserves compatibility with the existing
  shared room and imported artwork collection.
*/

let worldwidePage = "loading";

let worldwideSelected = null;
let worldwidePrompt = "";

let worldwideBase = null;
let worldwideMessage = "";

let worldwideVisited = new Set();

let worldwideSeedPending = null;
let worldwideSeedsLoaded = false;

let worldwideLocalColor = WHITE;
let worldwideLocalSize = 4;

const worldwideTools = {
  zoomLevel: MAX_ZOOM,

  get brushColor() {
    return getWorldwideState()?.brushColor ||
      worldwideLocalColor;
  },

  set brushColor(value) {
    worldwideLocalColor = value;

    const state = getWorldwideState();

    if (state) {
      state.brushColor = value;
    }
  },

  get brushSize() {
    return getWorldwideState()?.brushSize ||
      worldwideLocalSize;
  },

  set brushSize(value) {
    worldwideLocalSize = value;

    const state = getWorldwideState();

    if (state) {
      state.brushSize = value;
    }
  }
};

let anonymousBubbles = [];

let anonymousCollectionKey = "";

let anonymousMediaQueue = [];

let anonymousKnownMedia = new Set();

let anonymousPop = null;

let anonymousPurpose = "contribution";

let anonymousPrimaryButton = null;
let anonymousSecondaryButton = null;

let anonymousLoading = false;
let anonymousLastLoadAttempt = -10000;

let anonymousRevealTime = 0;
let anonymousLastShake = -10000;

let anonymousDrawingReturnPage = "view";

// ==================================================
// SETUP
// ==================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(displayDensity());

  textFont("Arial");
  angleMode(DEGREES);

  lockGestures();

  enableGyroTap(
    "Tap to enable motion sensors"
  );

  setShakeThreshold(
    VERSION_SHAKE_THRESHOLD
  );

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

  updateLayout();
  createWaitingBubbles();

  console.log(
    "Bubble Pop Build 1.1 — Collective & Anonymous"
  );
}

// ==================================================
// SHARE CONNECTION
// ==================================================

function shareReady() {
  ensureSharedStructure();

  console.log(
    "Bubble Pop connected."
  );
}

function connectToShare() {
  if (!window.shareConnected) {
    shareConnect();
  }
}

// ==================================================
// SHARED STATE MIGRATION
// ==================================================

function ensureSharedStructure() {
  const room = window.shared;

  if (
    !room ||
    typeof room !== "object"
  ) {
    return false;
  }

  const legacyStrokes =
    Array.isArray(room.strokes)
      ? room.strokes
      : [];

  const legacyVersion =
    Number(room.version) || 0;

  const legacyTurnCount =
    Number(room.turnCount) || 0;

  const legacyLastAction =
    room.lastAction || "created";

  const legacyHasData =
    legacyStrokes.length > 0 ||
    legacyVersion > 0 ||
    legacyTurnCount > 0;

  if (
    !room.group ||
    typeof room.group !== "object"
  ) {
    room.group = {};
  }

  const group = room.group;

  const groupHasData =
    (
      Array.isArray(group.strokes) &&
      group.strokes.length > 0
    ) ||
    (Number(group.version) || 0) > 0 ||
    (Number(group.turnCount) || 0) > 0;

  if (
    legacyHasData &&
    !groupHasData
  ) {
    group.strokes = legacyStrokes;
    group.version = legacyVersion;
    group.turnCount = legacyTurnCount;
    group.lastAction = legacyLastAction;
  }

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
    group.brushColor = WHITE;
  }

  if (typeof group.brushSize !== "number") {
    group.brushSize = 4;
  }

  if (
    typeof group.bubblePopCount !== "number"
  ) {
    group.bubblePopCount = 0;
  }

  if (
    typeof group.sessionActive !== "boolean"
  ) {
    group.sessionActive = true;
  }

  if (
    group.zoomSetupVersion !==
    ZOOM_SETUP_VERSION
  ) {
    group.zoomLevel = MAX_ZOOM;

    group.zoomSetupVersion =
      ZOOM_SETUP_VERSION;
  }

  if (typeof group.zoomLevel !== "number") {
    group.zoomLevel = MAX_ZOOM;
  }

  group.zoomLevel = constrain(
    group.zoomLevel,
    MIN_ZOOM,
    MAX_ZOOM
  );

  // Anonymous shared state.

  if (
    !room.worldwide ||
    typeof room.worldwide !== "object"
  ) {
    room.worldwide = {};
  }

  const worldwide = room.worldwide;

  if (
    !Array.isArray(worldwide.artworks)
  ) {
    worldwide.artworks = [];
  }

  if (
    !Array.isArray(worldwide.prompts)
  ) {
    worldwide.prompts = [];
  }

  if (!worldwide.brushColor) {
    worldwide.brushColor = WHITE;
  }

  if (
    typeof worldwide.brushSize !== "number"
  ) {
    worldwide.brushSize = 4;
  }

  if (
    typeof worldwide.bubblePopCount !==
    "number"
  ) {
    worldwide.bubblePopCount = 0;
  }

  if (
    worldwide.zoomSetupVersion !==
    ZOOM_SETUP_VERSION
  ) {
    worldwide.zoomLevel = MAX_ZOOM;

    worldwide.zoomSetupVersion =
      ZOOM_SETUP_VERSION;
  }

  if (
    typeof worldwide.zoomLevel !== "number"
  ) {
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

// ==================================================
// SHARED STATE HELPERS
// ==================================================

const fallbackToolSettings = {
  brushColor: WHITE,
  brushSize: 4,
  zoomLevel: MAX_ZOOM
};

function getActiveToolSettings() {
  if (activeMode === "worldwide") {
    return worldwideTools;
  }

  return window.shared?.group ||
    fallbackToolSettings;
}

function getGroupState() {
  return window.shared?.group || null;
}

function getWorldwideState() {
  return window.shared?.worldwide || null;
}

function getSharedData() {
  const room = window.shared || {};
  const group = room.group || room;

  return {
    strokes:
      Array.isArray(group.strokes)
        ? group.strokes
        : [],

    version:
      Number(group.version) || 0,

    turnCount:
      Number(group.turnCount) || 0,

    lastAction:
      group.lastAction || "created",

    versions:
      Array.isArray(group.versions)
        ? group.versions
        : []
  };
}

function cloneData(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}

// ==================================================
// MAIN DRAW LOOP
// ==================================================

function draw() {
  background(BACKGROUND);

  if (
    window.shareConnected &&
    !sharedStructureReady
  ) {
    ensureSharedStructure();
  }

  updateBrushSizeFromTilt();

  if (activeMode === "menu") {
    drawModeSelection();
    return;
  }

  updateLayout();

  if (activeMode === "worldwide") {
    drawAnonymous();
    return;
  }

  if (activeMode === "group") {
    syncVersionBubbles();

    drawHeader();
    drawCanvasCircle();
    drawSharedArtwork();
    drawLocalArtwork();

    if (
      drawingMode &&
      eraserMode
    ) {
      drawEraserCursor();
    }

    if (
      !drawingMode &&
      !activeVersionPreview
    ) {
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

// ==================================================
// MAIN MENU
// ==================================================

function drawModeSelection() {
  const buttonWidth =
    min(width - 48, 360);

  const buttonHeight = 76;
  const gap = 13;

  const x =
    (width - buttonWidth) / 2;

  const totalHeight =
    buttonHeight * 2 + gap;

  const startY =
    height / 2 -
    totalHeight / 2 +
    30;

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

  textSize(
    min(40, width * 0.1)
  );

  text(
    "bubble pop",
    width / 2,
    startY - 85
  );

  fill(MUTED);
  textSize(14);

  text(
    "Choose your experience",
    width / 2,
    startY - 50
  );

  drawMenuCard(
    groupMenuButton,
    "COLLECTIVE",
    "Develop a shared artwork together."
  );

  drawMenuCard(
    worldwideMenuButton,
    "ANONYMOUS",
    "Explore an evolving collection of artworks."
  );

  if (
    !initialModeConfirmed &&
    pendingModeSelection
  ) {
    const selectedButton =
      pendingModeSelection === "group"
        ? groupMenuButton
        : worldwideMenuButton;

    push();

    noFill();
    stroke("#B69BFF");
    strokeWeight(2);

    rect(
      selectedButton.x,
      selectedButton.y,
      selectedButton.w,
      selectedButton.h,
      14
    );

    pop();
  }

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(11);

  let instruction =
    "Every session creates something different.";

  if (!initialModeConfirmed) {
    if (pendingModeSelection) {
      instruction =
        "Tap again to enter " +
        (
          pendingModeSelection === "group"
            ? "Collective"
            : "Anonymous"
        );
    } else {
      instruction =
        "Tap twice to choose your experience.";
    }
  }

  text(
    instruction,
    width / 2,
    startY + totalHeight + 30
  );

  textSize(10);

  text(
    window.shareConnected
      ? "CONNECTED"
      : "TAP A MODE TO JOIN",

    width / 2,
    height - 20
  );
}

function drawMenuCard(
  button,
  heading,
  description
) {
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
  textSize(16);

  text(
    heading,
    button.x + button.w / 2,
    button.y + 25
  );

  fill(MUTED);
  textSize(11);

  text(
    description,
    button.x + button.w / 2,
    button.y + 51
  );

  pop();
}

// ==================================================
// MODE ENTRY
// ==================================================

function handleModeSelection(x, y) {
  if (
    millis() <
    modeInputBlockedUntil
  ) {
    return;
  }

  let selectedMode = null;

  if (
    insideButton(
      x,
      y,
      groupMenuButton
    )
  ) {
    selectedMode = "group";
  }

  if (
    insideButton(
      x,
      y,
      worldwideMenuButton
    )
  ) {
    selectedMode = "worldwide";
  }

  if (!selectedMode) {
    pendingModeSelection = null;
    return;
  }

  // Initial entry still requires two deliberate taps.

  if (!initialModeConfirmed) {
    const elapsed =
      millis() - pendingModeTime;

    if (
      pendingModeSelection !== selectedMode ||
      elapsed > 6000
    ) {
      pendingModeSelection =
        selectedMode;

      pendingModeTime =
        millis();

      return;
    }

    if (elapsed < 180) {
      return;
    }

    initialModeConfirmed = true;

    pendingModeSelection = null;
  }

  connectToShare();

  if (selectedMode === "group") {
    enterCollective();
  } else {
    enterAnonymous();
  }
}

function enterCollective() {
  activeMode = "group";

  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  brushAdjustmentActive = false;
  brushPermissionPending = false;

  activeVersionPreview = null;

  bubblePopAnimations = [];

  updateLayout();
  createWaitingBubbles();
}

function enterAnonymous() {
  activeMode = "worldwide";

  resetAnonymousDrawing();

  worldwidePage = "loading";

  worldwideMessage = "";

  anonymousBubbles = [];
  anonymousCollectionKey = "";

  anonymousMediaQueue = [];
  anonymousKnownMedia = new Set();

  anonymousPop = null;

  anonymousLastLoadAttempt = -10000;

  anonymousPurpose = "contribution";

  bubblePopAnimations = [];

  updateLayout();
}

function returnToModes() {
  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  brushAdjustmentActive = false;
  brushPermissionPending = false;

  activeVersionPreview = null;
  anonymousPop = null;

  activeMode = "menu";
}

// ==================================================
// LAYOUT
// ==================================================

function updateLayout() {
  const areaTop = 125;
  const areaBottom = height - 245;

  const availableHeight =
    max(
      180,
      areaBottom - areaTop
    );

  const baseDiameter =
    max(
      180,
      min(
        width - 72,
        availableHeight * 0.88
      )
    );

  canvasArea = {
    x: width / 2,

    y:
      (areaTop + areaBottom) / 2,

    radius:
      baseDiameter / 2,

    diameter:
      baseDiameter,

    baseDiameter
  };

  const buttonY = height - 84;
  const buttonH = 50;
  const gap = 10;

  const buttonW =
    (width - 36 - gap) / 2;

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

  worldwideBackButton = {
    ...modeButton
  };

  paletteButtons = [];

  const swatchSize =
    min(
      27,
      (width - 66) / 10
    );

  const swatchGap =
    max(
      3,
      min(
        8,
        (
          width -
          66 -
          swatchSize * 8
        ) / 7
      )
    );

  const paletteWidth =
    swatchSize * 8 +
    swatchGap * 7;

  const paletteStartX =
    (width - paletteWidth) / 2;

  const paletteY =
    height - 215;

  for (
    let i = 0;
    i < DRAWING_PALETTE.length;
    i++
  ) {
    paletteButtons.push({
      x:
        paletteStartX +
        i * (swatchSize + swatchGap),

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
}

// ==================================================
// BUTTON DRAWING
// ==================================================

function drawSmallTextButton(
  button,
  label
) {
  if (!button) return;

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
    8
  );

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

function drawButton(
  button,
  label
) {
  if (!button) return;

  push();

  rectMode(CORNER);
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
      ? BACKGROUND
      : WHITE
  );

  textAlign(CENTER, CENTER);
  textSize(13);

  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );

  pop();
}

function drawSecondaryButton(
  button,
  label
) {
  if (!button) return;

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
    8
  );

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(12);

  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );

  pop();
}

// ==================================================
// COLLECTIVE HEADER
// ==================================================

function drawHeader() {
  const data = getSharedData();

  noStroke();
  fill(WHITE);
  textAlign(LEFT, TOP);
  textSize(25);

  text(
    "bubble pop",
    20,
    18
  );

  fill(MUTED);
  textSize(13);

  text(
    "Collective",
    21,
    53
  );

  textAlign(RIGHT, TOP);
  textSize(12);

  fill(
    window.shareConnected
      ? WHITE
      : MUTED
  );

  text(
    window.shareConnected
      ? "CONNECTED"
      : "CONNECTING...",

    width - 20,
    25
  );

  if (!drawingMode) {
    drawSmallTextButton(
      modeButton,
      "MODES"
    );
  }

  textAlign(LEFT, TOP);
  fill(MUTED);
  textSize(13);

  text(
    "Version " +
    data.version +
    " · " +
    data.turnCount +
    " turns",

    21,
    88
  );

  textSize(11);

  text(
    "Bubbles popped: " +
    (
      getGroupState()?.bubblePopCount ||
      0
    ),

    21,
    105
  );
}

// ==================================================
// DRAWING CANVAS
// ==================================================

function drawCircleBackground() {
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

  pop();
}

function drawCanvasCircle() {
  drawCircleBackground();

  const data = getSharedData();

  if (
    data.strokes.length === 0 &&
    localStrokes.length === 0 &&
    !currentStroke
  ) {
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

  for (
    const strokeData of data.strokes
  ) {
    drawStroke(strokeData);
  }
}

function drawLocalArtwork() {
  for (
    const strokeData of localStrokes
  ) {
    drawStroke(strokeData);
  }

  if (currentStroke) {
    drawStroke(currentStroke);
  }
}

// ==================================================
// STROKE RENDERING
// ==================================================

function drawStroke(
  strokeData,
  zoomOverride,
  targetArea
) {
  if (
    !strokeData ||
    !Array.isArray(strokeData.points) ||
    strokeData.points.length === 0
  ) {
    return;
  }

  const points = strokeData.points;

  const area =
    targetArea || canvasArea;

  const zoom =
    constrain(
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

  stroke(
    strokeData.color || WHITE
  );

  strokeWeight(
    strokeData.weight || 4
  );

  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  if (points.length === 1) {
    const px =
      area.x +
      (points[0].x - 0.5) *
      area.baseDiameter *
      zoom;

    const py =
      area.y +
      (points[0].y - 0.5) *
      area.baseDiameter *
      zoom;

    noStroke();

    fill(
      strokeData.color || WHITE
    );

    circle(
      px,
      py,
      strokeData.weight || 4
    );
  } else {
    beginShape();

    for (const point of points) {
      const px =
        area.x +
        (point.x - 0.5) *
        area.baseDiameter *
        zoom;

      const py =
        area.y +
        (point.y - 0.5) *
        area.baseDiameter *
        zoom;

      vertex(px, py);
    }

    endShape();
  }

  drawingContext.restore();

  pop();
}

// ==================================================
// DRAWING TOOLS
// ==================================================

function drawSharedToolControls() {
  const settings =
    getActiveToolSettings();

  // Colour palette.

  for (
    let i = 0;
    i < paletteButtons.length;
    i++
  ) {
    const button =
      paletteButtons[i];

    const selected =
      settings.brushColor ===
      DRAWING_PALETTE[i].color;

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

    fill(
      DRAWING_PALETTE[i].color
    );

    circle(
      button.x + button.w / 2,
      button.y + button.h / 2,
      button.w
    );

    pop();
  }

  // Brush size and tilt control.

  push();

  rectMode(CORNER);

  stroke(
    brushAdjustmentActive
      ? "#FFE66D"
      : BORDER
  );

  strokeWeight(
    brushAdjustmentActive
      ? 2
      : 1
  );

  fill(
    brushAdjustmentActive
      ? "#29251A"
      : PAPER
  );

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

    brushSizeButton.x +
      brushSizeButton.w / 2,

    brushSizeButton.y +
      brushSizeButton.h / 2
  );

  pop();

  const ratio =
    constrain(
      (
        settings.brushSize -
        MIN_BRUSH_SIZE
      ) /
      (
        MAX_BRUSH_SIZE -
        MIN_BRUSH_SIZE
      ),

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

  fill(
    brushAdjustmentActive
      ? "#FFE66D"
      : WHITE
  );

  rect(
    brushSizeTrack.x,
    brushSizeTrack.y,
    brushSizeTrack.w * ratio,
    brushSizeTrack.h,
    4
  );

  circle(
    brushSizeTrack.x +
      brushSizeTrack.w * ratio,

    brushSizeTrack.y +
      brushSizeTrack.h / 2,

    12
  );

  fill(MUTED);
  textAlign(LEFT, CENTER);
  textSize(10);

  text(
    "SIZE " +
    Math.round(
      settings.brushSize
    ),

    brushSizeTrack.x,
    brushSizeTrack.y + 17
  );

  if (drawingMode) {
    drawEraserButton();
  }

  const zoomAllowed =
    drawingMode;

  drawZoomButton(
    zoomOutButton,
    "−",
    zoomAllowed
  );

  drawZoomButton(
    zoomInButton,
    "+",
    zoomAllowed
  );

  fill(
    zoomAllowed
      ? MUTED
      : "#666666"
  );

  textAlign(CENTER, CENTER);
  textSize(10);

  text(
    zoomAllowed
      ? Math.round(
          (
            settings.zoomLevel ||
            MAX_ZOOM
          ) * 100
        ) + "%"
      : "TURN ONLY",

    width - 63,
    height - 128
  );
}

// ==================================================
// ERASER BUTTON
// ==================================================

function drawEraserButton() {
  push();

  rectMode(CORNER);

  stroke(
    eraserMode
      ? "#FFE66D"
      : BORDER
  );

  strokeWeight(
    eraserMode
      ? 2
      : 1
  );

  fill(
    eraserMode
      ? "#29251A"
      : PAPER
  );

  rect(
    eraserButton.x,
    eraserButton.y,
    eraserButton.w,
    eraserButton.h,
    7
  );

  noStroke();

  fill(
    eraserMode
      ? "#FFE66D"
      : WHITE
  );

  textAlign(CENTER, CENTER);
  textSize(11);

  text(
    eraserMode
      ? "ON"
      : "ER",

    eraserButton.x +
      eraserButton.w / 2,

    eraserButton.y +
      eraserButton.h / 2
  );

  pop();
}

// ==================================================
// ZOOM BUTTONS
// ==================================================

function drawZoomButton(
  button,
  label,
  enabled
) {
  push();

  rectMode(CORNER);

  stroke(
    enabled
      ? BORDER
      : "#333333"
  );

  strokeWeight(1);

  fill(
    enabled
      ? PAPER
      : "#080808"
  );

  rect(
    button.x,
    button.y,
    button.w,
    button.h,
    7
  );

  noStroke();

  fill(
    enabled
      ? WHITE
      : "#555555"
  );

  textAlign(CENTER, CENTER);
  textSize(20);

  text(
    label,

    button.x +
      button.w / 2,

    button.y +
      button.h / 2 -
      1
  );

  pop();
}

// ==================================================
// DRAWING TOOL INPUT
// ==================================================

function handleToolControlPress(
  x,
  y
) {
  const settings =
    getActiveToolSettings();

  for (
    let i = 0;
    i < paletteButtons.length;
    i++
  ) {
    if (
      insideButton(
        x,
        y,
        paletteButtons[i]
      )
    ) {
      settings.brushColor =
        DRAWING_PALETTE[i].color;

      return true;
    }
  }

  if (
    insideButton(
      x,
      y,
      brushSizeButton
    )
  ) {
    if (brushAdjustmentActive) {
      brushAdjustmentActive = false;
      brushPermissionPending = false;
    } else if (
      window.sensorsEnabled
    ) {
      brushAdjustmentActive = true;

      tiltBaseline = rotationY;
    } else {
      brushPermissionPending = true;

      enableGyroTap(
        "Tap to enable tilt controls"
      );
    }

    return true;
  }

  const sliderHitArea = {
    x: brushSizeTrack.x,
    y: brushSizeTrack.y - 10,
    w: brushSizeTrack.w,
    h: 28
  };

  if (
    insideButton(
      x,
      y,
      sliderHitArea
    )
  ) {
    const ratio =
      constrain(
        (
          x -
          brushSizeTrack.x
        ) /
        brushSizeTrack.w,

        0,
        1
      );

    settings.brushSize =
      Math.round(
        map(
          ratio,
          0,
          1,
          MIN_BRUSH_SIZE,
          MAX_BRUSH_SIZE
        )
      );

    brushAdjustmentActive = false;

    return true;
  }

  if (
    drawingMode &&
    insideButton(
      x,
      y,
      eraserButton
    )
  ) {
    mouseReleased();

    eraserMode =
      !eraserMode;

    brushAdjustmentActive = false;

    return true;
  }

  if (
    insideButton(
      x,
      y,
      zoomOutButton
    )
  ) {
    if (drawingMode) {
      settings.zoomLevel =
        max(
          MIN_ZOOM,

          (
            Number(settings.zoomLevel) ||
            MAX_ZOOM
          ) - ZOOM_STEP
        );
    }

    return true;
  }

  if (
    insideButton(
      x,
      y,
      zoomInButton
    )
  ) {
    if (drawingMode) {
      settings.zoomLevel =
        min(
          MAX_ZOOM,

          (
            Number(settings.zoomLevel) ||
            MAX_ZOOM
          ) + ZOOM_STEP
        );
    }

    return true;
  }

  return false;
}

// ==================================================
// TILT CONTROL
// ==================================================

function updateBrushSizeFromTilt() {
  if (
    !brushAdjustmentActive ||
    !window.sensorsEnabled ||
    !window.shareConnected
  ) {
    return;
  }

  let difference =
    rotationY - tiltBaseline;

  if (difference > 180) {
    difference -= 360;
  }

  if (difference < -180) {
    difference += 360;
  }

  difference =
    constrain(
      difference,
      -30,
      30
    );

  const newSize =
    Math.round(
      map(
        difference,
        -30,
        30,
        MIN_BRUSH_SIZE,
        MAX_BRUSH_SIZE
      )
    );

  const settings =
    getActiveToolSettings();

  if (
    settings.brushSize !==
    newSize
  ) {
    settings.brushSize =
      newSize;
  }
}

// ==================================================
// MOTION PERMISSION CALLBACK
// ==================================================

function userSetupComplete() {
  if (brushPermissionPending) {
    brushPermissionPending = false;
    brushAdjustmentActive = true;

    tiltBaseline = rotationY;
  }

  if (activeMode === "menu") {
    pendingModeSelection = null;
    pendingModeTime = 0;

    modeInputBlockedUntil =
      millis() + 500;
  }
}

// ==================================================
// LOCAL ERASER
// ==================================================

function getEraserRadius() {
  const settings =
    getActiveToolSettings();

  return max(
    12,

    (
      Number(settings.brushSize) ||
      4
    ) * 2.5
  );
}

function getStrokeScreenPoint(
  point
) {
  const zoom =
    constrain(
      Number(
        getActiveToolSettings().zoomLevel
      ) || MAX_ZOOM,

      MIN_ZOOM,
      MAX_ZOOM
    );

  return {
    x:
      canvasArea.x +
      (point.x - 0.5) *
      canvasArea.baseDiameter *
      zoom,

    y:
      canvasArea.y +
      (point.y - 0.5) *
      canvasArea.baseDiameter *
      zoom
  };
}

function distanceToSegment(
  px,
  py,
  ax,
  ay,
  bx,
  by
) {
  const dx = bx - ax;
  const dy = by - ay;

  if (
    dx === 0 &&
    dy === 0
  ) {
    return dist(
      px,
      py,
      ax,
      ay
    );
  }

  const t =
    constrain(
      (
        (px - ax) * dx +
        (py - ay) * dy
      ) /
      (
        dx * dx +
        dy * dy
      ),

      0,
      1
    );

  return dist(
    px,
    py,
    ax + t * dx,
    ay + t * dy
  );
}

function strokeTouchesEraser(
  strokeData,
  x,
  y
) {
  if (
    !strokeData ||
    !Array.isArray(strokeData.points) ||
    !strokeData.points.length
  ) {
    return false;
  }

  const radius =
    getEraserRadius() +
    (
      Number(strokeData.weight) ||
      4
    ) / 2;

  const points =
    strokeData.points;

  if (points.length === 1) {
    const point =
      getStrokeScreenPoint(
        points[0]
      );

    return dist(
      x,
      y,
      point.x,
      point.y
    ) <= radius;
  }

  for (
    let i = 0;
    i < points.length - 1;
    i++
  ) {
    const a =
      getStrokeScreenPoint(
        points[i]
      );

    const b =
      getStrokeScreenPoint(
        points[i + 1]
      );

    if (
      distanceToSegment(
        x,
        y,
        a.x,
        a.y,
        b.x,
        b.y
      ) <= radius
    ) {
      return true;
    }
  }

  return false;
}

function eraseLocalStrokesAt(
  x,
  y
) {
  if (
    !drawingMode ||
    !eraserMode
  ) {
    return;
  }

  for (
    let i = localStrokes.length - 1;
    i >= 0;
    i--
  ) {
    if (
      strokeTouchesEraser(
        localStrokes[i],
        x,
        y
      )
    ) {
      localStrokes.splice(
        i,
        1
      );
    }
  }

  if (
    currentStroke &&
    strokeTouchesEraser(
      currentStroke,
      x,
      y
    )
  ) {
    currentStroke = null;
  }
}

function drawEraserCursor() {
  if (
    !insideDrawingCircle(
      mouseX,
      mouseY
    )
  ) {
    return;
  }

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
// COLLECTIVE WAITING BUBBLES
// ==================================================

function createWaitingBubbles() {
  waitingBubbles = [];

  for (
    let i = 0;
    i < WAITING_BUBBLE_COUNT;
    i++
  ) {
    waitingBubbles.push(
      makeWaitingBubble()
    );
  }
}

function makeWaitingBubble() {
  const size =
    random(25, 55);

  let x = width / 2;
  let y = height / 2;

  let found = false;

  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {
    x =
      random(
        18 + size / 2,
        width - 18 - size / 2
      );

    y =
      random(
        110 + size / 2,

        max(
          140 + size / 2,
          height - 115 - size / 2
        )
      );

    if (
      !canvasArea ||

      dist(
        x,
        y,
        canvasArea.x,
        canvasArea.y
      ) >

      canvasArea.radius +
        size * 0.55
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

    speed:
      random(0.35, 1.15),

    phase:
      random(360),

    drift:
      random(0.2, 0.65),

    rotation:
      random(360),

    rotationSpeed:
      random(-0.35, 0.35),

    alpha:
      random(100, 190),

    popping: false
  };
}

function updateWaitingBubbles() {
  for (
    let i = 0;
    i < waitingBubbles.length;
    i++
  ) {
    const b =
      waitingBubbles[i];

    if (b.popping) {
      continue;
    }

    b.y -= b.speed;

    b.x +=
      sin(
        frameCount * 0.7 +
        b.phase
      ) * b.drift;

    b.rotation +=
      b.rotationSpeed;

    b.x =
      constrain(
        b.x,
        b.size / 2,
        width - b.size / 2
      );

    if (
      canvasArea &&

      dist(
        b.x,
        b.y,
        canvasArea.x,
        canvasArea.y
      ) <

      canvasArea.radius +
        b.size * 0.55
    ) {
      b.y -=
        b.speed + 0.5;
    }

    if (
      b.y < -b.size
    ) {
      waitingBubbles[i] =
        makeWaitingBubble();

      waitingBubbles[i].y =
        height +
        random(20, 100);
    }
  }
}

function drawWaitingBubbles() {
  for (
    const b of waitingBubbles
  ) {
    if (!b.popping) {
      drawWaitingBubble(b);
    }
  }
}

function drawWaitingBubble(b) {
  push();

  translate(
    b.x,
    b.y
  );

  rotate(
    b.rotation
  );

  noStroke();
  fill(255, 255, 255, 8);

  circle(
    0,
    0,
    b.size
  );

  noFill();
  strokeWeight(2.2);

  stroke(0, 220, 255, b.alpha);

  arc(
    0,
    0,
    b.size,
    b.size,
    190,
    270
  );

  stroke(170, 80, 255, b.alpha);

  arc(
    0,
    0,
    b.size,
    b.size,
    270,
    340
  );

  stroke(255, 80, 180, b.alpha);

  arc(
    0,
    0,
    b.size,
    b.size,
    340,
    55
  );

  stroke(70, 130, 255, b.alpha);

  arc(
    0,
    0,
    b.size,
    b.size,
    55,
    120
  );

  stroke(100, 255, 190, b.alpha);

  arc(
    0,
    0,
    b.size,
    b.size,
    120,
    190
  );

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

// ==================================================
// COLLECTIVE EMPTY BUBBLE POPPING
// ==================================================

function popWaitingBubble(b) {
  if (b.popping) {
    return;
  }

  b.popping = true;

  bubblePopAnimations.push({
    x: b.x,
    y: b.y,
    size: b.size,
    startTime: millis()
  });

  const state =
    activeMode === "worldwide"
      ? getWorldwideState()
      : getGroupState();

  if (
    state &&
    window.shareConnected
  ) {
    state.bubblePopCount =
      (
        Number(state.bubblePopCount) ||
        0
      ) + 1;
  }
}

function drawBubblePopAnimations() {
  for (
    let i =
      bubblePopAnimations.length - 1;

    i >= 0;

    i--
  ) {
    const animation =
      bubblePopAnimations[i];

    const progress =
      constrain(
        (
          millis() -
          animation.startTime
        ) / 400,

        0,
        1
      );

    const size =
      animation.size *
      (1 + progress * 0.8);

    const alpha =
      180 * (1 - progress);

    noFill();

    stroke(
      255,
      255,
      255,
      alpha
    );

    strokeWeight(2);

    circle(
      animation.x,
      animation.y,
      size
    );

    for (
      let j = 0;
      j < 5;
      j++
    ) {
      const angle =
        j * 72;

      const distance =
        progress *
        animation.size *
        0.55;

      noStroke();

      fill(
        255,
        255,
        255,
        alpha
      );

      circle(
        animation.x +
          cos(angle) * distance,

        animation.y +
          sin(angle) * distance,

        3 * (1 - progress)
      );
    }

    if (progress >= 1) {
      bubblePopAnimations.splice(
        i,
        1
      );

      const index =
        waitingBubbles.findIndex(
          b =>
            b.popping &&

            dist(
              b.x,
              b.y,
              animation.x,
              animation.y
            ) < 1
        );

      if (index !== -1) {
        waitingBubbles[index] =
          makeWaitingBubble();

        waitingBubbles[index].y =
          height +
          random(30, 100);
      }
    }
  }
}

// ==================================================
// COLLECTIVE VERSION BUBBLES
// ==================================================

function getVersionId(snapshot) {
  if (
    snapshot?.id !== undefined
  ) {
    return String(snapshot.id);
  }

  if (
    snapshot?.version !== undefined
  ) {
    return (
      "version-" +
      snapshot.version
    );
  }

  return null;
}

function syncVersionBubbles() {
  if (
    activeMode !== "group" ||
    !window.shareConnected
  ) {
    return;
  }

  const data =
    getSharedData();

  for (
    const snapshot of data.versions
  ) {
    const id =
      getVersionId(snapshot);

    if (
      !id ||
      seenVersionIds.has(id)
    ) {
      continue;
    }

    seenVersionIds.add(id);

    versionBubbles.push(
      makeVersionBubble(
        snapshot,
        id
      )
    );
  }
}

function makeVersionBubble(
  snapshot,
  id
) {
  const size =
    random(
      VERSION_BUBBLE_MIN_SIZE,
      VERSION_BUBBLE_MAX_SIZE
    );

  return {
    id,
    snapshot,

    x:
      random(
        size / 2 + 12,
        width - size / 2 - 12
      ),

    y:
      height +
      random(30, 100),

    size,

    speed:
      random(
        VERSION_BUBBLE_SPEED_MIN,
        VERSION_BUBBLE_SPEED_MAX
      ),

    drift:
      random(0.2, 0.55),

    phase:
      random(360),

    rotation:
      random(360),

    rotationSpeed:
      random(-0.25, 0.25),

    alpha:
      random(150, 210)
  };
}

function updateVersionBubbles() {
  for (
    let i =
      versionBubbles.length - 1;

    i >= 0;

    i--
  ) {
    const b =
      versionBubbles[i];

    b.y -= b.speed;

    b.x +=
      sin(
        frameCount * 0.6 +
        b.phase
      ) * b.drift;

    b.rotation +=
      b.rotationSpeed;

    b.x =
      constrain(
        b.x,
        b.size / 2,
        width - b.size / 2
      );

    if (b.y < -b.size) {
      versionBubbles.splice(
        i,
        1
      );
    }
  }
}

function drawVersionBubbles() {
  for (
    const b of versionBubbles
  ) {
    drawVersionBubble(b);
  }
}

// ==================================================
// RAINBOW BUBBLE RING
// ==================================================

function drawRainbowRing(
  x,
  y,
  size,
  alpha,
  weight
) {
  noFill();
  strokeWeight(weight);

  stroke(98, 214, 206, alpha);

  arc(
    x,
    y,
    size,
    size,
    190,
    265
  );

  stroke(182, 155, 255, alpha);

  arc(
    x,
    y,
    size,
    size,
    265,
    335
  );

  stroke(255, 156, 203, alpha);

  arc(
    x,
    y,
    size,
    size,
    335,
    50
  );

  stroke(40, 123, 255, alpha);

  arc(
    x,
    y,
    size,
    size,
    50,
    120
  );

  stroke(255, 230, 109, alpha);

  arc(
    x,
    y,
    size,
    size,
    120,
    190
  );
}

// ==================================================
// COLLECTIVE ARTWORK BUBBLE RENDERING
// ==================================================

function drawVersionBubble(b) {
  const drawingDiameter =
    b.size * 0.66;

  const previewArea = {
    x: b.x,
    y: b.y,

    radius:
      drawingDiameter / 2,

    diameter:
      drawingDiameter,

    baseDiameter:
      drawingDiameter
  };

  noStroke();
  fill(12, 18, 25, 220);

  circle(
    b.x,
    b.y,
    b.size * 0.82
  );

  const snapshot =
    b.snapshot;

  if (
    snapshot &&
    Array.isArray(
      snapshot.strokes
    )
  ) {
    for (
      const strokeData of snapshot.strokes
    ) {
      drawStroke(
        strokeData,

        snapshot.zoomLevel ||
          MAX_ZOOM,

        previewArea
      );
    }
  }

  push();

  translate(
    b.x,
    b.y
  );

  rotate(
    b.rotation
  );

  drawRainbowRing(
    0,
    0,
    b.size,
    b.alpha,
    2.5
  );

  noStroke();
  fill(255, 255, 255, 180);

  ellipse(
    -b.size * 0.22,
    -b.size * 0.25,
    b.size * 0.22,
    b.size * 0.10
  );

  pop();

  noFill();
  stroke(255, 255, 255, 125);
  strokeWeight(1);

  circle(
    b.x,
    b.y,
    drawingDiameter
  );
}

// ==================================================
// COLLECTIVE VERSION PREVIEW
// ==================================================

function openVersionPreview(
  bubble
) {
  if (
    !bubble ||
    activeVersionPreview
  ) {
    return;
  }

  const index =
    versionBubbles.indexOf(
      bubble
    );

  if (index !== -1) {
    versionBubbles.splice(
      index,
      1
    );
  }

  const blurredBackground =
    get();

  blurredBackground.filter(
    BLUR,
    2
  );

  activeVersionPreview = {
    snapshot:
      bubble.snapshot,

    x: bubble.x,
    y: bubble.y,

    startSize:
      bubble.size,

    startTime:
      millis(),

    background:
      blurredBackground,

    popping: false,
    popStartTime: 0,
    droplets: []
  };
}

function drawVersionPreview() {
  if (!activeVersionPreview) {
    return;
  }

  const preview =
    activeVersionPreview;

  const elapsed =
    millis() -
    preview.startTime;

  if (preview.background) {
    image(
      preview.background,
      0,
      0,
      width,
      height
    );
  }

  noStroke();
  fill(0, 185);

  rect(
    0,
    0,
    width,
    height
  );

  const maximumSize =
    min(
      width - 64,
      height * 0.42,
      330
    );

  const expandProgress =
    constrain(
      elapsed /
      VERSION_PREVIEW_EXPAND_TIME,

      0,
      1
    );

  const easedExpansion =
    1 -
    pow(
      1 - expandProgress,
      3
    );

  let previewSize =
    lerp(
      preview.startSize,
      maximumSize,
      easedExpansion
    );

  const previewX =
    constrain(
      preview.x,

      previewSize / 2 + 12,

      width -
        previewSize / 2 -
        12
    );

  const previewY =
    constrain(
      preview.y,

      previewSize / 2 + 65,

      height -
        previewSize / 2 -
        65
    );

  let alpha = 255;

  if (preview.popping) {
    const progress =
      constrain(
        (
          millis() -
          preview.popStartTime
        ) /
        VERSION_PREVIEW_POP_TIME,

        0,
        1
      );

    previewSize *=
      1 - progress;

    alpha =
      255 * (1 - progress);

    drawVersionPreviewPop(
      preview
    );

    if (progress >= 1) {
      activeVersionPreview = null;
      return;
    }
  }

  if (previewSize <= 1) {
    return;
  }

  const drawingDiameter =
    previewSize * 0.82;

  const previewArea = {
    x: previewX,
    y: previewY,

    radius:
      drawingDiameter / 2,

    diameter:
      drawingDiameter,

    baseDiameter:
      drawingDiameter
  };

  noStroke();

  fill(
    8,
    18,
    28,
    245 * alpha / 255
  );

  circle(
    previewX,
    previewY,
    previewSize
  );

  fill(
    16,
    16,
    16,
    245 * alpha / 255
  );

  circle(
    previewX,
    previewY,
    drawingDiameter
  );

  const snapshot =
    preview.snapshot;

  if (
    snapshot &&
    Array.isArray(
      snapshot.strokes
    )
  ) {
    for (
      const strokeData of snapshot.strokes
    ) {
      drawStroke(
        strokeData,

        snapshot.zoomLevel ||
          MAX_ZOOM,

        previewArea
      );
    }
  }

  drawRainbowRing(
    previewX,
    previewY,
    previewSize,
    alpha,
    3
  );

  noFill();

  stroke(
    255,
    255,
    255,
    170 * alpha / 255
  );

  strokeWeight(1.5);

  circle(
    previewX,
    previewY,
    drawingDiameter
  );

  if (
    expandProgress >= 0.92 &&
    !preview.popping
  ) {
    const labelAlpha =
      map(
        expandProgress,
        0.92,
        1,
        0,
        255
      );

    drawCurvedVersionLabel(
      "VERSION " +
        snapshot.version,

      previewX,
      previewY,
      previewSize * 0.57,
      labelAlpha
    );

    noStroke();

    fill(
      255,
      255,
      255,
      labelAlpha
    );

    textAlign(CENTER, CENTER);
    textSize(12);

    text(
      window.sensorsEnabled
        ? "SHAKE TO POP"
        : "TAP TO POP",

      previewX,

      previewY +
        previewSize / 2 +
        30
    );
  }
}

// ==================================================
// CURVED VERSION LABEL
// ==================================================

function drawCurvedVersionLabel(
  label,
  x,
  y,
  radius,
  alpha
) {
  push();

  textFont("Arial");
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  fill(
    255,
    255,
    255,
    alpha
  );

  noStroke();

  const totalWidth =
    textWidth(label);

  const angleSpan =
    min(
      125,

      (
        totalWidth / radius
      ) * 57.2958
    );

  let currentWidth = 0;

  for (
    let i = 0;
    i < label.length;
    i++
  ) {
    const character =
      label[i];

    const characterWidth =
      textWidth(character);

    const characterCenter =
      currentWidth +
      characterWidth / 2;

    const angle =
      map(
        characterCenter,
        0,
        totalWidth,
        -90 - angleSpan / 2,
        -90 + angleSpan / 2
      );

    push();

    translate(
      x + cos(angle) * radius,
      y + sin(angle) * radius
    );

    rotate(
      angle + 90
    );

    text(
      character,
      0,
      0
    );

    pop();

    currentWidth +=
      characterWidth;
  }

  pop();
}

// ==================================================
// VERSION PREVIEW DROPLETS
// ==================================================

function createVersionPreviewDroplets(
  x,
  y,
  size
) {
  const droplets = [];

  for (
    let i = 0;
    i < 30;
    i++
  ) {
    const angle =
      random(360);

    const speed =
      random(1.5, 5.5);

    droplets.push({
      x,
      y,

      vx:
        cos(angle) * speed,

      vy:
        sin(angle) * speed,

      size:
        random(3, 8),

      r:
        random(100, 255),

      g:
        random(100, 255),

      b:
        random(180, 255),

      alpha: 230
    });
  }

  return droplets;
}

// ==================================================
// VERSION PREVIEW POP ANIMATION
// ==================================================

function drawVersionPreviewPop(
  preview
) {
  const progress =
    constrain(
      (
        millis() -
        preview.popStartTime
      ) /
      VERSION_PREVIEW_POP_TIME,

      0,
      1
    );

  const eased =
    1 -
    pow(
      1 - progress,
      3
    );

  const centerX =
    preview.x;

  const centerY =
    preview.y;

  const baseSize =
    preview.startSize;

  for (
    let i = 0;
    i < 14;
    i++
  ) {
    const angle =
      i * (360 / 14) +
      sin(i * 41) * 12;

    const delay =
      (i % 4) * 0.035;

    const splashProgress =
      constrain(
        (progress - delay) /
        (1 - delay),

        0,
        1
      );

    const splashEased =
      1 -
      pow(
        1 - splashProgress,
        2.5
      );

    const distance =
      baseSize *
      (
        0.12 +
        splashEased * 0.48
      );

    const streakLength =
      baseSize *
      (
        0.06 +
        splashEased * 0.12
      );

    const x1 =
      centerX +
      cos(angle) * distance;

    const y1 =
      centerY +
      sin(angle) * distance;

    const x2 =
      centerX +
      cos(angle) *
      (
        distance +
        streakLength
      );

    const y2 =
      centerY +
      sin(angle) *
      (
        distance +
        streakLength
      );

    stroke(
      255,
      255,
      255,
      190 * (1 - splashProgress)
    );

    strokeWeight(2.5);
    strokeCap(ROUND);

    line(
      x1,
      y1,
      x2,
      y2
    );
  }

  const splashColours = [
    [0, 220, 255],
    [170, 80, 255],
    [255, 80, 180],
    [100, 255, 190],
    [255, 230, 100]
  ];

  for (
    let i = 0;
    i < splashColours.length;
    i++
  ) {
    const angle =
      i * 72 + 18;

    const splashProgress =
      constrain(
        progress - i * 0.045,
        0,
        1
      );

    const splashEased =
      1 -
      pow(
        1 - splashProgress,
        2.5
      );

    const distance =
      baseSize *
      (
        0.12 +
        splashEased * 0.48
      );

    const length =
      baseSize * 0.12;

    stroke(
      splashColours[i][0],
      splashColours[i][1],
      splashColours[i][2],
      180 * (1 - splashProgress)
    );

    strokeWeight(4);
    strokeCap(ROUND);

    line(
      centerX +
        cos(angle) * distance,

      centerY +
        sin(angle) * distance,

      centerX +
        cos(angle) *
        (distance + length),

      centerY +
        sin(angle) *
        (distance + length)
    );
  }

  noStroke();

  fill(
    255,
    255,
    255,
    180 * (1 - progress)
  );

  circle(
    centerX,
    centerY,
    baseSize * 0.2 * eased
  );

  for (
    const d of preview.droplets
  ) {
    d.x += d.vx;
    d.y += d.vy;

    d.vy += 0.025;
    d.alpha *= 0.985;

    push();

    translate(
      d.x,
      d.y
    );

    rotate(
      atan2(
        d.vy,
        d.vx
      )
    );

    noStroke();

    fill(
      d.r,
      d.g,
      d.b,

      d.alpha *
      (1 - progress * 0.5)
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

      d.alpha *
      0.35 *
      (1 - progress)
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
// COLLECTIVE SHAKE INTERACTION
// ==================================================

function popVersionPreview() {
  if (
    !activeVersionPreview ||
    activeVersionPreview.popping
  ) {
    return;
  }

  const preview =
    activeVersionPreview;

  if (
    millis() -
    preview.startTime <
    VERSION_PREVIEW_EXPAND_TIME
  ) {
    return;
  }

  if (
    millis() -
    lastVersionShake <
    VERSION_PREVIEW_SHAKE_COOLDOWN
  ) {
    return;
  }

  lastVersionShake =
    millis();

  preview.popping = true;

  preview.popStartTime =
    millis();

  preview.droplets =
    createVersionPreviewDroplets(
      preview.x,
      preview.y,
      preview.startSize
    );
}

// ==================================================
// SHAKE EVENT
// ==================================================

function deviceShaken() {
  // Existing Collective shake interaction.

  if (
    activeMode === "group" &&
    activeVersionPreview
  ) {
    popVersionPreview();
    return;
  }

  // Anonymous prompt responses:
  // Shake to create an independent interpretation.

  if (
    activeMode === "worldwide" &&
    worldwidePage === "response" &&
    !drawingMode &&
    window.shareConnected
  ) {
    if (
      millis() -
      anonymousRevealTime < 450
    ) {
      return;
    }

    if (
      millis() -
      anonymousLastShake < 850
    ) {
      return;
    }

    anonymousLastShake =
      millis();

    beginIndependentResponse();
  }
}

// ==================================================
// COLLECTIVE FOOTER
// ==================================================

function drawFooter() {
  drawButton(
    leftButton,

    drawingMode
      ? "DRAWING"
      : "MY TURN"
  );

  drawButton(
    rightButton,

    drawingMode
      ? "FINISH"
      : "PASS"
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, TOP);
  textSize(11);

  text(
    drawingMode
      ? (
          eraserMode
            ? "Erasing your own strokes. Tap ER to draw again."
            : "Add to the drawing, then finish your turn."
        )
      : "Tap the floating bubbles while you wait.",

    width / 2,
    height - 22
  );
}

// ==================================================
// COLLECTIVE TURN MANAGEMENT
// ==================================================

function startTurn() {
  if (!window.shareConnected) {
    return;
  }

  drawingMode = true;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;
}

function finishTurn() {
  if (!window.shareConnected) {
    return;
  }

  const group =
    getGroupState();

  if (!group) {
    return;
  }

  mouseReleased();

  const data =
    getSharedData();

  if (
    localStrokes.length > 0
  ) {
    const nextVersion =
      data.version + 1;

    const nextTurn =
      data.turnCount + 1;

    const completedStrokes =
      data.strokes.concat(
        localStrokes
      );

    group.strokes =
      completedStrokes;

    group.version =
      nextVersion;

    group.lastAction =
      "edited";

    const snapshot = {
      id:
        "version-" +
        nextVersion +
        "-turn-" +
        nextTurn,

      version:
        nextVersion,

      turn:
        nextTurn,

      zoomLevel:
        Number(group.zoomLevel) ||
        MAX_ZOOM,

      strokes:
        cloneData(
          completedStrokes
        )
    };

    group.versions =
      data.versions.concat(
        [snapshot]
      );
  } else {
    group.lastAction =
      "passed";
  }

  group.turnCount =
    data.turnCount + 1;

  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  brushAdjustmentActive = false;
  brushPermissionPending = false;
}

function passTurn() {
  if (!window.shareConnected) {
    return;
  }

  const group =
    getGroupState();

  if (!group) {
    return;
  }

  group.lastAction =
    "passed";

  group.turnCount =
    (
      Number(group.turnCount) ||
      0
    ) + 1;
}

// ==================================================
// ANONYMOUS COLLECTION HELPERS
// ==================================================

function worldwideId() {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID ===
    "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

function worldwideArtworks() {
  const state =
    getWorldwideState();

  if (
    !Array.isArray(
      state?.artworks
    )
  ) {
    return [];
  }

  const valid =
    state.artworks.filter(
      artwork =>
        artwork &&
        artwork.id &&

        Array.isArray(
          artwork.strokes
        )
    );

  const unique =
    new Map();

  for (
    const artwork of valid
  ) {
    const previous =
      unique.get(
        artwork.id
      );

    if (
      !previous ||

      Number(artwork.version) >=
      Number(previous.version)
    ) {
      unique.set(
        artwork.id,
        artwork
      );
    }
  }

  return Array.from(
    unique.values()
  );
}

function worldwidePrompts() {
  /*
    The original prompts now come directly
    from the editable list at the top.

    Old random prompts stored in the room
    cannot override the new list.
  */

  return Array.from(
    new Set(
      DEFAULT_PROMPTS
        .map(p => p.trim())
        .filter(Boolean)
    )
  );
}

function worldwideArtwork(id) {
  if (!id) {
    return null;
  }

  return (
    worldwideArtworks().find(
      artwork =>
        artwork.id === id
    ) || null
  );
}

function worldwidePick(items) {
  if (!items.length) {
    return null;
  }

  return items[
    Math.floor(
      Math.random() *
      items.length
    )
  ];
}

function anonymousShuffle(items) {
  const shuffled =
    items.slice();

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    const temporary =
      shuffled[i];

    shuffled[i] =
      shuffled[j];

    shuffled[j] =
      temporary;
  }

  return shuffled;
}

// ==================================================
// ANONYMOUS ARTWORK CLASSIFICATION
// ==================================================

function isPromptResponse(artwork) {
  if (!artwork) {
    return false;
  }

  if (
    artwork.kind === "prompt-response" ||
    artwork.type === "prompt-response"
  ) {
    return true;
  }

  /*
    Starting artworks and unrestricted drawings
    remain collaborative artworks.

    New prompt responses are explicitly marked
    as prompt-response when created.
  */

  return false;
}

function getArtworkPrompt(artwork) {
  if (!artwork) {
    return "";
  }

  return (
    artwork.prompt ||
    ""
  );
}

function synchronizeOriginalPrompts() {
  const state =
    getWorldwideState();

  if (!state) {
    return;
  }

  const prompts =
    worldwidePrompts().map(
      (text, index) => ({
        id:
          "seed-prompt-" +
          index,

        text
      })
    );

  const existing =
    Array.isArray(state.prompts)
      ? state.prompts
      : [];

  if (
    JSON.stringify(existing) !==
    JSON.stringify(prompts)
  ) {
    state.prompts = prompts;
  }
}

// ==================================================
// IMPORT STARTING ARTWORKS
// ==================================================

async function prepareWorldwide() {
  if (
    !window.shareConnected ||
    !ensureSharedStructure()
  ) {
    return false;
  }

  synchronizeOriginalPrompts();

  const existingArtworks =
    worldwideArtworks();

  const allStartingArtworksPresent =
    STARTING_ARTWORK_FILES.every(
      (filename, index) =>
        existingArtworks.some(
          artwork =>
            artwork.id ===
            "starting-artwork-" +
            (index + 1)
        )
    );

  if (
    worldwideSeedsLoaded &&
    allStartingArtworksPresent
  ) {
    return true;
  }

  if (worldwideSeedPending) {
    return worldwideSeedPending;
  }

  worldwideSeedPending =
    (async () => {
      const importedArtworks = [];

      await Promise.all(
        STARTING_ARTWORK_FILES.map(
          async (
            filename,
            index
          ) => {
            const expectedId =
              "starting-artwork-" +
              (index + 1);

            if (
              worldwideArtwork(
                expectedId
              )
            ) {
              return;
            }

            try {
              const response =
                await fetch(
                  "./" + filename,

                  {
                    cache: "no-cache"
                  }
                );

              if (!response.ok) {
                throw new Error(
                  "HTTP " +
                  response.status
                );
              }

              const data =
                await response.json();

              if (
                data.format !==
                  "bubble-pop-artwork" ||

                data.artwork?.id !==
                  expectedId ||

                !Array.isArray(
                  data.artwork.strokes
                )
              ) {
                throw new Error(
                  "Invalid artwork file"
                );
              }

              importedArtworks.push(
                data.artwork
              );

              console.log(
                "Loaded:",
                filename
              );
            } catch (error) {
              console.warn(
                "Starting artwork unavailable:",
                filename,
                error
              );
            }
          }
        )
      );

      const state =
        getWorldwideState();

      if (
        !window.shareConnected ||
        !state
      ) {
        return false;
      }

      const collection =
        cloneData(
          worldwideArtworks()
        );

      const knownIds =
        new Set(
          collection.map(
            artwork =>
              artwork.id
          )
        );

      let changed = false;

      for (
        const artwork of importedArtworks
      ) {
        if (
          !knownIds.has(
            artwork.id
          )
        ) {
          collection.push(
            cloneData(artwork)
          );

          knownIds.add(
            artwork.id
          );

          changed = true;
        }
      }

      if (changed) {
        state.artworks =
          collection;
      }

      synchronizeOriginalPrompts();

      worldwideSeedsLoaded = true;

      console.log(
        "Anonymous collection:",
        worldwideArtworks().length,
        "artworks"
      );

      console.log(
        "Artwork IDs:",

        worldwideArtworks().map(
          artwork => artwork.id
        )
      );

      return true;
    })();

  try {
    return await worldwideSeedPending;
  } finally {
    worldwideSeedPending = null;
  }
}

// ==================================================
// ANONYMOUS NAVIGATION
// ==================================================

function resetAnonymousDrawing() {
  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  brushAdjustmentActive = false;
  brushPermissionPending = false;

  worldwideSelected = null;
  worldwideBase = null;
  worldwideMessage = "";
}

function anonymousDiscover() {
  resetAnonymousDrawing();

  worldwidePage = "discover";

  worldwidePrompt = "";

  anonymousPurpose =
    "contribution";

  anonymousPop = null;

  anonymousCollectionKey = "";

  /*
    Existing floating bubbles are retained.

    Returning from a drawing does not restart
    the floating animation or rearrange the screen.
  */

  updateAnonymousMediaQueue();

  if (!anonymousBubbles.length) {
    buildAnonymousBubbles();
  }
}

// ==================================================
// OPEN COLLABORATIVE ARTWORK OR RESPONSE
// ==================================================

function worldwideOpenArtwork(id) {
  const artwork =
    worldwideArtwork(id);

  if (!artwork) {
    anonymousDiscover();
    return;
  }

  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  worldwideSelected = id;

  worldwideBase = null;

  worldwideTools.zoomLevel =
    Number(artwork.zoomLevel) ||
    MAX_ZOOM;

  worldwideMessage = "";

  anonymousRevealTime =
    millis();

  if (
    isPromptResponse(artwork)
  ) {
    // Prompt responses are view-only artworks.

    worldwidePage = "response";

    worldwidePrompt =
      getArtworkPrompt(artwork);

    anonymousPurpose =
      "prompt-response";
  } else {
    // Collaborative artworks can be developed.

    worldwidePage = "view";

    worldwidePrompt = "";

    anonymousPurpose =
      "contribution";
  }
}

// ==================================================
// OPEN ORIGINAL WRITTEN PROMPT
// ==================================================

function worldwideOpenPrompt(
  promptText
) {
  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  worldwideSelected = null;

  worldwidePrompt =
    promptText ||
    worldwidePick(
      worldwidePrompts()
    );

  worldwidePage = "prompt";

  worldwideBase = null;

  worldwideTools.zoomLevel =
    MAX_ZOOM;

  worldwideMessage = "";

  anonymousPurpose =
    "prompt-response";

  anonymousRevealTime =
    millis();
}

// ==================================================
// OPEN FREE DRAWING BUBBLE
// ==================================================

function worldwideOpenFreeBubble() {
  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  worldwideSelected = null;

  worldwidePrompt =
    FREE_DRAWING_PROMPT;

  worldwidePage = "free";

  worldwideBase = null;

  worldwideTools.zoomLevel =
    MAX_ZOOM;

  worldwideMessage = "";

  anonymousPurpose =
    "free";

  anonymousRevealTime =
    millis();
}

// ==================================================
// ANONYMOUS HEADER
// ==================================================

function drawAnonymousHeader(
  subtitle
) {
  const state =
    getWorldwideState();

  noStroke();
  fill(WHITE);
  textAlign(LEFT, TOP);
  textSize(25);

  text(
    "bubble pop",
    20,
    18
  );

  fill(MUTED);
  textSize(13);

  text(
    subtitle || "Anonymous",
    21,
    53
  );

  textSize(11);

  text(
    "Bubbles popped: " +
    (
      state?.bubblePopCount ||
      0
    ),

    21,
    83
  );

  drawSmallTextButton(
    worldwideBackButton,
    "MODES"
  );

  fill(MUTED);
  textAlign(RIGHT, TOP);
  textSize(10);

  text(
    window.shareConnected
      ? "CONNECTED"
      : "CONNECTING...",

    width - 20,
    25
  );
}

// ==================================================
// ANONYMOUS BUTTON LAYOUT
// ==================================================

function setAnonymousButtons(
  layout
) {
  if (layout === "single") {
    anonymousPrimaryButton = {
      x: 18,
      y: height - 84,
      w: width - 36,
      h: 50
    };

    anonymousSecondaryButton =
      null;

    return;
  }

  anonymousPrimaryButton = {
    ...leftButton
  };

  anonymousSecondaryButton = {
    ...rightButton
  };
}

// ==================================================
// ANONYMOUS LOADING SCREEN
// ==================================================

function drawAnonymousLoading() {
  drawAnonymousHeader(
    "Anonymous"
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(14);

  text(
    worldwideMessage ||
      "Preparing the collection...",

    width / 2,
    height / 2
  );

  if (
    !window.shareConnected ||
    !getWorldwideState()
  ) {
    return;
  }

  if (
    anonymousLoading ||

    millis() -
      anonymousLastLoadAttempt <
      2000
  ) {
    return;
  }

  anonymousLoading = true;

  anonymousLastLoadAttempt =
    millis();

  prepareWorldwide()
    .then(
      ready => {
        if (
          ready &&
          activeMode === "worldwide" &&
          worldwidePage === "loading"
        ) {
          anonymousDiscover();
        }
      }
    )
    .catch(
      error => {
        console.error(
          "Collection loading failed:",
          error
        );

        worldwideMessage =
          "Unable to load the collection. Retrying...";
      }
    )
    .finally(
      () => {
        anonymousLoading = false;
      }
    );
}

// ==================================================
// ANONYMOUS MEDIA COLLECTION
// ==================================================

function getAnonymousMedia() {
  /*
    Each artwork ID appears only once.

    Collaborative artworks point to their latest
    version rather than every previous version.

    Prompt responses each have their own unique ID.
  */

  const artworkMedia =
    worldwideArtworks().map(
      artwork => ({
        type:
          isPromptResponse(artwork)
            ? "response"
            : "artwork",

        id: artwork.id,

        key:
          "artwork:" +
          artwork.id
      })
    );

  const promptMedia =
    worldwidePrompts().map(
      prompt => ({
        type: "prompt",

        id:
          "prompt:" +
          prompt,

        key:
          "prompt:" +
          prompt,

        text: prompt
      })
    );

  return artworkMedia.concat(
    promptMedia
  );
}

function anonymousSignature() {
  return JSON.stringify(
    getAnonymousMedia().map(
      media => media.key
    )
  );
}

// ==================================================
// ANONYMOUS MEDIA QUEUE
// ==================================================

/*
  The queue allows the collection to grow
  without putting every artwork on screen at once.

  Newly contributed artworks enter circulation.

  Bubbles already floating do not need to
  disappear when the collection changes.
*/

function updateAnonymousMediaQueue() {
  const media =
    getAnonymousMedia();

  const currentKeys =
    new Set(
      media.map(
        item => item.key
      )
    );

  // Remove entries no longer in the collection.

  anonymousMediaQueue =
    anonymousMediaQueue.filter(
      item =>
        currentKeys.has(
          item.key
        )
    );

  // Give new artworks a place in circulation.

  const newMedia =
    media.filter(
      item =>
        !anonymousKnownMedia.has(
          item.key
        )
    );

  if (newMedia.length) {
    anonymousMediaQueue =
      anonymousShuffle(newMedia)
        .concat(
          anonymousMediaQueue
        );
  }

  anonymousKnownMedia =
    currentKeys;

  anonymousCollectionKey =
    anonymousSignature();
}

function nextAnonymousMedia(
  ignoredBubble
) {
  updateAnonymousMediaQueue();

  const media =
    getAnonymousMedia();

  if (!media.length) {
    return {
      type: "free",
      id: "free",
      key: "free"
    };
  }

  const activeKeys =
    new Set(
      anonymousBubbles
        .filter(
          b =>
            b !== ignoredBubble &&
            b.type !== "free"
        )
        .map(
          b => b.key
        )
    );

  /*
    Prefer an artwork or prompt that is not
    currently represented by another bubble.
  */

  let index =
    anonymousMediaQueue.findIndex(
      item =>
        !activeKeys.has(
          item.key
        )
    );

  if (index === -1) {
    const available =
      media.filter(
        item =>
          !activeKeys.has(
            item.key
          )
      );

    if (available.length) {
      anonymousMediaQueue =
        anonymousShuffle(
          available
        );

      index = 0;
    }
  }

  if (index !== -1) {
    return anonymousMediaQueue.splice(
      index,
      1
    )[0];
  }

  /*
    If every available item is already
    circulating, allow another mystery bubble
    to point to one of those items.
  */

  if (!anonymousMediaQueue.length) {
    anonymousMediaQueue =
      anonymousShuffle(
        media
      );
  }

  return anonymousMediaQueue.shift() ||
    worldwidePick(media);
}

// ==================================================
// CREATE ANONYMOUS FLOATING BUBBLE
// ==================================================

function makeAnonymousBubble(
  content,
  initialPosition
) {
  /*
    Every bubble uses identical visual settings.

    A free bubble is not smaller or visually
    different from a collaborative artwork bubble.
  */

  const size =
    random(
      ANONYMOUS_MIN_SIZE,

      min(
        ANONYMOUS_MAX_SIZE,
        width * 0.25
      )
    );

  const radius =
    size / 2;

  const top = 155;
  const bottom = height - 35;

  let x =
    random(
      radius + 8,

      width -
        radius -
        8
    );

  let y =
    initialPosition
      ? random(
          top + radius,

          max(
            top + radius + 1,
            bottom - radius
          )
        )
      : height +
        random(5, 75);

  // Avoid heavy overlap during initial placement.

  if (initialPosition) {
    for (
      let attempt = 0;
      attempt < 70;
      attempt++
    ) {
      const overlaps =
        anonymousBubbles.some(
          bubble =>
            dist(
              x,
              y,
              bubble.x,
              bubble.y
            ) <

            (
              size +
              bubble.size
            ) * 0.47
        );

      if (!overlaps) {
        break;
      }

      x =
        random(
          radius + 8,
          width - radius - 8
        );

      y =
        random(
          top + radius,

          max(
            top + radius + 1,
            bottom - radius
          )
        );
    }
  }

  return {
    ...content,

    x,
    y,
    size,

    speed:
      random(
        ANONYMOUS_MIN_SPEED,
        ANONYMOUS_MAX_SPEED
      ),

    drift:
      random(
        0.25,
        0.7
      ),

    phase:
      random(360),

    rotation:
      random(360),

    rotationSpeed:
      random(
        -0.35,
        0.35
      ),

    alpha:
      random(
        155,
        225
      )
  };
}

// ==================================================
// INITIAL ANONYMOUS BUBBLES
// ==================================================

function buildAnonymousBubbles() {
  anonymousBubbles = [];

  updateAnonymousMediaQueue();

  const mediaCount =
    ANONYMOUS_BUBBLE_COUNT -
    ANONYMOUS_FREE_COUNT;

  const media =
    getAnonymousMedia();

  if (media.length) {
    for (
      let i = 0;
      i < mediaCount;
      i++
    ) {
      const content =
        nextAnonymousMedia();

      if (!content) {
        continue;
      }

      anonymousBubbles.push(
        makeAnonymousBubble(
          content,
          true
        )
      );
    }
  }

  // Only two unrestricted drawing bubbles.

  for (
    let i = 0;
    i < ANONYMOUS_FREE_COUNT;
    i++
  ) {
    anonymousBubbles.push(
      makeAnonymousBubble(
        {
          type: "free",

          id:
            "free-" + i,

          key:
            "free-" + i
        },

        true
      )
    );
  }

  // Mix all bubble types together.

  anonymousBubbles =
    anonymousShuffle(
      anonymousBubbles
    );

  anonymousCollectionKey =
    anonymousSignature();
}

// ==================================================
// ANONYMOUS FLOATING MOVEMENT
// ==================================================

function updateAnonymousBubbles() {
  if (
    anonymousSignature() !==
    anonymousCollectionKey
  ) {
    updateAnonymousMediaQueue();
  }

  for (
    let i = 0;
    i < anonymousBubbles.length;
    i++
  ) {
    const bubble =
      anonymousBubbles[i];

    if (
      anonymousPop &&
      anonymousPop.bubble === bubble
    ) {
      continue;
    }

    // Continuous upward movement.

    bubble.y -=
      bubble.speed;

    // Sideways drifting motion.

    bubble.x +=
      sin(
        frameCount * 0.7 +
        bubble.phase
      ) *
      bubble.drift;

    bubble.rotation +=
      bubble.rotationSpeed;

    bubble.x =
      constrain(
        bubble.x,

        bubble.size / 2,

        width -
          bubble.size / 2
      );

    /*
      Once a bubble leaves the visible area,
      another enters from the bottom.

      Free bubbles remain free slots.

      Media slots rotate through artworks,
      prompts and independent responses.
    */

    if (
      bubble.y +
        bubble.size / 2 <
      150
    ) {
      let content;

      if (
        bubble.type === "free"
      ) {
        content = {
          type: "free",
          id: bubble.id,
          key: bubble.key
        };
      } else {
        content =
          nextAnonymousMedia(
            bubble
          );
      }

      anonymousBubbles[i] =
        makeAnonymousBubble(
          content,
          false
        );
    }
  }
}

// ==================================================
// DRAW ANONYMOUS MYSTERY BUBBLE
// ==================================================

function drawAnonymousMediaBubble(
  bubble
) {
  /*
    All four types have the same exterior.

    No artwork preview.
    No visible written prompt.
    No indication of a free drawing bubble.
  */

  push();

  noStroke();

  fill(
    12,
    16,
    24,
    195
  );

  circle(
    bubble.x,
    bubble.y,
    bubble.size * 0.94
  );

  pop();

  // Original iridescent bubble appearance.

  drawWaitingBubble(
    bubble
  );

  // Keep the question mark upright.

  push();

  noStroke();

  fill(
    255,
    255,
    255,
    230
  );

  textAlign(CENTER, CENTER);

  textSize(
    bubble.size * 0.38
  );

  text(
    "?",

    bubble.x,

    bubble.y
  );

  pop();
}

// ==================================================
// ANONYMOUS DISCOVERY SCREEN
// ==================================================

function drawAnonymousDiscovery() {
  if (
    !anonymousBubbles.length
  ) {
    buildAnonymousBubbles();
  }

  updateAnonymousBubbles();

  /*
    Clip the floating area so the bubbles
    move behind the header and footer.
  */

  drawingContext.save();

  drawingContext.beginPath();

  drawingContext.rect(
    0,
    150,
    width,
    max(1, height - 185)
  );

  drawingContext.clip();

  for (
    const bubble of anonymousBubbles
  ) {
    if (
      anonymousPop &&
      anonymousPop.bubble === bubble
    ) {
      continue;
    }

    drawAnonymousMediaBubble(
      bubble
    );
  }

  drawAnonymousPop();

  drawingContext.restore();

  // Draw fixed interface above the moving bubbles.

  drawAnonymousHeader(
    "Anonymous"
  );

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(25);

  text(
    "pop a bubble",

    width / 2,

    119
  );

  fill(MUTED);
  textSize(11);

  text(
    "Discover something within the collection.",

    width / 2,

    140
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(10);

  text(
    worldwideArtworks().length +
      " artworks in this collection",

    width / 2,

    height - 24
  );
}

// ==================================================
// ANONYMOUS BUBBLE POP COUNTER
// ==================================================

function incrementAnonymousPopCount() {
  if (!window.shareConnected) {
    return;
  }

  const state =
    getWorldwideState();

  if (!state) {
    return;
  }

  state.bubblePopCount =
    (
      Number(
        state.bubblePopCount
      ) || 0
    ) + 1;
}

// ==================================================
// ANONYMOUS BUBBLE POPPING
// ==================================================

function beginAnonymousPop(
  bubble
) {
  if (
    anonymousPop ||
    !window.shareConnected
  ) {
    return;
  }

  anonymousPop = {
    bubble,

    startTime:
      millis(),

    x: bubble.x,
    y: bubble.y,

    size:
      bubble.size
  };

  /*
    Every Anonymous bubble counts.

    Collaborative artwork: +1
    Original prompt: +1
    Prompt response: +1
    Free drawing: +1

    The counter is shared between participants.
  */

  incrementAnonymousPopCount();
}

function drawAnonymousPop() {
  if (!anonymousPop) {
    return;
  }

  const animation =
    anonymousPop;

  const progress =
    constrain(
      (
        millis() -
        animation.startTime
      ) /
      ANONYMOUS_POP_DURATION,

      0,
      1
    );

  const alpha =
    255 * (1 - progress);

  noFill();

  stroke(
    255,
    255,
    255,
    alpha
  );

  strokeWeight(2);

  circle(
    animation.x,

    animation.y,

    animation.size *
      (
        1 +
        progress * 0.65
      )
  );

  const colours = [
    "#62D6CE",
    "#B69BFF",
    "#FF9CCB",
    "#287BFF",
    "#FFE66D"
  ];

  for (
    let i = 0;
    i < 10;
    i++
  ) {
    const angle =
      i * 36;

    const distance =
      animation.size *
      (
        0.28 +
        progress * 0.65
      );

    const dropletColour =
      color(
        colours[
          i % colours.length
        ]
      );

    dropletColour.setAlpha(
      alpha
    );

    noStroke();

    fill(
      dropletColour
    );

    circle(
      animation.x +
        cos(angle) * distance,

      animation.y +
        sin(angle) * distance,

      6 * (1 - progress)
    );
  }

  if (progress >= 1) {
    const bubble =
      animation.bubble;

    anonymousPop = null;

    // Replace the popped bubble in circulation.

    const index =
      anonymousBubbles.indexOf(
        bubble
      );

    if (index !== -1) {
      let replacement;

      if (
        bubble.type === "free"
      ) {
        replacement = {
          type: "free",
          id: bubble.id,
          key: bubble.key
        };
      } else {
        replacement =
          nextAnonymousMedia(
            bubble
          );
      }

      anonymousBubbles[index] =
        makeAnonymousBubble(
          replacement,
          false
        );
    }

    // Reveal the selected bubble's content.

    if (
      bubble.type === "artwork" ||
      bubble.type === "response"
    ) {
      worldwideOpenArtwork(
        bubble.id
      );

      return;
    }

    if (
      bubble.type === "prompt"
    ) {
      worldwideOpenPrompt(
        bubble.text
      );

      return;
    }

    if (
      bubble.type === "free"
    ) {
      worldwideOpenFreeBubble();

      return;
    }
  }
}

// ==================================================
// ANONYMOUS PROMPT TEXT HELPER
// ==================================================

function drawPromptInsideBubble(
  promptText
) {
  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(17);

  text(
    promptText,

    canvasArea.x -
      canvasArea.diameter / 2 +
      24,

    canvasArea.y -
      canvasArea.diameter / 2 +
      24,

    canvasArea.diameter - 48,

    canvasArea.diameter - 48
  );
}

function drawPromptAboveArtwork(
  promptText
) {
  const canvasTop =
    canvasArea.y -
    canvasArea.radius;

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);
  textSize(15);

  const promptY =
    max(
      113,
      canvasTop - 37
    );

  text(
    promptText,

    24,

    promptY - 14,

    width - 48,

    28
  );
}

// ==================================================
// ANONYMOUS REVEAL SCREEN
// ==================================================

function drawAnonymousReveal() {
  const isPrompt =
    worldwidePage === "prompt";

  const isFree =
    worldwidePage === "free";

  const isResponse =
    worldwidePage === "response";

  const artwork =
    worldwideArtwork(
      worldwideSelected
    );

  if (
    !isPrompt &&
    !isFree &&
    !artwork
  ) {
    anonymousDiscover();
    return;
  }

  drawAnonymousHeader(
    "Anonymous"
  );

  drawCircleBackground();

  drawRainbowRing(
    canvasArea.x,
    canvasArea.y,
    canvasArea.diameter,
    210,
    2
  );

  // Original written prompts and free bubbles.

  if (
    isPrompt ||
    isFree
  ) {
    drawPromptInsideBubble(
      worldwidePrompt
    );
  }

  // Existing artwork or independent prompt response.

  else {
    worldwideTools.zoomLevel =
      Number(
        artwork.zoomLevel
      ) || MAX_ZOOM;

    for (
      const strokeData of artwork.strokes
    ) {
      drawStroke(
        strokeData
      );
    }

    if (isResponse) {
      /*
        Display the original prompt ABOVE
        the participant's finished drawing.
      */

      drawPromptAboveArtwork(
        getArtworkPrompt(
          artwork
        )
      );
    } else {
      noStroke();
      fill(MUTED);
      textAlign(CENTER, CENTER);
      textSize(12);

      text(
        "Version " +
          artwork.version,

        width / 2,

        118
      );
    }
  }

  // ==================================================
  // PROMPT RESPONSE INTERACTION
  // ==================================================

  if (isResponse) {
    /*
      Participants cannot edit an existing response.

      They shake to open a new blank drawing canvas
      containing the exact same written prompt.
    */

    const bottomOfArtwork =
      canvasArea.y +
      canvasArea.radius;

    const instructionY =
      min(
        height - 150,

        max(
          bottomOfArtwork + 42,
          height - 175
        )
      );

    noStroke();
    fill(WHITE);
    textAlign(CENTER, CENTER);
    textSize(18);

    text(
      window.sensorsEnabled
        ? "shake to create your own"
        : "create your own",

      width / 2,

      instructionY
    );

    fill(MUTED);
    textSize(11);

    text(
      "A different interpretation of the same prompt.",

      width / 2,

      instructionY + 25
    );

    /*
      On phones with motion permissions, shake
      is the primary interaction.

      A button is available when motion sensors
      are unavailable, including desktop testing.
    */

    if (window.sensorsEnabled) {
      setAnonymousButtons(
        "single"
      );

      drawSecondaryButton(
        anonymousPrimaryButton,
        "PASS"
      );
    } else {
      setAnonymousButtons(
        "double"
      );

      drawButton(
        anonymousPrimaryButton,
        "CREATE YOUR OWN"
      );

      drawSecondaryButton(
        anonymousSecondaryButton,
        "PASS"
      );
    }

    return;
  }

  // ==================================================
  // COLLABORATIVE ARTWORK, PROMPT OR FREE BUBBLE
  // ==================================================

  const contributed =
    worldwidePage === "view" &&

    worldwideSelected &&

    worldwideVisited.has(
      worldwideSelected
    );

  setAnonymousButtons(
    "double"
  );

  if (contributed) {
    drawSecondaryButton(
      anonymousPrimaryButton,
      "ALREADY CONTRIBUTED"
    );
  } else {
    drawButton(
      anonymousPrimaryButton,
      "CONTRIBUTE"
    );
  }

  drawSecondaryButton(
    anonymousSecondaryButton,
    "PASS"
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(11);

  let instruction =
    "Become part of this artwork.";

  if (isPrompt) {
    instruction =
      "Create your own interpretation.";
  }

  if (isFree) {
    instruction =
      "Start something new.";
  }

  if (contributed) {
    instruction =
      "You have already added to this artwork.";
  }

  text(
    worldwideMessage ||
      instruction,

    width / 2,

    height - 23
  );
}

// ==================================================
// ANONYMOUS START DRAWING
// ==================================================

function worldwideStartDrawing() {
  if (!window.shareConnected) {
    return;
  }

  anonymousDrawingReturnPage =
    worldwidePage;

  let artwork = null;

  /*
    Only collaborative artworks use
    an existing drawing as their base.
  */

  if (
    anonymousPurpose === "contribution"
  ) {
    if (
      worldwideSelected &&

      worldwideVisited.has(
        worldwideSelected
      )
    ) {
      worldwideMessage =
        "You have already contributed to this artwork.";

      return;
    }

    artwork =
      worldwideArtwork(
        worldwideSelected
      );

    if (!artwork) {
      worldwideMessage =
        "This artwork is unavailable.";

      return;
    }

    if (
      isPromptResponse(
        artwork
      )
    ) {
      return;
    }
  }

  /*
    Prompt responses and free drawings always
    begin with a blank canvas.
  */

  worldwideBase =
    artwork
      ? cloneData(artwork)
      : null;

  worldwideTools.zoomLevel =
    Number(
      artwork?.zoomLevel
    ) || MAX_ZOOM;

  drawingMode = true;
  eraserMode = false;

  brushAdjustmentActive = false;
  brushPermissionPending = false;

  localStrokes = [];
  currentStroke = null;

  worldwidePage = "draw";

  worldwideMessage = "";
}

// ==================================================
// BEGIN ANONYMOUS CONTRIBUTION
// ==================================================

function beginAnonymousContribution() {
  if (
    worldwidePage === "view"
  ) {
    anonymousPurpose =
      "contribution";
  } else if (
    worldwidePage === "prompt"
  ) {
    anonymousPurpose =
      "prompt-response";
  } else if (
    worldwidePage === "free"
  ) {
    anonymousPurpose =
      "free";
  } else {
    return;
  }

  worldwideStartDrawing();
}

// ==================================================
// BEGIN INDEPENDENT PROMPT RESPONSE
// ==================================================

function beginIndependentResponse() {
  if (
    worldwidePage !== "response" ||
    !window.shareConnected
  ) {
    return;
  }

  const artwork =
    worldwideArtwork(
      worldwideSelected
    );

  if (
    !artwork ||
    !isPromptResponse(artwork)
  ) {
    return;
  }

  // Retain the original prompt, not the drawing.

  worldwidePrompt =
    getArtworkPrompt(
      artwork
    );

  anonymousPurpose =
    "prompt-response";

  /*
    Keep the original response ID for navigation
    if the participant cancels.

    The save function will create a new ID and
    will not modify the original artwork.
  */

  worldwideStartDrawing();
}

// ==================================================
// ANONYMOUS DRAWING SCREEN
// ==================================================

function drawAnonymousDrawing() {
  const responding =
    anonymousPurpose ===
    "prompt-response";

  const freeDrawing =
    anonymousPurpose ===
    "free";

  drawAnonymousHeader(
    "Anonymous"
  );

  drawCircleBackground();

  // Display the base drawing only for contributions.

  if (
    worldwideBase &&

    Array.isArray(
      worldwideBase.strokes
    )
  ) {
    for (
      const strokeData of worldwideBase.strokes
    ) {
      drawStroke(
        strokeData
      );
    }
  }

  drawLocalArtwork();

  if (eraserMode) {
    drawEraserCursor();
  }

  /*
    Written prompts remain visible above
    the blank drawing canvas while responding.
  */

  if (responding) {
    drawPromptAboveArtwork(
      worldwidePrompt
    );
  }

  if (
    freeDrawing &&
    localStrokes.length === 0 &&
    !currentStroke
  ) {
    noStroke();
    fill(MUTED);
    textAlign(CENTER, CENTER);
    textSize(15);

    text(
      FREE_DRAWING_PROMPT,

      canvasArea.x -
        canvasArea.radius +
        25,

      canvasArea.y -
        canvasArea.radius +
        25,

      canvasArea.diameter - 50,

      canvasArea.diameter - 50
    );
  }

  drawSharedToolControls();

  drawSecondaryButton(
    leftButton,
    "CANCEL"
  );

  drawButton(
    rightButton,
    "FINISH"
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(11);

  let instruction =
    "Add your own marks to the artwork.";

  if (responding) {
    instruction =
      "Draw your own interpretation.";
  }

  if (freeDrawing) {
    instruction =
      "Draw anything you'd like.";
  }

  if (eraserMode) {
    instruction =
      "Erase your own unsaved marks.";
  }

  if (worldwideMessage) {
    instruction =
      worldwideMessage;
  }

  text(
    instruction,

    width / 2,

    height - 22
  );
}

// ==================================================
// ANONYMOUS SAVE
// ==================================================

function worldwideFinish() {
  if (!window.shareConnected) {
    worldwideMessage =
      "Reconnect before finishing.";

    return;
  }

  const state =
    getWorldwideState();

  if (!state) {
    worldwideMessage =
      "Collection unavailable.";

    return;
  }

  mouseReleased();

  // Prevent blank artworks from entering the collection.

  if (!localStrokes.length) {
    worldwideMessage =
      "Add something before finishing.";

    return;
  }

  const marks =
    cloneData(
      localStrokes
    );

  const zoom =
    worldwideTools.zoomLevel;

  const collection =
    cloneData(
      worldwideArtworks()
    );

  const purpose =
    anonymousPurpose;

  let savedArtworkId = null;

  // ==================================================
  // TYPE 1 — UPDATE COLLABORATIVE ARTWORK
  // ==================================================

  if (
    purpose === "contribution"
  ) {
    if (
      worldwideVisited.has(
        worldwideSelected
      )
    ) {
      worldwideMessage =
        "You have already contributed.";

      return;
    }

    const index =
      collection.findIndex(
        artwork =>
          artwork.id ===
          worldwideSelected
      );

    if (index === -1) {
      worldwideMessage =
        "Artwork unavailable.";

      return;
    }

    const artwork =
      collection[index];

    // Never modify independent prompt responses.

    if (
      isPromptResponse(
        artwork
      )
    ) {
      worldwideMessage =
        "Create your own interpretation instead.";

      return;
    }

    const previousVersion =
      Number(
        artwork.version
      ) || 1;

    const history =
      Array.isArray(
        artwork.versions
      )
        ? cloneData(
            artwork.versions
          )
        : [];

    // Preserve the original version history.

    if (
      !history.some(
        version =>
          Number(
            version.version
          ) ===
          previousVersion
      )
    ) {
      history.push({
        id:
          worldwideId(),

        version:
          previousVersion,

        zoomLevel:
          artwork.zoomLevel ||
          MAX_ZOOM,

        strokes:
          cloneData(
            artwork.strokes
          )
      });
    }

    const nextVersion =
      previousVersion + 1;

    // Contribute to the latest available version.

    const completedStrokes =
      cloneData(
        artwork.strokes
      ).concat(
        marks
      );

    history.push({
      id:
        worldwideId(),

      version:
        nextVersion,

      baseVersion:
        worldwideBase?.version ||
        previousVersion,

      zoomLevel:
        zoom,

      strokes:
        cloneData(
          completedStrokes
        )
    });

    collection[index] = {
      ...artwork,

      kind:
        "collaborative",

      version:
        nextVersion,

      zoomLevel:
        zoom,

      strokes:
        completedStrokes,

      versions:
        history
    };

    state.artworks =
      collection;

    worldwideVisited.add(
      artwork.id
    );

    savedArtworkId =
      artwork.id;

    console.log(
      "Collaborative artwork updated:",

      artwork.id,

      "Version",

      nextVersion
    );
  }

  // ==================================================
  // TYPE 2 — CREATE INDEPENDENT PROMPT RESPONSE
  // ==================================================

  else if (
    purpose === "prompt-response"
  ) {
    const id =
      worldwideId();

    /*
      Every response receives a new artwork ID.

      Responding to the original written prompt
      creates a new drawing.

      Shaking an existing response also creates
      a new drawing.

      Neither replaces any previous response.
    */

    const artwork = {
      id,

      title:
        "Anonymous interpretation",

      type:
        "prompt-response",

      kind:
        "prompt-response",

      prompt:
        worldwidePrompt,

      version:
        1,

      zoomLevel:
        zoom,

      strokes:
        marks,

      createdAt:
        new Date().toISOString()
    };

    collection.push(
      artwork
    );

    state.artworks =
      collection;

    savedArtworkId =
      id;

    console.log(
      "Independent prompt response created:",

      id,

      worldwidePrompt
    );
  }

  // ==================================================
  // TYPE 3 — CREATE FREE DRAWING
  // ==================================================

  else if (
    purpose === "free"
  ) {
    const id =
      worldwideId();

    /*
      Free drawings become collaborative artworks.

      Future participants can build on these
      drawings in the same way as starting artworks.
    */

    const artwork = {
      id,

      title:
        "Anonymous artwork",

      type:
        "drawing",

      kind:
        "collaborative",

      prompt:
        "",

      version:
        1,

      zoomLevel:
        zoom,

      strokes:
        marks,

      versions: [
        {
          id:
            worldwideId(),

          version:
            1,

          zoomLevel:
            zoom,

          strokes:
            cloneData(marks)
        }
      ],

      createdAt:
        new Date().toISOString()
    };

    collection.push(
      artwork
    );

    state.artworks =
      collection;

    worldwideVisited.add(
      id
    );

    savedArtworkId =
      id;

    console.log(
      "Free drawing created:",
      id
    );
  } else {
    worldwideMessage =
      "Unable to identify this contribution.";

    return;
  }

  // ==================================================
  // FINISH THE CURRENT INTERACTION
  // ==================================================

  resetAnonymousDrawing();

  anonymousCollectionKey = "";

  anonymousPop = null;

  worldwidePage =
    "thanks";

  if (
    purpose === "contribution"
  ) {
    worldwideMessage =
      "Thank you for\nyour contribution.";
  } else if (
    purpose === "prompt-response"
  ) {
    worldwideMessage =
      "Your interpretation has\njoined the collection.";
  } else {
    worldwideMessage =
      "Your bubble has\njoined the collection.";
  }

  /*
    New artworks are inserted into the circulation queue.

    They can appear as soon as an existing
    floating bubble leaves the screen.
  */

  updateAnonymousMediaQueue();

  if (
    purpose !== "contribution" &&
    savedArtworkId
  ) {
    const media =
      getAnonymousMedia().find(
        item =>
          item.id ===
          savedArtworkId
      );

    if (media) {
      anonymousMediaQueue =
        anonymousMediaQueue.filter(
          item =>
            item.key !==
            media.key
        );

      anonymousMediaQueue.unshift(
        media
      );

      /*
        Introduce the new artwork into a
        current media slot without changing
        the number of free bubbles.
      */

      const mediaSlots =
        anonymousBubbles
          .map(
            (bubble, index) => ({
              bubble,
              index
            })
          )
          .filter(
            item =>
              item.bubble.type !==
              "free"
          );

      if (mediaSlots.length) {
        const slot =
          mediaSlots.reduce(
            (lowest, current) =>
              current.bubble.y >
              lowest.bubble.y
                ? current
                : lowest
          );

        const original =
          slot.bubble;

        anonymousBubbles[
          slot.index
        ] = {
          ...original,
          ...media
        };
      }
    }
  }

  console.log(
    "Current shared collection:",

    worldwideArtworks().map(
      artwork => ({
        id: artwork.id,

        version: artwork.version,

        kind:
          isPromptResponse(artwork)
            ? "prompt-response"
            : "collaborative",

        prompt:
          artwork.prompt || ""
      })
    )
  );
}

// ==================================================
// ANONYMOUS COMPLETION SCREEN
// ==================================================

function drawAnonymousThankYou() {
  drawAnonymousHeader(
    "Anonymous"
  );

  const diameter =
    min(
      width - 90,
      height * 0.34,
      300
    );

  const centerX =
    width / 2;

  const centerY =
    height * 0.43;

  noStroke();
  fill(PAPER);

  circle(
    centerX,
    centerY,
    diameter
  );

  drawRainbowRing(
    centerX,
    centerY,
    diameter,
    230,
    2.5
  );

  noStroke();
  fill(WHITE);
  textAlign(CENTER, CENTER);

  textSize(
    min(
      19,
      diameter * 0.077
    )
  );

  text(
    worldwideMessage ||
      "Thank you for\nyour contribution.",

    centerX -
      diameter / 2 +
      15,

    centerY -
      diameter / 2 +
      15,

    diameter - 30,

    diameter - 30
  );

  // All three completion types have one button.

  setAnonymousButtons(
    "single"
  );

  drawButton(
    anonymousPrimaryButton,
    "CONTINUE"
  );
}

// ==================================================
// ANONYMOUS MAIN DRAW LOOP
// ==================================================

function drawAnonymous() {
  if (
    worldwidePage === "loading"
  ) {
    drawAnonymousLoading();

    return;
  }

  if (!window.shareConnected) {
    drawAnonymousHeader(
      "Anonymous"
    );

    noStroke();
    fill(MUTED);
    textAlign(CENTER, CENTER);
    textSize(14);

    text(
      "Reconnecting to the collection...",

      width / 2,

      height / 2
    );

    return;
  }

  if (
    worldwidePage === "discover"
  ) {
    drawAnonymousDiscovery();

    return;
  }

  if (
    worldwidePage === "view" ||
    worldwidePage === "prompt" ||
    worldwidePage === "response" ||
    worldwidePage === "free"
  ) {
    drawAnonymousReveal();

    return;
  }

  if (
    worldwidePage === "draw"
  ) {
    drawAnonymousDrawing();

    return;
  }

  if (
    worldwidePage === "thanks"
  ) {
    drawAnonymousThankYou();

    return;
  }

  anonymousDiscover();
}

// ==================================================
// ANONYMOUS CANCEL
// ==================================================

function cancelAnonymousDrawing() {
  if (
    (
      localStrokes.length ||
      currentStroke
    ) &&

    !confirm(
      "Discard your unsaved contribution?"
    )
  ) {
    return;
  }

  const previousArtwork =
    worldwideSelected;

  const returnPage =
    anonymousDrawingReturnPage;

  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  brushAdjustmentActive = false;
  brushPermissionPending = false;

  worldwideBase = null;
  worldwideMessage = "";

  if (
    returnPage === "view" ||
    returnPage === "response"
  ) {
    if (previousArtwork) {
      worldwideOpenArtwork(
        previousArtwork
      );
    } else {
      anonymousDiscover();
    }

    return;
  }

  if (returnPage === "free") {
    worldwideOpenFreeBubble();
    return;
  }

  if (returnPage === "prompt") {
    worldwideOpenPrompt(
      worldwidePrompt
    );

    return;
  }

  anonymousDiscover();
}

// ==================================================
// ANONYMOUS INPUT
// ==================================================

function anonymousPress(
  x,
  y
) {
  // Return to the mode selection menu.

  if (
    insideButton(
      x,
      y,
      worldwideBackButton
    )
  ) {
    if (
      drawingMode &&

      (
        localStrokes.length ||
        currentStroke
      ) &&

      !confirm(
        "Discard your unsaved contribution?"
      )
    ) {
      return;
    }

    resetAnonymousDrawing();

    returnToModes();

    return;
  }

  if (!window.shareConnected) {
    return;
  }

  // ==================================================
  // DISCOVERY INPUT
  // ==================================================

  if (
    worldwidePage === "discover"
  ) {
    if (anonymousPop) {
      return;
    }

    /*
      Only allow visible floating bubbles
      to be selected.
    */

    if (
      y < 150 ||
      y > height - 35
    ) {
      return;
    }

    for (
      let i =
        anonymousBubbles.length - 1;

      i >= 0;

      i--
    ) {
      const bubble =
        anonymousBubbles[i];

      if (
        dist(
          x,
          y,
          bubble.x,
          bubble.y
        ) <=

        bubble.size / 2 + 5
      ) {
        beginAnonymousPop(
          bubble
        );

        return;
      }
    }

    return;
  }

  // ==================================================
  // ORIGINAL ARTWORK, PROMPT AND FREE BUBBLE INPUT
  // ==================================================

  if (
    worldwidePage === "view" ||
    worldwidePage === "prompt" ||
    worldwidePage === "free"
  ) {
    if (
      insideButton(
        x,
        y,
        anonymousPrimaryButton
      )
    ) {
      beginAnonymousContribution();

      return;
    }

    if (
      insideButton(
        x,
        y,
        anonymousSecondaryButton
      )
    ) {
      anonymousDiscover();

      return;
    }

    return;
  }

  // ==================================================
  // PROMPT RESPONSE INPUT
  // ==================================================

  if (
    worldwidePage === "response"
  ) {
    /*
      On motion-enabled phones, the only
      button is PASS.

      Shaking opens a blank canvas.
    */

    if (window.sensorsEnabled) {
      if (
        insideButton(
          x,
          y,
          anonymousPrimaryButton
        )
      ) {
        anonymousDiscover();
      }

      return;
    }

    /*
      Desktop and unavailable-motion fallback.
    */

    if (
      insideButton(
        x,
        y,
        anonymousPrimaryButton
      )
    ) {
      beginIndependentResponse();

      return;
    }

    if (
      insideButton(
        x,
        y,
        anonymousSecondaryButton
      )
    ) {
      anonymousDiscover();

      return;
    }

    return;
  }

  // ==================================================
  // DRAWING INPUT
  // ==================================================

  if (
    worldwidePage === "draw"
  ) {
    if (
      handleToolControlPress(
        x,
        y
      )
    ) {
      return;
    }

    if (
      insideButton(
        x,
        y,
        rightButton
      )
    ) {
      worldwideFinish();

      return;
    }

    if (
      insideButton(
        x,
        y,
        leftButton
      )
    ) {
      cancelAnonymousDrawing();

      return;
    }

    if (
      insideDrawingCircle(
        x,
        y
      )
    ) {
      if (eraserMode) {
        eraseLocalStrokesAt(
          x,
          y
        );

        return;
      }

      worldwideMessage = "";

      currentStroke = {
        color:
          worldwideTools.brushColor ||
          WHITE,

        weight:
          worldwideTools.brushSize ||
          4,

        points: []
      };

      addDrawingPoint(
        x,
        y
      );
    }

    return;
  }

  // ==================================================
  // COMPLETION SCREEN INPUT
  // ==================================================

  if (
    worldwidePage === "thanks"
  ) {
    if (
      insideButton(
        x,
        y,
        anonymousPrimaryButton
      )
    ) {
      anonymousDiscover();

      return;
    }
  }
}

// ==================================================
// COLLECTIVE INPUT
// ==================================================

function collectivePress(
  x,
  y
) {
  if (activeVersionPreview) {
    if (!window.sensorsEnabled) {
      popVersionPreview();
    }

    return;
  }

  if (
    handleToolControlPress(
      x,
      y
    )
  ) {
    return;
  }

  if (
    !drawingMode &&

    insideButton(
      x,
      y,
      modeButton
    )
  ) {
    returnToModes();

    return;
  }

  if (!window.shareConnected) {
    return;
  }

  if (!drawingMode) {
    // Check artwork version bubbles first.

    for (
      let i =
        versionBubbles.length - 1;

      i >= 0;

      i--
    ) {
      const b =
        versionBubbles[i];

      if (
        dist(
          x,
          y,
          b.x,
          b.y
        ) <

        b.size / 2 + 12
      ) {
        openVersionPreview(
          b
        );

        return;
      }
    }

    // Check ordinary waiting bubbles.

    for (
      let i =
        waitingBubbles.length - 1;

      i >= 0;

      i--
    ) {
      const b =
        waitingBubbles[i];

      if (b.popping) {
        continue;
      }

      if (
        dist(
          x,
          y,
          b.x,
          b.y
        ) <

        b.size / 2 + 12
      ) {
        popWaitingBubble(
          b
        );

        return;
      }
    }
  }

  if (
    insideButton(
      x,
      y,
      leftButton
    )
  ) {
    if (!drawingMode) {
      startTurn();
    }

    return;
  }

  if (
    insideButton(
      x,
      y,
      rightButton
    )
  ) {
    if (drawingMode) {
      finishTurn();
    } else {
      passTurn();
    }

    return;
  }

  if (
    drawingMode &&

    insideDrawingCircle(
      x,
      y
    )
  ) {
    if (eraserMode) {
      eraseLocalStrokesAt(
        x,
        y
      );

      return;
    }

    const settings =
      getActiveToolSettings();

    currentStroke = {
      color:
        settings.brushColor ||
        WHITE,

      weight:
        settings.brushSize ||
        4,

      points: []
    };

    addDrawingPoint(
      x,
      y
    );
  }
}

// ==================================================
// GENERAL POINTER INPUT
// ==================================================

function mousePressed() {
  if (
    activeMode === "menu"
  ) {
    handleModeSelection(
      mouseX,
      mouseY
    );

    return;
  }

  if (
    activeMode === "worldwide"
  ) {
    anonymousPress(
      mouseX,
      mouseY
    );

    return;
  }

  if (
    activeMode === "group"
  ) {
    collectivePress(
      mouseX,
      mouseY
    );
  }
}

function mouseDragged() {
  if (
    (
      activeMode !== "group" &&
      activeMode !== "worldwide"
    ) ||

    !drawingMode ||

    activeVersionPreview
  ) {
    return;
  }

  if (
    activeMode === "worldwide" &&
    worldwidePage !== "draw"
  ) {
    return;
  }

  if (
    !insideDrawingCircle(
      mouseX,
      mouseY
    )
  ) {
    return;
  }

  if (eraserMode) {
    eraseLocalStrokesAt(
      mouseX,
      mouseY
    );

    return;
  }

  if (currentStroke) {
    addDrawingPoint(
      mouseX,
      mouseY
    );
  }
}

function mouseReleased() {
  if (currentStroke) {
    if (
      currentStroke.points.length > 0
    ) {
      localStrokes.push(
        currentStroke
      );
    }

    currentStroke = null;
  }
}

// ==================================================
// DRAWING COORDINATES
// ==================================================

function insideDrawingCircle(
  x,
  y
) {
  return (
    canvasArea &&

    dist(
      x,
      y,
      canvasArea.x,
      canvasArea.y
    ) <=

    canvasArea.radius
  );
}

function insideButton(
  x,
  y,
  button
) {
  return (
    !!button &&

    x >= button.x &&

    x <=
      button.x + button.w &&

    y >= button.y &&

    y <=
      button.y + button.h
  );
}

function addDrawingPoint(
  x,
  y
) {
  if (
    !currentStroke ||
    !canvasArea
  ) {
    return;
  }

  const zoom =
    constrain(
      Number(
        getActiveToolSettings().zoomLevel
      ) || MAX_ZOOM,

      MIN_ZOOM,
      MAX_ZOOM
    );

  const baseDiameter =
    canvasArea.baseDiameter;

  const normalizedX =
    (
      x -
      canvasArea.x
    ) /
    (
      baseDiameter *
      zoom
    ) + 0.5;

  const normalizedY =
    (
      y -
      canvasArea.y
    ) /
    (
      baseDiameter *
      zoom
    ) + 0.5;

  currentStroke.points.push({
    x:
      normalizedX,

    y:
      normalizedY
  });
}

// ==================================================
// WINDOW RESIZE
// ==================================================

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  updateLayout();

  if (
    activeMode === "group"
  ) {
    createWaitingBubbles();
  }

  anonymousCollectionKey = "";

  anonymousBubbles = [];

  anonymousPop = null;
}

// ==================================================
// END OF BUBBLE POP BUILD 1.1
// ==================================================
