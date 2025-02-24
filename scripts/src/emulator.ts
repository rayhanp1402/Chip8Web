import { CHIP8 } from "./chip8.js";
import { Disassembler } from "./disassembler.js";

const romIndicatorLight = document.getElementById("rom-indicator") as HTMLElement;
const romStatusText = document.getElementById("rom-status-text") as HTMLElement;

const playButton = document.getElementById("play-button") as HTMLButtonElement;
const stopButton = document.getElementById("stop-button") as HTMLButtonElement;

const cycleUpButton = document.getElementById("cycle-up-button") as HTMLButtonElement;
const cycleDownButton = document.getElementById("cycle-down-button") as HTMLButtonElement;
const cycleValueText = document.getElementById("cycle-value-text") as HTMLElement;

let cycleFrequency = 500; // Hz

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

        cycleUpButton.addEventListener("click", (e) => {
            cycleFrequency += 10;
            cycleValueText.innerText = `${cycleFrequency}`;
            chip8.changeSpeed(1000 / cycleFrequency);
        });

        cycleDownButton.addEventListener("click", (e) => {
            cycleFrequency -= 10;
            cycleValueText.innerText = `${cycleFrequency}`;
            chip8.changeSpeed(1000 / cycleFrequency);
        });
        
        playButton.addEventListener("click", (e) => chip8.run(1000 / cycleFrequency));
        stopButton.addEventListener("click", (e) => chip8.stop());
    })  
    .catch(error => {
        console.error("Error loading ROM:", error)
    });