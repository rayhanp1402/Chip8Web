import { CHIP8 } from "./chip8.js";
import { populateDisassemblerViews } from "./disassembler.js";

fetch("signed_url")
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const chip8 = new CHIP8();
        chip8.loadROM(new Uint8Array(buffer));
        console.log("ROM loaded successfully!");

        populateDisassemblerViews(chip8.memory);
        chip8.run();
    })  
    .catch(error => console.error("Error loading ROM:", error));