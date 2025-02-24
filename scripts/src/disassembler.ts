import { CHIP8 } from "./chip8";

const stackOutputContents = document.getElementById("stack-output-contents") as HTMLElement;
const memoryOutputContents = document.getElementById("memory-output-contents") as HTMLElement;

const memoryUpButton = document.getElementById("memory-up-button") as HTMLButtonElement;
const memoryDownButton = document.getElementById("memory-down-button") as HTMLButtonElement;

const pcContentView = document.getElementById("pc-content-view") as HTMLElement;

export class Disassembler {
    private currentMemoryStartIndex = 0;

    constructor(chip8: CHIP8) {
        // Inititalize the stack view
        for (let i = 0; i < 16; ++i) {
            stackOutputContents.innerHTML += `
                <pre class="disassembler-content" id="stack-content-${i}">${i}: 0x00</pre>
            `;
        }
    
        // Memory view
        // Display initial memory contents (0x000 - 0x03F)
        this.displayMemoryContents(0, chip8.getMemory());
    
        // Display memory dynamically
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

        // Subscribe to CHIP8 class object to dynamically change the disassembler contents
        this.subscribeToChip8PC(chip8);
    }

    private subscribeToChip8PC(chip8: CHIP8) {
        chip8.listenToPC(this.updatePCView);
    }

    private updatePCView(PC: number) {
        pcContentView.innerText = `PC: 0x${PC.toString(16).padStart(3, "0")}`;
    }
    
    private displayMemoryContents(
        startingIndex: number,
        memory: Uint8Array
    ) {
        memoryOutputContents.innerHTML = `
            <pre class="memory-address">Address</pre>
        `;
    
        const memoryViewTotalColumns = 17;
        const memoryViewRowLimit = 4;
        for (let i = 0; i < memoryViewTotalColumns - 1; ++i) {
            memoryOutputContents.innerHTML += `
                <pre class="memory-address">0x${i.toString(16).padStart(2, "0")}</pre>
            `;
        }
    
        let msbByteIndex = startingIndex;  // Index of memory every 16-bit, so the first (msb) nibble and second nibble
        let memoryIndex = startingIndex; // Current pointed index of memory
        for (let i = 0; i < memoryViewTotalColumns * memoryViewRowLimit; ++i) {
            if (i % (memoryViewTotalColumns) === 0) {
                memoryOutputContents.innerHTML += `
                   <pre class="memory-address">${msbByteIndex.toString(16).padStart(3, "0")}</pre>
                `;
                msbByteIndex += memoryViewTotalColumns - 1;
            } else {
                memoryOutputContents.innerHTML += `
                   <pre class="disassembler-content">${memory[memoryIndex].toString(16).padStart(2, "0")}</pre>
                `;
                ++memoryIndex;
            }
        }
    }
    
    private updateMemoryButtonStates() {
        // This will disable or enable the memory up and memory down buttons
        // According to limit
        memoryUpButton.disabled = this.currentMemoryStartIndex >= 0xFFF - 0x040;
        memoryDownButton.disabled = this.currentMemoryStartIndex <= 0x000;
    }
};
