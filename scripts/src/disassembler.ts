import { CHIP8 } from "./chip8";

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

    constructor(chip8: CHIP8, romSize: number) {
        // Inititalize the stack view
        for (let i = 0; i < 16; ++i) {
            stackOutputContents.innerHTML += `
                <pre class="disassembler-content stack-elements">${i}: 0x0000</pre>
            `;
        }
    
        // Memory view
        // Display initial memory contents (0x000 - 0x03F)
        this.displayMemoryContents(0, chip8.getMemory());
    
        // Display memory dynamically using up and down button
        memoryUpButton.addEventListener("click", (e) => {
            if (this.currentMemoryStartIndex < 0xFFF - 0x040) {
                this.currentMemoryStartIndex += 0x040;
                this.displayMemoryContents(this.currentMemoryStartIndex, chip8.getMemory());
            }
    
            this.updateMemoryButtonStates();
        });
    
        memoryDownButton.addEventListener("click", (e) => {
            if (this.currentMemoryStartIndex > 0x000) {
                this.currentMemoryStartIndex -= 0x040;
                this.displayMemoryContents(this.currentMemoryStartIndex, chip8.getMemory());
            }
    
            this.updateMemoryButtonStates();
        });

        // The loaded ROM last address
        this.romMaxAddress = 0x200 + (romSize - 1);

        // Display initial ROM
        this.displayInstructionContents(
            this.currentInstructionIndex, 
            this.romMaxAddress,
            chip8.getMemory(),
            chip8.getPC()
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
                chip8.getMemory(),
                chip8.getPC()
            );
        });

        instructionDownButton.addEventListener("click", (e) => {
            this.currentInstructionIndex -= 2;
            this.updateInstructionButtonStates();
            this.displayInstructionContents(
                this.currentInstructionIndex, 
                this.romMaxAddress,
                chip8.getMemory(),
                chip8.getPC()
            );
        });

        // Subscribe/listen to CHIP8 class object to dynamically change the disassembler contents
        this.subscribeToChip8(chip8);
    }

    private subscribeToChip8 = (chip8: CHIP8) => {
        chip8.listenToPC(this.updatePCView);
        chip8.listenToSP(this.updateSPView);
        chip8.listenToIndex(this.updateIndexView);
        chip8.listenToV(this.updateVRegisterView);
        chip8.listenToStack(this.updateStackView);
        chip8.listenToMemory(this.updateMemoryView);
        chip8.listenToPCAndMemory(this.updateInstructionView);
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

    private updateMemoryView = (memory: Uint8Array, updatedAtIndex: number) => {
        // Only change the currently displayed memory contents in the memory view
        if (updatedAtIndex >= this.currentMemoryStartIndex && updatedAtIndex < this.currentMemoryStartIndex + 0x40) {
            this.displayMemoryContents(this.currentMemoryStartIndex, memory);
        }
    }

    private updateInstructionView = (PC: number, memory: Uint8Array) => {
        if (this.isFollowingPC) this.currentInstructionIndex = PC;
        this.displayInstructionContents(this.currentInstructionIndex, this.romMaxAddress, memory, PC);
    }
    
    private displayMemoryContents = (
        startingIndex: number,
        memory: Uint8Array
    ) => {
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
                   <pre class="disassembler-content">${memory[memoryIndex].toString(16).padStart(2, "0").toUpperCase()}</pre>
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
            `<pre class="disassembler-content">0x${i.toString(16).padStart(3, "0").toUpperCase()}: 0x${instruction[0].toString(16).padStart(4, "0").toUpperCase()}</pre>`
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
};
