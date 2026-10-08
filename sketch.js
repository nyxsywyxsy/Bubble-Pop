let minion = null;
let imageReady = false;

// --------------------------------
// INTERACTION STATE
// --------------------------------

let bubblePopped = false;
let popStarted = false;
let popStartTime = 0;

let lastShake = 0;

let popDuration = 1500;

let droplets = [];


// --------------------------------
// DISTORTION MEMORY
// --------------------------------

let distortionLevel = 0;

let lastFrameTime = 0;


// --------------------------------
// CONTRIBUTION STATE
// --------------------------------

let contributionActivated = false;
let contributionSubmitted = false;

let contributionFade = 0;
let submissionFade = 0;

let contributionStartTime = 0;
let submissionStartTime = 0;

let contributionFadeDuration = 3000;
let submissionFadeDuration = 2500;

let drawingPoints = [];


// --------------------------------
// DRAWING WAVE
// --------------------------------

let waveStartTime = 0;
let waveDuration = 5000;

let waveCopies = [];


// --------------------------------
// SETUP
// --------------------------------

async function setup() {

  createCanvas(windowWidth, windowHeight);

  lockGestures();

  enableGyroTap('Tap to enable motion sensors');

  // Very strong shake required
  setShakeThreshold(110);

  angleMode(DEGREES);

  imageMode(CENTER);

  minion = await loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg"
  );

  imageReady = true;

  lastFrameTime = millis();

  console.log("MINION LOADED");
}


// --------------------------------
// DRAW
// --------------------------------

function draw() {

  background(0);

  let bubbleX = width / 2;
  let bubbleY = height / 2;

  let bubbleSize =
    min(width, height) * 0.62;


  // --------------------------------
  // FRAME TIME
  // --------------------------------

  let currentTime = millis();

  let deltaTime =
    currentTime - lastFrameTime;

  lastFrameTime = currentTime;


  // --------------------------------
  // GET TILT
  // --------------------------------

  let tilt = 0;

  if (window.sensorsEnabled) {

    tilt = abs(rotationX);

    tilt = constrain(
      tilt,
      0,
      90
    );
  }


  // --------------------------------
  // GRADUAL REVEAL
  // --------------------------------

  let revealAmount = map(
    tilt,
    5,
    60,
    0,
    255
  );

  revealAmount = constrain(
    revealAmount,
    0,
    255
  );


  // --------------------------------
  // TIME-BASED DISTORTION
  // --------------------------------

  if (
    tilt >= 88 &&
    !bubblePopped &&
    !popStarted
  ) {

    distortionLevel +=
      0.00035 *
      deltaTime;

  } else if (tilt < 84) {

    distortionLevel -=
      0.00045 *
      deltaTime;
  }


  distortionLevel = constrain(
    distortionLevel,
    0,
    1
  );


  // --------------------------------
  // BUBBLE
  // --------------------------------

  if (!bubblePopped) {

    drawBubble(
      bubbleX,
      bubbleY,
      bubbleSize
    );


    // --------------------------------
    // MINION
    // --------------------------------

    if (
      !popStarted &&
      imageReady &&
      minion &&
      revealAmount > 0
    ) {

      drawMinionInsideBubble(
        bubbleX,
        bubbleY,
        bubbleSize,
        revealAmount,
        distortionLevel
      );
    }
  }


  // --------------------------------
  // POP
  // --------------------------------

  if (popStarted) {

    drawPopAnimation(
      bubbleX,
      bubbleY,
      bubbleSize
    );
  }


  // --------------------------------
  // ORIGINAL TEXT
  // --------------------------------

  textAlign(
    CENTER,
    CENTER
  );

  textFont("Georgia");


  if (!bubblePopped) {

    fill(
      255,
      255,
      255,
      230
    );

    textSize(
      min(width, height) * 0.045
    );

    text(
      "reveal what's hidden.",
      width / 2,
      height * 0.10
    );

  } else if (!contributionActivated) {

    // --------------------------------
    // BUBBLE GONE SCREEN
    // --------------------------------

    fill(
      255,
      255,
      255,
      230
    );

    textSize(
      min(width, height) * 0.045
    );

    text(
      "the bubble is gone.",
      width / 2,
      height / 2
    );
  }


  // --------------------------------
  // CONTRIBUTION SCREEN
  // --------------------------------

  if (
    bubblePopped &&
    contributionActivated &&
    !contributionSubmitted
  ) {

    if (contributionStartTime === 0) {

      contributionStartTime =
        millis();
    }


    let elapsed =
      millis() -
      contributionStartTime;


    contributionFade =
      constrain(
        elapsed /
        contributionFadeDuration,
        0,
        1
      );


    drawContributionUI(
      contributionFade
    );
  }


  // --------------------------------
  // DRAWING WAVE
  // --------------------------------

  if (
    contributionSubmitted
  ) {

    if (waveStartTime === 0) {

      waveStartTime =
        millis();
    }


    let waveElapsed =
      millis() -
      waveStartTime;


    drawContributionWave(
      waveElapsed
    );


    // --------------------------------
    // CONFIRMATION
    // --------------------------------

    let confirmationDelay =
      waveDuration * 0.72;


    if (
      waveElapsed >
      confirmationDelay
    ) {

      let confirmationProgress =
        constrain(
          (
            waveElapsed -
            confirmationDelay
          ) /
          submissionFadeDuration,
          0,
          1
        );


      drawSubmissionScreen(
        confirmationProgress
      );
    }
  }


  // --------------------------------
  // FINISH POP
  // --------------------------------

  if (popStarted) {

    let elapsed =
      millis() - popStartTime;

    if (elapsed > popDuration) {

      popStarted = false;

      bubblePopped = true;
    }
  }
}


