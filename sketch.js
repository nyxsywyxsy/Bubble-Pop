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

let finalBubbleCount = 45;


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

      // Some sparkles are slightly softer
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


  // --------------------------------
  // CREATE ONE LARGE CIRCULAR MASK
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


  // --------------------------------
  // IMAGE SIZE
  // --------------------------------

  let imageSize =
    size * 0.98;

  let intensity =
    distortionLevel;


  // --------------------------------
  // NORMAL IMAGE
  // --------------------------------

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
        imageSize,
        imageSize
      );


      drawingContext.filter =
        "none";

      noTint();

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

    if (
      intensity > 0.25
    ) {

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
        random(
          -8,
          8
        ),
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
        random(
          -8,
          8
        ),
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


// --------------------------------
// POP ANIMATION
// --------------------------------

function drawPopAnimation() {

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


  // Stronger easing for a quick burst

  let eased =
    1 -
    pow(
      1 - progress,
      3
    );


  // --------------------------------
  // EXPANDING RINGS
  // --------------------------------

  noFill();

  strokeWeight(3);


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    let ringProgress =
      constrain(
        progress -
        i * 0.07,
        0,
        1
      );


    let ringSize =
      min(width, height) *
      (
        0.15 +
        0.55 *
        ringProgress
      );


    stroke(
      255,
      255,
      255,
      170 *
      (
        1 -
        ringProgress
      )
    );


    ellipse(
      width / 2,
      height / 2,
      ringSize,
      ringSize
    );
  }


  // --------------------------------
  // COLOURED BURST RINGS
  // --------------------------------

  let colours = [

    [0, 220, 255],

    [170, 80, 255],

    [255, 80, 180],

    [100, 255, 190],

    [255, 230, 100]
  ];


  for (
    let i = 0;
    i < colours.length;
    i++
  ) {

    let ringProgress =
      constrain(
        progress -
        i * 0.045,
        0,
        1
      );


    let ringSize =
      min(width, height) *
      (
        0.25 +
        ringProgress *
        0.75
      );


    stroke(
      colours[i][0],
      colours[i][1],
      colours[i][2],
      130 *
      (
        1 -
        ringProgress
      )
    );


    strokeWeight(
      min(width, height) *
      0.008
    );


    noFill();


    ellipse(
      width / 2,
      height / 2,
      ringSize,
      ringSize
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
    170 *
    (
      1 -
      progress
    )
  );


  let flashSize =
    min(width, height) *
    0.15 *
    eased;


  ellipse(
    width / 2,
    height / 2,
    flashSize,
    flashSize
  );


  // --------------------------------
  // DROPLETS
  // --------------------------------

  for (
    let i = 0;
    i < droplets.length;
    i++
  ) {

    let d =
      droplets[i];


    d.x +=
      d.vx;

    d.y +=
      d.vy;

    d.vy +=
      0.025;

    d.alpha *=
      0.985;


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
      d.x,
      d.y,
      d.size,
      d.size
    );
  }
}


// --------------------------------
// CREATE POP DROPLETS
// --------------------------------

function createDroplets() {

  droplets = [];


  for (
    let i = 0;
    i < 25;
    i++
  ) {

    let angle =
      random(360);


    let speed =
      random(
        1,
        5
      );


    droplets.push({

      x:
        width / 2,

      y:
        height / 2,

      vx:
        cos(angle) *
        speed,

      vy:
        sin(angle) *
        speed,

      size:
        random(
          4,
          12
        ),

      r:
        random(
          100,
          255
        ),

      g:
        random(
          100,
          255
        ),

      b:
        random(
          180,
          255
        ),

      alpha:
        220
    });
  }
}


// --------------------------------
// CONTRIBUTION SCREEN
// --------------------------------

function drawContributionScreen(
  fade
) {

  background(0);

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
    230 * fade
  );

  text(
    "leave something behind.",
    width / 2,
    height * 0.16
  );


  // --------------------------------
  // DRAWING AREA
  // --------------------------------

  let boxWidth =
    width * 0.78;

  let boxHeight =
    height * 0.48;

  let boxX =
    width / 2 -
    boxWidth / 2;

  let boxY =
    height * 0.26;


  noFill();

  stroke(
    255,
    255,
    255,
    130 * fade
  );

  strokeWeight(1.5);

  rect(
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    18
  );


  // --------------------------------
  // PLACEHOLDER
  // --------------------------------

  if (
    drawingPoints.length === 0
  ) {

    noStroke();

    fill(
      255,
      255,
      255,
      100 * fade
    );

    textSize(
      min(width, height) *
      0.035
    );

    text(
      "draw something.",
      width / 2,
      boxY +
      boxHeight / 2
    );
  }


  // --------------------------------
  // USER DRAWING
  // --------------------------------

  if (
    drawingPoints.length > 1
  ) {

    noFill();

    stroke(
      255,
      255,
      255,
      230 * fade
    );

    strokeWeight(4);

    strokeCap(ROUND);


    for (
      let i = 1;
      i < drawingPoints.length;
      i++
    ) {

      let current =
        drawingPoints[i];

      let previous =
        drawingPoints[i - 1];


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
  // SUBMIT BUTTON
  // --------------------------------

  let buttonWidth =
    width * 0.58;

  let buttonHeight =
    height * 0.075;

  let buttonX =
    width / 2 -
    buttonWidth / 2;

  let buttonY =
    height * 0.82;


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
    30
  );


  fill(
    0,
    0,
    0,
    255 * fade
  );

  textSize(
    min(width, height) *
    0.027
  );

  text(
    "SUBMIT CONTRIBUTION",
    width / 2,
    buttonY +
    buttonHeight / 2
  );
}


