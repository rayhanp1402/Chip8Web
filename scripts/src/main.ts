import { Disassembler } from "./disassembler";
import { Emulator } from "./emulator";
import { UtilityTerminal } from "./utility_terminal";
import { CHIP8 } from "./chip8";

const uploadROMButton = document.getElementById("upload-rom-button") as HTMLElement;
const uploadROMInput = document.getElementById("upload-rom") as HTMLElement;

function loadSavedROM(signed_url: string) {
    fetch(signed_url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ROM: ${response.status} ${response.statusText}`);
        }
        return response.arrayBuffer();
    })
    .then(buffer => {
        const emulator = new Emulator(new Uint8Array(buffer));
    })  
    .catch(error => {
        console.error("Error loading ROM:", error)
    });
}

function main() {
    let utilityTerminal = new UtilityTerminal(false);
    let chip8 = new CHIP8(utilityTerminal, 0);
    let disassembler = new Disassembler(chip8, 0, utilityTerminal);

    uploadROMButton.addEventListener("click", function() {
        uploadROMInput.click();
    });
    
    uploadROMInput.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement | null;
    
        if (!target || !target.files || target.files.length === 0) return;
    
        const file = target.files[0];
        const reader = new FileReader();
    
        reader.onload = (e) => {
            if (!e.target) return;
    
            const arrayBuffer = e.target.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
    
            const emulator = new Emulator(uint8Array);
        };
    
        reader.readAsArrayBuffer(file);
    });
}

main();