// ================================================
// BUBBLE
// ================================================

function drawBubble(
  bubbleX,
  bubbleY,
  bubbleSize
) {

  noStroke();

  fill(
    2,
    15,
    18,
    210
  );

  ellipse(
    bubbleX,
    bubbleY,
    bubbleSize * 0.88
  );


  fill(
    0,
    70,
    75,
    35
  );

  ellipse(
    bubbleX - bubbleSize * 0.04,
    bubbleY - bubbleSize * 0.03,
    bubbleSize * 0.80
  );


  // Cyan

  fill(
    20,
    220,
    240,
    45
  );

  ellipse(
    bubbleX - bubbleSize * 0.28,
    bubbleY - bubbleSize * 0.12,
    bubbleSize * 0.38,
    bubbleSize * 0.65
  );


  // Purple

  fill(
    170,
    70,
    255,
    45
  );

  ellipse(
    bubbleX - bubbleSize * 0.10,
    bubbleY - bubbleSize * 0.35,
    bubbleSize * 0.45,
    bubbleSize * 0.35
  );


  // Pink

  fill(
    255,
    70,
    180,
    50
  );

  ellipse(
    bubbleX + bubbleSize * 0.20,
    bubbleY - bubbleSize * 0.30,
    bubbleSize * 0.48,
    bubbleSize * 0.35
  );


  // Blue

  fill(
    70,
    150,
    255,
    45
  );

  ellipse(
    bubbleX + bubbleSize * 0.34,
    bubbleY,
    bubbleSize * 0.28,
    bubbleSize * 0.55
  );


  // Green

  fill(
    80,
    255,
    190,
    42
  );

  ellipse(
    bubbleX + bubbleSize * 0.18,
    bubbleY + bubbleSize * 0.28,
    bubbleSize * 0.45,
    bubbleSize * 0.30
  );


  // Yellow

  fill(
    255,
    230,
    100,
    35
  );

  ellipse(
    bubbleX - bubbleSize * 0.20,
    bubbleY + bubbleSize * 0.30,
    bubbleSize * 0.45,
    bubbleSize * 0.25
  );


  // Outer glow

  noFill();

  strokeWeight(12);

  stroke(
    100,
    220,
    255,
    25
  );

  ellipse(
    bubbleX,
    bubbleY,
    bubbleSize,
    bubbleSize
  );


  // Rainbow edge

  strokeWeight(5);

  stroke(
    255,
    100,
    190,
    170
  );

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.05,
    PI * 1.48
  );


  stroke(
    170,
    100,
    255,
    170
  );

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.48,
    PI * 1.75
  );


  stroke(
    80,
    190,
    255,
    180
  );

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.75,
    PI * 2.05
  );


  stroke(
    80,
    240,
    230,
    180
  );

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 2.05,
    PI * 2.35
  );


  stroke(
    150,
    255,
    180,
    150
  );

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 2.35,
    PI * 2.60
  );


  stroke(
    255,
    230,
    120,
    150
  );

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 2.60,
    PI * 2.90
  );


  // Reflections

  stroke(
    255,
    255,
    255,
    150
  );

  strokeWeight(4);

  arc(
    bubbleX - bubbleSize * 0.14,
    bubbleY - bubbleSize * 0.13,
    bubbleSize * 0.65,
    bubbleSize * 0.65,
    PI * 1.05,
    PI * 1.45
  );


  stroke(
    255,
    255,
    255,
    100
  );

  strokeWeight(2);

  arc(
    bubbleX + bubbleSize * 0.13,
    bubbleY + bubbleSize * 0.12,
    bubbleSize * 0.70,
    bubbleSize * 0.70,
    0,
    HALF_PI
  );


  // Reflection spots

  noStroke();

  fill(
    255,
    255,
    255,
    180
  );

  ellipse(
    bubbleX - bubbleSize * 0.25,
    bubbleY - bubbleSize * 0.25,
    bubbleSize * 0.045
  );

  ellipse(
    bubbleX + bubbleSize * 0.27,
    bubbleY - bubbleSize * 0.17,
    bubbleSize * 0.035
  );


  fill(
    255,
    255,
    255,
    100
  );

  ellipse(
    bubbleX - bubbleSize * 0.32,
    bubbleY - bubbleSize * 0.03,
    bubbleSize * 0.025
  );


  // Sparkles

  stroke(
    255,
    255,
    255,
    170
  );

  strokeWeight(1.5);

  drawSparkle(
    bubbleX - bubbleSize * 0.39,
    bubbleY - bubbleSize * 0.10,
    bubbleSize * 0.025
  );

  drawSparkle(
    bubbleX + bubbleSize * 0.39,
    bubbleY - bubbleSize * 0.25,
    bubbleSize * 0.02
  );

  drawSparkle(
    bubbleX + bubbleSize * 0.28,
    bubbleY + bubbleSize * 0.43,
    bubbleSize * 0.018
  );
}


