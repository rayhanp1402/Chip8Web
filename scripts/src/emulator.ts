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

fetch("https://chip8-roms.s3.ap-southeast-2.amazonaws.com/IBM%20Logo.ch8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4SYAMDUSJQCYOHS7%2F20250225%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250225T153333Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=400e51f9df87bcaa5c68f3d262949471b98fd6dce036cd753ffcd683b7c58f82")
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

        const disassembler = new Disassembler(chip8, buffer.byteLength);

        cycleUpButton.addEventListener("click", (e) => {
            cycleFrequency += 10;
            if (cycleFrequency >= 1000) {
                cycleFrequency = 1000;
            }

            cycleValueText.innerText = `${cycleFrequency}`;
            chip8.changeSpeed(1000 / cycleFrequency);
            updateCycleButtonStates();
            });

            cycleDownButton.addEventListener("click", (e) => {
                cycleFrequency -= 10;
                if (cycleFrequency <= 0) {
                    cycleFrequency = 1;
                }

                cycleValueText.innerText = `${cycleFrequency}`;
                chip8.changeSpeed(1000 / cycleFrequency);
                updateCycleButtonStates();
            });
            
            playButton.addEventListener("click", (e) => chip8.run(1000 / cycleFrequency));
            stopButton.addEventListener("click", (e) => chip8.stop());
        })  
        .catch(error => {
            console.error("Error loading ROM:", error)
        });

    function updateCycleButtonStates() {
        // This will disable or enable the memory up and memory down buttons
        // According to limit
        cycleUpButton.disabled = cycleFrequency >= 1000;    // Upper limit 1000 Hz
        cycleDownButton.disabled = cycleFrequency <= 1;     // Lower limit 1 Hz
    }