import { CHIP8 } from "./chip8.js";
import { Disassembler } from "./disassembler.js";

fetch("https://chip8-roms.s3.ap-southeast-2.amazonaws.com/IBM%20Logo.ch8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4SYAMDUSJQCYOHS7%2F20250224%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250224T083159Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3adb2863707bf8b16b0d690f4012576e15d2c29231aef872a59d316a263558f7")
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const chip8 = new CHIP8();
        chip8.loadROM(new Uint8Array(buffer));
        console.log("ROM loaded successfully!");

        const disassembler = new Disassembler(chip8.getMemory());
        chip8.run();
    })  
    .catch(error => console.error("Error loading ROM:", error));