// ================================================
// MINION + SLOW DISTORTION
// ================================================

function drawMinionInsideBubble(
  x,
  y,
  size,
  opacity,
  distortionLevel
) {

  push();

  drawingContext.save();

  drawingContext.beginPath();

  drawingContext.arc(
    x,
    y,
    size * 0.49,
    0,
    Math.PI * 2
  );

  drawingContext.clip();


  let imageSize =
    size * 0.98;


  let intensity =
    distortionLevel;


  // --------------------------------
  // NORMAL IMAGE
  // --------------------------------

  if (intensity < 0.02) {

    tint(
      255,
      opacity
    );

    image(
      minion,
      x,
      y,
      imageSize,
      imageSize
    );

    noTint();

  } else {


    // ========================================
    // DEEPENING BLACKS
    // ========================================

    let blackStrength =
      100 -
      intensity * 45;


    drawingContext.filter =
      "contrast(" +
      (
        100 +
        intensity * 180
      ) +
      "%) brightness(" +
      blackStrength +
      "%)";


    tint(
      255,
      opacity
    );


    image(
      minion,
      x,
      y,
      imageSize,
      imageSize
    );


    drawingContext.filter =
      "none";


    // ========================================
    // SUBTLE RGB SEPARATION
    // ========================================

    let rgbShift =
      intensity * 55;


    if (intensity > 0.08) {

      tint(
        255,
        255,
        255,
        opacity *
        intensity *
        0.45
      );


      image(
        minion,
        x - rgbShift,
        y,
        imageSize,
        imageSize
      );


      tint(
        255,
        255,
        255,
        opacity *
        intensity *
        0.30
      );


      image(
        minion,
        x + rgbShift,
        y,
        imageSize,
        imageSize
      );


      noTint();
    }


    // ========================================
    // HORIZONTAL SLICING
    // ========================================

    let sliceCount =
      5 +
      floor(
        intensity * 15
      );


    for (
      let i = 0;
      i < sliceCount;
      i++
    ) {

      let sliceHeight =
        imageSize /
        sliceCount;


      let sliceY =
        y -
        imageSize / 2 +
        i * sliceHeight;


      let direction =
        i % 2 === 0
          ? 1
          : -1;


      let shift =
        direction *
        intensity *
        120;


      if (intensity > 0.35) {

        shift +=
          random(
            -1,
            1
          ) *
          intensity *
          50;
      }


      drawingContext.save();

      drawingContext.beginPath();

      drawingContext.rect(
        x - imageSize,
        sliceY,
        imageSize * 2,
        sliceHeight + 4
      );

      drawingContext.clip();


      drawingContext.filter =
        "contrast(" +
        (
          100 +
          intensity * 180
        ) +
        "%)";


      tint(
        255,
        255,
        255,
        opacity
      );


      image(
        minion,
        x + shift,
        y,
        imageSize,
        imageSize
      );


      drawingContext.restore();
    }


    // ========================================
    // PIXELATION
    // ========================================

    drawingContext.filter =
      "none";


    let pixelSize =
      2 +
      intensity * 28;


    let pixelCount =
      floor(
        intensity * 110
      );


    noStroke();


    for (
      let i = 0;
      i < pixelCount;
      i++
    ) {

      let px =
        x -
        imageSize / 2 +
        random(imageSize);


      let py =
        y -
        imageSize / 2 +
        random(imageSize);


      let blockSize =
        random(
          pixelSize * 0.4,
          pixelSize * 2
        );


      fill(
        0,
        0,
        0,
        random(
          70,
          230
        )
      );


      rect(
        px,
        py,
        blockSize,
        blockSize
      );
    }


    // ========================================
    // MISSING BLACK SECTIONS
    // ========================================

    let missingCount =
      floor(
        intensity * 25
      );


    for (
      let i = 0;
      i < missingCount;
      i++
    ) {

      let px =
        x -
        imageSize / 2 +
        random(imageSize);


      let py =
        y -
        imageSize / 2 +
        random(imageSize);


      let blockWidth =
        random(
          10,
          70
        );


      let blockHeight =
        random(
          5,
          30
        );


      fill(
        0,
        0,
        0,
        random(
          100,
          240
        )
      );


      rect(
        px,
        py,
        blockWidth,
        blockHeight
      );
    }


    // ========================================
    // GHOSTING
    // ========================================

    if (intensity > 0.25) {

      drawingContext.filter =
        "contrast(" +
        (
          100 +
          intensity * 200
        ) +
        "%)";


      tint(
        255,
        255,
        255,
        opacity *
        intensity *
        0.35
      );


      image(
        minion,
        x -
        intensity * 100,
        y +
        random(-8, 8),
        imageSize,
        imageSize
      );


      tint(
        255,
        255,
        255,
        opacity *
        intensity *
        0.30
      );


      image(
        minion,
        x +
        intensity * 100,
        y +
        random(-8, 8),
        imageSize,
        imageSize
      );


      noTint();
    }


    // ========================================
    // GLITCH BARS
    // ========================================

    drawingContext.filter =
      "none";


    let glitchCount =
      floor(
        intensity * 25
      );


    for (
      let i = 0;
      i < glitchCount;
      i++
    ) {

      let barY =
        y -
        imageSize / 2 +
        random(imageSize);


      let barWidth =
        random(
          imageSize * 0.15,
          imageSize * 0.9
        );


      let barHeight =
        random(
          2,
          12
        );


      let barX =
        x -
        imageSize / 2 +
        random(imageSize);


      fill(
        0,
        0,
        0,
        random(
          80,
          220
        )
      );


      rect(
        barX,
        barY,
        barWidth,
        barHeight
      );
    }
  }


  noTint();

  drawingContext.filter =
    "none";

  drawingContext.restore();

  pop();
}


