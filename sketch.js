function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  fill(20, 220, 240);
  noStroke();

  ellipse(
    width / 2,
    height / 2,
    min(width, height) * 0.6
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);

  text(
    "reveal what's hidden",
    width / 2,
    height * 0.1
  );
}
