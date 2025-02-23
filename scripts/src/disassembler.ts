const stackOutputContents = document.getElementById("stack-output-contents") as HTMLElement;
const memoryOutputContents = document.getElementById("memory-output-contents") as HTMLElement;

const memoryUpButton = document.getElementById("memory-up-button") as HTMLButtonElement;
const memoryDownButton = document.getElementById("memory-down-button") as HTMLButtonElement;

let currentMemoryStartIndex = 0;

export function populateDisassemblerViews(memory: Uint8Array) {
    // Populate the stack view
    for (let i = 0; i < 16; ++i) {
        stackOutputContents.innerHTML += `
            <pre class="disassembler-content" id="stack-content-${i}">${i}: 0x00</pre>
        `;
    }

    // Memory view
    // Display initial memory contents (0x000 - 0x03F)
    displayMemoryContents(0, memory);

    // Display memory dynamically
    memoryUpButton.addEventListener("click", (e) => {
        if (currentMemoryStartIndex < 0xFFF - 0x040) {
            currentMemoryStartIndex += 0x040;
            displayMemoryContents(currentMemoryStartIndex, memory);
        }

        updateButtonStates();
    });

    memoryDownButton.addEventListener("click", (e) => {
        if (currentMemoryStartIndex > 0x000) {
            currentMemoryStartIndex -= 0x040;
            displayMemoryContents(currentMemoryStartIndex, memory);
        }

        updateButtonStates();
    });
}

function displayMemoryContents(
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

function updateButtonStates() {
    // This will disable or enable the memory up and memory down buttons
    // According to limit
    memoryUpButton.disabled = currentMemoryStartIndex >= 0xFFF - 0x040;
    memoryDownButton.disabled = currentMemoryStartIndex <= 0x000;
}