// ================================================
// CONTRIBUTION UI
// ================================================

function drawContributionUI(
  fade
) {

  let centreX =
    width / 2;


  // --------------------------------
  // DRAWING AREA
  // --------------------------------

  let drawingWidth =
    min(
      width * 0.78,
      430
    );


  let drawingHeight =
    min(
      height * 0.34,
      260
    );


  let drawingX =
    centreX -
    drawingWidth / 2;


  let drawingY =
    height * 0.24;


  // --------------------------------
  // TITLE
  // --------------------------------

  textAlign(
    CENTER,
    CENTER
  );

  textFont("Georgia");

  textSize(
    min(width, height) * 0.035
  );


  fill(
    255,
    255,
    255,
    220 * fade
  );


  text(
    "leave something behind.",
    centreX,
    height * 0.10
  );


  // --------------------------------
  // DRAWING BOX
  // --------------------------------

  stroke(
    255,
    255,
    255,
    100 * fade
  );

  strokeWeight(1.5);

  fill(
    10,
    15,
    18,
    100 * fade
  );


  rect(
    drawingX,
    drawingY,
    drawingWidth,
    drawingHeight,
    18
  );


  // --------------------------------
  // DRAWING
  // --------------------------------

  if (drawingPoints.length > 0) {

    stroke(
      255,
      255,
      255,
      220 * fade
    );

    strokeWeight(3);

    noFill();


    for (
      let i = 1;
      i < drawingPoints.length;
      i++
    ) {

      let previous =
        drawingPoints[i - 1];


      let current =
        drawingPoints[i];


      if (
        current.newStroke ||
        previous.newStroke
      ) {
        continue;
      }


      line(
        previous.x,
        previous.y,
        current.x,
        current.y
      );
    }
  }


  // --------------------------------
  // HELPER TEXT
  // --------------------------------

  if (
    drawingPoints.length === 0
  ) {

    noStroke();

    fill(
      255,
      255,
      255,
      90 * fade
    );

    textSize(
      min(width, height) * 0.025
    );


    text(
      "draw something.",
      centreX,
      drawingY +
      drawingHeight / 2
    );
  }


  // --------------------------------
  // SUBMIT BUTTON
  // --------------------------------

  let buttonWidth =
    min(
      width * 0.55,
      250
    );


  let buttonHeight =
    48;


  let buttonX =
    centreX -
    buttonWidth / 2;


  let buttonY =
    drawingY +
    drawingHeight +
    28;


  noStroke();

  fill(
    255,
    255,
    255,
    220 * fade
  );


  rect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight,
    24
  );


  fill(
    0,
    0,
    0,
    230 * fade
  );


  textSize(
    min(width, height) * 0.021
  );


  text(
    "SUBMIT CONTRIBUTION",
    centreX,
    buttonY +
    buttonHeight / 2
  );
}


