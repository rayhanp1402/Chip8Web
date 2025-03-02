import { Disassembler } from "./disassembler";
import { Emulator } from "./emulator";
import { UtilityTerminal } from "./utility_terminal";
import { CHIP8 } from "./chip8";

declare const bootstrap: any;

const uploadROMButton = document.getElementById("upload-rom-button") as HTMLButtonElement;
const uploadROMInput = document.getElementById("upload-rom") as HTMLInputElement;

const loadingOverlay = document.getElementById("loadingOverlay") as HTMLElement;

const romDropdownMenu = document.getElementById("rom-dropdown-menu") as HTMLElement;

function loadSavedROM(signed_url: string) {
    fetch(signed_url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ROM: ${response.status} ${response.statusText}`);
            }

            // 1️⃣ Try to get filename from Content-Disposition header
            const contentDisposition = response.headers.get("Content-Disposition");
            let fileName = "unknown.rom"; // Default fallback filename

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    fileName = match[1];
                }
            } else {
                fileName = "unnamed";
            }

            return response.arrayBuffer().then(buffer => {
                const emulator = new Emulator(new Uint8Array(buffer), fileName);
            });
        })
        .catch(error => {
            console.error("Error loading ROM:", error);
        });
}

async function listRoms() {
    // Get the uploaded ROMs list
    try {
        romDropdownMenu.innerHTML = ``;
        const response = await fetch('http://localhost:8080/rom/list');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const roms = await response.json();
        for (let i = 0; i < roms.length; ++i) {
            romDropdownMenu.innerHTML += `
            <li>
                <a class="dropdown-item" id="dropdown-item-${roms[i]}" href="#">${roms[i].replace(/\.ch8$/, "")}</a>
            </li>`;
        }
    } catch (error) {
        console.error('Error fetching ROMs:', error);
    }
}

function main() {
    let emulator: Emulator | null = null;
    
    // Fetches the uploaded ROMs
    listRoms();

    uploadROMButton.addEventListener("click", function() {
        uploadROMInput.value = ""; // Reset input to allow re-selecting the same file
        uploadROMInput.click();
    });

    uploadROMInput.addEventListener("change", (event: Event) => {
        showLoading();

        const target = event.target as HTMLInputElement | null;

        if (!target || !target.files || target.files.length === 0) {
            hideLoading();
            showErrorModal("No file selected", "Please select a valid CHIP-8 ROM file.");
            return;
        }

        const file = target.files[0];
        const fileName = file.name.toLowerCase();

        if (!fileName.endsWith(".ch8")) {
            hideLoading();
            showErrorModal("Invalid File Type", "Please upload a valid CHIP-8 ROM (.ch8).");
            return;
        }

        const reader = new FileReader();

        reader.onerror = () => {
            hideLoading();
            showErrorModal("File Read Error", "Failed to read the file. Please try again.");
        };

        reader.onload = (e) => {
            if (!e.target || !e.target.result) {
                hideLoading();
                showErrorModal("File Read Error", "Error: File could not be read.");
                return;
            }

            const arrayBuffer = e.target.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);

            try {
                if (emulator === null) {
                    emulator = new Emulator(uint8Array, fileName);
                    emulator.getUtilityTerminal().setUsername("Rayhan");
                } else {
                    emulator.reset(uint8Array, fileName);
                }
            } catch (error) {
                hideLoading();
                showEmulatorErrorModal("Emulator Error", "Failed to initialize/reset emulator.");
                console.error(error);
            }

            hideLoading();
        };

        reader.readAsArrayBuffer(file);
    });
}

function showErrorModal(title: string, message: string) {
    const modalTitle = document.getElementById("errorModalLabel");
    const modalBody = document.getElementById("errorModalBody");
    const modalElement = document.getElementById("errorModal");

    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.textContent = message;

    if (modalElement) {
        const errorModal = new bootstrap.Modal(modalElement);
        errorModal.show();
    }
}

function showEmulatorErrorModal(title: string, message: string) {
    const modalTitle = document.getElementById("errorModalLabel");
    const modalBody = document.getElementById("errorModalBody");
    const modalElement = document.getElementById("errorModal");

    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.textContent = message;

    if (modalElement) {
        const errorModal = new bootstrap.Modal(modalElement);
        errorModal.show();

        // Reload the page when the modal is fully hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
            location.reload();
        }, { once: true }); // `once: true` ensures the event runs only once per modal display
    }
}

function showLoading() {
    loadingOverlay.style.display = "flex";
}

function hideLoading() {
    loadingOverlay.style.display = "none";
}

main();