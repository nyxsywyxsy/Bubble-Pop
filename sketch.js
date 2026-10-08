let minion;

function preload() {
  minion = loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg"
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
}

function draw() {
  background(0);

  image(
    minion,
    width / 2,
    height / 2,
    300,
    300
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
