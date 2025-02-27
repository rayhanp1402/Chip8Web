import { CHIP8 } from "./chip8";
import { UtilityTerminal } from "./utility_terminal";

const stackOutputContents = document.getElementById("stack-output-contents") as HTMLElement;
const memoryOutputContents = document.getElementById("memory-output-contents") as HTMLElement;

const memoryUpButton = document.getElementById("memory-up-button") as HTMLButtonElement;
const memoryDownButton = document.getElementById("memory-down-button") as HTMLButtonElement;

const pcContentView = document.getElementById("pc-content-view") as HTMLElement;
const spContentView = document.getElementById("sp-content-view") as HTMLElement;
const indexContentView = document.getElementById("index-content-view") as HTMLElement;

const vRegistersContentView = document.getElementsByClassName("v-registers") as HTMLCollectionOf<Element>;

const stackContentView = document.getElementsByClassName("stack-elements") as HTMLCollectionOf<Element>;

const instructionOutputContents = document.getElementById("instruction-output-contents") as HTMLElement;

const instructionUpButton = document.getElementById("instruction-up-button") as HTMLButtonElement;
const instructionDownButton = document.getElementById("instruction-down-button") as HTMLButtonElement;
const followPCButton = document.getElementById("follow-pc-button") as HTMLButtonElement;

export class Disassembler {
    private currentMemoryStartIndex = 0;
    private currentInstructionIndex = 0x200;
    private romMaxAddress: number;
    private isFollowingPC = true;

    private chip8: CHIP8;
    private utilityTerminal: UtilityTerminal;

    constructor(chip8: CHIP8, romSize: number, terminal: UtilityTerminal) {
        this.chip8 = chip8;
        this.utilityTerminal = terminal;

        // Memory view
        // Display initial memory contents (0x000 - 0x03F)
        this.displayMemoryContents(0);
    
        // Display memory dynamically using up and down button
        memoryUpButton.addEventListener("click", (e) => {
            if (this.currentMemoryStartIndex < 0xFFF - 0x040) {
                this.currentMemoryStartIndex += 0x040;
                this.displayMemoryContents(this.currentMemoryStartIndex);
            }
    
            this.updateMemoryButtonStates();
        });
    
        memoryDownButton.addEventListener("click", (e) => {
            if (this.currentMemoryStartIndex > 0x000) {
                this.currentMemoryStartIndex -= 0x040;
                this.displayMemoryContents(this.currentMemoryStartIndex);
            }
    
            this.updateMemoryButtonStates();
        });

        // The loaded ROM last address
        this.romMaxAddress = (romSize === 0) ? 0x200 : 0x200 + (romSize - 1);

        // Display initial ROM
        this.displayInstructionContents(
            this.currentInstructionIndex, 
            this.romMaxAddress,
            this.chip8.getMemory(),
            this.chip8.getPC()
        );

        // Display instructions dynamically using up and down button
        followPCButton.addEventListener("click", (e) => {
            // Don't get confused brother/sister, this just toggles between true or false
            this.isFollowingPC = !this.isFollowingPC;
            this.updateInstructionButtonStates();
        });

        instructionUpButton.addEventListener("click", (e) => {
            this.currentInstructionIndex += 2;
            this.updateInstructionButtonStates();
            this.displayInstructionContents(
                this.currentInstructionIndex, 
                this.romMaxAddress,
                this.chip8.getMemory(),
                this.chip8.getPC()
            );
        });

        instructionDownButton.addEventListener("click", (e) => {
            this.currentInstructionIndex -= 2;
            this.updateInstructionButtonStates();
            this.displayInstructionContents(
                this.currentInstructionIndex, 
                this.romMaxAddress,
                this.chip8.getMemory(),
                this.chip8.getPC()
            );
        });

        // Subscribe/listen to CHIP8 class object to dynamically change the disassembler contents
        this.subscribeToChip8();

        // Subscribe utility terminal to listen to the inputted changes by the user (gotos)
        this.subscribeToUtilityTerminal();
    }

    private subscribeToChip8 = () => {
        this.chip8.listenToPC(this.updatePCView);
        this.chip8.listenToSP(this.updateSPView);
        this.chip8.listenToIndex(this.updateIndexView);
        this.chip8.listenToV(this.updateVRegisterView);
        this.chip8.listenToStack(this.updateStackView);
        this.chip8.listenToMemory(this.updateMemoryView);
        this.chip8.listenToPCAndMemory(this.updateInstructionView);
    }

    private subscribeToUtilityTerminal = () => {
        this.utilityTerminal.listenToGotoMemory(this.goToMemoryView);
        this.utilityTerminal.listenToGotoInstruction(this.goToInstructionView);
    }

    private updatePCView = (PC: number) => {
        pcContentView.innerText = `PC: 0x${PC.toString(16).padStart(4, "0").toUpperCase()}`;
    }

    private updateSPView = (PC: number) => {
        spContentView.innerText = `SP: 0x${PC.toString(16).padStart(2, "0").toUpperCase()}`;
    }

