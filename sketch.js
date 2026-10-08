```js
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
// BUBBLE DECORATION RANDOMIZATION
// --------------------------------

let bubbleOvals = [];
let bubbleSparkles = [];


// --------------------------------
// FINAL BUBBLE WAVE
// --------------------------------

let finalBubbles = [];

let finalBubbleStartTime = 0;
let finalBubbleDuration = 6000;

// DOUBLED FROM 45 TO 90
let finalBubbleCount = 90;


// --------------------------------
// SETUP
// --------------------------------

async function setup() {

  createCanvas(windowWidth, windowHeight);

  lockGestures();

  if (
    location.protocol === "https:" &&
    window.self === window.top
  ) {
    showDesktopQr();
  }

  enableGyroTap(
    "Tap to enable motion sensors"
  );

  angleMode(DEGREES);

  imageMode(CENTER);

  setShakeThreshold(110);

  lastFrameTime = millis();

  // --------------------------------
  // RANDOMIZE MAIN BUBBLE
  // --------------------------------

  createBubbleDecorations();

  // --------------------------------
  // LOAD MINION
  // --------------------------------

  minion = await loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg"
  );

  imageReady = true;
}


// --------------------------------
// RANDOMIZE BUBBLE DECORATIONS
// --------------------------------

function createBubbleDecorations() {

  bubbleOvals = [];

  bubbleSparkles = [];


  // --------------------------------
  // COLOURED OVALS
  // --------------------------------

  let ovalColours = [

    {
      r: 0,
      g: 220,
      b: 255
    },

    {
      r: 170,
      g: 80,
      b: 255
    },

    {
      r: 255,
      g: 80,
      b: 180
    },

    {
      r: 70,
      g: 130,
      b: 255
    },

    {
      r: 100,
      g: 255,
      b: 190
    },

    {
      r: 255,
      g: 230,
      b: 100
    }
  ];


  for (
    let i = 0;
    i < ovalColours.length;
    i++
  ) {

    let angle =
      random(360);

    let distance =
      random(
        0.05,
        0.28
      );

    bubbleOvals.push({

      x:
        cos(angle) *
        distance,

      y:
        sin(angle) *
        distance,

      width:
        random(
          0.30,
          0.72
        ),

      height:
        random(
          0.25,
          0.65
        ),

      rotation:
        random(
          -30,
          30
        ),

      r:
        ovalColours[i].r,

      g:
        ovalColours[i].g,

      b:
        ovalColours[i].b,

      alpha:
        random(
          18,
          48
        )
    });
  }


  // --------------------------------
  // RANDOMIZED SPARKLES
  // --------------------------------

  let sparkleCount =
    floor(
      random(
        8,
        14
      )
    );


  for (
    let i = 0;
    i < sparkleCount;
    i++
  ) {

    let angle =
      random(360);

    let distance =
      random(
        0.25,
        0.45
      );


    bubbleSparkles.push({

      x:
        cos(angle) *
        distance,

      y:
        sin(angle) *
        distance,

      size:
        random(
          0.012,
          0.035
        ),

      alpha:
        random(
          100,
          220
        ),

      rotation:
        random(360),

      softness:
        random(
          0.7,
          1.3
        )
    });
  }
}


// --------------------------------
// DRAW
// --------------------------------

function draw() {

  background(0);

  let currentTime =
    millis();

  let deltaTime =
    currentTime -
    lastFrameTime;

  lastFrameTime =
    currentTime;


  // --------------------------------
  // BEFORE BUBBLE POP
  // --------------------------------

  if (!bubblePopped) {

    let tilt = 0;

    if (window.sensorsEnabled) {

      tilt =
        abs(rotationX);

      tilt =
        constrain(
          tilt,
          0,
          90
        );
    }


    // --------------------------------
    // REVEAL
    // --------------------------------

    let revealAmount =
      map(
        tilt,
        5,
        60,
        0,
        255
      );

    revealAmount =
      constrain(
        revealAmount,
        0,
        255
      );


    // --------------------------------
    // SLOW DISTORTION
    // --------------------------------

    if (
      tilt >= 88 &&
      !bubblePopped &&
      !popStarted
    ) {

      distortionLevel +=
        0.00035 *
        deltaTime;

    } else if (
      tilt < 84
    ) {

      distortionLevel -=
        0.00045 *
        deltaTime;
    }

    distortionLevel =
      constrain(
        distortionLevel,
        0,
        1
      );


    // --------------------------------
    // LARGE BUBBLE
    // --------------------------------

    let bubbleSize =
      min(width, height) *
      0.72;


    // --------------------------------
    // POP FADE
    // --------------------------------

    let bubbleOpacity = 1;

    if (popStarted) {

      let popElapsed =
        millis() -
        popStartTime;

      let popProgress =
        constrain(
          popElapsed /
          popDuration,
          0,
          1
        );

      bubbleOpacity =
        1 -
        popProgress;
    }


    drawBubble(
      width / 2,
      height / 2,
      bubbleSize,
      revealAmount,
      bubbleOpacity
    );


    // --------------------------------
    // MINION + DISTORTION
    // EVERYTHING IS MASKED
    // --------------------------------

    if (
      !popStarted &&
      imageReady &&
      minion &&
      revealAmount > 0
    ) {

      drawMinionInsideBubble(
        width / 2,
        height / 2,
        bubbleSize,
        revealAmount,
        distortionLevel
      );
    }


    // --------------------------------
    // POP ANIMATION
    // --------------------------------

    if (popStarted) {

      drawPopAnimation();

      let elapsed =
        millis() -
        popStartTime;

      if (
        elapsed >
        popDuration
      ) {

        popStarted = false;

        bubblePopped = true;
      }
    }


    // --------------------------------
    // STARTING TEXT
    // --------------------------------

    if (!popStarted) {

      textAlign(
        CENTER,
        CENTER
      );

      textFont("Georgia");

      textSize(
        min(width, height) *
        0.045
      );

      fill(
        255,
        255,
        255,
        230
      );

      text(
        "reveal what's hidden.",
        width / 2,
        height * 0.87
      );
    }

    return;
  }


  // --------------------------------
  // BUBBLE HAS BEEN POPPED
  // --------------------------------

  if (
    bubblePopped &&
    !contributionActivated &&
    !contributionSubmitted
  ) {

    textAlign(
      CENTER,
      CENTER
    );

    textFont("Georgia");

    textSize(
      min(width, height) *
      0.045
    );

    fill(255);

    text(
      "the bubble is gone.",
      width / 2,
      height / 2
    );

    return;
  }


  // --------------------------------
  // CONTRIBUTION DRAWING SCREEN
  // --------------------------------

  if (
    contributionActivated &&
    !contributionSubmitted
  ) {

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

    drawContributionScreen(
      contributionFade
    );

    return;
  }


  // --------------------------------
  // FINAL BUBBLE EFFECT
  // --------------------------------

  if (contributionSubmitted) {

    drawFinalBubbleEffect();

    return;
  }
}


// ================================================
// BUBBLE
// ================================================

function drawBubble(
  x,
  y,
  size,
  revealAmount,
  bubbleOpacity
) {

  push();

  translate(
    x,
    y
  );


  // --------------------------------
  // MAIN DARK BUBBLE
  // --------------------------------

  noStroke();

  fill(
    5,
    25,
    35,
    245 *
    bubbleOpacity
  );

  ellipse(
    0,
    0,
    size,
    size
  );


  // --------------------------------
  // RANDOMIZED COLOURED OVALS
  // --------------------------------

  for (
    let i = 0;
    i < bubbleOvals.length;
    i++
  ) {

    let oval =
      bubbleOvals[i];

    push();

    translate(
      oval.x * size,
      oval.y * size
    );

    rotate(
      oval.rotation
    );

    fill(
      oval.r,
      oval.g,
      oval.b,
      oval.alpha *
      bubbleOpacity
    );

    ellipse(
      0,
      0,
      size * oval.width,
      size * oval.height
    );

    pop();
  }


  // --------------------------------
  // RAINBOW EDGE ARCS
  // --------------------------------

  noFill();

  strokeWeight(
    size * 0.018
  );


  stroke(
    0,
    220,
    255,
    150 *
    bubbleOpacity
  );

  arc(
    0,
    0,
    size * 0.94,
    size * 0.94,
    200,
    285
  );


  stroke(
    160,
    80,
    255,
    150 *
    bubbleOpacity
  );

  arc(
    0,
    0,
    size * 0.94,
    size * 0.94,
    285,
    350
  );


  stroke(
    255,
    90,
    190,
    150 *
    bubbleOpacity
  );

  arc(
    0,
    0,
    size * 0.94,
    size * 0.94,
    350,
    55
  );


  stroke(
    80,
    150,
    255,
    150 *
    bubbleOpacity
  );

  arc(
    0,
    0,
    size * 0.94,
    size * 0.94,
    55,
    130
  );


  stroke(
    100,
    255,
    190,
    150 *
    bubbleOpacity
  );

  arc(
    0,
    0,
    size * 0.94,
    size * 0.94,
    130,
    200
  );


  // --------------------------------
  // MAIN WHITE REFLECTION
  // --------------------------------

  noStroke();

  fill(
    255,
    255,
    255,
    120 *
    bubbleOpacity
  );

  ellipse(
    -size * 0.23,
    -size * 0.27,
    size * 0.16,
    size * 0.08
  );

  ellipse(
    -size * 0.17,
    -size * 0.20,
    size * 0.07,
    size * 0.035
  );


  // --------------------------------
  // SECONDARY REFLECTION
  // --------------------------------

  fill(
    255,
    255,
    255,
    80 *
    bubbleOpacity
  );

  ellipse(
    size * 0.27,
    size * 0.28,
    size * 0.055,
    size * 0.055
  );

  ellipse(
    size * 0.30,
    size * 0.23,
    size * 0.025,
    size * 0.025
  );


  // --------------------------------
  // RANDOMIZED WHIMSICAL SPARKLES
  // --------------------------------

  for (
    let i = 0;
    i < bubbleSparkles.length;
    i++
  ) {

    let sparkle =
      bubbleSparkles[i];

    let sparkleSize =
      size *
      sparkle.size *
      sparkle.softness;


    fill(
      255,
      255,
      255,
      sparkle.alpha *
      bubbleOpacity
    );


    drawSparkle(
      sparkle.x * size,
      sparkle.y * size,
      sparkleSize
    );
  }


  // --------------------------------
  // A FEW TINY EXTRA STAR POINTS
  // --------------------------------

  for (
    let i = 0;
    i < 5;
    i++
  ) {

    let angle =
      i * 72 +
      20;

    let distance =
      0.32 +
      sin(
        i * 47
      ) *
      0.06;


    let sparkleX =
      cos(angle) *
      distance *
      size;

    let sparkleY =
      sin(angle) *
      distance *
      size;


    fill(
      255,
      255,
      255,
      90 *
      bubbleOpacity
    );


    ellipse(
      sparkleX,
      sparkleY,
      size * 0.008,
      size * 0.008
    );
  }


  pop();
}


// ================================================
// MINION + DISTORTION
// MASKED INSIDE THE BUBBLE
// ================================================

function drawMinionInsideBubble(
  x,
  y,
  size,
  opacity,
  distortionLevel
) {

  push();

  imageMode(CENTER);

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


  if (
    intensity < 0.02
  ) {

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


    let rgbShift =
      intensity * 55;


    if (
      intensity > 0.08
    ) {

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


      if (
        intensity > 0.35
      ) {

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
        im
```
