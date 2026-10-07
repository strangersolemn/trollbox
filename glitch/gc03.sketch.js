function setup() {
  createCanvas(1000, 1000);
  let frameCount = 0;
}

function draw() {
  frameCount++;

  background(color(10, 10, 27));
  noStroke();

  fill(color(255, 54, 0));
  for (let i = 0; i < 25000; i++) {
    rect(random(width), random(height), 5, 5);
  }

  if (frameCount % 5 === 0) {
    fill(color(0, 0, 0, 64));
    rect(0, 0, width, height);
  }

  if (frameCount % 10 === 0) {
    fill(color(255, 54, 0, 26));
    rect(0, 0, width, height);
  }
}
