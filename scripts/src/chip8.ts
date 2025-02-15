import { OFF_COLOR, PIXEL_WIDTH, PIXEL_HEIGHT, CONTEXT } from "./screen";

class CHIP8 {
    // 16 8-bit Registers (V0 to VF)
    V = new Uint8Array(16);
    
    // Program Counter
    PC = new Uint16Array(1);
    
    // Index Register
    I = new Uint16Array(1);

    // 16-level Stack
    stack = new Uint16Array(16);
    
    // Stack Pointer
    SP = new Uint8Array(1);
    
    // 4K bytes of memory
    memory = new Uint8Array(4096);
    
    // Delay Timer
    delay = new Uint8Array(1);
    
    // Sound Timer
    sound = new Uint8Array(1);

    // Opcode
    instruction = new Uint16Array(1);

    // Opcode separation based on pattern
    firstNibble = new Uint8Array(1);    // First 4-bits (nibble)
    X = new Uint8Array(1);              // Second nibble
    Y = new Uint8Array(1);              // Third nibble
    N = new Uint8Array(1);              // Fourth nibble
    NN = new Uint8Array(1);             // Third and fourth nibbles
    NNN = new Uint16Array(1);           // Second, third, and fourth nibbles

    // Keypads, using KeyboardEvent codes
    keyMap = {
        "Digit1": 0x1, "Digit2": 0x2, "Digit3": 0x3, "Digit4": 0xC,
        "KeyQ": 0x4, "KeyW": 0x5, "KeyE": 0x6, "KeyR": 0xD,
        "KeyA": 0x7, "KeyS": 0x8, "KeyD": 0x9, "KeyF": 0xE,
        "KeyZ": 0xA, "KeyX": 0x0, "KeyC": 0xB, "KeyV": 0xF
    };

    // Fonts
    fontset = [
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

    constructor() {
        this.PC[0] = 0x200; // ROMs start at address 0x200

        // Fonts stored in addresses 0x050-0x0A0
        const fontsetSize = 80;
        const fontsetStartAddress = 0x50;

        // Loads the fonts into memory
        for (let i = 0; i < fontsetSize; ++i) {
            this.memory[fontsetStartAddress + i] = this.fontset[i];
        }
    };

    loadROM(romData: Uint8Array) {
        this.PC[0] = 0x200; // Resets the PC

        if (romData.length > (4096 - 0x200)) {
            throw new Error("ROM is too large to fit in memory!");
        }

        // Loads ROM bytes into memory
        for (let i = 0; i < romData.length; i++) {
            this.memory[0x200 + i] = romData[i];
        }
    };

    fetch() {
        // Gets two successive bytes in memory and concatenates them into a 2-bytes instruction
        this.instruction[0] = (this.memory[this.PC[0]] << 8) | (this.memory[this.PC[0] + 1]);

        this.PC[0] += 2;
    };

    decode() {
        // Classify/separate the bits in the instruction
        this.firstNibble[0] = (this.instruction[0] & 0xF000) >> 12;
        this.X[0] = (this.instruction[0] & 0x0F00) >> 8;
        this.Y[0] = (this.instruction[0] & 0x00F0) >> 4;
        this.N[0] = (this.instruction[0] & 0x00F0);
        this.NN[0] = (this.instruction[0] & 0x00FF);
        this.NNN[0] = (this.instruction[0] & 0x0FFF);
    };

    execute() {
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
            case 0x01:
                this.jumpTo(this.NNN);
                break;
            case 0x02:
                throw new Error("Opcode not implemented yet.")
            case 0x03:
                throw new Error("Opcode not implemented yet.")
            case 0x04:
                throw new Error("Opcode not implemented yet.")
            case 0x05:
                throw new Error("Opcode not implemented yet.")
            case 0x06:
                throw new Error("Opcode not implemented yet.")
            case 0x07:
                throw new Error("Opcode not implemented yet.")
            case 0x08:
                throw new Error("Opcode not implemented yet.")
            case 0x09:
                throw new Error("Opcode not implemented yet.")
            case 0x0A:
                throw new Error("Opcode not implemented yet.")
            case 0x0B:
                throw new Error("Opcode not implemented yet.")
            case 0x0C:
                throw new Error("Opcode not implemented yet.")
            case 0x0D:
                throw new Error("Opcode not implemented yet.")
            case 0x0E:
                throw new Error("Opcode not implemented yet.")
            case 0x0F:
                throw new Error("Opcode not implemented yet.")
            default:
                throw new Error("Opcode not found!");
        };
    };

    clearScreen() {
        if (!CONTEXT) {
            throw new Error("Context not found!");
        }

        CONTEXT.fillStyle = OFF_COLOR;
        CONTEXT.fillRect(0, 0, PIXEL_WIDTH, PIXEL_HEIGHT);
    };

    jumpTo(address: Uint16Array) {
        this.PC[0] = address[0];
    };
};
