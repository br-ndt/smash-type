import * as w4 from "./wasm4";

// Define the p1 sprite data
const p1 = memory.data<u8>([
  0b11000011, 0b10000001, 0b00100100, 0b00100100, 0b00000000, 0b00100100,
  0b10011001, 0b11000011,
]);

// Define the inverted p1 sprite data by flipping each byte's bits
const p2 = memory.data<u8>([
  ~0b11000011 & 0xff, // 00111100
  ~0b10000001 & 0xff, // 01111110
  ~0b00100100 & 0xff, // 11011011
  ~0b00100100 & 0xff, // 11011011
  ~0b00000000 & 0xff, // 11111111
  ~0b00100100 & 0xff, // 11011011
  ~0b10011001 & 0xff, // 01100110
  ~0b11000011 & 0xff, // 00111100
]);

// Initialize global position variables for the p1s
let p1X: i32 = 145; // Initial X position for p1
let p1Y: i32 = 50; // Initial Y position for p1

let p2X: i32 = 5; // Initial X position for p2
let p2Y: i32 = 50; // Initial Y position for p2

// Initialize velocity variables for the p1s
let p1VX: f32 = 0.0;
let p1VY: f32 = 0.0;

let p2VX: f32 = 0.0;
let p2VY: f32 = 0.0;

let freezeMovement = false;
let unfreezeFrame = 0;

// Define movement acceleration and friction
const ACCELERATION: f32 = 0.5;
const FRICTION: f32 = 0.85; // Increased friction

