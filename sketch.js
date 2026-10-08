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

  if (location.protocol === "https:" && window.self === window.top) {
    showDesktopQr();
  }

  enableGyroTap("Tap to enable motion sensors");

  angleMode(DEGREES);

  imageMode(CENTER);

  setShakeThreshold(110);

  lastFrameTime = millis();

  minion = await loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg"
  );

  imageReady = true;
}


// --------------------------------
// DRAW
// --------------------------------

function draw() {

  background(0);

  let currentTime = millis();
  let deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;


  // --------------------------------
  // BEFORE BUBBLE POP
  // --------------------------------

  if (!bubblePopped) {

    let tilt = 0;

    if (window.sensorsEnabled) {
      tilt = abs(rotationX);
      tilt = constrain(tilt, 0, 90);
    }


    // --------------------------------
    // REVEAL
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
    // SLOW DISTORTION
    // --------------------------------

    if (
      tilt >= 88 &&
      !bubblePopped &&
      !popStarted
    ) {

      distortionLevel +=
        0.00035 * deltaTime;

    } else if (tilt < 84) {

      distortionLevel -=
        0.00045 * deltaTime;
    }

    distortionLevel = constrain(
      distortionLevel,
      0,
      1
    );


    // --------------------------------
    // DRAW BUBBLE
    // --------------------------------

    drawBubble(
      width / 2,
      height / 2,
      min(width, height) * 0.42,
      revealAmount
    );


    // --------------------------------
    // DRAW MINION
    // --------------------------------

    if (
      imageReady &&
      !popStarted
    ) {

      drawMinion(
        width / 2,
        height / 2,
        revealAmount
      );
    }


    // --------------------------------
    // DISTORTION
    // --------------------------------

    if (
      distortionLevel > 0 &&
      !popStarted
    ) {

      drawDistortion(
        distortionLevel
      );
    }


    // --------------------------------
    // POP ANIMATION
    // --------------------------------

    if (popStarted) {

      drawPopAnimation();

      let elapsed =
        millis() - popStartTime;

      if (elapsed > popDuration) {

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
        min(width, height) * 0.045
      );

      fill(255, 255, 255, 230);

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
      min(width, height) * 0.045
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
      millis() - contributionStartTime;

    contributionFade =
      constrain(
        elapsed / contributionFadeDuration,
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


// --------------------------------
// BUBBLE
// --------------------------------

function drawBubble(
  x,
  y,
  size,
  revealAmount
) {

  push();

  translate(x, y);


  // Main dark bubble

  noStroke();

  fill(
    5,
    25,
    35,
    245
  );

  ellipse(
    0,
    0,
    size,
    size
  );


  // Cyan glow

  fill(
    0,
    220,
    255,
    35
  );

  ellipse(
    -size * 0.18,
    -size * 0.16,
    size * 0.65,
    size * 0.58
  );


  // Purple

  fill(
    170,
    80,
    255,
    45
  );

  ellipse(
    size * 0.18,
    -size * 0.05,
    size * 0.65,
    size * 0.7
  );


  // Pink

  fill(
    255,
    80,
    180,
    35
  );

  ellipse(
    0,
    size * 0.2,
    size * 0.75,
    size * 0.6
  );


  // Blue

  fill(
    70,
    130,
    255,
    35
  );

  ellipse(
    -size * 0.22,
    size * 0.2,
    size * 0.45,
    size * 0.55
  );


  // Green

  fill(
    100,
    255,
    190,
    25
  );

  ellipse(
    size * 0.25,
    size * 0.2,
    size * 0.4,
    size * 0.45
  );


  // Yellow

  fill(
    255,
    230,
    100,
    20
  );

  ellipse(
    -size * 0.1,
    -size * 0.3,
    size * 0.35,
    size * 0.3
  );


  // Rainbow edge arcs

  noFill();

  strokeWeight(
    size * 0.018
  );

  stroke(
    0,
    220,
    255,
    150
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
    150
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
    150
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
    150
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
    150
  );

  arc(
    0,
    0,
    size * 0.94,
    size * 0.94,
    130,
    200
  );


  // White reflections

  noStroke();

  fill(255, 255, 255, 120);

  ellipse(
    -size * 0.23,
    -size * 0.27,
    size * 0.16,
    size * 0.08
  );

  ellipse(
    -size * 0.17,
    -size * 0.2,
    size * 0.07,
    size * 0.035
  );


  fill(255, 255, 255, 80);

  ellipse(
    size * 0.27,
    size * 0.28,
    size * 0.055,
    size * 0.055
  );

  ellipse(
    size * 0.3,
    size * 0.23,
    size * 0.025,
    size * 0.025
  );


  // Small sparkles

  fill(255, 255, 255, 180);

  drawSparkle(
    -size * 0.43,
    -size * 0.03,
    size * 0.025
  );

  drawSparkle(
    size * 0.4,
    -size * 0.18,
    size * 0.018
  );

  drawSparkle(
    -size * 0.28,
    size * 0.35,
    size * 0.015
  );

  pop();
}


// --------------------------------
// MINION
// --------------------------------

function drawMinion(
  x,
  y,
  revealAmount
) {

  if (!imageReady) {
    return;
  }

  push();

  imageMode(CENTER);

  let imageSize =
    min(width, height) * 0.27;

  let alphaAmount =
    map(
      revealAmount,
      0,
      255,
      0,
      255
    );

  tint(
    255,
    alphaAmount
  );

  image(
    minion,
    x,
    y,
    imageSize,
    imageSize
  );

  noTint();

  pop();
}


// --------------------------------
// DISTORTION
// --------------------------------

function drawDistortion(
  level
) {

  if (!imageReady) {
    return;
  }

  push();

  let amount =
    level * 45;

  let slices =
    floor(
      map(
        level,
        0,
        1,
        2,
        22
      )
    );


  // Dark sections

  for (
    let i = 0;
    i < slices;
    i++
  ) {

    let y =
      random(height);

    let h =
      random(
        2,
        15
      ) * level;

    fill(
      0,
      random(
        20,
        100
      )
    );

    noStroke();

    rect(
      0,
      y,
      width,
      h
    );
  }


  // Horizontal slices

  for (
    let i = 0;
    i < slices;
    i++
  ) {

    let y =
      random(
        height * 0.2,
        height * 0.8
      );

    let h =
      random(
        2,
        12
      );

    let offset =
      random(
        -amount,
        amount
      );

    let sourceY =
      constrain(
        y,
        0,
        height - h
      );

    copy(
      0,
      sourceY,
      width,
      h,
      offset,
      sourceY,
      width,
      h
    );
  }


  // RGB separation

  if (level > 0.2) {

    blendMode(ADD);

    tint(
      255,
      0,
      80,
      45 * level
    );

    image(
      minion,
      width / 2 - amount * 0.4,
      height / 2,
      min(width, height) * 0.27,
      min(width, height) * 0.27
    );

    tint(
      0,
      200,
      255,
      45 * level
    );

    image(
      minion,
      width / 2 + amount * 0.4,
      height / 2,
      min(width, height) * 0.27,
      min(width, height) * 0.27
    );

    blendMode(BLEND);

    noTint();
  }


  // Glitch bars

  if (level > 0.35) {

    for (
      let i = 0;
      i < 12 * level;
      i++
    ) {

      let y =
        random(height);

      let w =
        random(
          width * 0.05,
          width * 0.6
        );

      let h =
        random(
          2,
          10
        );

      fill(
        random([
          255,
          0,
          180
        ]),
        random(
          30,
          100
        )
      );

      rect(
        random(width - w),
        y,
        w,
        h
      );
    }
  }


  // Heavy black cuts

  if (level > 0.65) {

    for (
      let i = 0;
      i < 10;
      i++
    ) {

      fill(
        0,
        random(
          80,
          200
        )
      );

      rect(
        random(width),
        random(height),
        random(
          10,
          100
        ),
        random(
          5,
          40
        )
      );
    }
  }

  pop();
}


// --------------------------------
// POP ANIMATION
// --------------------------------

function drawPopAnimation() {

  let elapsed =
    millis() - popStartTime;

  let progress =
    constrain(
      elapsed / popDuration,
      0,
      1
    );

  let eased =
    1 - pow(
      1 - progress,
      3
    );


  // Expanding rings

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
        i * 0.08,
        0,
        1
      );

    let ringSize =
      min(width, height) *
      0.4 *
      ringProgress;

    stroke(
      255,
      255,
      255,
      150 *
      (1 - ringProgress)
    );

    ellipse(
      width / 2,
      height / 2,
      ringSize,
      ringSize
    );
  }


  // Flash

  noStroke();

  fill(
    255,
    255,
    255,
    150 *
    (1 - progress)
  );

  ellipse(
    width / 2,
    height / 2,
    min(width, height) *
    0.35 *
    eased,
    min(width, height) *
    0.35 *
    eased
  );


  // Droplets

  for (
    let i = 0;
    i < droplets.length;
    i++
  ) {

    let d =
      droplets[i];

    d.x += d.vx;
    d.y += d.vy;

    d.vy += 0.025;

    d.alpha *= 0.985;

    noStroke();

    fill(
      d.r,
      d.g,
      d.b,
      d.alpha
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
    i < 20;
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

      x: width / 2,

      y: height / 2,

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

      alpha: 220
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
    min(width, height) * 0.045
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


  // Placeholder

  if (drawingPoints.length === 0) {

    noStroke();

    fill(
      255,
      255,
      255,
      100 * fade
    );

    textSize(
      min(width, height) * 0.035
    );

    text(
      "draw something.",
      width / 2,
      boxY +
      boxHeight / 2
    );
  }


  // Draw user's strokes

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


  // Submit button

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
    min(width, height) * 0.027
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
        random(
          width
        ),

      y:
        random(
          height + 100,
          height + 500
        ),

      size:
        random(
          min(width, height) * 0.04,
          min(width, height) * 0.20
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
        )
    });
  }
}


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


  // Slowly make the bubbles more visible

  let bubbleAlpha =
    constrain(
      progress * 1.5,
      0,
      1
    );


  // Move bubbles upward

  for (
    let i = 0;
    i < finalBubbles.length;
    i++
  ) {

    let b =
      finalBubbles[i];


    b.y -= b.speed;

    b.x +=
      sin(
        frameCount * 0.7 +
        b.phase
      ) *
      0.35;

    b.rotation +=
      b.rotationSpeed;


    // Reset bubble when it leaves screen

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


    drawFinalBubble(
      b,
      bubbleAlpha
    );
  }


  // Add more bubbles over time

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
          random(20, 100),

        size:
          random(
            min(width, height) * 0.04,
            min(width, height) * 0.15
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
          )
      });
    }
  }


  // Dark overlay so text remains readable

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


  // Final message

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
    min(width, height) * 0.045
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


  // Dark transparent interior

  noStroke();

  fill(
    5,
    25,
    35,
    150 * overallAlpha
  );

  ellipse(
    0,
    0,
    b.size,
    b.size
  );


  // Coloured interior glow

  fill(
    0,
    220,
    255,
    25 * overallAlpha
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
    25 * overallAlpha
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
    20 * overallAlpha
  );

  ellipse(
    0,
    b.size * 0.18,
    b.size * 0.7,
    b.size * 0.5
  );


  // Rainbow edge

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


  // Reflection

  noStroke();

  fill(
    255,
    255,
    255,
    120 * overallAlpha
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
    70 * overallAlpha
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

        x: mouseX,

        y: mouseY,

        newStroke: true
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

        x: mouseX,

        y: mouseY,

        newStroke: false
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
