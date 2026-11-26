
/*
======================================================
BUBBLE POP
BUILD 0.9 — COLLECTIVE & ANONYMOUS

Adds:
- Renamed modes
- Deliberate initial mode selection
- Full-screen anonymous bubble discovery
- Artwork and prompt bubbles
- Contribution and creation loop
- Temporary shared creative ecosystem

Paste this entire section at the bottom of sketch.js.
======================================================
*/

// ==================================================
// ANONYMOUS SETTINGS
// ==================================================

const ANON_EMPTY_BUBBLES = 2;
const ANON_POP_DURATION = 300;

const ANON_CREATION_PROMPT =
  "Introduce something new into the collection.";

let anonBubbles = [];
let anonCollectionKey = "";
let anonCollectionPage = 0;

let anonPrimaryButton = null;
let anonSecondaryButton = null;

let anonPop = null;
let anonDrawingPurpose = "contribution";

let anonLoading = false;
let anonLoadAttempt = -5000;

let initialModeConfirmed = false;
let pendingModeSelection = null;
let pendingModeTime = 0;
let modeInputBlockedUntil = 0;

// Keep the existing working functions.

const previousMousePressed = mousePressed;
const previousWorldwideFinish = worldwideFinish;
const previousWorldwideStart = worldwideStartDrawing;
const previousUserSetupComplete = userSetupComplete;
const previousWindowResized = windowResized;


// ==================================================
// MOTION PERMISSIONS
// ==================================================

userSetupComplete = function () {
  previousUserSetupComplete();

  // The permission gesture must not select a mode.

  if (activeMode === "menu") {
    pendingModeSelection = null;
    pendingModeTime = 0;

    modeInputBlockedUntil = millis() + 500;
  }
};


// ==================================================
// UPDATED MAIN MENU
// ==================================================

drawModeSelection = function () {
  const buttonWidth = min(width - 48, 360);
  const buttonHeight = 76;
  const gap = 13;

  const x = (width - buttonWidth) / 2;

  const totalHeight =
    buttonHeight * 2 + gap;

  const startY =
    height / 2 - totalHeight / 2 + 30;

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

  // Highlight the selected mode before confirming it.

  if (
    !initialModeConfirmed &&
    pendingModeSelection
  ) {
    const button =
      pendingModeSelection === "group"
        ? groupMenuButton
        : worldwideMenuButton;

    push();

    noFill();
    stroke("#B69BFF");
    strokeWeight(2);

    rect(
      button.x,
      button.y,
      button.w,
      button.h,
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
};


// ==================================================
// DELIBERATE INITIAL MODE SELECTION
// ==================================================

mousePressed = function () {
  if (activeMode === "menu") {
    if (millis() < modeInputBlockedUntil) {
      return;
    }

    let selectedMode = null;

    if (
      insideButton(
        mouseX,
        mouseY,
        groupMenuButton
      )
    ) {
      selectedMode = "group";
    }

    if (
      insideButton(
        mouseX,
        mouseY,
        worldwideMenuButton
      )
    ) {
      selectedMode = "worldwide";
    }

    if (!selectedMode) {
      pendingModeSelection = null;
      return;
    }

    // First entry requires two deliberate taps.

    if (!initialModeConfirmed) {
      const elapsed =
        millis() - pendingModeTime;

      if (
        pendingModeSelection !== selectedMode ||
        elapsed > 6000
      ) {
        pendingModeSelection = selectedMode;
        pendingModeTime = millis();

        return;
      }

      // Prevent duplicate touch events from
      // being interpreted as the second tap.

      if (elapsed < 180) {
        return;
      }

      initialModeConfirmed = true;
      pendingModeSelection = null;
    }

    // Use the original mode-entry function.

    previousMousePressed();

    if (activeMode === "worldwide") {
      anonBubbles = [];
      anonCollectionKey = "";
      anonCollectionPage = 0;
      anonPop = null;
      anonDrawingPurpose = "contribution";
    }

    return;
  }

  // Anonymous uses its new input system.

  if (activeMode === "worldwide") {
    worldwidePress(mouseX, mouseY);
    return;
  }

  // Collective keeps its existing input system.

  return previousMousePressed();
};


// ==================================================
// COLLECTIVE MODE HEADER
// ==================================================

drawHeader = function () {
  const data = getSharedData();

  noStroke();
  fill(WHITE);
  textAlign(LEFT, TOP);
  textSize(25);

  text("bubble pop", 20, 18);

  fill(MUTED);
  textSize(13);

  text(
    "Collective",
    21,
    53
  );

  textAlign(RIGHT, TOP);
  textSize(11);

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
      (getGroupState()?.bubblePopCount || 0),
    21,
    105
  );
};


// ==================================================
// ANONYMOUS — GENERAL HELPERS
// ==================================================

function anonShuffle(items) {
  const shuffled = items.slice();

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    const temporary = shuffled[i];

    shuffled[i] = shuffled[j];
    shuffled[j] = temporary;
  }

  return shuffled;
}