    private updateIndexView = (PC: number) => {
        indexContentView.innerText = `Index: 0x${PC.toString(16).padStart(4, "0").toUpperCase()}`;
    }

    private updateVRegisterView = (V: Uint8Array) => {
        for (let i = 0; i < 16; ++i) {
            vRegistersContentView[i]
            .innerHTML = `V${i.toString(16).toUpperCase()}: 0x${V[i].toString(16).padStart(2, "0").toUpperCase()}`;
        }
    }

    private updateStackView = (stack: Uint16Array) => {
        for (let i = 0; i < 16; ++i) {
            stackContentView[i]
            .innerHTML = `${i}: 0x${stack[i].toString(16).padStart(4, "0").toUpperCase()}`;
        }
    }

    private updateMemoryView = (updatedAtIndex: number) => {
        // Only change the currently displayed memory contents in the memory view
        if (updatedAtIndex >= this.currentMemoryStartIndex && updatedAtIndex < this.currentMemoryStartIndex + 0x40) {
            this.displayMemoryContents(this.currentMemoryStartIndex);
        }
    }

    private updateInstructionView = (PC: number) => {
        if (this.isFollowingPC) this.currentInstructionIndex = PC;
        this.displayInstructionContents(this.currentInstructionIndex, this.romMaxAddress, this.chip8.getMemory(), PC);
    }

    private goToMemoryView = (address: number) => {
        let pointedAddress = address;
        if (address >= 0xFFF) {
            pointedAddress = 0xFFF;
            this.currentMemoryStartIndex = 0xFC0;
        } else if (address <= 0x0) {
            pointedAddress = 0x0;
            this.currentMemoryStartIndex = 0x0;
        } else {
            this.currentMemoryStartIndex = address - (address % 16);
        }

        this.displayMemoryContents(this.currentMemoryStartIndex);
        this.updateMemoryButtonStates();
        
        return pointedAddress;
    }

    private goToInstructionView = (address: number) => {
        if (address >= this.romMaxAddress) {
            this.currentInstructionIndex = this.romMaxAddress - (this.romMaxAddress % 2);
        } else if (address <= 0x200) {
            this.currentInstructionIndex = 0x200;
        } else {
            this.currentInstructionIndex = address - (address % 2);
        }

        this.isFollowingPC = false;
        this.updateInstructionButtonStates();
        this.displayInstructionContents(
            this.currentInstructionIndex, 
            this.romMaxAddress,
            this.chip8.getMemory(),
            this.chip8.getPC()
        );

        return this.currentInstructionIndex;
    }

    private displayMemoryContents = (startingIndex: number) => {
        memoryOutputContents.innerHTML = `
            <pre class="memory-address">Address</pre>
        `;
    
        const memoryViewTotalColumns = 17;
        const memoryViewRowLimit = 4;
        for (let i = 0; i < memoryViewTotalColumns - 1; ++i) {
            memoryOutputContents.innerHTML += `
                <pre class="memory-address">0x${i.toString(16).padStart(2, "0").toUpperCase()}</pre>
            `;
        }
    
        let msbByteIndex = startingIndex;  // Index of memory every 16-bit, so the first (msb) nibble and second nibble
        let memoryIndex = startingIndex; // Current pointed index of memory
        for (let i = 0; i < memoryViewTotalColumns * memoryViewRowLimit; ++i) {
            if (i % (memoryViewTotalColumns) === 0) {
                memoryOutputContents.innerHTML += `
                   <pre class="memory-address">${msbByteIndex.toString(16).padStart(3, "0").toUpperCase()}</pre>
                `;
                msbByteIndex += memoryViewTotalColumns - 1;
            } else {
                memoryOutputContents.innerHTML += `
                   <pre class="disassembler-content">${this.chip8.getMemory()[memoryIndex].toString(16).padStart(2, "0").toUpperCase()}</pre>
                `;
                ++memoryIndex;
            }
        }
    }
    
    private updateMemoryButtonStates = () => {
        // This will disable or enable the memory up and memory down buttons
        // According to limit
        memoryUpButton.disabled = this.currentMemoryStartIndex >= 0xFFF - 0x040;
        memoryDownButton.disabled = this.currentMemoryStartIndex <= 0x000;
    }

    private updateInstructionButtonStates = () => {
        // This will disable or enable the instruction up and instruction down buttons
        instructionUpButton.disabled = (this.currentInstructionIndex >= this.romMaxAddress - 1) || this.isFollowingPC;
        instructionDownButton.disabled = (this.currentInstructionIndex <= 0x200) || this.isFollowingPC;
        followPCButton.innerText = this.isFollowingPC ? `Following PC` : `Not Following PC`;
    }

