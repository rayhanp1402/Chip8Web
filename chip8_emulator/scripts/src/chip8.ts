import { OFF_COLOR, PIXEL_WIDTH, PIXEL_HEIGHT, CONTEXT, ON_COLOR } from "./screen.js";
import { UtilityTerminal } from "./utility_terminal.js";
import { playAudio, stopAudio } from "./audio.js";

export class CHIP8 {
    // 16 8-bit Registers (V0 to VF)
    private V = new Uint8Array(16);
    
    // Program Counter
    private PC = new Uint16Array(1);
    
    // Index Register
    private I = new Uint16Array(1);

    // 16-level Stack
    private stack = new Uint16Array(16);
    
    // Stack Pointer
    private SP = new Uint8Array(1);
    
    // 4K bytes of memory
    private memory = new Uint8Array(4096);
    
    // Delay Timer
    private delay = new Uint8Array(1);
    
    // Sound Timer
    private sound = new Uint8Array(1);

    // Opcode
    private instruction = new Uint16Array(1);

    // Opcode separation based on pattern
    private firstNibble = new Uint8Array(1);    // First 4-bits (nibble)
    private X = new Uint8Array(1);              // Second nibble
    private Y = new Uint8Array(1);              // Third nibble
    private N = new Uint8Array(1);              // Fourth nibble
    private NN = new Uint8Array(1);             // Third and fourth nibbles
    private NNN = new Uint16Array(1);           // Second, third, and fourth nibbles

    // Keypads, using KeyboardEvent codes
    private keyMap: Record<string, number> = {
        "Digit1": 0x1, "Digit2": 0x2, "Digit3": 0x3, "Digit4": 0xC,
        "KeyQ": 0x4, "KeyW": 0x5, "KeyE": 0x6, "KeyR": 0xD,
        "KeyA": 0x7, "KeyS": 0x8, "KeyD": 0x9, "KeyF": 0xE,
        "KeyZ": 0xA, "KeyX": 0x0, "KeyC": 0xB, "KeyV": 0xF
    };

    private keys: boolean[] = new Array(16).fill(false);

    // Fonts
    private fontset = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    // Fonts stored in addresses 0x050-0x0A0
    private fontsetSize = 80;
    private fontsetStartAddress = 0x50;

    // Display representation
    private display = Array.from({ length: 32 }, () => Array(64).fill(0));

    // ID for CPU cycle interval
    private runLoop: number | null = null;

    // ID for Timers cycle interval
    private timerLoop: number | null = null;

    // Listeners to update of CHIP8 registers and memory
    private pcListeners: ((PC: number) => void)[] = [];
    private spListeners: ((SP: number) =>void)[] = [];
    private indexListeners: ((I: number) =>void)[] = [];
    private vListeners: ((V: Uint8Array) => void)[] = [];
    private stackListeners: ((stack: Uint16Array) => void)[] = [];
    private memoryListeners: ((updatedAtIndex: number) => void)[] = [];
    private pcAndMemoryListeners: ((PC: number, memory: Uint8Array) => void)[] = [];
    private delayListeners: ((delay: number) => void)[] = [];
    private soundListeners: ((sound: number) => void)[] = [];

    // Terminal feature
    private utilityTerminal: UtilityTerminal;

    private breakpoints: Set<Number> = new Set();
    private lastBreakpoint: number | null = null;

    // Last address of the ROM
    private romMaxAddress: number;

