import { Disassembler } from "./disassembler";
import { Emulator } from "./emulator";
import { UtilityTerminal } from "./utility_terminal";
import { CHIP8 } from "./chip8";
import { signInWithGoogle, signOut } from "./auth";
import { SUPABASE } from "./auth";

declare const bootstrap: any;

const uploadROMButton = document.getElementById("upload-rom-button") as HTMLButtonElement;
const uploadROMInput = document.getElementById("upload-rom") as HTMLInputElement;

const loadingOverlay = document.getElementById("loadingOverlay") as HTMLElement;

const romDropdownMenu = document.getElementById("rom-dropdown-menu") as HTMLElement;

const loginButton = document.getElementById("login-button") as HTMLButtonElement;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;

async function listRoms() {
    try {
        romDropdownMenu.innerHTML = ``;

        // Fetch ROM list
        const response = await fetch('http://localhost:8080/rom/public/list');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const roms = await response.json();

        roms.forEach((rom: { id: { romName: string } }) => {
            romDropdownMenu.innerHTML += `
            <li>
                <a class="dropdown-item" id="dropdown-item-${rom.id.romName}" href="#">${rom.id.romName.replace(/\.ch8$/, "")}</a>
            </li>`;
        });        

    } catch (error) {
        console.error('Error fetching ROMs:', error);
    }
}


async function main() {
    let emulator: Emulator | null = null;
    let username = "Guest";
    let email = "Guest";
    
    // Fetches the uploaded ROMs
    listRoms();

    const { data, error } = await SUPABASE.auth.getUser();

    if (error) {
        console.error("Error fetching user:", error.message);
    } else if (data?.user) {
        const { email: userEmail, user_metadata } = data.user;
        username = user_metadata?.full_name || "User";
        email = userEmail ?? "User";
        console.log("Logged in as:", username, email);

        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }

    // Handle login
    loginButton.addEventListener("click", async () => {
        await signInWithGoogle();
    });

    // Handle logout
    logoutButton.addEventListener("click", async () => {
        await signOut();
    });

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
                    emulator = new Emulator(uint8Array, fileName, username, email);
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