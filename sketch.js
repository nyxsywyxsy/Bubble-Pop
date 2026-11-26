
/*
  BUBBLE POP
  BUILD 1.0 — COLLECTIVE & ANONYMOUS

  A temporary creative ecosystem.

  COLLECTIVE:
  Participants take turns developing a shared artwork.
  Completed versions appear as floating preview bubbles.
  Tap a version bubble to expand it.
  Shake the phone to pop the preview.

  ANONYMOUS:
  Discover an evolving collection of artworks and prompts.
  Pop a bubble to reveal its contents.
  Contribute or pass.
  Create new bubbles for other participants to discover.

  Both modes use the same Share room but maintain
  independent artwork collections and bubble counters.

  Starting artworks are imported from JSON backups.

  This is a complete, standalone sketch.js.
*/

// ==================================================
// SHARE CONNECTION
// ==================================================

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

const ANONYMOUS_EMPTY_COUNT = 2;
const ANONYMOUS_POP_DURATION = 350;
const MAX_ANONYMOUS_ARTWORKS = 13;

// ==================================================
// STARTING ARTWORKS AND PROMPTS
// ==================================================

const STARTING_ARTWORK_FILES = [
  "bubble-pop-starting-artwork-001.json",
  "bubble-pop-starting-artwork-002.json",
  "bubble-pop-starting-artwork-003.json",
  "bubble-pop-starting-artwork-004.json",
  "bubble-pop-starting-artwork-005.json"
];

const DEFAULT_PROMPTS = [
  "Draw something that makes you happy.",
  "Draw a place that exists only in your imagination.",
  "Turn a simple shape into something unexpected.",
  "Start something that someone else can transform.",
  "Draw something you noticed today."
];

const CREATION_PROMPT =
  "Start something new for others to build on.";

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
// VERSION PREVIEW STATE
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
  "worldwide" remains the internal Share namespace.

  This preserves compatibility with the existing
  artwork collection and JSON backups.

  Participants only see the name Anonymous.
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

let anonymousPop = null;

let anonymousPurpose = "contribution";

let anonymousPrimaryButton = null;
let anonymousSecondaryButton = null;

let anonymousLoading = false;
let anonymousLastLoadAttempt = -10000;

let anonymousLastRotation = 0;

let anonymousCreationReturnPage = "thanks";

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
    "Bubble Pop Build 1.0 — Collective & Anonymous"
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

  if (
    typeof group.brushSize !== "number"
  ) {
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

  if (
    typeof group.zoomLevel !== "number"
  ) {
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

  // Highlight first selected mode.

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

  // Initial mode entry requires two deliberate taps.

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

    // Ignore duplicate or very rapid events.

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

  const areaBottom =
    height - 245;

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

  const buttonY =
    height - 84;

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
        i *
        (swatchSize + swatchGap),

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
  const data =
    getSharedData();

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

  const data =
    getSharedData();

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
  const data =
    getSharedData();

  for (
    const strokeData
    of data.strokes
  ) {
    drawStroke(strokeData);
  }
}

function drawLocalArtwork() {
  for (
    const strokeData
    of localStrokes
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

  const points =
    strokeData.points;

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
      (
        points[0].x - 0.5
      ) *
      area.baseDiameter *
      zoom;

    const py =
      area.y +
      (
        points[0].y - 0.5
      ) *
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
        (
          point.x - 0.5
        ) *
        area.baseDiameter *
        zoom;

      const py =
        area.y +
        (
          point.y - 0.5
        ) *
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

    stroke(
      220,
      220,
      220,
      100
    );

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
    rotationY -
    tiltBaseline;

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

  // Prevent the initial permission interaction
  // from carrying into mode selection.

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
      (
        point.x - 0.5
      ) *
      canvasArea.baseDiameter *
      zoom,

    y:
      canvasArea.y +
      (
        point.y - 0.5
      ) *
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

  stroke(
    255,
    230,
    109,
    210
  );

  strokeWeight(1.5);

  circle(
    mouseX,

    mouseY,

    getEraserRadius() * 2
  );
}

// ==================================================
// ORDINARY WAITING BUBBLES
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

  let x =
    width / 2;

  let y =
    height / 2;

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
    x =
      random(width);

    y =
      random(height);
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
      ) *
      b.drift;

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
    const b
    of waitingBubbles
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

  fill(
    255,
    255,
    255,
    8
  );

  circle(
    0,
    0,
    b.size
  );

  noFill();

  strokeWeight(2.2);

  stroke(
    0,
    220,
    255,
    b.alpha
  );

  arc(
    0,
    0,
    b.size,
    b.size,
    190,
    270
  );

  stroke(
    170,
    80,
    255,
    b.alpha
  );

  arc(
    0,
    0,
    b.size,
    b.size,
    270,
    340
  );

  stroke(
    255,
    80,
    180,
    b.alpha
  );

  arc(
    0,
    0,
    b.size,
    b.size,
    340,
    55
  );

  stroke(
    70,
    130,
    255,
    b.alpha
  );

  arc(
    0,
    0,
    b.size,
    b.size,
    55,
    120
  );

  stroke(
    100,
    255,
    190,
    b.alpha
  );

  arc(
    0,
    0,
    b.size,
    b.size,
    120,
    190
  );

  noStroke();

  fill(
    255,
    255,
    255,
    155
  );

  ellipse(
    -b.size * 0.22,

    -b.size * 0.25,

    b.size * 0.22,

    b.size * 0.10
  );

  fill(
    255,
    255,
    255,
    100
  );

  circle(
    b.size * 0.24,

    b.size * 0.22,

    b.size * 0.07
  );

  pop();
}