    constructor(utilityTerminal: UtilityTerminal, romSize: number) {
        this.romMaxAddress = (romSize === 0) ? 0x200 : 0x200 + (romSize - 1);
    
        // Assign a terminal
        this.utilityTerminal = utilityTerminal;

        this.assignToPC(0x200); // ROMs start at address 0x200

        // Loads the fonts into memory
        for (let i = 0; i < this.fontsetSize; ++i) {
            this.assignToMemory(this.fontsetStartAddress + i, this.fontset[i]);
        }

        // Detects user pressed keys
        document.addEventListener("keydown", (event) => {
            const key = this.keyMap[event.code];
            if (key !== undefined) {
                this.keys[key] = true;
            }
        });
        
        document.addEventListener("keyup", (event) => {
            const key = this.keyMap[event.code];
            if (key !== undefined) {
                this.keys[key] = false;
            }
        });

        // The same as above, this time with the clicked buttons on the screen
        document.querySelectorAll(".key").forEach((button) => {
            button.addEventListener("mousedown", () => {
                const keyHex = button.id.replace("key_", ""); // Extract the key identifier
                const keyValue = parseInt(keyHex, 16); // Convert it to a hex number (0-15)

                if (!isNaN(keyValue)) {
                    this.keys[keyValue] = true;
                }
            });

            button.addEventListener("mouseup", () => {
                const keyHex = button.id.replace("key_", "");
                const keyValue = parseInt(keyHex, 16);

                if (!isNaN(keyValue)) {
                    this.keys[keyValue] = false;
                }
            });
        });

        // Subscribe utility terminal to listen to the inputted changes by the user (breakpoints)
        this.subscribeToUtilityTerminal();
    };

    public listenToPC(listener: (PC: number) => void) {
        this.pcListeners.push(listener);
    }

    public listenToSP(listener: (SP: number) => void) {
        this.spListeners.push(listener);
    }

    public listenToIndex(listener: (I: number) => void) {
        this.indexListeners.push(listener);
    }

    public listenToV(listener: ((V: Uint8Array) => void)) {
        this.vListeners.push(listener);
    }

    public listenToStack(listener: ((Stack: Uint16Array) => void)) {
        this.stackListeners.push(listener);
    }

    public listenToMemory(listener: ((updatedAtIndex: number) => void)) {
        this.memoryListeners.push(listener);
    }

    public listenToPCAndMemory(listener: ((PC: number, memory: Uint8Array) => void)) {
        this.pcAndMemoryListeners.push(listener);
    }

    public listenToDelay(listener: ((delay: number) => void)) {
        this.delayListeners.push(listener);
    }

    public listenToSound(listener: ((sound: number) => void)) {
        this.soundListeners.push(listener);
    }

    private notifyPCListeners() {
        for (let listener of this.pcListeners) {
            listener(this.PC[0]);
        }

        for (let listener of this.pcAndMemoryListeners) {
            listener(this.PC[0], this.memory);
        }
    }

    private notifySPListeners() {
        for (let listener of this.spListeners) {
            listener(this.PC[0]);
        }
    }

    private notifyIndexListeners() {
        for (let listener of this.indexListeners) {
            listener(this.PC[0]);
        }
    }

    private notifyVListeners() {
        for (let listener of this.vListeners) {
            listener(this.V);
        }
    }

    private notifyStackListeners() {
        for (let listener of this.stackListeners) {
            listener(this.stack);
        }
    }

    private notifyMemoryListeners(index: number) {
        for (let listener of this.memoryListeners) {
            listener(index);
        }

        for (let listener of this.pcAndMemoryListeners) {
            listener(this.PC[0], this.memory);
        }
    }

    private notifyDelayListeners() {
        for (let listener of this.delayListeners) {
            listener(this.delay[0]);
        }
    }

    private notifySoundListeners() {
        for (let listener of this.soundListeners) {
            listener(this.sound[0]);
        }
    }

    private subscribeToUtilityTerminal = () => {
        this.utilityTerminal.listenToSetBreakpoint(this.setBreakpoint);
        this.utilityTerminal.listenToRemoveBreakpoint(this.removeBreakpoint);
        this.utilityTerminal.listenToClearBreakpoint(this.clearBreakpoint);
        this.utilityTerminal.listenToShowBreakpoint(this.showBreakpoint);
        this.utilityTerminal.listenToStep(this.step);
    }

    private showBreakpoint = () => {
        return this.breakpoints;
    }

    private setBreakpoint = (address: number) => {
        if (address > this.romMaxAddress) {
            return `Breakpoint not set. Address 0x${address.toString(16)} is larger than the ROM's last address 0x${this.romMaxAddress.toString(16)}.`
        } else if (address < 0x200) {
            return `Breakpoint not set. Address 0x${address.toString(16)} is smaller than the ROM's first address 0x200.`
        } else {
            this.breakpoints.add(address - (address % 2));
            return `Breakpoint set to address 0x${(address - (address % 2)).toString(16)}`;
        }
    }

