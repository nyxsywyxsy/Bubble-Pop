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

// This is separate from the phone angle.
// It allows the distortion to build over time.

let distortionLevel = 0;

let lastFrameTime = 0;


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

  // Distortion only begins once the phone
  // is tilted far enough.

  if (
    tilt > 40 &&
    !bubblePopped &&
    !popStarted
  ) {

    // The higher the tilt, the faster
    // the distortion builds.

    let buildSpeed = map(
      tilt,
      40,
      90,
      0.002,
      0.012
    );

    distortionLevel +=
      buildSpeed *
      deltaTime;

  } else {

    // If the phone comes back down,
    // slowly recover instead of instantly
    // resetting the distortion.

    distortionLevel -=
      0.0015 *
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
  // TEXT
  // --------------------------------

  textAlign(
    CENTER,
    CENTER
  );

  textFont("Georgia");

  fill(
    255,
    255,
    255,
    230
  );

  textSize(
    min(width, height) * 0.045
  );


  if (!bubblePopped) {

    text(
      "reveal what's hidden",
      width / 2,
      height * 0.10
    );

  } else {

    text(
      "the bubble is gone",
      width / 2,
      height * 0.10
    );
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
// MINION + TIME-BASED DISTORTION
// ================================================

function drawMinionInsideBubble(
  x,
  y,
  size,
  opacity,
  distortionLevel
) {

  push();


  // --------------------------------
  // CIRCLE MASK
  // --------------------------------

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


  // --------------------------------
  // DISTORTION INTENSITY
  // --------------------------------

  let intensity =
    distortionLevel;


  // --------------------------------
  // NORMAL IMAGE
  // --------------------------------

  if (intensity < 0.08) {

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
    // DEEP BLACK IMAGE
    // ========================================

    drawingContext.filter =
      "contrast(180%) brightness(60%)";


    tint(
      30,
      30,
      30,
      opacity
    );


    image(
      minion,
      x,
      y,
      imageSize,
      imageSize
    );


    // ========================================
    // RGB GHOSTING
    // ========================================

    drawingContext.filter =
      "none";


    let rgbShift =
      5 +
      intensity * 50;


    // Red ghost

    tint(
      255,
      255,
      255,
      opacity * 0.40
    );


    image(
      minion,
      x - rgbShift,
      y,
      imageSize,
      imageSize
    );


    // Blue ghost

    tint(
      255,
      255,
      255,
      opacity * 0.25
    );


    image(
      minion,
      x + rgbShift,
      y,
      imageSize,
      imageSize
    );


    noTint();


    // ========================================
    // HORIZONTAL CORRUPTION
    // ========================================

    let sliceCount =
      8 +
      floor(
        intensity * 12
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


      // Add random movement once
      // distortion is strong.

      if (intensity > 0.45) {

        shift +=
          random(
            -40,
            40
          );
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
          120 +
          intensity * 180
        ) +
        "%) brightness(" +
        (
          100 -
          intensity * 45
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
      3 +
      intensity * 25;


    noStroke();


    let pixelCount =
      floor(
        20 +
        intensity * 100
      );


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


      // Black corruption

      fill(
        0,
        0,
        0,
        random(
          80,
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
    // MISSING SECTIONS
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
          120,
          250
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
    // HEAVY GHOSTING
    // ========================================

    if (intensity > 0.35) {

      drawingContext.filter =
        "contrast(250%)";


      tint(
        255,
        255,
        255,
        opacity * 0.20
      );


      image(
        minion,
        x -
        intensity * 100,
        y +
        random(-10, 10),
        imageSize,
        imageSize
      );


      tint(
        255,
        255,
        255,
        opacity * 0.20
      );


      image(
        minion,
        x +
        intensity * 100,
        y +
        random(-10, 10),
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
          100,
          240
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
