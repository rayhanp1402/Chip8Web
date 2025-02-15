fetch("https://chip8-roms-default.s3.ap-southeast-2.amazonaws.com/ibm_logo.ch8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4SYAMDUSJQCYOHS7%2F20250215%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250215T110604Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=490856361cd65a93ebe0355db3e2d10de729499e6644acf438c441180cffdeab")
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const chip8 = new CHIP8();
        chip8.loadROM(new Uint8Array(buffer));
        console.log("ROM loaded successfully!");
        console.log(chip8.memory);

        for (let i = 0; i < 80; ++i) {
            chip8.fetch();
        }
    })  
    .catch(error => console.error("Error loading ROM:", error));