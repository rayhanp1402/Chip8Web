import { OFF_COLOR, PIXEL_WIDTH, PIXEL_HEIGHT, CONTEXT, ON_COLOR } from "./screen.js";

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
    private keyMap = {
        "Digit1": 0x1, "Digit2": 0x2, "Digit3": 0x3, "Digit4": 0xC,
        "KeyQ": 0x4, "KeyW": 0x5, "KeyE": 0x6, "KeyR": 0xD,
        "KeyA": 0x7, "KeyS": 0x8, "KeyD": 0x9, "KeyF": 0xE,
        "KeyZ": 0xA, "KeyX": 0x0, "KeyC": 0xB, "KeyV": 0xF
    };

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

    // Display representation
    private display = Array.from({ length: 32 }, () => Array(64).fill(0));

    // ID for CPU cycle interval
    private runLoop: number | null = null;

    // Listeners to update of CHIP8 registers and memory
    private pcListeners: ((PC: number) => void)[] = [];
    private spListeners: ((SP: number) =>void)[] = [];
    private indexListeners: ((I: number) =>void)[] = [];
    private vListeners: ((V: Uint8Array) => void)[] = [];
    private stackListeners: ((stack: Uint16Array) => void)[] = [];
    private memoryListeners: ((memory: Uint8Array, updatedAtIndex: number) => void)[] = [];
    private pcAndMemoryListeners: ((PC: number, memory: Uint8Array) => void)[] = [];

    constructor() {
        this.assignToPC(0x200); // ROMs start at address 0x200

        // Fonts stored in addresses 0x050-0x0A0
        const fontsetSize = 80;
        const fontsetStartAddress = 0x50;

        // Loads the fonts into memory
        for (let i = 0; i < fontsetSize; ++i) {
            this.assignToMemory(fontsetStartAddress + i, this.fontset[i]);
        }
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

    public listenToMemory(listener: ((memory: Uint8Array, updatedAtIndex: number) => void)) {
        this.memoryListeners.push(listener);
    }

    public listenToPCAndMemory(listener: ((PC: number, memory: Uint8Array) => void)) {
        this.pcAndMemoryListeners.push(listener);
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
            listener(this.memory, index);
        }

        for (let listener of this.pcAndMemoryListeners) {
            listener(this.PC[0], this.memory);
        }
    }

    public getMemory() {
        return this.memory;
    }

    private addToPC(value: number) {
        this.PC[0] += value;
        this.notifyPCListeners();
    }

    private assignToPC(value: number) {
        this.PC[0] = value;
        this.notifyPCListeners();
    }

    private assignToIndex(value: number) {
        this.I[0] = value;
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
                        throw new Error("Opcode not implemented yet.");
                    default:
                        throw new Error("Opcode not implemented yet.");
                }
                break;
            case 0x01:
                this.jumpTo(this.NNN);
                break;
            case 0x02:
                throw new Error("Opcode not implemented yet.");
            case 0x03:
                throw new Error("Opcode not implemented yet.");
            case 0x04:
                throw new Error("Opcode not implemented yet.");
            case 0x05:
                throw new Error("Opcode not implemented yet.");
            case 0x06:
                this.loadRegister(this.X, this.NN);
                break;
            case 0x07:
                this.addRegister(this.X, this.NN);
                break;
            case 0x08:
                throw new Error("Opcode not implemented yet.");
            case 0x09:
                throw new Error("Opcode not implemented yet.");
            case 0x0A:
                this.loadIndex(this.NNN);
                break;
            case 0x0B:
                throw new Error("Opcode not implemented yet.");
            case 0x0C:
                throw new Error("Opcode not implemented yet.");
            case 0x0D:
                this.draw(this.X, this.Y, this.N);
                break;
            case 0x0E:
                throw new Error("Opcode not implemented yet.");
            case 0x0F:
                throw new Error("Opcode not implemented yet.");
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

        this.fetch();
        this.decode();
        this.execute();
    };

    public run(timeout: number = 2) { // Default 500Hz (2ms)
        this.stop(); // Ensure no duplicate intervals
        this.runLoop = setInterval(() => {
            this.cycle();
        }, timeout);
    }

    public stop() {
        if (this.runLoop) {
            clearInterval(this.runLoop);
            this.runLoop = null;  // Prevent accidental re-clearing
            console.log("Execution stopped.");
        }
    }

    public changeSpeed(newTimeout: number) {
        if (!this.runLoop) return;  // Do nothing if not running
    
        clearInterval(this.runLoop);  // Stop current interval
        this.runLoop = setInterval(() => {
            this.cycle();
        }, newTimeout);
    }

    private clearScreen() {
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
};