    private removeBreakpoint = (address: number) => {
        if (address > this.romMaxAddress) {
            return `Breakpoint not set. Address 0x${address.toString(16)} is larger than the ROM's last address 0x${this.romMaxAddress.toString(16)}.`
        } else if (address < 0x200) {
            return `Breakpoint not set. Address 0x${address.toString(16)} is smaller than the ROM's first address 0x200.`
        } else if (this.breakpoints.has(address - (address % 2))) {
            this.breakpoints.delete(address - (address % 2));
            return `Breakpoint removed at address 0x${(address - (address % 2)).toString(16)}.`;
        } else {
            return `Breakpoint not found.`;
        }
    }

    private clearBreakpoint = () => {
        this.breakpoints.clear();
        return `Breakpoints have been cleared.`
    }

    public getMemory() {
        return this.memory;
    }

    public getPC() {
        return this.PC[0];
    }

    private addToPC(value: number) {
        this.PC[0] += value;
        this.notifyPCListeners();
    }

    private assignToPC(value: number) {
        this.PC[0] = value;
        this.notifyPCListeners();
    }

    private addToSP(value: number) {
        this.SP[0] += value;
        this.notifySPListeners();
    }

    private assignToSP(value: number) {
        this.SP[0] = value;
        this.notifySPListeners();
    }

    private assignToIndex(value: number) {
        this.I[0] = value;
        this.notifyIndexListeners();
    }

    private addToIndex(value: number) {
        this.I[0] += value;
        this.notifyIndexListeners();
    }

    private assignToV(order: number, value: number) {
        // Order means the V registers index/number (0-F or 0-15)
        this.V[order] = value;
        this.notifyVListeners();
    }

    private addToV(order: number, value: number) {
        // Order means the V registers index/number (0-F or 0-15)
        this.V[order] += value;
        this.notifyVListeners();
    }

    private assignToMemory(index: number, value: number) {
        this.memory[index] = value;
        this.notifyMemoryListeners(index);
    }

    private assignToStack(index: number, value: number) {
        this.stack[index] = value;
        this.notifyStackListeners();
    }

    private assignToDelay(value: number) {
        this.delay[0] = value;
        this.notifyDelayListeners();
    }

    private addToDelay(value: number) {
        this.delay[0] += value;
        this.notifyDelayListeners();
    }

    private addToSound(value: number) {
        this.sound[0] += value;
        this.notifySoundListeners();
    }

    private assignToSound(value: number) {
        this.sound[0] = value;
        this.notifySoundListeners();
    }

    public loadROM(romData: Uint8Array) {
        this.assignToPC(0x200); // Resets the PC

        if (romData.length > (4096 - 0x200)) {
            throw new Error("ROM is too large to fit in memory!");
        }

        // Loads ROM bytes into memory
        for (let i = 0; i < romData.length; i++) {
            this.assignToMemory(0x200 + i, romData[i]);
        }
    };

    private fetch() {
        // Gets two successive bytes in memory and concatenates them into a 2-bytes instruction
        this.instruction[0] = (this.memory[this.PC[0]] << 8) | (this.memory[this.PC[0] + 1]);

        this.addToPC(2);
    };

    private decode() {
        // Classify/separate the bits in the instruction
        this.firstNibble[0] = (this.instruction[0] & 0xF000) >> 12;
        this.X[0] = (this.instruction[0] & 0x0F00) >> 8;
        this.Y[0] = (this.instruction[0] & 0x00F0) >> 4;
        this.N[0] = (this.instruction[0] & 0x000F);
        this.NN[0] = (this.instruction[0] & 0x00FF);
        this.NNN[0] = (this.instruction[0] & 0x0FFF);
    };

