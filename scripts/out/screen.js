"use strict";
// Standard canvas and context setup steps
const canvas = document.getElementById("screen");
if (!canvas) {
    throw new Error("Canvas element not found!");
}
const context = canvas.getContext("2d");
if (!context) {
    throw new Error("Context not found!");
}
// Canvas resolution (logical pixels)
const pixelWidth = 64;
const pixelHeight = 32;
canvas.width = pixelWidth;
canvas.height = pixelHeight;
// Scale the canvas using CSS to upscale it while maintaining the pixel grid
const scale = 12;
canvas.style.width = `${pixelWidth * scale}px`;
canvas.style.height = `${pixelHeight * scale}px`;
canvas.style.imageRendering = "pixelated"; // Ensures crisp pixels in modern browsers
context.imageSmoothingEnabled = false; // Disable anti-aliasing
// Fills the canvas with the color black
context.fillStyle = "#000000";
context.fillRect(0, 0, pixelWidth, pixelHeight);
