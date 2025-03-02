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
    private maxFrequency = 1000;    // Hz
    private minFrequency = 1;   // Hz
    private maxIncrement = 500;
    private minIncrement = 1;

    private chip8: CHIP8;
    private disassembler: Disassembler;
    private utilityTerminal: UtilityTerminal;

    constructor(rom: Uint8Array, fileName: string) {
        this.utilityTerminal = new UtilityTerminal();
        this.chip8 = new CHIP8(this.utilityTerminal, rom.byteLength);
        this.chip8.loadROM(new Uint8Array(rom));        
        this.disassembler = new Disassembler(this.chip8, rom.byteLength, this.utilityTerminal);

        romIndicatorLight.style.backgroundColor = '#00FF33';
        romStatusText.innerText = `Loaded '${fileName}' ROM`;

        // Subscribe utility terminal to listen to the inputted changes by the user (cycle changes)
        this.subscribeToUtilityTerminal();
        

        cycleUpButton.addEventListener("click", (e) => this.changeCycleFrequency(this.cycleFrequency + this.cycleIncrement));
        cycleDownButton.addEventListener("click", (e) => this.changeCycleFrequency(this.cycleFrequency - this.cycleIncrement));
        
        playButton.addEventListener("click", (e) => this.chip8.run(1000 / this.cycleFrequency));
        stopButton.addEventListener("click", (e) => this.chip8.stop());
    }

    public reset(rom: Uint8Array, fileName: string) {
        this.chip8.reset(rom.byteLength);
        this.chip8.loadROM(new Uint8Array(rom));

        this.disassembler.reset(rom.byteLength);

        romStatusText.innerText = `Loaded '${fileName}' ROM`;
    }

    public getUtilityTerminal() {
        return this.utilityTerminal;
    }

    private changeCycleIncrement = (value: number) => {
        this.cycleIncrement = value;
    
        if (this.cycleIncrement <= this.minIncrement) {
            this.cycleIncrement = this.minIncrement;
        } else if (this.cycleIncrement >= this.maxIncrement) {
            this.cycleIncrement = this.maxIncrement;
        }

        return this.cycleIncrement;
    }

    private changeCycleFrequency = (speed: number) => {   // speed argument is in Hz
        this.cycleFrequency = speed;

        if (this.cycleFrequency <= this.minFrequency) {
            this.cycleFrequency = this.minFrequency;
        } else if (this.cycleFrequency >= this.maxFrequency) {
            this.cycleFrequency = this.maxFrequency;
        }

        cycleValueText.innerText = `${this.cycleFrequency}`;
        this.chip8.changeSpeed(1000 / this.cycleFrequency);
        this.updateCycleButtonStates();

        return this.cycleFrequency;
    }

    private updateCycleButtonStates = () => {
        // This will disable or enable the memory up and memory down buttons
        // According to limit
        cycleUpButton.disabled = this.cycleFrequency >= this.maxFrequency;    // Upper limit 1000 Hz
        cycleDownButton.disabled = this.cycleFrequency <= this.minFrequency;     // Lower limit 1 Hz
    }

    private subscribeToUtilityTerminal = () => {
        this.utilityTerminal.listenToSetCycle(this.changeCycleFrequency);
        this.utilityTerminal.listenToSetCycleIncrement(this.changeCycleIncrement);
    }
}