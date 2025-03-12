export const OFF_COLOR = "#000000";
export const ON_COLOR = "#00FF33";
export const PIXEL_WIDTH = 64;  // Default CHIP-8 pixel width
export const PIXEL_HEIGHT = 32; // Default CHIP-8 pixel height

// Standard canvas and context setup steps
const canvas = document.getElementById("screen") as HTMLCanvasElement | null;

if (!canvas) {
  throw new Error("Canvas element not found!");
}

export const CONTEXT = canvas.getContext("2d") as CanvasRenderingContext2D | null;

if (!CONTEXT) {
    throw new Error("Context not found!");
}

// Canvas resolution (logical pixels)
canvas.width = PIXEL_WIDTH;
canvas.height = PIXEL_HEIGHT;

canvas.style.imageRendering = "pixelated";  // Ensures crisp pixels in modern browsers
CONTEXT.imageSmoothingEnabled = false;  // Disable anti-aliasing

// Fills the canvas with the color black
CONTEXT.fillStyle = OFF_COLOR;
CONTEXT.fillRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);