function anonResetDrawing() {
  drawingMode = false;
  eraserMode = false;

  localStrokes = [];
  currentStroke = null;

  brushAdjustmentActive = false;
  brushPermissionPending = false;

  worldwideBase = null;
  worldwideSelected = null;
  worldwideMessage = "";
}

function anonDiscover() {
  anonResetDrawing();

  worldwidePage = "discover";

  anonDrawingPurpose = "contribution";
  anonPop = null;

  anonBubbles = [];
  anonCollectionKey = "";
  anonCollectionPage = 0;

  bubblePopAnimations = [];
}

// Replace automatic random artwork selection.
// Anonymous always begins with bubble discovery.

worldwideRandomEntry = function () {
  anonDiscover();
};


// ==================================================
// ANONYMOUS — HEADER
// ==================================================

function anonDrawHeader(subtitle) {
  const state = getWorldwideState();

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
      (state?.bubblePopCount || 0),
    21,
    83
  );

  worldwideBackButton = {
    x: width - 86,
    y: 58,
    w: 66,
    h: 25
  };

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
// ANONYMOUS — BUTTON LAYOUT
// ==================================================

function anonSetButtons(layout) {
  if (layout === "single") {
    anonPrimaryButton = {
      x: 18,
      y: height - 84,
      w: width - 36,
      h: 50
    };

    anonSecondaryButton = null;

    return;
  }

  if (layout === "stacked") {
    anonPrimaryButton = {
      x: 18,
      y: height - 144,
      w: width - 36,
      h: 50
    };

    anonSecondaryButton = {
      x: 18,
      y: height - 84,
      w: width - 36,
      h: 50
    };

    return;
  }

  anonPrimaryButton = {
    ...leftButton
  };

  anonSecondaryButton = {
    ...rightButton
  };
}

function anonDrawSecondaryButton(
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
  textSize(13);

  text(
    label,
    button.x + button.w / 2,
    button.y + button.h / 2
  );

  pop();
}


// ==================================================
// ANONYMOUS — BUBBLE COLLECTION
// ==================================================

function anonGetMedia() {
  const artworks =
    worldwideArtworks().map(
      artwork => ({
        type: "artwork",
        id: artwork.id,
        artwork
      })
    );

  const prompts =
    worldwidePrompts().map(
      (prompt, index) => ({
        type: "prompt",
        id: "prompt-" + index,
        text: prompt
      })
    );

  return artworks.concat(prompts);
}

function anonCollectionSignature() {
  return JSON.stringify({
    artworks: worldwideArtworks().map(
      artwork => [
        artwork.id,
        artwork.version
      ]
    ),

    prompts: worldwidePrompts(),

    width,
    height
  });
}


// ==================================================
// ANONYMOUS — CREATE DISCOVERY BUBBLES
// ==================================================

