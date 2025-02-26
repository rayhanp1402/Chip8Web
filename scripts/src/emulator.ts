import { CHIP8 } from "./chip8.js";
import { Disassembler } from "./disassembler.js";
import { UtilityTerminal } from "./utility_terminal.js";

const romIndicatorLight = document.getElementById("rom-indicator") as HTMLElement;
const romStatusText = document.getElementById("rom-status-text") as HTMLElement;

const playButton = document.getElementById("play-button") as HTMLButtonElement;
const stopButton = document.getElementById("stop-button") as HTMLButtonElement;

const cycleUpButton = document.getElementById("cycle-up-button") as HTMLButtonElement;
const cycleDownButton = document.getElementById("cycle-down-button") as HTMLButtonElement;
const cycleValueText = document.getElementById("cycle-value-text") as HTMLElement;

export class Emulator {
    private cycleFrequency = 500; // Hz
    private cycleIncrement = 10;
    private romName = 'IBM Logo.ch8'

    constructor(rom: Uint8Array) {
        const chip8 = new CHIP8();
        chip8.loadROM(new Uint8Array(rom));
        
        romIndicatorLight.style.backgroundColor = '#00FF33';
        romStatusText.innerText = `Loaded '${this.romName}' ROM`;

        const disassembler = new Disassembler(chip8, rom.byteLength);

        const utilityTerminal = new UtilityTerminal();

        cycleUpButton.addEventListener("click", (e) => {
            this.cycleFrequency += this.cycleIncrement;
            if (this.cycleFrequency >= 1000) {
                this.cycleFrequency = 1000;
            }

            cycleValueText.innerText = `${this.cycleFrequency}`;
            chip8.changeSpeed(1000 / this.cycleFrequency);
            this.updateCycleButtonStates();
            });

            cycleDownButton.addEventListener("click", (e) => {
                this.cycleFrequency -= this.cycleIncrement;
                if (this.cycleFrequency <= 0) {
                    this.cycleFrequency = 1;
                }

                cycleValueText.innerText = `${this.cycleFrequency}`;
                chip8.changeSpeed(1000 / this.cycleFrequency);
                this.updateCycleButtonStates();
            });
            
            playButton.addEventListener("click", (e) => chip8.run(1000 / this.cycleFrequency));
            stopButton.addEventListener("click", (e) => chip8.stop());
    }

    private updateCycleButtonStates() {
        // This will disable or enable the memory up and memory down buttons
        // According to limit
        cycleUpButton.disabled = this.cycleFrequency >= 1000;    // Upper limit 1000 Hz
        cycleDownButton.disabled = this.cycleFrequency <= 1;     // Lower limit 1 Hz
    }
}