// --------------------------------
// FINAL BUBBLE EFFECT
// --------------------------------

function startFinalBubbles() {

  finalBubbles = [];


  for (
    let i = 0;
    i < finalBubbleCount;
    i++
  ) {

    finalBubbles.push({

      x:
        random(width),

      y:
        random(
          height + 100,
          height + 500
        ),

      size:
        random(
          min(width, height) *
          0.04,
          min(width, height) *
          0.20
        ),

      speed:
        random(
          0.6,
          2
        ),

      drift:
        random(
          10,
          45
        ),

      phase:
        random(360),

      rotation:
        random(360),

      rotationSpeed:
        random(
          -0.5,
          0.5
        ),

      alpha:
        random(
          90,
          210
        ),

      vx:
        random(
          -0.3,
          0.3
        ),

      vy:
        random(
          -0.2,
          0.2
        )
    });
  }
}


// --------------------------------
// FINAL BUBBLE EFFECT
// --------------------------------

function drawFinalBubbleEffect() {

  background(0);


  let elapsed =
    millis() -
    finalBubbleStartTime;


  let progress =
    constrain(
      elapsed /
      finalBubbleDuration,
      0,
      1
    );


  // --------------------------------
  // BUBBLE FADE-IN
  // --------------------------------

  let bubbleAlpha =
    constrain(
      progress * 1.5,
      0,
      1
    );


  // --------------------------------
  // PHONE TILT
  // --------------------------------

  let tiltX = 0;
  let tiltY = 0;


  if (
    window.sensorsEnabled
  ) {

    tiltX =
      constrain(
        rotationY,
        -45,
        45
      );

    tiltY =
      constrain(
        rotationX,
        -45,
        45
      );
  }


  // --------------------------------
  // MOVE BUBBLES
  // --------------------------------

  for (
    let i = 0;
    i < finalBubbles.length;
    i++
  ) {

    let b =
      finalBubbles[i];


    // Natural upward movement

    b.vy -=
      0.005;


    // Tilt pushes bubbles

    b.vx +=
      map(
        tiltX,
        -45,
        45,
        -0.035,
        0.035
      );


    b.vy +=
      map(
        tiltY,
        -45,
        45,
        -0.025,
        0.025
      );


    // Limit speed

    b.vx =
      constrain(
        b.vx,
        -2.5,
        2.5
      );


    b.vy =
      constrain(
        b.vy,
        -2.5,
        2.5
      );


    b.x +=
      b.vx;


    b.y +=
      b.vy -
      b.speed;


    // Gentle natural drift

    b.x +=
      sin(
        frameCount * 0.7 +
        b.phase
      ) *
      0.25;


    b.rotation +=
      b.rotationSpeed;


    // --------------------------------
    // SCREEN BOUNCE
    // --------------------------------

    if (
      b.x <
      b.size / 2
    ) {

      b.x =
        b.size / 2;

      b.vx *=
        -0.8;
    }


    if (
      b.x >
      width -
      b.size / 2
    ) {

      b.x =
        width -
        b.size / 2;

      b.vx *=
        -0.8;
    }


    // --------------------------------
    // TOP RESET
    // --------------------------------

    if (
      b.y <
      -b.size
    ) {

      b.y =
        height +
        random(
          30,
          200
        );

      b.x =
        random(width);

      b.vy =
        random(
          -0.2,
          0.2
        );
    }
  }


  // --------------------------------
  // BUBBLE COLLISIONS
  // --------------------------------

  for (
    let i = 0;
    i < finalBubbles.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < finalBubbles.length;
      j++
    ) {

      let a =
        finalBubbles[i];

      let b =
        finalBubbles[j];


      let dx =
        b.x -
        a.x;

      let dy =
        b.y -
        a.y;


      let distance =
        sqrt(
          dx * dx +
          dy * dy
        );


      let minimumDistance =
        (
          a.size +
          b.size
        ) / 2;


      if (
        distance > 0 &&
        distance <
        minimumDistance
      ) {

        let nx =
          dx /
          distance;

        let ny =
          dy /
          distance;


        let overlap =
          minimumDistance -
          distance;


        // Push bubbles apart

        a.x -=
          nx *
          overlap *
          0.5;

        a.y -=
          ny *
          overlap *
          0.5;


        b.x +=
          nx *
          overlap *
          0.5;

        b.y +=
          ny *
          overlap *
          0.5;


        // Relative velocity

        let relativeVelocity =
          (
            b.vx -
            a.vx
          ) *
          nx +
          (
            b.vy -
            a.vy
          ) *
          ny;


        // Only bounce if moving toward each other

        if (
          relativeVelocity < 0
        ) {

          let bounceStrength =
            0.85;


          a.vx +=
            nx *
            relativeVelocity *
            bounceStrength;

          a.vy +=
            ny *
            relativeVelocity *
            bounceStrength;


          b.vx -=
            nx *
            relativeVelocity *
            bounceStrength;

          b.vy -=
            ny *
            relativeVelocity *
            bounceStrength;
        }
      }
    }
  }


  // --------------------------------
  // DRAW BUBBLES
  // --------------------------------

  for (
    let i = 0;
    i < finalBubbles.length;
    i++
  ) {

    drawFinalBubble(
      finalBubbles[i],
      bubbleAlpha
    );
  }


  // --------------------------------
  // ADD MORE BUBBLES OVER TIME
  // --------------------------------

  if (
    progress > 0.25 &&
    finalBubbles.length <
      finalBubbleCount + 20
  ) {

    if (
      frameCount % 12 === 0
    ) {

      finalBubbles.push({

        x:
          random(width),

        y:
          height +
          random(
            20,
            100
          ),

        size:
          random(
            min(width, height) *
            0.04,
            min(width, height) *
            0.15
          ),

        speed:
          random(
            0.8,
            2.2
          ),

        drift:
          random(
            10,
            40
          ),

        phase:
          random(360),

        rotation:
          random(360),

        rotationSpeed:
          random(
            -0.5,
            0.5
          ),

        alpha:
          random(
            100,
            220
          ),

        vx:
          random(
            -0.3,
            0.3
          ),

        vy:
          random(
            -0.2,
            0.2
          )
      });
    }
  }


  // --------------------------------
  // DARK OVERLAY BEHIND FINAL TEXT
  // --------------------------------

  if (
    progress > 0.55
  ) {

    let overlayAlpha =
      map(
        progress,
        0.55,
        1,
        0,
        85
      );


    noStroke();

    fill(
      0,
      0,
      0,
      overlayAlpha
    );


    rect(
      0,
      0,
      width,
      height
    );
  }


  // --------------------------------
  // FINAL MESSAGE
  // --------------------------------

  let messageFade =
    constrain(
      map(
        progress,
        0.45,
        0.72,
        0,
        1
      ),
      0,
      1
    );


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
    245 *
    messageFade
  );


  text(
    "your contribution has been added.",
    width / 2,
    height / 2
  );
}