function anonBuildBubbles() {
  const allMedia =
    anonShuffle(anonGetMedia());

  const columns = width >= 650 ? 5 : 3;

  const top = 155;
  const bottom = height - 65;

  const availableHeight =
    max(130, bottom - top);

  const cellWidth =
    (width - 30) / columns;

  const rows = max(
    2,
    min(
      6,
      floor(
        availableHeight /
        max(70, cellWidth * 0.82)
      )
    )
  );

  const cellHeight =
    availableHeight / rows;

  const totalSlots =
    columns * rows;

  const emptyCount =
    min(
      ANON_EMPTY_BUBBLES,
      max(1, totalSlots - 1)
    );

  const mediaSlots =
    totalSlots - emptyCount;

  const chosenMedia =
    allMedia.slice(0, mediaSlots);

  // All media bubbles represent actual artworks
  // or actual written prompts.

  const bubbleContents =
    chosenMedia.slice();

  for (let i = 0; i < emptyCount; i++) {
    bubbleContents.push({
      type: "empty",
      id: "empty-" + i
    });
  }

  const shuffled =
    anonShuffle(bubbleContents);

  anonBubbles = [];

  for (
    let i = 0;
    i < shuffled.length;
    i++
  ) {
    const content = shuffled[i];

    const col = i % columns;
    const row = floor(i / columns);

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
        120
      );

    const bubbleSize =
      content.type === "empty"
        ? largestSize * 0.48
        : random(
            largestSize * 0.76,
            largestSize
          );

    anonBubbles.push({
      ...content,

      x: centerX,
      y: centerY,

      baseX: centerX,
      baseY: centerY,

      size: bubbleSize,

      phase: random(360),

      rotation: random(360),
      rotationSpeed:
        random(-0.18, 0.18),

      alpha: random(160, 235)
    });
  }

  anonCollectionKey =
    anonCollectionSignature();
}


// ==================================================
// ANONYMOUS — DRAW MEDIA BUBBLES
// ==================================================

function anonDrawMediaBubble(bubble) {
  if (bubble.type === "empty") {
    drawWaitingBubble(bubble);
    return;
  }

  if (bubble.type === "artwork") {
    const artwork =
      worldwideArtwork(bubble.id);

    if (!artwork) return;

    drawVersionBubble({
      ...bubble,
      snapshot: artwork
    });

    return;
  }

  if (bubble.type === "prompt") {
    push();

    noStroke();
    fill(16, 16, 22);

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

    fill(255, 255, 255, 150);

    ellipse(
      bubble.x - bubble.size * 0.2,
      bubble.y - bubble.size * 0.27,
      bubble.size * 0.18,
      bubble.size * 0.08
    );

    pop();
  }
}


// ==================================================
// ANONYMOUS — DISCOVERY SCREEN
// ==================================================

