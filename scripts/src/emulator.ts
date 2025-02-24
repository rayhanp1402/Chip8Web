import { CHIP8 } from "./chip8.js";
import { Disassembler } from "./disassembler.js";

const romIndicatorLight = document.getElementById("rom-indicator") as HTMLElement;
const romStatusText = document.getElementById("rom-status-text") as HTMLElement;

fetch("signed_url")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ROM: ${response.status} ${response.statusText}`);
        }
        return response.arrayBuffer();
    })
    .then(buffer => {
        const chip8 = new CHIP8();
        chip8.loadROM(new Uint8Array(buffer));
        
        romIndicatorLight.style.backgroundColor = '#00FF33';
        romStatusText.innerText = `Loaded 'IBM Logo.ch8' ROM`;

        const disassembler = new Disassembler(chip8);
        chip8.run();
    })  
    .catch(error => {
        console.error("Error loading ROM:", error)
    });