```javascript
let minion;

function preload() {
  minion = loadImage("minion.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
}

function draw() {
  // Black background
  background(3, 8, 10);

  let bubbleX = width / 2;
  let bubbleY = height / 2;
  let bubbleSize = min(width, height) * 0.72;

  // -------------------------
  // INSTRUCTION
  // -------------------------

  fill(255, 255, 255, 210);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(min(width, height) * 0.045);
  text("reveal what's hidden", width / 2, height * 0.10);

  // -------------------------
  // BUBBLE BASE
  // -------------------------

  noStroke();

  // Dark teal transparent centre
  fill(5, 65, 70, 70);
  ellipse(bubbleX, bubbleY, bubbleSize);

  // Soft teal inner layer
  fill(20, 120, 125, 30);
  ellipse(
    bubbleX - bubbleSize * 0.02,
    bubbleY - bubbleSize * 0.02,
    bubbleSize * 0.92
  );

  // -------------------------
  // IRIDESCENT COLOUR
  // -------------------------

  // Pink / purple glow
  fill(255, 80, 180, 22);
  ellipse(
    bubbleX - bubbleSize * 0.16,
    bubbleY - bubbleSize * 0.20,
    bubbleSize * 0.55
  );

  // Blue glow
  fill(50, 150, 255, 25);
  ellipse(
    bubbleX + bubbleSize * 0.18,
    bubbleY - bubbleSize * 0.10,
    bubbleSize * 0.52
  );

  // Green glow
  fill(80, 255, 190, 20);
  ellipse(
    bubbleX + bubbleSize * 0.15,
    bubbleY + bubbleSize * 0.20,
    bubbleSize * 0.55
  );

  // Yellow / orange glow
  fill(255, 190, 60, 18);
  ellipse(
    bubbleX - bubbleSize * 0.20,
    bubbleY + bubbleSize * 0.18,
    bubbleSize * 0.48
  );

  // -------------------------
  // HIDDEN MINION
  // -------------------------

  // Very faint image for now.
  // Later, phone tilt will control this opacity.

  tint(255, 45);

  image(
    minion,
    bubbleX,
    bubbleY,
    bubbleSize * 0.48,
    bubbleSize * 0.48
  );

  noTint();

  // -------------------------
  // BUBBLE EDGE
  // -------------------------

  noFill();

  // Outer teal edge
  stroke(80, 220, 220, 110);
  strokeWeight(3);

  ellipse(
    bubbleX,
    bubbleY,
    bubbleSize,
    bubbleSize
  );

  // Rainbow edge sections
  strokeWeight(6);

  // Pink
  stroke(255, 100, 190, 120);
  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.98,
    bubbleSize * 0.98,
    PI * 1.05,
    PI * 1.45
  );

  // Purple / blue
  stroke(120, 120, 255, 120);
  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.99,
    bubbleSize * 0.99,
    PI * 1.45,
    PI * 1.85
  );

  // Cyan
  stroke(80, 240, 240, 120);
  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.99,
    bubbleSize * 0.99,
    PI * 1.85,
    PI * 2.25
  );

  // Green / yellow
  stroke(150, 255, 180, 100);
  arc(
    bubbleX,
    bubbleY,
    bubbleSize * 0.99,
    bubbleSize * 0.99,
    PI * 2.25,
    PI * 2.65
  );

  // -------------------------
  // BUBBLE HIGHLIGHTS
  // -------------------------

  stroke(255, 255, 255, 170);
  strokeWeight(4);

  arc(
    bubbleX - bubbleSize * 0.12,
    bubbleY - bubbleSize * 0.12,
    bubbleSize * 0.68,
    bubbleSize * 0.68,
    PI * 1.05,
    PI * 1.42
  );

  stroke(255, 255, 255, 100);
  strokeWeight(2);

  arc(
    bubbleX + bubbleSize * 0.08,
    bubbleY + bubbleSize * 0.10,
    bubbleSize * 0.82,
    bubbleSize * 0.82,
    0,
    HALF_PI
  );

  // Small bubble shine
  noStroke();
  fill(255, 255, 255, 130);
  ellipse(
    bubbleX - bubbleSize * 0.27,
    bubbleY - bubbleSize * 0.27,
    bubbleSize * 0.035
  );

  ellipse(
    bubbleX - bubbleSize * 0.22,
    bubbleY - bubbleSize * 0.23,
    bubbleSize * 0.018
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
```