function anonDrawDiscovery() {
  anonDrawHeader("Anonymous");

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

  // Refresh the collection when another
  // participant adds or changes an artwork.

  const currentKey =
    anonCollectionSignature();

  if (
    !anonPop &&
    (
      currentKey !== anonCollectionKey ||
      anonBubbles.length === 0
    )
  ) {
    anonBuildBubbles();
  }

  for (const bubble of anonBubbles) {
    if (
      anonPop &&
      anonPop.bubble === bubble
    ) {
      continue;
    }

    // Gentle floating motion without
    // excessive overlap between bubbles.

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

    anonDrawMediaBubble(bubble);
  }

  anonDrawPop();

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
// ANONYMOUS — POP ANIMATION
// ==================================================

function anonBeginPop(bubble) {
  if (anonPop) return;

  anonPop = {
    bubble,
    startTime: millis(),
    x: bubble.x,
    y: bubble.y,
    size: bubble.size
  };

  // Only the empty bubbles increase
  // the recreational bubble-pop counter.

  if (
    bubble.type === "empty" &&
    window.shareConnected
  ) {
    const state = getWorldwideState();

    if (state) {
      state.bubblePopCount =
        (Number(state.bubblePopCount) || 0) + 1;
    }
  }
}

function anonDrawPop() {
  if (!anonPop) return;

  const animation = anonPop;

  const progress = constrain(
    (
      millis() -
      animation.startTime
    ) / ANON_POP_DURATION,
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
      (1 + progress * 0.65)
  );

  const colours = [
    "#62D6CE",
    "#B69BFF",
    "#FF9CCB",
    "#287BFF",
    "#FFE66D"
  ];

  for (let i = 0; i < 10; i++) {
    const angle =
      i * 36;

    const distance =
      animation.size *
      (0.28 + progress * 0.65);

    const dropletColour =
      color(colours[i % colours.length]);

    dropletColour.setAlpha(alpha);

    noStroke();
    fill(dropletColour);

    circle(
      animation.x +
        cos(angle) * distance,

      animation.y +
        sin(angle) * distance,

      6 * (1 - progress)
    );
  }

  if (progress >= 1) {
    const bubble = animation.bubble;

    anonPop = null;

    if (bubble.type === "artwork") {
      worldwideOpenArtwork(
        bubble.id
      );

      return;
    }

    if (bubble.type === "prompt") {
      worldwideOpenPrompt(
        bubble.text
      );

      return;
    }

    // Empty bubbles simply reappear.

    bubble.phase = random(360);
    bubble.rotation = random(360);
  }
}


// ==================================================
// ANONYMOUS — REVEAL ARTWORK OR PROMPT
// ==================================================

function anonDrawReveal() {
  const isPrompt =
    worldwidePage === "prompt";

  const artwork =
    worldwideArtwork(
      worldwideSelected
    );

  if (!isPrompt && !artwork) {
    anonDiscover();
    return;
  }

  anonDrawHeader("Anonymous");

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(12);

  text(
    isPrompt
      ? "A new idea"
      : "Version " + artwork.version,

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
        canvasArea.diameter / 2 + 24,

      canvasArea.y -
        canvasArea.diameter / 2 + 24,

      canvasArea.diameter - 48,
      canvasArea.diameter - 48
    );
  } else {
    worldwideTools.zoomLevel =
      Number(artwork.zoomLevel) ||
      MAX_ZOOM;

    for (
      const strokeData of artwork.strokes
    ) {
      drawStroke(strokeData);
    }
  }

  const contributed =
    worldwideSelected &&
    worldwideVisited.has(
      worldwideSelected
    );

  anonSetButtons("double");

  if (contributed) {
    anonDrawSecondaryButton(
      anonPrimaryButton,
      "ALREADY CONTRIBUTED"
    );
  } else {
    drawButton(
      anonPrimaryButton,
      "CONTRIBUTE"
    );
  }

  anonDrawSecondaryButton(
    anonSecondaryButton,
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
// ANONYMOUS — BEGIN CONTRIBUTION
// ==================================================

function anonBeginContribution() {
  if (
    worldwideSelected &&
    worldwideVisited.has(
      worldwideSelected
    )
  ) {
    worldwideMessage =
      "You have already contributed.";

    return;
  }

  anonDrawingPurpose = "contribution";

  previousWorldwideStart();
}


// ==================================================
// ANONYMOUS — CREATE A NEW BUBBLE
// ==================================================

function anonBeginCreation() {
  if (!window.shareConnected) return;

  anonResetDrawing();

  worldwidePrompt =
    ANON_CREATION_PROMPT;

  worldwideTools.zoomLevel =
    MAX_ZOOM;

  anonDrawingPurpose = "creation";

  previousWorldwideStart();

  if (drawingMode) {
    worldwidePage = "draw";
  }
}


// ==================================================
// ANONYMOUS — DRAWING SCREEN
// ==================================================

function anonDrawDrawing() {
  const creating =
    anonDrawingPurpose === "creation";

  anonDrawHeader(
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
      drawStroke(strokeData);
    }
  }

  drawLocalArtwork();

  if (eraserMode) {
    drawEraserCursor();
  }

  // Show the prompt before drawing.

  if (
    !worldwideBase &&
    localStrokes.length === 0 &&
    !currentStroke
  ) {
    noStroke();
    fill(MUTED);
    textAlign(CENTER, CENTER);
    textSize(15);

    const instruction =
      creating
        ? "Start something new for others to build on."
        : worldwidePrompt;

    text(
      instruction,

      canvasArea.x -
        canvasArea.diameter / 2 + 25,

      canvasArea.y -
        canvasArea.diameter / 2 + 25,

      canvasArea.diameter - 50,
      canvasArea.diameter - 50
    );
  }

  drawSharedToolControls();

  drawButton(
    rightButton,
    "FINISH"
  );

  anonDrawSecondaryButton(
    leftButton,
    "CANCEL"
  );

  noStroke();
  fill(MUTED);
  textAlign(CENTER, CENTER);
  textSize(11);

  let instruction =
    creating
      ? "Create something others can contribute to."
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
// ANONYMOUS — SAVE CONTRIBUTIONS
// ==================================================

worldwideFinish = function () {
  if (!window.shareConnected) {
    worldwideMessage =
      "Reconnect before finishing.";

    return;
  }

  mouseReleased();

  // Do not create empty artworks or versions.

  if (localStrokes.length === 0) {
    worldwideMessage =
      "Add something before finishing.";

    return;
  }

  const purpose =
    anonDrawingPurpose;

  // Use the existing shared artwork saving
  // and version history functionality.

  previousWorldwideFinish();

  // Continue only if the original save
  // function completed successfully locally.

  if (worldwidePage !== "thanks") {
    return;
  }

  anonBubbles = [];
  anonCollectionKey = "";
  anonPop = null;

  if (purpose === "creation") {
    worldwidePage = "created";

    worldwideMessage =
      "Your bubble has joined the collection.";
  } else {
    worldwidePage = "thanks";

    worldwideMessage =
      "Thank you for your contribution.";
  }

  console.log(
    "Anonymous collection:",
    worldwideArtworks().map(
      artwork => ({
        id: artwork.id,
        version: artwork.version
      })
    )
  );
};


// ==================================================
// ANONYMOUS — THANK YOU SCREEN
// ==================================================

function anonDrawThankYou() {
  anonDrawHeader("Anonymous");

  const diameter =
    min(
      width - 90,
      height * 0.34,
      300
    );

  const centerX = width / 2;

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

  anonSetButtons("stacked");

  drawButton(
    anonPrimaryButton,
    "CREATE A BUBBLE"
  );

  anonDrawSecondaryButton(
    anonSecondaryButton,
    "PASS"
  );
}


// ==================================================
// ANONYMOUS — NEW BUBBLE CONFIRMATION
// ==================================================

function anonDrawCreated() {
  anonDrawHeader("Anonymous");

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

  anonSetButtons("single");

  drawButton(
    anonPrimaryButton,
    "CONTINUE"
  );
}


// ==================================================
// ANONYMOUS — LOADING SCREEN
// ==================================================

function anonDrawLoading() {
  anonDrawHeader("Anonymous");

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
    anonLoading ||
    millis() - anonLoadAttempt < 2000
  ) {
    return;
  }

  anonLoading = true;
  anonLoadAttempt = millis();

  prepareWorldwide()
    .then(ready => {
      if (
        ready &&
        activeMode === "worldwide" &&
        worldwidePage === "loading"
      ) {
        anonDiscover();
      }
    })
    .catch(error => {
      console.error(
        "Collection loading error:",
        error
      );

      worldwideMessage =
        "Unable to load the collection. Retrying...";
    })
    .finally(() => {
      anonLoading = false;
    });
}


// ==================================================
// ANONYMOUS — MAIN DRAW FUNCTION
// ==================================================

drawWorldwide = function () {
  if (worldwidePage === "loading") {
    anonDrawLoading();
    return;
  }

  if (!window.shareConnected) {
    anonDrawHeader("Anonymous");

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

  if (worldwidePage === "discover") {
    anonDrawDiscovery();
    return;
  }

  if (
    worldwidePage === "view" ||
    worldwidePage === "prompt"
  ) {
    anonDrawReveal();
    return;
  }

  if (worldwidePage === "draw") {
    anonDrawDrawing();
    return;
  }

  if (worldwidePage === "thanks") {
    anonDrawThankYou();
    return;
  }

  if (worldwidePage === "created") {
    anonDrawCreated();
    return;
  }

  anonDiscover();
};


// ==================================================
// ANONYMOUS — CANCEL DRAWING
// ==================================================

function anonCancelDrawing() {
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

  const wasCreation =
    anonDrawingPurpose === "creation";

  const previousArtwork =
    worldwideSelected;

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
// ANONYMOUS — INPUT HANDLING
// ==================================================

worldwidePress = function (x, y) {
  // Return to the main mode-selection screen.

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

    anonResetDrawing();

    resetWorldwideEntry();

    anonBubbles = [];
    anonPop = null;

    activeMode = "menu";

    return;
  }

  if (!window.shareConnected) {
    return;
  }

  // ----------------------------------------------
  // DISCOVERY
  // ----------------------------------------------

  if (worldwidePage === "discover") {
    if (anonPop) return;

    for (
      let i = anonBubbles.length - 1;
      i >= 0;
      i--
    ) {
      const bubble =
        anonBubbles[i];

      if (
        dist(
          x,
          y,
          bubble.x,
          bubble.y
        ) <= bubble.size / 2 + 5
      ) {
        anonBeginPop(bubble);
        return;
      }
    }

    return;
  }

  // ----------------------------------------------
  // REVEALED ARTWORK OR PROMPT
  // ----------------------------------------------

  if (
    worldwidePage === "view" ||
    worldwidePage === "prompt"
  ) {
    if (
      insideButton(
        x,
        y,
        anonPrimaryButton
      )
    ) {
      anonBeginContribution();
      return;
    }

    if (
      insideButton(
        x,
        y,
        anonSecondaryButton
      )
    ) {
      anonDiscover();
      return;
    }

    return;
  }

  // ----------------------------------------------
  // DRAWING
  // ----------------------------------------------

  if (worldwidePage === "draw") {
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
      anonCancelDrawing();
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

      addDrawingPoint(x, y);
    }

    return;
  }

  // ----------------------------------------------
  // THANK YOU
  // ----------------------------------------------

  if (worldwidePage === "thanks") {
    if (
      insideButton(
        x,
        y,
        anonPrimaryButton
      )
    ) {
      anonBeginCreation();
      return;
    }

    if (
      insideButton(
        x,
        y,
        anonSecondaryButton
      )
    ) {
      anonDiscover();
      return;
    }

    return;
  }

  // ----------------------------------------------
  // NEW BUBBLE ADDED
  // ----------------------------------------------

  if (worldwidePage === "created") {
    if (
      insideButton(
        x,
        y,
        anonPrimaryButton
      )
    ) {
      anonDiscover();
      return;
    }
  }
};


// ==================================================
// WINDOW RESIZING
// ==================================================

windowResized = function () {
  previousWindowResized();

  anonCollectionKey = "";
  anonBubbles = [];
  anonPop = null;
};


// ==================================================
// BUILD INFORMATION
// ==================================================

console.log(
  "Bubble Pop 0.9 — Collective & Anonymous"
);

// ==================================================
// END OF BUILD 0.9
// ==================================================