// ==================================================
// EMPTY BUBBLE POPPING
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
      (
        1 + progress * 0.8
      );

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
    const snapshot
    of data.versions
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
      ) *
      b.drift;

    b.rotation +=
      b.rotationSpeed;

    b.x =
      constrain(
        b.x,

        b.size / 2,

        width - b.size / 2
      );

    if (
      b.y < -b.size
    ) {
      versionBubbles.splice(
        i,
        1
      );
    }
  }
}

function drawVersionBubbles() {
  for (
    const b
    of versionBubbles
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

  stroke(
    98,
    214,
    206,
    alpha
  );

  arc(
    x,
    y,
    size,
    size,
    190,
    265
  );

  stroke(
    182,
    155,
    255,
    alpha
  );

  arc(
    x,
    y,
    size,
    size,
    265,
    335
  );

  stroke(
    255,
    156,
    203,
    alpha
  );

  arc(
    x,
    y,
    size,
    size,
    335,
    50
  );

  stroke(
    40,
    123,
    255,
    alpha
  );

  arc(
    x,
    y,
    size,
    size,
    50,
    120
  );

  stroke(
    255,
    230,
    109,
    alpha
  );

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
// ARTWORK BUBBLE RENDERING
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

  fill(
    12,
    18,
    25,
    220
  );

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
      const strokeData
      of snapshot.strokes
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

  fill(
    255,
    255,
    255,
    180
  );

  ellipse(
    -b.size * 0.22,

    -b.size * 0.25,

    b.size * 0.22,

    b.size * 0.10
  );

  pop();

  noFill();

  stroke(
    255,
    255,
    255,
    125
  );

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

      width - previewSize / 2 - 12
    );

  const previewY =
    constrain(
      preview.y,

      previewSize / 2 + 65,

      height - previewSize / 2 - 65
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
      const strokeData
      of snapshot.strokes
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
        (
          progress - delay
        ) /
        (
          1 - delay
        ),

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

      190 *
      (
        1 - splashProgress
      )
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

      180 *
        (1 - splashProgress)
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
    const d
    of preview.droplets
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
      (
        1 -
        progress * 0.5
      )
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
// SHAKE INTERACTION
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

function deviceShaken() {
  if (
    activeMode === "group" &&
    activeVersionPreview
  ) {
    popVersionPreview();
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

  // Deduplicate by artwork ID.
  // Prefer the most developed version.

  const unique =
    new Map();

  for (
    const artwork
    of valid
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
  const state =
    getWorldwideState();

  const prompts =
    Array.isArray(
      state?.prompts
    )
      ? state.prompts
      : [];

  return Array.from(
    new Set(
      prompts
        .map(
          p =>
            typeof p === "string"
              ? p
              : p?.text
        )
        .filter(
          p =>
            typeof p === "string" &&
            p.trim()
        )
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
// IMPORT STARTING ARTWORKS
// ==================================================

async function prepareWorldwide() {
  if (
    !window.shareConnected ||
    !ensureSharedStructure()
  ) {
    return false;
  }

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
    allStartingArtworksPresent &&
    worldwidePrompts().length
  ) {
    return true;
  }

  if (worldwideSeedPending) {
    return worldwideSeedPending;
  }

  worldwideSeedPending =
    (async () => {
      const importedArtworks = [];

      // Only retrieve artwork backups that
      // are missing from the shared collection.

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

      // Read the current collection again
      // after the asynchronous imports.

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
        const artwork
        of importedArtworks
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

      // Assign the complete collection when
      // importing missing artwork backups.

      if (changed) {
        state.artworks =
          collection;
      }

      if (
        !worldwidePrompts().length
      ) {
        state.prompts =
          DEFAULT_PROMPTS.map(
            (text, index) => ({
              id:
                "seed-prompt-" +
                index,

              text
            })
          );
      }

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

  anonymousBubbles = [];

  anonymousCollectionKey = "";

  anonymousPop = null;

  anonymousLastRotation =
    millis();
}

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

  worldwidePage = "view";

  worldwideBase = null;

  worldwideTools.zoomLevel =
    Number(artwork.zoomLevel) ||
    MAX_ZOOM;

  worldwideMessage = "";
}

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
    ) ||
    worldwidePick(
      DEFAULT_PROMPTS
    );

  worldwidePage = "prompt";

  worldwideBase = null;

  worldwideTools.zoomLevel =
    MAX_ZOOM;

  worldwideMessage = "";
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
    subtitle ||
    "Anonymous",

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

  if (layout === "stacked") {
    anonymousPrimaryButton = {
      x: 18,

      y: height - 144,

      w: width - 36,

      h: 50
    };

    anonymousSecondaryButton = {
      x: 18,

      y: height - 84,

      w: width - 36,

      h: 50
    };

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
  const artworkMedia =
    worldwideArtworks().map(
      artwork => ({
        type: "artwork",

        id: artwork.id
      })
    );

  const promptMedia =
    worldwidePrompts().map(
      (prompt, index) => ({
        type: "prompt",

        id:
          "prompt-" +
          index,

        text: prompt
      })
    );

  return artworkMedia.concat(
    promptMedia
  );
}

function anonymousSignature() {
  return JSON.stringify({
    artworks:
      worldwideArtworks().map(
        artwork => [
          artwork.id,

          artwork.version
        ]
      ),

    prompts:
      worldwidePrompts(),

    width,

    height
  });
}

// ==================================================
// ANONYMOUS DISCOVERY BUBBLES
// ==================================================

function buildAnonymousBubbles() {
  const artworkMedia =
    anonymousShuffle(
      getAnonymousMedia().filter(
        item =>
          item.type === "artwork"
      )
    );

  const promptMedia =
    anonymousShuffle(
      getAnonymousMedia().filter(
        item =>
          item.type === "prompt"
      )
    );

  // Keep the artworks as the main focus,
  // while including written prompt bubbles.

  const columns =
    width >= 650
      ? 5
      : 3;

  const top = 155;

  const bottom =
    height - 65;

  const availableHeight =
    max(
      130,
      bottom - top
    );

  const cellWidth =
    (width - 30) /
    columns;

  const rows =
    max(
      2,

      min(
        6,

        floor(
          availableHeight /
          max(
            70,

            cellWidth * 0.82
          )
        )
      )
    );

  const cellHeight =
    availableHeight /
    rows;

  const totalSlots =
    columns * rows;

  const emptyCount =
    min(
      ANONYMOUS_EMPTY_COUNT,

      max(
        1,
        totalSlots - 1
      )
    );

  const mediaSlots =
    totalSlots -
    emptyCount;

  const promptSlots =
    promptMedia.length
      ? min(
          promptMedia.length,

          max(
            1,

            floor(
              mediaSlots * 0.3
            )
          )
        )
      : 0;

  const selectedArtworks =
    artworkMedia.slice(
      0,

      mediaSlots -
      promptSlots
    );

  const selectedPrompts =
    promptMedia.slice(
      0,

      mediaSlots -
      selectedArtworks.length
    );

  const chosenMedia =
    selectedArtworks.concat(
      selectedPrompts
    );

  // Fill unused positions with other media
  // before introducing empty bubbles.

  const chosenIds =
    new Set(
      chosenMedia.map(
        item =>
          item.id
      )
    );

  const remaining =
    anonymousShuffle(
      artworkMedia
        .concat(promptMedia)
        .filter(
          item =>
            !chosenIds.has(
              item.id
            )
        )
    );

  while (
    chosenMedia.length <
      mediaSlots &&

    remaining.length
  ) {
    chosenMedia.push(
      remaining.pop()
    );
  }

  const bubbleContents =
    chosenMedia.slice();

  for (
    let i = 0;
    i < emptyCount;
    i++
  ) {
    bubbleContents.push({
      type: "empty",

      id:
        "empty-" +
        i
    });
  }

  const shuffled =
    anonymousShuffle(
      bubbleContents
    );

  anonymousBubbles = [];

  for (
    let i = 0;
    i < shuffled.length;
    i++
  ) {
    const content =
      shuffled[i];

    const col =
      i % columns;

    const row =
      floor(
        i / columns
      );

    const centerX =
      15 +
      cellWidth * col +
      cellWidth / 2;

    const centerY =
      top +
      cellHeight * row +
      cellHeight / 2;

    const largestSize =
      min(
        cellWidth * 0.85,

        cellHeight * 0.82,

        125
      );

    const bubbleSize =
      content.type === "empty"
        ? largestSize * 0.48
        : random(
            largestSize * 0.76,

            largestSize
          );

    anonymousBubbles.push({
      ...content,

      x: centerX,

      y: centerY,

      baseX: centerX,

      baseY: centerY,

      size: bubbleSize,

      phase:
        random(360),

      rotation:
        random(360),

      rotationSpeed:
        random(
          -0.18,
          0.18
        ),

      alpha:
        random(
          160,
          235
        )
    });
  }

  anonymousCollectionKey =
    anonymousSignature();

  anonymousLastRotation =
    millis();
}

// ==================================================
// ANONYMOUS BUBBLE DRAWING
// ==================================================

function drawAnonymousMediaBubble(
  bubble
) {
  if (bubble.type === "empty") {
    drawWaitingBubble(
      bubble
    );

    return;
  }

  if (
    bubble.type === "artwork"
  ) {
    const artwork =
      worldwideArtwork(
        bubble.id
      );

    if (!artwork) {
      return;
    }

    drawVersionBubble({
      ...bubble,

      snapshot: artwork
    });

    return;
  }

  if (
    bubble.type === "prompt"
  ) {
    push();

    noStroke();

    fill(
      16,
      16,
      22
    );

    circle(
      bubble.x,

      bubble.y,

      bubble.size
    );

    drawRainbowRing(
      bubble.x,

      bubble.y,

      bubble.size,

      bubble.alpha,

      2.5
    );

    noStroke();

    fill(WHITE);

    textAlign(CENTER, CENTER);

    textSize(
      bubble.size * 0.33
    );

    text(
      "?",

      bubble.x,

      bubble.y
    );

    fill(
      255,
      255,
      255,
      150
    );

    ellipse(
      bubble.x -
        bubble.size * 0.2,

      bubble.y -
        bubble.size * 0.27,

      bubble.size * 0.18,

      bubble.size * 0.08
    );

    pop();
  }
}

// ==================================================
// ANONYMOUS DISCOVERY SCREEN
// ==================================================

function drawAnonymousDiscovery() {
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

  const currentKey =
    anonymousSignature();

  // Refresh whenever another participant
  // creates or develops an artwork.

  if (
    !anonymousPop &&
    (
      currentKey !==
        anonymousCollectionKey ||

      anonymousBubbles.length === 0
    )
  ) {
    buildAnonymousBubbles();
  }

  for (
    const bubble
    of anonymousBubbles
  ) {
    if (
      anonymousPop &&
      anonymousPop.bubble === bubble
    ) {
      continue;
    }

    // Gentle floating movement.

    bubble.x =
      bubble.baseX +
      sin(
        frameCount * 0.45 +
        bubble.phase
      ) * 5;

    bubble.y =
      bubble.baseY +
      cos(
        frameCount * 0.55 +
        bubble.phase
      ) * 8;

    bubble.rotation +=
      bubble.rotationSpeed;

    drawAnonymousMediaBubble(
      bubble
    );
  }

  drawAnonymousPop();

  // Refresh the visible selection periodically
  // if the collection is larger than the screen.

  const visibleMediaCount =
    anonymousBubbles.filter(
      b => b.type !== "empty"
    ).length;

  if (
    !anonymousPop &&

    getAnonymousMedia().length >
      visibleMediaCount &&

    millis() -
      anonymousLastRotation >
      18000
  ) {
    buildAnonymousBubbles();
  }

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
// ANONYMOUS BUBBLE POPPING
// ==================================================

function beginAnonymousPop(
  bubble
) {
  if (anonymousPop) {
    return;
  }

  anonymousPop = {
    bubble,

    startTime:
      millis(),

    x:
      bubble.x,

    y:
      bubble.y,

    size:
      bubble.size
  };

  // Only empty bubbles count towards
  // the recreational bubble-pop counter.

  if (
    bubble.type === "empty" &&
    window.shareConnected
  ) {
    const state =
      getWorldwideState();

    if (state) {
      state.bubblePopCount =
        (
          Number(
            state.bubblePopCount
          ) || 0
        ) + 1;
    }
  }
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
        cos(angle) *
        distance,

      animation.y +
        sin(angle) *
        distance,

      6 *
        (1 - progress)
    );
  }

  if (progress >= 1) {
    const bubble =
      animation.bubble;

    anonymousPop = null;

    if (
      bubble.type === "artwork"
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

    // Empty bubbles reappear.

    bubble.phase =
      random(360);

    bubble.rotation =
      random(360);
  }
}

// ==================================================
// ANONYMOUS REVEAL SCREEN
// ==================================================

function drawAnonymousReveal() {
  const isPrompt =
    worldwidePage === "prompt";

  const artwork =
    worldwideArtwork(
      worldwideSelected
    );

  if (
    !isPrompt &&
    !artwork
  ) {
    anonymousDiscover();

    return;
  }

  drawAnonymousHeader(
    "Anonymous"
  );

  noStroke();

  fill(MUTED);

  textAlign(CENTER, CENTER);

  textSize(12);

  text(
    isPrompt
      ? "A new idea"
      : "Version " +
        artwork.version,

    width / 2,

    118
  );

  drawCircleBackground();

  drawRainbowRing(
    canvasArea.x,

    canvasArea.y,

    canvasArea.diameter,

    210,

    2
  );

  if (isPrompt) {
    noStroke();

    fill(WHITE);

    textAlign(CENTER, CENTER);

    textSize(17);

    text(
      worldwidePrompt,

      canvasArea.x -
        canvasArea.diameter / 2 +
        24,

      canvasArea.y -
        canvasArea.diameter / 2 +
        24,

      canvasArea.diameter - 48,

      canvasArea.diameter - 48
    );
  } else {
    worldwideTools.zoomLevel =
      Number(
        artwork.zoomLevel
      ) || MAX_ZOOM;

    for (
      const strokeData
      of artwork.strokes
    ) {
      drawStroke(
        strokeData
      );
    }
  }

  const contributed =
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

  text(
    worldwideMessage ||
      (
        contributed
          ? "You have already added to this artwork."
          : "Become part of this artwork."
      ),

    width / 2,

    height - 23
  );
}

// ==================================================
// ANONYMOUS CONTRIBUTION
// ==================================================

function worldwideStartDrawing() {
  if (!window.shareConnected) {
    return;
  }

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

  const artwork =
    worldwideSelected
      ? worldwideArtwork(
          worldwideSelected
        )
      : null;

  if (
    worldwideSelected &&
    !artwork
  ) {
    worldwideMessage =
      "This artwork is unavailable.";

    return;
  }

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

function beginAnonymousContribution() {
  anonymousPurpose =
    "contribution";

  worldwideStartDrawing();
}

// ==================================================
// CREATE A NEW BUBBLE
// ==================================================

function beginAnonymousCreation() {
  if (!window.shareConnected) {
    return;
  }

  resetAnonymousDrawing();

  anonymousPurpose =
    "creation";

  worldwidePrompt =
    CREATION_PROMPT;

  worldwideTools.zoomLevel =
    MAX_ZOOM;

  worldwideStartDrawing();
}

// ==================================================
// ANONYMOUS DRAWING SCREEN
// ==================================================

function drawAnonymousDrawing() {
  const creating =
    anonymousPurpose === "creation";

  drawAnonymousHeader(
    creating
      ? "Create a bubble"
      : "Anonymous"
  );

  drawCircleBackground();

  if (
    worldwideBase &&
    Array.isArray(
      worldwideBase.strokes
    )
  ) {
    for (
      const strokeData
      of worldwideBase.strokes
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

  if (
    !worldwideBase &&
    localStrokes.length === 0 &&
    !currentStroke
  ) {
    noStroke();

    fill(MUTED);

    textAlign(CENTER, CENTER);

    textSize(15);

    text(
      creating
        ? CREATION_PROMPT
        : worldwidePrompt,

      canvasArea.x -
        canvasArea.diameter / 2 +
        25,

      canvasArea.y -
        canvasArea.diameter / 2 +
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
    creating
      ? "Introduce something new into the collection."
      : "Add your own marks to the artwork.";

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

  // Empty drawings do not create artwork.

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

  // ==================================================
  // CONTRIBUTE TO EXISTING ARTWORK
  // ==================================================

  if (worldwideSelected) {
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

    // Ensure the previous version is preserved.

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

    // Merge into the latest available artwork,
    // rather than the older drawing that was
    // originally revealed on this participant's phone.

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

      version:
        nextVersion,

      zoomLevel:
        zoom,

      strokes:
        completedStrokes,

      versions:
        history
    };

    // Reassign the shared artwork collection
    // so the updated array is visible to Share.

    state.artworks =
      collection;

    worldwideVisited.add(
      artwork.id
    );

    console.log(
      "Anonymous artwork updated:",

      artwork.id,

      "Version",

      nextVersion
    );
  }

  // ==================================================
  // CREATE NEW ARTWORK
  // ==================================================

  else {
    if (
      collection.length >=
      MAX_ANONYMOUS_ARTWORKS
    ) {
      worldwideMessage =
        "The collection is full. Cancel to continue.";

      return;
    }

    const id =
      worldwideId();

    const artwork = {
      id,

      title:
        "Anonymous artwork",

      type:
        "drawing",

      prompt:
        worldwidePrompt,

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

    console.log(
      "New Anonymous artwork:",

      id
    );
  }

  // ==================================================
  // FINISH CURRENT INTERACTION
  // ==================================================

  resetAnonymousDrawing();

  anonymousCollectionKey = "";

  anonymousBubbles = [];

  anonymousPop = null;

  if (purpose === "creation") {
    worldwidePage =
      "created";

    worldwideMessage =
      "Your bubble has joined the collection.";
  } else {
    worldwidePage =
      "thanks";

    worldwideMessage =
      "Thank you for your contribution.";
  }

  console.log(
    "Current shared collection:",

    worldwideArtworks().map(
      artwork => ({
        id: artwork.id,

        version: artwork.version
      })
    )
  );
}

// ==================================================
// ANONYMOUS THANK YOU SCREEN
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
    height * 0.42;

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

    220,

    2.5
  );

  noStroke();

  fill(WHITE);

  textAlign(CENTER, CENTER);

  textSize(19);

  text(
    "Thank you for\nyour contribution.",

    centerX,

    centerY - 16
  );

  fill(MUTED);

  textSize(12);

  text(
    "You have become part\nof the collection.",

    centerX,

    centerY + 38
  );

  setAnonymousButtons(
    "stacked"
  );

  drawButton(
    anonymousPrimaryButton,

    "CREATE A BUBBLE"
  );

  drawSecondaryButton(
    anonymousSecondaryButton,

    "PASS"
  );
}

// ==================================================
// ANONYMOUS NEW BUBBLE CONFIRMATION
// ==================================================

function drawAnonymousCreated() {
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

  textSize(19);

  text(
    "Your bubble has\njoined the collection.",

    centerX,

    centerY - 16
  );

  fill(MUTED);

  textSize(12);

  text(
    "See what it becomes.",

    centerX,

    centerY + 35
  );

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
    worldwidePage === "prompt"
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

  if (
    worldwidePage === "created"
  ) {
    drawAnonymousCreated();

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

  const wasCreation =
    anonymousPurpose === "creation";

  drawingMode = false;

  eraserMode = false;

  localStrokes = [];

  currentStroke = null;

  brushAdjustmentActive = false;

  brushPermissionPending = false;

  worldwideBase = null;

  worldwideMessage = "";

  if (wasCreation) {
    worldwideSelected = null;

    worldwidePage = "thanks";

    return;
  }

  if (previousArtwork) {
    worldwideOpenArtwork(
      previousArtwork
    );

    return;
  }

  worldwidePage = "prompt";
}

// ==================================================
// ANONYMOUS INPUT
// ==================================================

function anonymousPress(
  x,
  y
) {
  // Back to mode selection.

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
  // REVEAL INPUT
  // ==================================================

  if (
    worldwidePage === "view" ||
    worldwidePage === "prompt"
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
  // THANK YOU INPUT
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
      beginAnonymousCreation();

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
  // NEW BUBBLE CONFIRMATION INPUT
  // ==================================================

  if (
    worldwidePage === "created"
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
    // Preserve shake interaction.
    // Allow a tap fallback if motion
    // permissions are unavailable.

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

    // Check ordinary empty bubbles.

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
// END OF BUBBLE POP BUILD 1.0
// ==================================================