// ================================================
// DRAWING WAVE
// ================================================

function drawContributionWave(
  elapsed
) {

  if (
    drawingPoints.length === 0
  ) {
    return;
  }


  let progress =
    constrain(
      elapsed /
      waveDuration,
      0,
      1
    );


  // --------------------------------
  // DRAWING BOUNDS
  // --------------------------------

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;


  for (
    let i = 0;
    i < drawingPoints.length;
    i++
  ) {

    let point =
      drawingPoints[i];


    minX =
      min(
        minX,
        point.x
      );


    maxX =
      max(
        maxX,
        point.x
      );


    minY =
      min(
        minY,
        point.y
      );


    maxY =
      max(
        maxY,
        point.y
      );
  }


  let originalWidth =
    maxX - minX;


  let originalHeight =
    maxY - minY;


  let centreX =
    (minX + maxX) / 2;


  let centreY =
    (minY + maxY) / 2;


  // --------------------------------
  // MAKE THE DRAWING LARGE
  // --------------------------------

  let targetSize =
    min(width, height) *
    0.42;


  let originalSize =
    max(
      originalWidth,
      originalHeight,
      20
    );


  let scale =
    targetSize /
    originalSize;


  // --------------------------------
  // MULTIPLE WAVES
  // --------------------------------

  let copyCount = 13;


  for (
    let copy = 0;
    copy < copyCount;
    copy++
  ) {

    let offset =
      copy / copyCount;


    // Each copy follows the previous one.

    let copyProgress =
      progress -
      offset * 0.55;


    if (
      copyProgress < 0
    ) {
      continue;
    }


    // Move upward.

    let travel =
      copyProgress *
      (height + targetSize * 2);


    let waveX =
      width / 2 +
      sin(
        copyProgress * 360 +
        copy * 45
      ) *
      width *
      0.24;


    let waveY =
      height +
      targetSize -
      travel;


    // Make some copies larger.

    let pulse =
      1 +
      sin(
        copyProgress * 360 +
        copy * 50
      ) *
      0.12;


    let alpha =
      180 *
      (1 - copy * 0.035);


    // Fade them in and out naturally.

    if (
      copyProgress < 0.12
    ) {

      alpha *=
        copyProgress /
        0.12;
    }


    if (
      copyProgress > 0.82
    ) {

      alpha *=
        1 -
        (
          copyProgress -
          0.82
        ) /
        0.18;
    }


    push();


    translate(
      waveX,
      waveY
    );


    rotate(
      sin(
        copyProgress * 300 +
        copy * 40
      ) *
      15
    );


    scale(
      scale *
      pulse
    );


    translate(
      -centreX,
      -centreY
    );


    stroke(
      255,
      255,
      255,
      alpha
    );

    strokeWeight(
      3 /
      scale
    );

    noFill();


    // --------------------------------
    // RECREATE DRAWING
    // --------------------------------

    for (
      let i = 1;
      i < drawingPoints.length;
      i++
    ) {

      let previous =
        drawingPoints[i - 1];


      let current =
        drawingPoints[i];


      if (
        current.newStroke ||
        previous.newStroke
      ) {
        continue;
      }


      line(
        previous.x,
        previous.y,
        current.x,
        current.y
      );
    }


    pop();
  }
}


