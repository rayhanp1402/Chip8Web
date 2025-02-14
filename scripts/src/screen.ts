const offColor = "#000000";
const onColor = "#00FF33";
const pixelWidth = 64;  // Default CHIP-8 pixel width
const pixelHeight = 32; // Default CHIP-8 pixel height

// Standard canvas and context setup steps
const canvas = document.getElementById("screen") as HTMLCanvasElement | null;

if (!canvas) {
  throw new Error("Canvas element not found!");
}

const context = canvas.getContext("2d") as CanvasRenderingContext2D | null;

if (!context) {
    throw new Error("Context not found!");
}

// Canvas resolution (logical pixels)
canvas.width = pixelWidth;
canvas.height = pixelHeight;

// Scale the canvas using CSS to upscale it while maintaining the pixel grid
const scale = 12;
canvas.style.width = `${pixelWidth * scale}px`;
canvas.style.height = `${pixelHeight * scale}px`;

canvas.style.imageRendering = "pixelated";  // Ensures crisp pixels in modern browsers
context.imageSmoothingEnabled = false;  // Disable anti-aliasing

// Fills the canvas with the color black
context.fillStyle = offColor;
context.fillRect(0, 0, pixelWidth, pixelHeight);