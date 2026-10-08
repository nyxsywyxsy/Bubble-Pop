let minion = null;
let imageReady = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  loadImage(
    "https://nyxsywyxsy.github.io/Bubble-Pop/minion.jpg",
    
    function(img) {
      minion = img;
      imageReady = true;
      console.log("MINION LOADED:", minion);
    },

    function(error) {
      console.log("MINION FAILED:", error);
    }
  );
}

function draw() {
  background(0);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);

  if (imageReady && minion) {

    image(
      minion,
      width / 2,
      height / 2,
      300,
      300
    );

    text(
      "MINION LOADED",
      width / 2,
      height * 0.15
    );

  } else {

    text(
      "LOADING MINION...",
      width / 2,
      height * 0.15
    );

  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
