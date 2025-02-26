import { Emulator } from "./emulator";

fetch("signed_url")
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