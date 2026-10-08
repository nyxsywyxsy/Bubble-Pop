let minion;

function preload() {
  minion = loadImage("minion.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
}

function draw() {
  background(0);

  // Draw the Minion large in the middle
  image(
    minion,
    width / 2,
    height / 2,
    300,
    300
  );

  // Status text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("MINION TEST", width / 2, height * 0.15);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