    private execute() {
        switch(this.firstNibble[0]) {
            case 0x00:
                switch(this.NNN[0]) {
                    case 0x0E0:
                        this.clearScreen();
                        break;
                    case 0x0EE:
                        this.addToSP(-1);
                        this.assignToPC(this.stack[this.SP[0]]);
                        break;
                    default:
                        throw new Error(`Opcode 0x${this.instruction[0].toString(16).padStart(4, "0")} not implemented.`);
                }
                break;
            case 0x01:
                this.jumpTo(this.NNN);
                break;
            case 0x02:
                this.assignToStack(this.SP[0], this.PC[0]);
                this.addToSP(1);
                this.assignToPC(this.NNN[0]);
                break;
            case 0x03:
                if (this.V[this.X[0]] === this.NN[0]) this.addToPC(2);
                break;
            case 0x04:
                if (this.V[this.X[0]] !== this.NN[0]) this.addToPC(2);
                break;
            case 0x05:
                if (this.V[this.X[0]] === this.V[this.Y[0]]) this.addToPC(2);
                break;
            case 0x06:
                this.loadRegister(this.X, this.NN);
                break;
            case 0x07:
                this.addRegister(this.X, this.NN);
                break;
            case 0x08:
                switch(this.N[0]) {
                    case 0x0:
                        this.assignToV(this.X[0], this.V[this.Y[0]]);
                        break;
                    case 0x1:
                        const vxOrvy = this.V[this.X[0]] | this.V[this.Y[0]];
                        this.assignToV(this.X[0], vxOrvy);
                        break;
                    case 0x2:
                        const vxAndvy = this.V[this.X[0]] & this.V[this.Y[0]];
                        this.assignToV(this.X[0], vxAndvy);
                        break;
                    case 0x3:
                        const vxXorvy = this.V[this.X[0]] ^ this.V[this.Y[0]];
                        this.assignToV(this.X[0], vxXorvy);
                        break;
                    case 0x4:
                        const vxAddvy = this.V[this.X[0]] + this.V[this.Y[0]];
                        this.assignToV(this.X[0], vxAddvy);

                        if (vxAddvy > 0xFF) {   // Greater than 8 bits (> 255 in base-10)
                            this.assignToV(0xF, 1);
                        } else {
                            this.assignToV(0xF, 0);
                        }

                        break;
                    case 0x5:
                        const vxSubvy = this.V[this.X[0]] - this.V[this.Y[0]];
                        const vx_5 = this.V[this.X[0]];
                        const vy_5 = this.V[this.Y[0]];
                        this.assignToV(this.X[0], vxSubvy);
                        
                        if (vx_5 >= vy_5) {
                            this.assignToV(0xF, 1);
                        } else {
                            this.assignToV(0xF, 0);
                        }

                        break;
                    case 0x6:
                        this.assignToV(0xF, this.V[this.X[0]] & 0x1);  // Put the LSB of Vx in the flag register
                        this.assignToV(this.X[0], this.V[this.X[0]] >> 1);
                        break;
                    case 0x7:
                        const vySubvx = this.V[this.Y[0]] - this.V[this.X[0]];
                        const vx_7 = this.V[this.X[0]];
                        const vy_7 = this.V[this.Y[0]];
                        this.assignToV(this.X[0], vySubvx);

                        if (vy_7 >= vx_7) {
                            this.assignToV(0xF, 1);
                        } else {
                            this.assignToV(0xF, 0);
                        }

                        break;
                    case 0xE:
                        this.assignToV(0xF, (this.V[this.X[0]] & 0x80) >> 7);  // Put the MSB of Vx in the flag register
                        this.assignToV(this.X[0], this.V[this.X[0]] << 1);
                        break;
                }
                break;
            case 0x09:
                if (this.V[this.X[0]] !== this.V[this.Y[0]]) this.addToPC(2);
                break;
            case 0x0A:
                this.loadIndex(this.NNN);
                break;
            case 0x0B:
                this.assignToPC(this.NNN[0] + this.V[0x0]);
                break;
            case 0x0C:
                const randomNumber = this.randomIntFromInterval(0, 255);
                this.assignToV(this.X[0], randomNumber & this.NN[0]);
                break;
            case 0x0D:
                this.draw(this.X, this.Y, this.N);
                break;
            case 0x0E:
                switch(this.NN[0]) {
                    case 0x9E:
                        if (this.keys[this.V[this.X[0]]]) this.addToPC(2);
                        break;
                    case 0xA1:
                        if (!this.keys[this.V[this.X[0]]]) this.addToPC(2);
                        break;
                }
                break;
            case 0x0F:
                switch(this.NN[0]) {
                    case 0x07:
                        this.assignToV(this.X[0], this.delay[0]);
                        break;
                    case 0x0A:
                        this.waitForKeyPress(this.X[0]);
                        break;
                    case 0x15:
                        this.assignToDelay(this.V[this.X[0]]);
                        break;
                    case 0x18:
                        this.assignToSound(this.V[this.X[0]]);
                        break;
                    case 0x1E:
                        this.addToIndex(this.V[this.X[0]]);
                        break;
                    case 0x29:
                        // Index is set to the location of sprite for digit Vx
                        this.assignToIndex(this.fontsetStartAddress + (5 * this.V[this.X[0]]));
                        break;
                    case 0x33:
                        // takes the decimal value of Vx, and places the hundreds digit in memory at location in I,
                        // the tens digit at location I+1, and the ones digit at location I+2.
                        let decimalValue = this.V[this.X[0]];

                        this.assignToMemory(this.I[0], Math.floor(decimalValue / 100));             // Hundreds-place
                        this.assignToMemory(this.I[0] + 1, Math.floor((decimalValue / 10) % 10));   // Tens-place
                        this.assignToMemory(this.I[0] + 2, decimalValue % 10);                      // Ones-place
                        break;
                    case 0x55:
                        for (let i = 0; i <= this.X[0]; ++i) {
                            this.assignToMemory(this.I[0] + i, this.V[i]);
                        }
                        break;
                    case 0x65:
                        for (let i = 0; i <= this.X[0]; ++i) {
                            this.assignToV(i, this.memory[this.I[0] + i]);
                        }
                        break;
                }
                break;
            default:
                throw new Error("Opcode not found!");
        };
    };

