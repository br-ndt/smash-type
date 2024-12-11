import * as w4 from "./wasm4";

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

const invertedSmiley = memory.data<u8>([
    ~0b11000011 & 0xff, // Flip bits: 00111100
    ~0b10000001 & 0xff, // Flip bits: 01111110
    ~0b00100100 & 0xff, // Flip bits: 11011011
    ~0b00100100 & 0xff, // Flip bits: 11011011
    ~0b00000000 & 0xff, // Flip bits: 11111111
    ~0b00100100 & 0xff, // Flip bits: 11011011
    ~0b10011001 & 0xff, // Flip bits: 01100110
    ~0b11000011 & 0xff, // Flip bits: 00111100
]);

// Make it gameboy colors
store<u32>(w4.PALETTE, 0xfff6d3, 0 * sizeof<u32>());
store<u32>(w4.PALETTE, 0xdb3416, 1 * sizeof<u32>());
store<u32>(w4.PALETTE, 0xeb6b6f, 2 * sizeof<u32>());
store<u32>(w4.PALETTE, 0x1b16ac, 3 * sizeof<u32>());

// Initialize global position variables for the smileys
let smileyX: i32 = 145;         // Initial X position for smiley
const smileyY: i32 = 50;        // Y position remains constant

let invertedSmileyX: i32 = 5;   // Initial X position for invertedSmiley
const invertedSmileyY: i32 = 50; // Y position remains constant

export function update (): void {
    // Set the initial draw color palette (foreground color)
    store<u16>(w4.DRAW_COLORS, 2);
    
    // Display game title
    w4.text("Pizza FIGHTERS!", 10, 10);

    // Retrieve the current state of the gamepad
    const gamepad1 = load<u8>(w4.GAMEPAD1);

    // Handle movement for invertedSmiley 
    if (gamepad1 & w4.BUTTON_2) {  
        invertedSmileyX -= 1;
    }
    if (gamepad1 & w4.BUTTON_1) {   
        invertedSmileyX += 1;
    }
    
    const gamepad2 = load<u8>(w4.GAMEPAD2);

    // Handle movement for smiley 
    if (gamepad2 & w4.BUTTON_1) {   
        smileyX += 1;
    }
    if (gamepad2 & w4.BUTTON_2) {   
        smileyX -= 1;
    }

    // Optional: Constrain smiley positions within screen bounds (0 to 160 pixels)
    // Screen width in wasm4 is typically 160 pixels
    const SCREEN_WIDTH: i32 = 160;
    const SPRITE_WIDTH: i32 = 8;

    // Constrain smileyX
    if (smileyX < 0) {
        smileyX = 0;
    } else if (smileyX > SCREEN_WIDTH - SPRITE_WIDTH) {
        smileyX = SCREEN_WIDTH - SPRITE_WIDTH;
    }

    // Constrain invertedSmileyX
    if (invertedSmileyX < 0) {
        invertedSmileyX = 0;
    } else if (invertedSmileyX > SCREEN_WIDTH - SPRITE_WIDTH) {
        invertedSmileyX = SCREEN_WIDTH - SPRITE_WIDTH;
    }

    // Update the draw colors if BUTTON_1 is pressed (as in original code)
    if (gamepad1 & w4.BUTTON_1) {
        store<u16>(w4.DRAW_COLORS, 4);
    } else {
        store<u16>(w4.DRAW_COLORS, 2);
    }

    // Draw the smiley sprite at its current position
    w4.blit(
        smiley,
        smileyX,
        smileyY,
        8,        // Width of the sprite in pixels
        8,        // Height of the sprite in pixels
        w4.BLIT_1BPP
    );

    // Draw the inverted smiley sprite at its current position
    w4.blit(
        invertedSmiley,
        invertedSmileyX,
        invertedSmileyY,
        8,        // Width of the sprite in pixels
        8,        // Height of the sprite in pixels
        w4.BLIT_1BPP
    );

    // Display instructional text
    w4.text("Press X to blink", 16, 90);
}