// Function to calculate the distance between two points
function calculateDistance(x1: i32, y1: i32, x2: i32, y2: i32): f64 {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Function to normalize a vector
function normalizeVector(vx: f32, vy: f32): Vector {
  const length = Math.sqrt(vx * vx + vy * vy) as f32;
  if (length > 0) {
    return new Vector(vx / length, vy / length);
  }
  return new Vector(vx, vy);
}

class Vector {
  constructor(public x: f32, public y: f32) {
    this.x = x;
    this.y = y;
  }
}
const freezeDuration = 10;
let currentFrame = 0;

// make variables for p1 and p2 health points
const MAX_PLAYER_HEALTH: i32 = 10;
let p1Health: i32 = MAX_PLAYER_HEALTH;
let p2Health: i32 = MAX_PLAYER_HEALTH;

export function update(): void {
  if (currentFrame === unfreezeFrame) {
    freezeMovement = false;
  }
  // Set the initial draw color palette (foreground color)
  store<u16>(w4.DRAW_COLORS, 2);

  // Display game title
  w4.text("Pizza FIGHTERS!", 25, 10);

  // Retrieve the current state of the gamepads
  const gamepad1 = load<u8>(w4.GAMEPAD1);
  const gamepad2 = load<u8>(w4.GAMEPAD2);

  let p1AX = 0 as f32;
  let p1AY = 0 as f32;

  let p2AX = 0 as f32;
  let p2AY = 0 as f32;

  // Handle movement for p1 using GAMEPAD1 (W, A, S, D)
  // X-axis movement
  if (gamepad1 & w4.BUTTON_LEFT) {
    p1AX -= ACCELERATION; // Accelerate left (A)
  }
  if (gamepad1 & w4.BUTTON_RIGHT) {
    p1AX += ACCELERATION; // Accelerate right (D)
  }

  // Y-axis movement
  if (gamepad1 & w4.BUTTON_UP) {
    p1AY -= ACCELERATION; // Accelerate up (W)
  }
  if (gamepad1 & w4.BUTTON_DOWN) {
    p1AY += ACCELERATION; // Accelerate down (S)
  }

  // Handle movement for p2 using GAMEPAD2 (O, K, L, ;)
  // X-axis movement
  if (gamepad2 & w4.BUTTON_LEFT) {
    p2AX -= ACCELERATION; // Accelerate left (O)
  }
  if (gamepad2 & w4.BUTTON_RIGHT) {
    p2AX += ACCELERATION; // Accelerate right (;)
  }

  // Y-axis movement
  if (gamepad2 & w4.BUTTON_UP) {
    p2AY -= ACCELERATION; // Accelerate up (K)
  }
  if (gamepad2 & w4.BUTTON_DOWN) {
    p2AY += ACCELERATION; // Accelerate down (L)
  }

  const p1NA = normalizeVector(p1AX, p1AY);
  const p2NA = normalizeVector(p2AX, p2AY);

  if (!freezeMovement) {
    // Update velocities based on acceleration
    p1VX += p1NA.x;
    p1VY += p1NA.y;
    p2VX += p2NA.x;
    p2VY += p2NA.y;
  }

  // Apply friction to velocities
  p1VX *= FRICTION;
  p1VY *= FRICTION;
  p2VX *= FRICTION;
  p2VY *= FRICTION;

  // Update positions based on velocities
  p1X += p1VX as i32;
  p1Y += p1VY as i32;
  p2X += p2VX as i32;
  p2Y += p2VY as i32;

  // Define screen constraints
  const SCREEN_WIDTH: i32 = 160;
  const SCREEN_HEIGHT: i32 = 120; // Common screen height in wasm4
  const SPRITE_WIDTH: i32 = 8;
  const SPRITE_HEIGHT: i32 = 8;

  // Constrain p1X within screen bounds
  if (p1X < 0) {
    p1X = 0;
    p1VX = 0;
  } else if (p1X > SCREEN_WIDTH - SPRITE_WIDTH) {
    p1X = SCREEN_WIDTH - SPRITE_WIDTH;
    p1VX = 0;
  }

  // Constrain p1Y within screen bounds
  if (p1Y < 0) {
    p1Y = 0;
    p1VY = 0;
  } else if (p1Y > SCREEN_HEIGHT - SPRITE_HEIGHT) {
    p1Y = SCREEN_HEIGHT - SPRITE_HEIGHT;
    p1VY = 0;
  }

  // Constrain p2X within screen bounds
  if (p2X < 0) {
    p2X = 0;
    p2VX = 0;
  } else if (p2X > SCREEN_WIDTH - SPRITE_WIDTH) {
    p2X = SCREEN_WIDTH - SPRITE_WIDTH;
    p2VX = 0;
  }

  // Constrain p2Y within screen bounds
  if (p2Y < 0) {
    p2Y = 0;
    p2VY = 0;
  } else if (p2Y > SCREEN_HEIGHT - SPRITE_HEIGHT) {
    p2Y = SCREEN_HEIGHT - SPRITE_HEIGHT;
    p2VY = 0;
  }

  // Calculate the distance between the two p1s
  const distance = calculateDistance(p1X, p1Y, p2X, p2Y);

  const p1VMagnitude = Math.sqrt(Math.pow(p1VX, 2) + Math.pow(p1VY, 2));
  const p2VMagnitude = Math.sqrt(Math.pow(p2VX, 2) + Math.pow(p2VY, 2));

  // If the distance is less than a threshold, play a beeping sound
  const THRESHOLD_DISTANCE: f64 = 8.0;
  if (!freezeMovement) {
    if (distance < THRESHOLD_DISTANCE) {
      const cachedP1V = [p1VX, p1VY];
      const cachedP2V = [p2VX, p2VY];
      w4.tone(440, 10, 20, w4.TONE_PULSE1);
      p1VX = 0;
      p1VY = 0;
      p2VX = 0;
      p2VY = 0;
      freezeMovement = true;
      unfreezeFrame = currentFrame + freezeDuration;
      const punchMagnitude: i32 = 3;
      const p1Punch = punchMagnitude + (MAX_PLAYER_HEALTH - p1Health) as f32;
      const p2Punch = punchMagnitude + (MAX_PLAYER_HEALTH - p2Health) as f32;

      if (p1VMagnitude > p2VMagnitude) {
        // player 1 does damage
        p2VX = (cachedP1V[0] * p2Punch) as f32;
        p2VY = (cachedP1V[1] * p2Punch) as f32;
        p2Health--;
      } else if (p1VMagnitude < p2VMagnitude) {
        // player 2 does damage
        p1VX = (cachedP2V[0] * p1Punch) as f32;
        p1VY = (cachedP2V[1] * p1Punch) as f32;
        p1Health--;
      } else {
        // equal collision
        p1VX = -cachedP1V[0] * p1Punch;
        p1VY = -cachedP1V[1] * p1Punch;
        p2VX = -cachedP2V[0] * p2Punch;
        p2VY = -cachedP2V[1] * p2Punch;
        p1Health--;
        p2Health--;
      }
    }
  }

  // Draw the p1 sprite at its current position
  w4.blit(
    p1,
    p1X,
    p1Y,
    SPRITE_WIDTH, // Width of the sprite in pixels
    SPRITE_HEIGHT, // Height of the sprite in pixels
    w4.BLIT_1BPP
  );

  // Draw the inverted p1 sprite at its current position
  w4.blit(
    p2,
    p2X,
    p2Y,
    SPRITE_WIDTH, // Width of the sprite in pixels
    SPRITE_HEIGHT, // Height of the sprite in pixels
    w4.BLIT_1BPP
  );

  // Display instructional text
  w4.text(
    "p1:" + p2Health.toString() + " ---- " + "p2:" + p1Health.toString(),
    10,
    130
  );
  w4.text("p1 x:" + p1X.toString(), 10, 140); 
  w4.text(" y:" + p1Y.toString(), 90, 140);
  // do the same for p2
  w4.text("p2 x:" + p2X.toString(), 10, 150); 
  w4.text(" y:" + p2Y.toString(), 90, 150);

  currentFrame++;
}

w4.tone(120, 10, 60, w4.TONE_PULSE2);
w4.tone(420, 15, 60, w4.TONE_PULSE2);
w4.tone(50, 20, 60, w4.TONE_PULSE2);
