let minion;
let imageLoaded = false;
let imageFailed = false;

function preload() {

  minion = loadImage(
    "minion.jpg",

    function() {
      imageLoaded = true;
    },

    function() {
      imageFailed = true;
    }
  );
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);

  background(0);

  if (imageLoaded) {

    image(
      minion,
      width / 2,
      height / 2,
      300,
      300
    );

    fill(0, 255, 0);
    textAlign(CENTER);
    textSize(24);

    text(
      "MINION LOADED",
      width / 2,
      height - 80
    );

  } else {

    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(24);

    text(
      "MINION DID NOT LOAD",
      width / 2,
      height / 2
    );
  }
}
