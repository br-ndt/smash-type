import * as w4 from "./wasm4";

// Define the smiley sprite data
const smiley = memory.data<u8>([
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
]);

// Define the inverted smiley sprite data by flipping each byte's bits
const invertedSmiley = memory.data<u8>([
    ~0b11000011 & 0xff, // 00111100
    ~0b10000001 & 0xff, // 01111110
    ~0b00100100 & 0xff, // 11011011
    ~0b00100100 & 0xff, // 11011011
    ~0b00000000 & 0xff, // 11111111
    ~0b00100100 & 0xff, // 11011011
    ~0b10011001 & 0xff, // 01100110
    ~0b11000011 & 0xff, // 00111100
]);

// Initialize global position variables for the smileys
let smileyX: i32 = 145;          // Initial X position for smiley
let smileyY: i32 = 50;           // Initial Y position for smiley

let invertedSmileyX: i32 = 5;    // Initial X position for invertedSmiley
let invertedSmileyY: i32 = 50;   // Initial Y position for invertedSmiley

// Initialize velocity variables for the smileys
let smileyVX: f32 = 0.0;
let smileyVY: f32 = 0.0;

let invertedSmileyVX: f32 = 0.0;
let invertedSmileyVY: f32 = 0.0;

// Define movement speed
const MOVE_SPEED: i32 = 2; // Pixels per frame

// Define movement acceleration and friction
const ACCELERATION: f32 = 0.5;
const FRICTION: f32 = 0.85; // Increased friction

