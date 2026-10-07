function setup() {
  createCanvas(1000, 1000);
}

function draw() {
  background(20);
  noStroke();

  for (let i = 0; i < 20000; i++) {
    rect(random(width), random(height), 4, 4);
  }
}
