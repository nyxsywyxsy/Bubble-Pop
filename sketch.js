let minion;

function preload() {

  minion = loadImage(
    "minion.jpg",

    // SUCCESS
    function(img) {
      console.log("MINION LOADED!");
      console.log(img.width, img.height);
    },

    // ERROR
    function(error) {
      console.log("MINION FAILED TO LOAD!");
      console.log(error);
    }
  );
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  background(0);

  imageMode(CENTER);

  if (minion) {

    image(
      minion,
      width / 2,
      height / 2,
      300,
      300
    );

    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("IMAGE LOADED", width / 2, height - 80);

  } else {

    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(24);
    text("IMAGE DID NOT LOAD", width / 2, height / 2);
  }
}