// Function to calculate the distance between two points
function calculateDistance(x1: i32, y1: i32, x2: i32, y2: i32): f64 {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to normalize the velocity
function normalizeVelocity(vx: f32, vy: f32): f32[] {
    const length = Math.sqrt(vx * vx + vy * vy) as f32;
    if (length > 1) {
        return [vx / length, vy / length];
    }
    return [vx, vy] as f32[];
}

export function update(): void {
    // Set the initial draw color palette (foreground color)
    store<u16>(w4.DRAW_COLORS, 2);

    // Display game title
    w4.text("Pizza FIGHTERS!", 25, 10); 

    // Retrieve the current state of the gamepads
    const gamepad1 = load<u8>(w4.GAMEPAD1);
    const gamepad2 = load<u8>(w4.GAMEPAD2);

    // Handle movement for smiley using GAMEPAD1 (W, A, S, D)
    // X-axis movement
    if (gamepad1 & w4.BUTTON_LEFT) {  
        smileyVX -= ACCELERATION; // Accelerate left (A)
    }
    if (gamepad1 & w4.BUTTON_RIGHT) {   
        smileyVX += ACCELERATION; // Accelerate right (D)
    }

    // Y-axis movement
    if (gamepad1 & w4.BUTTON_UP) {    
        smileyVY -= ACCELERATION; // Accelerate up (W)
    }
    if (gamepad1 & w4.BUTTON_DOWN) {  
        smileyVY += ACCELERATION; // Accelerate down (S)
    }

    // Handle movement for invertedSmiley using GAMEPAD2 (O, K, L, ;)
    // X-axis movement
    if (gamepad2 & w4.BUTTON_LEFT) {  
        invertedSmileyVX -= ACCELERATION; // Accelerate left (O)
    }
    if (gamepad2 & w4.BUTTON_RIGHT) {   
        invertedSmileyVX += ACCELERATION; // Accelerate right (;)
    }

    // Y-axis movement
    if (gamepad2 & w4.BUTTON_UP) {    
        invertedSmileyVY -= ACCELERATION; // Accelerate up (K)
    }
    if (gamepad2 & w4.BUTTON_DOWN) {  
        invertedSmileyVY += ACCELERATION; // Accelerate down (L)
    }

    // Apply friction to velocities
    smileyVX *= FRICTION;
    smileyVY *= FRICTION;
    invertedSmileyVX *= FRICTION;
    invertedSmileyVY *= FRICTION;

    // Normalize velocities to prevent faster diagonal movement
    const smileyVelocity = normalizeVelocity(smileyVX, smileyVY);
    const invertedSmileyVelocity = normalizeVelocity(invertedSmileyVX, invertedSmileyVY);

    let normalizedSmileyVX = smileyVX;
    let normalizedSmileyVY = smileyVY;
    let invertedNormalizedSmileyVX = invertedSmileyVX;
    let invertedNormalizedSmileyVY = invertedSmileyVY;
    
    // Update positions based on velocities
    smileyX += normalizedSmileyVX as i32;
    smileyY += normalizedSmileyVY as i32;
    invertedSmileyX += invertedNormalizedSmileyVX as i32;
    invertedSmileyY += invertedNormalizedSmileyVY as i32;

    // Define screen constraints
    const SCREEN_WIDTH: i32 = 160;
    const SCREEN_HEIGHT: i32 = 120; // Common screen height in wasm4
    const SPRITE_WIDTH: i32 = 8;
    const SPRITE_HEIGHT: i32 = 8;

    // Constrain smileyX within screen bounds
    if (smileyX < 0) {
        smileyX = 0;
        normalizedSmileyVX = 0;
    } else if (smileyX > SCREEN_WIDTH - SPRITE_WIDTH) {
        smileyX = SCREEN_WIDTH - SPRITE_WIDTH;
        normalizedSmileyVX = 0;
    }

    // Constrain smileyY within screen bounds
    if (smileyY < 0) {
        smileyY = 0;
        normalizedSmileyVY = 0;
    } else if (smileyY > SCREEN_HEIGHT - SPRITE_HEIGHT) {
        smileyY = SCREEN_HEIGHT - SPRITE_HEIGHT;
        normalizedSmileyVY = 0;
    }

    // Constrain invertedSmileyX within screen bounds
    if (invertedSmileyX < 0) {
        invertedSmileyX = 0;
        invertedNormalizedSmileyVX = 0;
    } else if (invertedSmileyX > SCREEN_WIDTH - SPRITE_WIDTH) {
        invertedSmileyX = SCREEN_WIDTH - SPRITE_WIDTH;
        invertedNormalizedSmileyVX = 0;
    }

    // Constrain invertedSmileyY within screen bounds
    if (invertedSmileyY < 0) {
        invertedSmileyY = 0;
        invertedNormalizedSmileyVY = 0;
    } else if (invertedSmileyY > SCREEN_HEIGHT - SPRITE_HEIGHT) {
        invertedSmileyY = SCREEN_HEIGHT - SPRITE_HEIGHT;
        invertedNormalizedSmileyVY = 0;
    }

    // Calculate the distance between the two smileys
    const distance = calculateDistance(smileyX, smileyY, invertedSmileyX, invertedSmileyY);

    // If the distance is less than a threshold, play a beeping sound
    const THRESHOLD_DISTANCE: f64 = 8.0; 
    if (distance < THRESHOLD_DISTANCE) {
        w4.tone(440, 10, 20, w4.TONE_PULSE1);
    }

    // Draw the smiley sprite at its current position
    w4.blit(
        smiley,
        smileyX,
        smileyY,
        SPRITE_WIDTH,        // Width of the sprite in pixels
        SPRITE_HEIGHT,       // Height of the sprite in pixels
        w4.BLIT_1BPP
    );

    // Draw the inverted smiley sprite at its current position
    w4.blit(
        invertedSmiley,
        invertedSmileyX,
        invertedSmileyY,
        SPRITE_WIDTH,        // Width of the sprite in pixels
        SPRITE_HEIGHT,       // Height of the sprite in pixels
        w4.BLIT_1BPP
    );

    // Display instructional text
    w4.text("REAAADY... FIGHT", 18, 90);
    w4.text("+----------------+", 10, 100);
    
}
   
w4.tone(120, 10, 60, w4.TONE_PULSE2);
w4.tone(420, 15, 60, w4.TONE_PULSE2);
w4.tone(50, 20, 60, w4.TONE_PULSE2);