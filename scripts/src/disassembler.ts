const stackOutputContents = document.getElementById("stack-output-contents") as HTMLElement;
const memoryOutputContents = document.getElementById("memory-output-contents") as HTMLElement;

export function populateDisassemblerViews(memory: Uint8Array) {
    // Populate the stack view
    for (let i = 0; i < 16; ++i) {
        stackOutputContents.innerHTML += `
            <pre class="disassembler-content" id="stack-content-${i}">${i}: 0x00</pre>
        `;
    }

    // Populate Memory view
    memoryOutputContents.innerHTML += `
        <pre class="memory-address">Address</pre>
    `;

    const memoryViewTotalColumns = 17;
    for (let i = 0; i < memoryViewTotalColumns - 1; ++i) {
        memoryOutputContents.innerHTML += `
            <pre class="memory-address">0x${i.toString(16).padStart(2, "0")}</pre>
        `;
    }

    const memoryViewRowLimit = 4;
    let memoryIndex = 0;
    for (let i = 0; i < memoryViewTotalColumns * memoryViewRowLimit; ++i) {
        if (i % (memoryViewTotalColumns) === 0) {
            memoryOutputContents.innerHTML += `
               <pre class="memory-address">${memoryIndex.toString(16).padStart(3, "0")}</pre>
            `;
            memoryIndex += memoryViewTotalColumns - 1;
        } else {
            memoryOutputContents.innerHTML += `
               <pre class="disassembler-content">00</pre>
            `;
        }
    }
}