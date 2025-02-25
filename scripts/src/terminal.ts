import { Terminal } from "xterm";
import "xterm/css/xterm.css";

// Function to initialize xterm.js
function initTerminal(): void {
    const terminalElement = document.getElementById("xterm-container");

    if (!terminalElement) {
        console.error("Terminal container not found!");
        return;
    }

    // Create xterm instance
    const term = new Terminal({
        cursorBlink: true,
        theme: {
            background: "#1e1e1e",
            foreground: "#ffffff",
        },
    });

    // Attach terminal to the container
    term.open(terminalElement);

    // Print a welcome message
    term.writeln("Welcome to CHIP-8 Emulator!");

    // Handle user input (echo input)
    term.onData((data: string) => {
        if (data.charCodeAt(0) === 13) { // Enter key
            term.writeln("");
        } else {
            term.write(data);
        }
    });

    // Resize terminal when accordion is toggled
    const accordionButton = document.querySelector('[data-bs-toggle="collapse"]');
    if (accordionButton) {
        accordionButton.addEventListener("click", () => {
            setTimeout(() => term.resize(term.cols, term.rows), 300);
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", initTerminal);
