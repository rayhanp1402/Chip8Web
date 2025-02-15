fetch("presigned_url")
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const chip8 = new CHIP8();
        chip8.loadROM(new Uint8Array(buffer));
        console.log("ROM loaded successfully!");
        console.log(chip8.memory);
    })
    .catch(error => console.error("Error loading ROM:", error));