    private displayInstructionContents = (
        startingIndex: number,
        maxIndex: number,
        memory: Uint8Array,
        PC: number
    ) => {
        instructionOutputContents.innerHTML = ``;

        const instructionViewSize = 5 * 2;  // Multiplied by 2 because one instruction is stored in consecutive address
        let lastIndex = (startingIndex < maxIndex - instructionViewSize) ? startingIndex + instructionViewSize : maxIndex;
        const instruction = new Uint16Array(1); // The will be retrieved instruction

        for (let i = startingIndex; i < lastIndex; i += 2) {
            // Again, i is incremented by 2 becauses one instruction is stored in consecutive address
            // Gets two successive bytes in memory and concatenates them into a 2-bytes instruction
            instruction[0] = (memory[i] << 8) | (memory[i + 1]);

            const instructionString = 
            `<pre class="disassembler-content">0x${i.toString(16).padStart(3, "0").toUpperCase()}: 0x${instruction[0].toString(16).padStart(4, "0").toUpperCase()} ${this.toAssemblySymbol(instruction[0])}</pre>`
            if (i === PC) {
                instructionOutputContents.innerHTML += `
                    <div class="current-instruction-output" id="current-instruction-output-contents">
                        ${instructionString}
                    </div>
                `;
            } else {
                instructionOutputContents.innerHTML += `
                    ${instructionString}
                `;
            }
        }
    }

    private toAssemblySymbol = (instruction: number) => {
        // Classify/separate the bits in the instruction
        const firstNibble = (instruction & 0xF000) >> 12;
        const X = (instruction & 0x0F00) >> 8;
        const Y = (instruction & 0x00F0) >> 4;
        const N = (instruction & 0x000F);
        const NN = (instruction & 0x00FF);
        const NNN = (instruction & 0x0FFF);

        switch(firstNibble) {
            case 0x00:
                switch(NNN) {
                    case 0x0E0:
                        return `CLS`;
                    case 0x0EE:
                        return `RET`
                    default:
                        return `SYS 0x${NNN.toString(16).padStart(3, "0").toUpperCase()}`;
                }
                break;
            case 0x01:
                return `JP 0x${NNN.toString(16).padStart(3, "0").toUpperCase()}`;
            case 0x02:
                return `CALL 0x${NNN.toString(16).padStart(3, "0").toUpperCase()}`;
            case 0x03:
                return `SE V${X.toString(16).toUpperCase()}, 0x${NN.toString(16).padStart(2, "0").toUpperCase()}`;
            case 0x04:
                return `SNE V${X.toString(16).toUpperCase()}, 0x${NN.toString(16).padStart(2, "0").toUpperCase()}`;
            case 0x05:
                return `SE V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
            case 0x06:
                return `LD V${X.toString(16).toUpperCase()}, 0x${NN.toString(16).padStart(2, "0").toUpperCase()}`;
            case 0x07:
                return `ADD V${X.toString(16).toUpperCase()}, 0x${NN.toString(16).padStart(2, "0").toUpperCase()}`;
            case 0x08:
                switch(N) {
                    case 0x0:
                        return `LD V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x1:
                        return `OR V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x2:
                        return `AND V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x3:
                        return `XOR V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x4:
                        return `ADD V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x5:
                        return `SUB V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x6:
                        return `SHR V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0x7:
                        return `SUBN V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                    case 0xE:
                        return `SHL V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
                }
            case 0x09:
                return `SNE V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}`;
            case 0x0A:
                return `LD I, 0x${NNN.toString(16).padStart(3, "0").toUpperCase()}`;
            case 0x0B:
                return `JP V0, 0x${NNN.toString(16).padStart(3, "0").toUpperCase()}`;
            case 0x0C:
                return `RND V${X.toString(16).toUpperCase()}, 0x${NN.toString(16).padStart(2, "0").toUpperCase()}`;
            case 0x0D:
                return `DRW V${X.toString(16).toUpperCase()}, V${Y.toString(16).toUpperCase()}, 0x${N.toString(16).padStart(1, "0").toUpperCase()}`;
            case 0x0E:
                switch(NN) {
                    case 0x9E:
                        return `SKP V${X.toString(16).toUpperCase()}`;
                    case 0xA1:
                        return `SKNP V${X.toString(16).toUpperCase()}`;
                }
            case 0x0F:
                switch(NN) {
                    case 0x07:
                        return `LD V${X.toString(16).toUpperCase()}, DT`;
                    case 0x0A:
                        return `LD V${X.toString(16).toUpperCase()}, K`;
                    case 0x15:
                        return `LD DT, V${X.toString(16).toUpperCase()}`;
                    case 0x18:
                        return `LD ST, V${X.toString(16).toUpperCase()}`;
                    case 0x1E:
                        return `ADD I, V${X.toString(16).toUpperCase()}`;
                    case 0x29:
                        return `LD F, V${X.toString(16).toUpperCase()}`;
                    case 0x33:
                        return `LD [I], V${X.toString(16).toUpperCase()}`;
                    case 0x55:
                        return `LD V${X.toString(16).toUpperCase()}, [I]`;
                }
            default:
                return `NOP`;
        };
    }
};
