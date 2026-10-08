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
// BUBBLE DECORATION
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

  createBubbleDecorations();

  minion = await loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg"
  );

  imageReady = true;
}


// ================================================
// CREATE BUBBLE DECORATIONS
// ================================================

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


  // Keep the original bubble layout,
  // but give each oval a tiny amount of movement.

  let positions = [

    [-0.18, -0.16],
    [0.18, -0.05],
    [0.00, 0.20],
    [-0.22, 0.20],
    [0.25, 0.20],
    [-0.10, -0.30]

  ];


  let sizes = [

    [0.65, 0.58],
    [0.65, 0.70],
    [0.75, 0.60],
    [0.45, 0.55],
    [0.40, 0.45],
    [0.35, 0.30]

  ];


  for (
    let i = 0;
    i < ovalColours.length;
    i++
  ) {

    bubbleOvals.push({

      x:
        positions[i][0],

      y:
        positions[i][1],

      width:
        sizes[i][0],

      height:
        sizes[i][1],

      rotation:
        random(
          -10,
          10
        ),

      r:
        ovalColours[i].r,

      g:
        ovalColours[i].g,

      b:
        ovalColours[i].b,

      alpha:
        [35, 45, 35, 35, 25, 20][i],

      // Movement settings

      phaseX:
        random(360),

      phaseY:
        random(360),

      phaseRotation:
        random(360),

      moveAmount:
        random(
          0.008,
          0.018
        ),

      moveSpeed:
        random(
          0.0007,
          0.0014
        ),

      rotationAmount:
        random(
          2,
          5
        ),

      rotationSpeed:
        random(
          0.0006,
          0.0012
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
        ),

      // Sparkle movement

      phaseX:
        random(360),

      phaseY:
        random(360),

      moveAmount:
        random(
          0.008,
          0.025
        ),

      moveSpeed:
        random(
          0.0008,
          0.0018
        ),

      rotationSpeed:
        random(
          0.02,
          0.08
        )
    });
  }
}


// ================================================
// DRAW
// ================================================

function draw() {

  background(0);

  let currentTime =
    millis();

  let deltaTime =
    currentTime -
    lastFrameTime;

  lastFrameTime =
    currentTime;


  // ================================================
  // BEFORE BUBBLE POP
  // ================================================

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
    // BUBBLE SIZE
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
    // MINION
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


  // ================================================
  // BUBBLE HAS BEEN POPPED
  // ================================================

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


  // ================================================
  // CONTRIBUTION SCREEN
  // ================================================

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


  // ================================================
  // FINAL BUBBLE EFFECT
  // ================================================

  if (contributionSubmitted) {

    drawFinalBubbleEffect();

    return;
  }
}