// ================================================
// SUBMISSION SCREEN
// ================================================

function drawSubmissionScreen(
  fade
) {

  let centreX =
    width / 2;


  let centreY =
    height / 2;


  textAlign(
    CENTER,
    CENTER
  );

  textFont("Georgia");

  textSize(
    min(width, height) * 0.045
  );


  fill(
    255,
    255,
    255,
    230 * fade
  );


  text(
    "your contribution has been added.",
    centreX,
    centreY
  );
}


// ================================================
// DRAWING INPUT
// ================================================

function mousePressed() {

  // --------------------------------
  // TAP AFTER BUBBLE POP
  // --------------------------------

  if (
    bubblePopped &&
    !contributionActivated &&
    !contributionSubmitted
  ) {

    contributionActivated = true;

    contributionStartTime =
      millis();

    console.log(
      "CONTRIBUTION SCREEN ACTIVATED"
    );

    return false;
  }


  // --------------------------------
  // DRAWING SCREEN
  // --------------------------------

  if (
    !bubblePopped ||
    !contributionActivated ||
    contributionSubmitted ||
    contributionFade < 0.7
  ) {
    return;
  }


  let drawingWidth =
    min(
      width * 0.78,
      430
    );


  let drawingHeight =
    min(
      height * 0.34,
      260
    );


  let drawingX =
    width / 2 -
    drawingWidth / 2;


  let drawingY =
    height * 0.24;


  // --------------------------------
  // DRAWING AREA
  // --------------------------------

  if (
    mouseX >= drawingX &&
    mouseX <= drawingX + drawingWidth &&
    mouseY >= drawingY &&
    mouseY <= drawingY + drawingHeight
  ) {

    drawingPoints.push({
      x: mouseX,
      y: mouseY,
      newStroke: true
    });

    return false;
  }


  // --------------------------------
  // SUBMIT BUTTON
  // --------------------------------

  let buttonWidth =
    min(
      width * 0.55,
      250
    );


  let buttonHeight =
    48;


  let buttonX =
    width / 2 -
    buttonWidth / 2;


  let buttonY =
    drawingY +
    drawingHeight +
    28;


  if (
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonWidth &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonHeight
  ) {

    if (
      drawingPoints.length > 0
    ) {

      contributionSubmitted = true;

      waveStartTime =
        millis();

      console.log(
        "CONTRIBUTION ADDED"
      );
    }

    return false;
  }
}