// --------------------------------
// INDIVIDUAL FINAL BUBBLE
// --------------------------------

function drawFinalBubble(
  b,
  overallAlpha
) {

  push();


  translate(
    b.x,
    b.y
  );


  rotate(
    b.rotation
  );


  let alpha =
    b.alpha *
    overallAlpha;


  // --------------------------------
  // DARK TRANSPARENT INTERIOR
  // --------------------------------

  noStroke();

  fill(
    5,
    25,
    35,
    150 *
    overallAlpha
  );


  ellipse(
    0,
    0,
    b.size,
    b.size
  );


  // --------------------------------
  // COLOURED INTERIOR GLOW
  // --------------------------------

  fill(
    0,
    220,
    255,
    25 *
    overallAlpha
  );


  ellipse(
    -b.size * 0.15,
    -b.size * 0.15,
    b.size * 0.7,
    b.size * 0.6
  );


  fill(
    170,
    80,
    255,
    25 *
    overallAlpha
  );


  ellipse(
    b.size * 0.15,
    0,
    b.size * 0.65,
    b.size * 0.7
  );


  fill(
    255,
    80,
    180,
    20 *
    overallAlpha
  );


  ellipse(
    0,
    b.size * 0.18,
    b.size * 0.7,
    b.size * 0.5
  );


  // --------------------------------
  // RAINBOW EDGE
  // --------------------------------

  noFill();

  strokeWeight(
    max(
      1,
      b.size * 0.012
    )
  );


  stroke(
    0,
    220,
    255,
    alpha
  );


  arc(
    0,
    0,
    b.size * 0.94,
    b.size * 0.94,
    200,
    285
  );


  stroke(
    170,
    80,
    255,
    alpha
  );


  arc(
    0,
    0,
    b.size * 0.94,
    b.size * 0.94,
    285,
    350
  );


  stroke(
    255,
    90,
    190,
    alpha
  );


  arc(
    0,
    0,
    b.size * 0.94,
    b.size * 0.94,
    350,
    55
  );


  stroke(
    80,
    150,
    255,
    alpha
  );


  arc(
    0,
    0,
    b.size * 0.94,
    b.size * 0.94,
    55,
    130
  );


  stroke(
    100,
    255,
    190,
    alpha
  );


  arc(
    0,
    0,
    b.size * 0.94,
    b.size * 0.94,
    130,
    200
  );


  // --------------------------------
  // REFLECTION
  // --------------------------------

  noStroke();


  fill(
    255,
    255,
    255,
    120 *
    overallAlpha
  );


  ellipse(
    -b.size * 0.22,
    -b.size * 0.25,
    b.size * 0.18,
    b.size * 0.09
  );


  fill(
    255,
    255,
    255,
    70 *
    overallAlpha
  );


  ellipse(
    b.size * 0.25,
    b.size * 0.25,
    b.size * 0.06,
    b.size * 0.06
  );


  pop();
}