// ================================================
// MAIN BUBBLE
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
  // COLOURED OVALS
  // --------------------------------

  let time =
    millis();


  for (
    let i = 0;
    i < bubbleOvals.length;
    i++
  ) {

    let oval =
      bubbleOvals[i];


    // Very subtle floating movement

    let movingX =
      oval.x +
      sin(
        time *
        oval.moveSpeed +
        oval.phaseX
      ) *
      oval.moveAmount;


    let movingY =
      oval.y +
      cos(
        time *
        oval.moveSpeed *
        0.8 +
        oval.phaseY
      ) *
      oval.moveAmount;


    let movingRotation =
      oval.rotation +
      sin(
        time *
        oval.rotationSpeed +
        oval.phaseRotation
      ) *
      oval.rotationAmount;


    push();

    translate(
      movingX * size,
      movingY * size
    );

    rotate(
      movingRotation
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
  // RAINBOW EDGE
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
  // WHITE REFLECTION
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
  // MOVING SPARKLES
  // --------------------------------

  for (
    let i = 0;
    i < bubbleSparkles.length;
    i++
  ) {

    let sparkle =
      bubbleSparkles[i];


    let sparkleX =
      sparkle.x +
      sin(
        time *
        sparkle.moveSpeed +
        sparkle.phaseX
      ) *
      sparkle.moveAmount;


    let sparkleY =
      sparkle.y +
      cos(
        time *
        sparkle.moveSpeed *
        0.9 +
        sparkle.phaseY
      ) *
      sparkle.moveAmount;


    let sparkleRotation =
      sparkle.rotation +
      time *
      sparkle.rotationSpeed;


    let sparkleSize =
      size *
      sparkle.size *
      sparkle.softness;


    push();

    translate(
      sparkleX * size,
      sparkleY * size
    );

    rotate(
      sparkleRotation
    );

    fill(
      255,
      255,
      255,
      sparkle.alpha *
      bubbleOpacity
    );

    drawSparkle(
      0,
      0,
      sparkleSize
    );

    pop();
  }


  // --------------------------------
  // EXTRA TINY STAR POINTS
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


    // RGB separation

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


    // Horizontal slicing

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


    // Pixelation

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


    // Missing black sections

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


    // Ghosting

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


    // Glitch bars

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
// MAIN BUBBLE POP
// ================================================

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
  // FLASH
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


// ================================================
// CREATE POP DROPLETS
// ================================================

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


// ================================================
// CONTRIBUTION SCREEN
// ================================================

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


// ================================================
// START FINAL BUBBLES
// ================================================

function startFinalBubbles() {

  finalBubbles = [];


  for (
    let i = 0;
    i < finalBubbleCount;
    i++
  ) {

    finalBubbles.push(
      createFinalBubble(
        random(width),
        random(
          height + 100,
          height + 500
        ),
        random(
          min(width, height) * 0.04,
          min(width, height) * 0.20
        )
      )
    );
  }
}


// ================================================
// CREATE ONE FINAL BUBBLE
// ================================================

function createFinalBubble(
  x,
  y,
  size
) {

  return {

    x: x,

    y: y,

    size: size,

    speed:
      random(
        0.6,
        2
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

    // Used only for horizontal movement

    sideSpeed:
      random(
        0.003,
        0.008
      ),

    sideAmount:
      random(
        0.3,
        1.0
      ),

    // Bubble pop state

    popped:
      false,

    popStarted:
      false,

    popStartTime:
      0,

    popDroplets:
      []
  };
}


// ================================================
// FINAL BUBBLE EFFECT
// ================================================

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
  // MOVE FINAL BUBBLES
  // --------------------------------

  for (
    let i = 0;
    i < finalBubbles.length;
    i++
  ) {

    let b =
      finalBubbles[i];


    // --------------------------------
    // NORMAL BUBBLE MOVEMENT
    // --------------------------------

    if (
      !b.popStarted
    ) {

      // ALWAYS MOVE UP.
      // Nothing here changes vertical
      // direction based on phone tilt.

      b.y -=
        b.speed;


      // Side-to-side movement only

      b.x +=
        sin(
          millis() *
          b.sideSpeed +
          b.phase
        ) *
        b.sideAmount;


      b.rotation +=
        b.rotationSpeed;


      // --------------------------------
      // SIDE WALLS
      // --------------------------------

      if (
        b.x <
        b.size / 2
      ) {

        b.x =
          b.size / 2;
      }


      if (
        b.x >
        width -
        b.size / 2
      ) {

        b.x =
          width -
          b.size / 2;
      }


      // --------------------------------
      // RESET AT TOP
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
      }
    }


    // --------------------------------
    // DRAW NORMAL BUBBLE
    // --------------------------------

    if (
      !b.popStarted
    ) {

      drawFinalBubble(
        b,
        bubbleAlpha
      );

    } else {

      // Draw the individual pop animation

      drawFinalBubblePop(
        b
      );
    }
  }


  // --------------------------------
  // ADD MORE BUBBLES
  // --------------------------------

  if (
    progress > 0.25 &&
    finalBubbles.length <
      finalBubbleCount + 20
  ) {

    if (
      frameCount % 12 === 0
    ) {

      finalBubbles.push(
        createFinalBubble(
          random(width),
          height +
          random(
            20,
            100
          ),
          random(
            min(width, height) * 0.04,
            min(width, height) * 0.15
          )
        )
      );
    }
  }


  // --------------------------------
  // DARK OVERLAY
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


// ================================================
// NORMAL FINAL BUBBLE
// ================================================

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
  // DARK INTERIOR
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
  // COLOUR
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


// ================================================
// FINAL BUBBLE POP
// ================================================

function startFinalBubblePop(
  bubble
) {

  if (
    bubble.popStarted
  ) {
    return;
  }


  bubble.popStarted =
    true;

  bubble.popStartTime =
    millis();


  bubble.popDroplets = [];


  // Create droplets around this bubble

  for (
    let i = 0;
    i < 14;
    i++
  ) {

    let angle =
      random(360);

    let speed =
      random(
        1,
        4
      );


    bubble.popDroplets.push({

      x:
        bubble.x,

      y:
        bubble.y,

      vx:
        cos(angle) *
        speed,

      vy:
        sin(angle) *
        speed,

      size:
        random(
          3,
          9
        ),

      alpha:
        220
    });
  }
}


// ================================================
// FINAL BUBBLE POP ANIMATION
// ================================================

function drawFinalBubblePop(
  bubble
) {

  let elapsed =
    millis() -
    bubble.popStartTime;


  let progress =
    constrain(
      elapsed /
      popDuration,
      0,
      1
    );


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

  strokeWeight(
    5 *
    (
      1 -
      progress
    )
  );


  stroke(
    180,
    230,
    255,
    200 *
    (
      1 -
      progress
    )
  );


  ellipse(
    bubble.x,
    bubble.y,
    bubble.size *
    (
      1 +
      progress *
      0.65
    )
  );


  stroke(
    255,
    255,
    255,
    140 *
    (
      1 -
      progress
    )
  );

  strokeWeight(2);


  ellipse(
    bubble.x,
    bubble.y,
    bubble.size *
    (
      1 +
      progress *
      0.65
    ) *
    0.86
  );


  // --------------------------------
  // COLOURED SECONDARY RING
  // --------------------------------

  stroke(
    170,
    80,
    255,
    100 *
    (
      1 -
      progress
    )
  );

  strokeWeight(
    2
  );


  ellipse(
    bubble.x,
    bubble.y,
    bubble.size *
    (
      1 +
      progress
    )
  );


  // --------------------------------
  // FLASH
  // --------------------------------

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
    bubble.x,
    bubble.y,
    bubble.size *
    0.35 *
    (
      1 +
      progress
    )
  );


  // --------------------------------
  // DROPLETS
  // --------------------------------

  for (
    let i = 0;
    i < bubble.popDroplets.length;
    i++
  ) {

    let d =
      bubble.popDroplets[i];


    d.x +=
      d.vx;

    d.y +=
      d.vy;

    d.vy +=
      0.06;


    d.alpha =
      230 *
      (
        1 -
        progress
      );


    noStroke();

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


  // --------------------------------
  // REMOVE AFTER POP
  // --------------------------------

  if (
    progress >= 1
  ) {

    bubble.popped =
      true;
  }
}


// ================================================
// DRAWING INPUT
// ================================================

function mousePressed() {

  // --------------------------------
  // FINAL BUBBLE TOUCH
  // --------------------------------

  if (
    contributionSubmitted
  ) {

    for (
      let i = finalBubbles.length - 1;
      i >= 0;
      i--
    ) {

      let b =
        finalBubbles[i];


      if (
        b.popStarted ||
        b.popped
      ) {
        continue;
      }


      let distance =
        dist(
          mouseX,
          mouseY,
          b.x,
          b.y
        );


      if (
        distance <=
        b.size / 2
      ) {

        startFinalBubblePop(
          b
        );

        return false;
      }
    }


    return false;
  }


  // --------------------------------
  // AFTER MAIN BUBBLE POP
  // --------------------------------

  if (
    bubblePopped &&
    !contributionActivated &&
    !contributionSubmitted
  ) {

    contributionActivated =
      true;

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


    // --------------------------------
    // SUBMIT
    // --------------------------------

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


// ================================================
// DRAWING MOVEMENT
// ================================================

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


// ================================================
// SHAKE
// ================================================

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


// ================================================
// SPARKLE
// ================================================

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


// ================================================
// RESIZE
// ================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}
