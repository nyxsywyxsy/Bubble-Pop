let minion = null;
let imageReady = false;

// --------------------------------
// INTERACTION STATE
// --------------------------------

let bubblePopped = false;
let popStarted = false;
let popStartTime = 0;

let lastShake = 0;

// Pop animation length
let popDuration = 900;

// Droplets
let droplets = [];


// --------------------------------
// SETUP
// --------------------------------

async function setup() {

  createCanvas(windowWidth, windowHeight);

  lockGestures();

  // Phone motion permission
  enableGyroTap('Tap to enable motion sensors');

  // Higher threshold = harder shake
  setShakeThreshold(70);

  angleMode(DEGREES);

  imageMode(CENTER);

  // Load Minion
  minion = await loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg"
  );

  imageReady = true;

  console.log("MINION LOADED");
}


// --------------------------------
// DRAW
// --------------------------------

function draw() {

  background(0);

  let bubbleX = width / 2;
  let bubbleY = height / 2;

  let bubbleSize = min(width, height) * 0.62;


  // --------------------------------
  // GET TILT
  // --------------------------------

  let tilt = 0;

  if (window.sensorsEnabled) {

    // Forward/back tilt
    tilt = abs(rotationX);

    // Keep it within a useful range
    tilt = constrain(tilt, 0, 90);
  }


  // --------------------------------
  // GRADUAL REVEAL
  // --------------------------------

  // 0 degrees = hidden
  // 60 degrees = fully visible

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
  // DISTORTION
  // --------------------------------

  // Distortion starts after the image
  // has already begun appearing.

  let distortionAmount = map(
    tilt,
    25,
    80,
    0,
    22
  );

  distortionAmount = constrain(
    distortionAmount,
    0,
    22
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
    // MINION INSIDE BUBBLE
    // --------------------------------

    if (
      imageReady &&
      minion &&
      revealAmount > 0
    ) {

      drawMinionInsideBubble(
        bubbleX,
        bubbleY,
        bubbleSize,
        revealAmount,
        distortionAmount
      );
    }
  }


  // --------------------------------
  // POP ANIMATION
  // --------------------------------

  if (popStarted) {

    drawPopAnimation(
      bubbleX,
      bubbleY,
      bubbleSize
    );
  }


  // --------------------------------
  // AFTER POP
  // --------------------------------

  if (bubblePopped && !popStarted) {

    if (imageReady && minion) {

      drawFullMinion(
        bubbleX,
        bubbleY,
        bubbleSize
      );
    }
  }


  // --------------------------------
  // TEXT
  // --------------------------------

  textAlign(CENTER, CENTER);

  textFont("Georgia");

  fill(255, 255, 255, 230);

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
  // UPDATE POP
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


// --------------------------------
// DRAW BUBBLE
// --------------------------------

function drawBubble(
  bubbleX,
  bubbleY,
  bubbleSize
) {

  // --------------------------------
  // DARK CENTRE
  // --------------------------------

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


  // --------------------------------
  // SUBTLE TEAL
  // --------------------------------

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


  // --------------------------------
  // IRIDESCENT FILM
  // --------------------------------

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


  // --------------------------------
  // OUTER GLOW
  // --------------------------------

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


  // --------------------------------
  // RAINBOW EDGE
  // --------------------------------

  strokeWeight(5);


  // Pink

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


  // Purple

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


  // Blue

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


  // Cyan

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


  // Green

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


  // Yellow

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


  // --------------------------------
  // REFLECTIONS
  // --------------------------------

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


  // --------------------------------
  // REFLECTION SPOTS
  // --------------------------------

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


  // --------------------------------
  // SPARKLES
  // --------------------------------

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


// --------------------------------
// DRAW MINION INSIDE BUBBLE
// --------------------------------

function drawMinionInsideBubble(
  x,
  y,
  size,
  opacity,
  distortion
) {

  push();

  // Circular clipping area
  drawingContext.save();

  drawingContext.beginPath();

  drawingContext.arc(
    x,
    y,
    size * 0.43,
    0,
    Math.PI * 2
  );

  drawingContext.clip();


  // Main image size
  let imageSize = size * 0.86;


  // --------------------------------
  // SLIGHT DISTORTION
  // --------------------------------

  // As tilt increases, the image shifts
  // in several directions.

  let shift = distortion;


  // Ghosted distorted layers

  if (distortion > 3) {

    tint(
      255,
      opacity * 0.20
    );

    image(
      minion,
      x - shift,
      y,
      imageSize,
      imageSize
    );

    image(
      minion,
      x + shift,
      y,
      imageSize,
      imageSize
    );

    image(
      minion,
      x,
      y - shift * 0.5,
      imageSize,
      imageSize
    );
  }


  // Main image

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


  drawingContext.restore();

  pop();
}


// --------------------------------
// FULL MINION AFTER POP
// --------------------------------

function drawFullMinion(
  x,
  y,
  size
) {

  push();

  drawingContext.save();

  drawingContext.beginPath();

  drawingContext.arc(
    x,
    y,
    size * 0.43,
    0,
    Math.PI * 2
  );

  drawingContext.clip();


  image(
    minion,
    x,
    y,
    size * 0.86,
    size * 0.86
  );


  drawingContext.restore();

  pop();
}


// --------------------------------
// SHAKE
// --------------------------------

function deviceShaken() {

  // Prevent multiple triggers from one shake

  if (
    millis() - lastShake > 900 &&
    !bubblePopped &&
    !popStarted
  ) {

    bubblePopped = true;
    popStarted = true;

    popStartTime = millis();

    createDroplets();

    lastShake = millis();

    console.log("BUBBLE POP");
  }
}


// --------------------------------
// CREATE DROPLETS
// --------------------------------

function createDroplets() {

  droplets = [];

  let centreX = width / 2;
  let centreY = height / 2;

  for (let i = 0; i < 16; i++) {

    let angle =
      random(0, 360);

    let speed =
      random(2.5, 6);

    droplets.push({

      x: centreX,

      y: centreY,

      vx: cos(angle) * speed,

      vy: sin(angle) * speed,

      size: random(5, 14),

      alpha: 230
    });
  }
}


// --------------------------------
// POP ANIMATION
// --------------------------------

function drawPopAnimation(
  centreX,
  centreY,
  bubbleSize
) {

  let elapsed =
    millis() - popStartTime;

  let progress =
    constrain(
      elapsed / popDuration,
      0,
      1
    );


  // --------------------------------
  // EXPANDING BUBBLE RING
  // --------------------------------

  let ringSize =
    bubbleSize *
    (1 + progress * 0.45);

  let ringAlpha =
    180 *
    (1 - progress);


  noFill();

  stroke(
    180,
    230,
    255,
    ringAlpha
  );

  strokeWeight(
    5 * (1 - progress)
  );

  ellipse(
    centreX,
    centreY,
    ringSize
  );


  // --------------------------------
  // SMALL INNER RINGS
  // --------------------------------

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
    ringSize * 0.88
  );


  // --------------------------------
  // DROPLETS
  // --------------------------------

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

    // Slight gravity

    d.vy += 0.06;

    d.alpha =
      230 *
      (1 - progress);


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


    // Tiny highlight

    fill(
      255,
      255,
      255,
      d.alpha * 0.8
    );

    ellipse(
      d.x - d.size * 0.20,
      d.y - d.size * 0.20,
      d.size * 0.25
    );
  }


  // --------------------------------
  // CENTRAL FLASH
  // --------------------------------

  noStroke();

  fill(
    255,
    255,
    255,
    90 * (1 - progress)
  );

  ellipse(
    centreX,
    centreY,
    bubbleSize *
    0.35 *
    (1 + progress)
  );
}


// --------------------------------
// SPARKLE FUNCTION
// --------------------------------

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
    x - size * 0.6,
    y - size * 0.6,
    x + size * 0.6,
    y + size * 0.6
  );

  line(
    x + size * 0.6,
    y - size * 0.6,
    x - size * 0.6,
    y + size * 0.6
  );
}


// --------------------------------
// RESIZE
// --------------------------------

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}