    private cycle() {
        if (this.PC[0] > 0xFFF) { 
            console.error("Program counter exceeded memory! Halting execution.");
            this.stop();
            return;
        }
    
        if (this.breakpoints.has(this.PC[0])) {  
            if (this.lastBreakpoint !== this.PC[0]) {
                console.log(`Breakpoint hit at 0x${this.PC[0].toString(16)}. Execution paused.`);
                this.lastBreakpoint = this.PC[0];
                this.stop();
                return;
            }
        } else {
            this.lastBreakpoint = null; // Reset if PC moved past a breakpoint
        }
    
        this.fetch();
        this.decode();
        this.execute();
    }

    public run(timeout: number = 2) { // Default 500Hz (2ms)
        this.stop(); // Ensure no duplicate intervals
        this.runLoop = window.setInterval(() => {
            this.cycle();
        }, timeout);

        // Fixed 60Hz timer loop for delay and sound timers
        this.timerLoop = window.setInterval(() => {
            this.updateTimers();
        }, 1000 / 60);
    }

    public stop() {
        if (this.runLoop) {
            clearInterval(this.runLoop);
            this.runLoop = null;  // Prevent accidental re-clearing
            console.log("Execution stopped.");
        }

        if (this.timerLoop) {
            clearInterval(this.timerLoop);
            this.timerLoop = null;
        }
    }

    public changeSpeed(newTimeout: number) {
        if (!this.runLoop) return;  // Do nothing if not running
    
        clearInterval(this.runLoop);  // Stop current interval
        this.runLoop = window.setInterval(() => {
            this.cycle();
        }, newTimeout);
    }

    public step = (): number => {
        if (this.runLoop) return -1; // Prevent stepping while running
        
        this.cycle(); // Execute a single instruction

        return this.PC[0];
    }

    private updateTimers() {
        if (this.delay[0] > 0) {
            this.addToDelay(-1);
        }
    
        if (this.sound[0] > 0) {
            this.addToSound(-1);
            if (this.sound[0] === 0) {
                stopAudio();
            } else {
                playAudio();
            }
        }
    }