// --------------------------------
// CONTINUE DRAWING
// --------------------------------

function mouseDragged() {

  if (
    !bubblePopped ||
    !contributionActivated ||
    contributionSubmitted ||
    contributionFade < 0.7
  ) {
    return;
  }


  let drawingWidth =
    min(
      width * 0.78,
      430
    );


  let drawingHeight =
    min(
      height * 0.34,
      260
    );


  let drawingX =
    width / 2 -
    drawingWidth / 2;


  let drawingY =
    height * 0.24;


  if (
    mouseX >= drawingX &&
    mouseX <= drawingX + drawingWidth &&
    mouseY >= drawingY &&
    mouseY <= drawingY + drawingHeight
  ) {

    drawingPoints.push({
      x: mouseX,
      y: mouseY,
      newStroke: false
    });
  }


  return false;
}


// ================================================
// SHAKE
// ================================================

function deviceShaken() {

  if (
    millis() - lastShake > 1200 &&
    !bubblePopped &&
    !popStarted
  ) {

    popStarted = true;

    popStartTime =
      millis();

    createDroplets();

    lastShake =
      millis();

    console.log(
      "BUBBLE POP"
    );
  }
}


// ================================================
// DROPLETS
// ================================================

function createDroplets() {

  droplets = [];

  let centreX =
    width / 2;

  let centreY =
    height / 2;


  for (
    let i = 0;
    i < 20;
    i++
  ) {

    let angle =
      random(
        0,
        360
      );


    let speed =
      random(
        2.5,
        7
      );


    droplets.push({

      x: centreX,

      y: centreY,

      vx:
        cos(angle) *
        speed,

      vy:
        sin(angle) *
        speed,

      size:
        random(
          5,
          14
        ),

      alpha: 230
    });
  }
}


// ================================================
// POP ANIMATION
// ================================================

function drawPopAnimation(
  centreX,
  centreY,
  bubbleSize
) {

  let elapsed =
    millis() -
    popStartTime;


  let progress =
    constrain(
      elapsed /
      popDuration,
      0,
      1
    );


  let ringSize =
    bubbleSize *
    (
      1 +
      progress *
      0.65
    );


  let ringAlpha =
    200 *
    (
      1 -
      progress
    );


  noFill();

  stroke(
    180,
    230,
    255,
    ringAlpha
  );

  strokeWeight(
    6 *
    (
      1 -
      progress
    )
  );


  ellipse(
    centreX,
    centreY,
    ringSize
  );


  stroke(
    255,
    255,
    255,
    ringAlpha * 0.7
  );

  strokeWeight(2);


  ellipse(
    centreX,
    centreY,
    ringSize * 0.86
  );


  noStroke();


  for (
    let i = 0;
    i < droplets.length;
    i++
  ) {

    let d =
      droplets[i];


    d.x += d.vx;

    d.y += d.vy;

    d.vy += 0.06;


    d.alpha =
      230 *
      (
        1 -
        progress
      );


    fill(
      180,
      240,
      255,
      d.alpha
    );


    ellipse(
      d.x,
      d.y,
      d.size
    );


    fill(
      255,
      255,
      255,
      d.alpha * 0.8
    );


    ellipse(
      d.x -
      d.size * 0.20,

      d.y -
      d.size * 0.20,

      d.size * 0.25
    );
  }


  noStroke();


  fill(
    255,
    255,
    255,
    90 *
    (
      1 -
      progress
    )
  );


  ellipse(
    centreX,
    centreY,
    bubbleSize *
    0.35 *
    (
      1 +
      progress
    )
  );
}


// ================================================
// SPARKLE
// ================================================

function drawSparkle(
  x,
  y,
  size
) {

  line(
    x - size,
    y,
    x + size,
    y
  );


  line(
    x,
    y - size,
    x,
    y + size
  );


  line(
    x -
    size * 0.6,

    y -
    size * 0.6,

    x +
    size * 0.6,

    y +
    size * 0.6
  );


  line(
    x +
    size * 0.6,

    y -
    size * 0.6,

    x -
    size * 0.6,

    y +
    size * 0.6
  );
}


// ================================================
// RESIZE
// ================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}
