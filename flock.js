let flock;
let grassy;

function setup() {
  createCanvas(640, 360);
  createP("Drag the mouse to generate new boids.");
  var button = createButton("toggle food");
  button.mousePressed(addCount);
  grass = new yard();

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

let count = 0;

function draw() {
  background("#a5d4eb");
  grass.update();
  if (count%2 != 0) {
    addFood();
  }
  flock.run();
  fill("#efd5ad");
  noStroke()
  rect(0, 340, 640, 20);
}

function addCount() {
  count++;
  console.log(count)
}

function addFood() {

  var size = 15;
  var x = 290
  var y = 180
  
  for (let  i = 0; i < size; i++) {
    noStroke();
    fill("#F43636");
    ellipse(x, y, 10, 10)
    if (i%4 == 0) {
      y-=3
    }
    else if (i%4 == 1) {
      y+=3
    }
    else if (i%4 == 2) {
      y+=3
    }
    else if (i%4 == 3) {
      y-=3
    }
    x+=5
  }
}

function yard() {
  this.grass = [];
  this.roff = [];
  this.rwave = [];
  this.size = [];
  this.seg = [];
  this.index = 0;
  this.population = 30;
  let width = 360
  let height = 720
  
  for (let x = 0; x < width; x += width / this.population) {
    this.index += 1;
    this.grass.push(x);
    this.roff.push((this.index * 0.065) + 0.0015);
    this.rwave.push(0);
    this.size.push(random(35, 55));
    this.seg.push(0.85);
  }
  this.update = function() {
    for (let i = 0; i < this.index; i++) { 
      let len = this.size[i];
      push();
      translate(this.grass[i], height * 0.65);
      this.blade(len, i);
      pop();
    }
  }
  this.blade = function(len, ind) {
    if (ind / 2 === int(ind / 2)) {
      this.roff[ind] += 0.0025;
      stroke(0, 255 - (len * 1.5), len * 1.5, 255);
      rot = map(noise(this.roff[ind]), 0, 1,
        -QUARTER_PI * 0.75, QUARTER_PI * 0.75);
    }
    if (ind / 2 != int(ind / 2)) {
      this.roff[ind] += 0.0025;
      stroke(0, 255 - (len * 1.5), len * 1.5, 255);
      rot = map(-sin(this.roff[ind]), -1, 1,
        -QUARTER_PI * 0.25, QUARTER_PI * 0.25);
    }
    strokeWeight(len * 2 * random(0.07, 0.11));
    rotate(rot);
    line(0, 0, 0, -len);
    translate(0, -len);
    if (len > 20) {
      this.blade(len * this.seg[ind], ind);
    }
  }
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  // this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  let avo = this.avoid(boids);      // Avoid walls
  let foo = this.food(boids);
  // Arbitrarily weight these forces
  sep.mult(10.0);
  ali.mult(2.0);
  coh.mult(1.0);
  avo.mult(3.0);
  foo.mult(5.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(avo);
  this.applyForce(foo);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  let theta = this.velocity.heading() + radians(90);
  fill("#e47330");
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  ellipse(0, 0, 20, 40);
  beginShape();
  endShape(CLOSE);
  pop();
  fill("#e47330");
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  triangle(0, 20, -10, 30, 10, 30)
  beginShape();
  endShape(CLOSE);
  fill("black");
  noStroke();
  ellipse(0, -10, 5, 5)
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width + this.r;
  if (this.position.y < -this.r)  this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.avoid = function(boids) {
  let steer = createVector(0, 0);
  if (this.position.x <= 0) {
    steer.add(createVector(1, 0));
  }
  if (this.position.x > 640) { // width of canvas
    steer.add(createVector(-1, 0));
  }
  if (this.position.y <= 0) {
    steer.add(createVector(0, 1));
  }
  if (this.position.y > 320) { // height of canvas
    steer.add(createVector(0, -1));
  }
  if (this.position.x <= 360 && this.position.y >= 200) {
    steer.add(createVector(1, 0));
  }
  return steer;
}

Boid.prototype.food = function(boids) {
  let steer = createVector(0, 0);
  if (count%2 != 0) {
    if (this.position.x < 320) {
      steer.add(createVector(1, 0))
    }
    if (this.position.x > 320) {
      steer.add(createVector(-1, 0))
    }
    if (this.position.y < 180) {
      steer.add(createVector(0, 1))
    }
    if (this.position.y > 180) {
      steer.add(createVector(0, -1))
    }
  }
  return steer;
}

