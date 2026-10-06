let minion;

function preload() {
  minion = loadImage("minion.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(235, 248, 255);

  // Instruction
  fill(40);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("reveal what's hidden", width / 2, 50);

  // Bubble
  let bubbleX = width / 2;
  let bubbleY = height / 2;
  let bubbleSize = min(width, height) * 0.75;

  // Bubble fill
  noStroke();
  fill(120, 210, 255, 70);
  ellipse(bubbleX, bubbleY, bubbleSize);

  // Bubble highlight
  noFill();
  stroke(255, 255, 255, 180);
  strokeWeight(4);
  ellipse(bubbleX - bubbleSize * 0.08,
          bubbleY - bubbleSize * 0.08,
          bubbleSize * 0.92);

  // Hidden Minion
  imageMode(CENTER);

  tint(255, 40);
  image(
    minion,
    bubbleX,
    bubbleY,
    bubbleSize * 0.55,
    bubbleSize * 0.55
  );

  noTint();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
