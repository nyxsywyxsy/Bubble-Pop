let minion = null;
let imageReady = false;

let tilted = false;


// --------------------------------
// SETUP
// --------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  // Load Minion image
  loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg",

    function(img) {
      minion = img;
      imageReady = true;
      console.log("MINION LOADED");
    },

    function(error) {
      console.log("MINION FAILED TO LOAD");
    }
  );
}


// --------------------------------
// DRAW
// --------------------------------

function draw() {

  // --------------------------------
  // BACKGROUND
  // --------------------------------

  background(0);

  let bubbleX = width / 2;
  let bubbleY = height / 2;
  let bubbleSize = min(width, height) * 0.62;


  // --------------------------------
  // BUBBLE DARK CENTRE
  // --------------------------------

  noStroke();

  fill(2, 15, 18, 210);

  ellipse(
    bubbleX,
    bubbleY,
    bubbleSize * 0.88
  );


  // --------------------------------
  // MINION
  // --------------------------------

  if (tilted && imageReady && minion) {

    tint(255, 255);

    image(
      minion,
      bubbleX,
      bubbleY,
      bubbleSize * 0.42,
      bubbleSize * 0.42
    );

    noTint();
  }


  // --------------------------------
  // VERY SUBTLE TEAL INSIDE BUBBLE
  // --------------------------------

  fill(0, 70, 75, 35);

  ellipse(
    bubbleX - bubbleSize * 0.04,
    bubbleY - bubbleSize * 0.03,
    bubbleSize * 0.80
  );


  // --------------------------------
  // IRIDESCENT BUBBLE FILM
  // --------------------------------

  // Cyan

  fill(20, 220, 240, 45);

  ellipse(
    bubbleX - bubbleSize * 0.28,
    bubbleY - bubbleSize * 0.12,
    bubbleSize * 0.38,
    bubbleSize * 0.65
  );


  // Purple

  fill(170, 70, 255, 45);

  ellipse(
    bubbleX - bubbleSize * 0.10,
    bubbleY - bubbleSize * 0.35,
    bubbleSize * 0.45,
    bubbleSize * 0.35
  );


  // Pink

  fill(255, 70, 180, 50);

  ellipse(
    bubbleX + bubbleSize * 0.20,
    bubbleY - bubbleSize * 0.30,
    bubbleSize * 0.48,
    bubbleSize * 0.35
  );


  // Blue

  fill(70, 150, 255, 45);

  ellipse(
    bubbleX + bubbleSize * 0.34,
    bubbleY,
    bubbleSize * 0.28,
    bubbleSize * 0.55
  );


  // Green

  fill(80, 255, 190, 42);

  ellipse(
    bubbleX + bubbleSize * 0.18,
    bubbleY + bubbleSize * 0.28,
    bubbleSize * 0.45,
    bubbleSize * 0.30
  );


  // Yellow

  fill(255, 230, 100, 35);

  ellipse(
    bubbleX - bubbleSize * 0.20,
    bubbleY + bubbleSize * 0.30,
    bubbleSize * 0.45,
    bubbleSize * 0.25
  );


  // --------------------------------
  // IRIDESCENT EDGE
  // --------------------------------

  noFill();

  // Soft outer glow

  strokeWeight(12);
  stroke(100, 220, 255, 25);

  ellipse(
    bubbleX,
    bubbleY,
    bubbleSize,
    bubbleSize
  );


  // Main thin rainbow edge

  strokeWeight(5);


  // Pink

  stroke(255, 100, 190, 170);

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.05,
    PI * 1.48
  );


  // Purple

  stroke(170, 100, 255, 170);

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.48,
    PI * 1.75
  );


  // Blue

  stroke(80, 190, 255, 180);

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.75,
    PI * 2.05
  );


  // Cyan

  stroke(80, 240, 230, 180);

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 2.05,
    PI * 2.35
  );


  // Green

  stroke(150, 255, 180, 150);

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 2.35,
    PI * 2.60
  );


  // Yellow

  stroke(255, 230, 120, 150);

  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 2.60,
    PI * 2.90
  );


  // --------------------------------
  // CURVED REFLECTIONS
  // --------------------------------

  stroke(255, 255, 255, 150);
  strokeWeight(4);

  arc(
    bubbleX - bubbleSize * 0.14,
    bubbleY - bubbleSize * 0.13,
    bubbleSize * 0.65,
    bubbleSize * 0.65,
    PI * 1.05,
    PI * 1.45
  );


  stroke(255, 255, 255, 100);
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
  // BRIGHT REFLECTION SPOTS
  // --------------------------------

  noStroke();

  fill(255, 255, 255, 180);

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


  fill(255, 255, 255, 100);

  ellipse(
    bubbleX - bubbleSize * 0.32,
    bubbleY - bubbleSize * 0.03,
    bubbleSize * 0.025
  );


  // --------------------------------
  // TEXT
  // --------------------------------

  textAlign(CENTER, CENTER);

  textFont("Georgia");

  fill(255, 255, 255, 230);

  textSize(min(width, height) * 0.045);

  text(
    "reveal what's hidden",
    width / 2,
    height * 0.10
  );


  // --------------------------------
  // SMALL SPARKLES
  // --------------------------------

  stroke(255, 255, 255, 170);
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
// PHONE TILT
// --------------------------------

function deviceMoved() {

  let xTilt = abs(rotationX);
  let yTilt = abs(rotationY);

  let tiltAmount = max(xTilt, yTilt);

  // Tilted
  if (tiltAmount > 15) {
    tilted = true;
  }

  // Back to upright
  else {
    tilted = false;
  }
}


// --------------------------------
// SPARKLE FUNCTION
// --------------------------------

function drawSparkle(x, y, size) {

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
  resizeCanvas(windowWidth, windowHeight);
}