    public reset(romSize: number) {
        // This will reset all states of the CHIP-8
        this.stop();

        this.romMaxAddress = (romSize === 0) ? 0x200 : 0x200 + (romSize - 1);

        this.breakpoints.clear();
        this.lastBreakpoint = null;
        this.assignToPC(0x200);
        this.assignToIndex(0);
        this.assignToSP(0);
        this.instruction[0] = 0;
        this.firstNibble[0] = 0;
        this.X[0] = 0;
        this.Y[0] = 0;
        this.N[0] = 0;
        this.NN[0] = 0;
        this.NNN[0] = 0;
        
        for (let i = 0; i < 16; ++i) {
            this.assignToV(i, 0);
            this.assignToStack(i, 0);
        }

        for (let i = 0; i < 4096; ++i) {
            this.assignToMemory(i, 0);
        }

        // Loads the fonts into memory
        for (let i = 0; i < this.fontsetSize; ++i) {
            this.assignToMemory(this.fontsetStartAddress + i, this.fontset[i]);
        }

        this.clearScreen();

        this.keys.fill(false);

        this.assignToDelay(0);
        this.assignToSound(0);
    }

    private clearScreen() {
        this.display = Array.from({ length: 32 }, () => Array(64).fill(0));

        if (!CONTEXT) {
            throw new Error("Context not found!");
        }

        CONTEXT.fillStyle = OFF_COLOR;
        CONTEXT.fillRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);
    };

    private jumpTo(address: Uint16Array) {
        this.assignToPC(address[0]);
    };

    private loadRegister(registerOrder: Uint8Array, value: Uint8Array) {
        // Loads 1-byte value to register Vx, where x is the register's order (0-F)
        this.assignToV(registerOrder[0], value[0]);
    };

    private addRegister(registerOrder: Uint8Array, value: Uint8Array) {
        // Adds 1-byte value to register Vx, where x is the register's order (0-F)
        this.addToV(registerOrder[0], value[0]);
    };

    private loadIndex(address: Uint16Array) {
        this.assignToIndex(address[0]);
    };

    private draw(xAxisRegister: Uint8Array, yAxisRegister: Uint8Array, height: Uint8Array) {
        // Get X and Y coordinates from registers VX and VY respectively. Modulus to wrap them within screen bounds.
        const xAxis = this.V[xAxisRegister[0]] % PIXEL_WIDTH;
        const yAxis = this.V[yAxisRegister[0]] % PIXEL_HEIGHT;

        // Reset collision flag (V[0xF] is used to indicate collision)
        // Collision is when a sprite is drawn into an 'active/on' display, which 'deactivate' the display
        this.assignToV(0xF, 0);

        let spriteByte = new Uint8Array(1);
        let spritePixel = new Uint8Array(1); // Sprite bit that will be extracted from spriteByte

        if (!CONTEXT) {
            throw new Error("Context not found!");
        }

        // Loop through each row of the sprite bytes in memory
        for (let row = 0; row < height[0]; ++row) {
            spriteByte[0] = this.memory[this.I[0] + row];
            
            // Loop through each bit (column) in the 8-bit wide sprite row
            for (let col = 0; col < 8; ++col) {
                spritePixel[0] = spriteByte[0] & (0x80 >> col);

                if (spritePixel[0]) {
                    // Again, modulus used to wrap within screen bounds
                    const x = (xAxis + col) % PIXEL_WIDTH;
                    const y = (yAxis + row) % PIXEL_HEIGHT;

                    if (this.display[y][x] === 1) { // Collision found
                        this.assignToV(0xF, 1);
                    }

                    this.display[y][x] ^= 1;

                    // Update the canvas accordingly
                    CONTEXT.fillStyle = this.display[y][x] ? ON_COLOR : OFF_COLOR;
                    CONTEXT.fillRect(x, y, 1, 1);
                }
            };
        };
    };

    private waitForKeyPress(registerOrder: number) {
        // Note that the timers are still decremented
        for (let i = 0; i < this.keys.length; ++i) {
            if (this.keys[i]) {
                this.assignToV(registerOrder, i);
                return;
            }
        }
        this.addToPC(-2);
    }

    private randomIntFromInterval(min: number, max: number) { // Inclusive 
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
};