// --------------------------------
// DRAWING INPUT
// --------------------------------

function mousePressed() {

  // --------------------------------
  // AFTER BUBBLE POP
  // --------------------------------

  if (
    bubblePopped &&
    !contributionActivated &&
    !contributionSubmitted
  ) {

    contributionActivated = true;

    contributionStartTime =
      millis();

    drawingPoints = [];

    return false;
  }


  // --------------------------------
  // DRAWING SCREEN
  // --------------------------------

  if (
    contributionActivated &&
    !contributionSubmitted
  ) {

    let buttonWidth =
      width * 0.58;

    let buttonHeight =
      height * 0.075;

    let buttonX =
      width / 2 -
      buttonWidth / 2;

    let buttonY =
      height * 0.82;


    // Submit

    if (
      mouseX >= buttonX &&
      mouseX <=
        buttonX +
        buttonWidth &&
      mouseY >= buttonY &&
      mouseY <=
        buttonY +
        buttonHeight
    ) {

      if (
        drawingPoints.length > 0
      ) {

        contributionSubmitted =
          true;

        finalBubbleStartTime =
          millis();

        startFinalBubbles();
      }

      return false;
    }


    // Drawing area

    let boxWidth =
      width * 0.78;

    let boxHeight =
      height * 0.48;

    let boxX =
      width / 2 -
      boxWidth / 2;

    let boxY =
      height * 0.26;


    if (
      mouseX >= boxX &&
      mouseX <=
        boxX +
        boxWidth &&
      mouseY >= boxY &&
      mouseY <=
        boxY +
        boxHeight
    ) {

      drawingPoints.push({

        x:
          mouseX,

        y:
          mouseY,

        newStroke:
          true
      });
    }

    return false;
  }
}


// --------------------------------
// DRAWING MOVEMENT
// --------------------------------

function mouseDragged() {

  if (
    contributionActivated &&
    !contributionSubmitted
  ) {

    let boxWidth =
      width * 0.78;

    let boxHeight =
      height * 0.48;

    let boxX =
      width / 2 -
      boxWidth / 2;

    let boxY =
      height * 0.26;


    if (
      mouseX >= boxX &&
      mouseX <=
        boxX +
        boxWidth &&
      mouseY >= boxY &&
      mouseY <=
        boxY +
        boxHeight
    ) {

      drawingPoints.push({

        x:
          mouseX,

        y:
          mouseY,

        newStroke:
          false
      });
    }
  }

  return false;
}


// --------------------------------
// SHAKE
// --------------------------------

function deviceShaken() {

  if (
    millis() - lastShake > 1200 &&
    !bubblePopped &&
    !popStarted
  ) {

    popStarted =
      true;

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


// --------------------------------
// SPARKLE
// --------------------------------

function drawSparkle(
  x,
  y,
  size
) {

  push();

  translate(
    x,
    y
  );


  noStroke();

  fill(
    255,
    255,
    255,
    180
  );


  beginShape();


  vertex(
    0,
    -size
  );


  vertex(
    size * 0.25,
    -size * 0.25
  );


  vertex(
    size,
    0
  );


  vertex(
    size * 0.25,
    size * 0.25
  );


  vertex(
    0,
    size
  );


  vertex(
    -size * 0.25,
    size * 0.25
  );


  vertex(
    -size,
    0
  );


  vertex(
    -size * 0.25,
    -size * 0.25
  );


  endShape(
    CLOSE
  );


  pop();
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
