import { Emulator } from "./emulator";
import { signInWithGoogle, signOut } from "./auth";
import { SUPABASE } from "./auth";

declare const bootstrap: any;

const uploadROMButton = document.getElementById("upload-rom-button") as HTMLButtonElement;
const uploadROMInput = document.getElementById("upload-rom") as HTMLInputElement;

const loadingOverlay = document.getElementById("loadingOverlay") as HTMLElement;

const romDropdownMenu = document.getElementById("rom-dropdown-menu") as HTMLElement;

const loginButton = document.getElementById("login-button") as HTMLButtonElement;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;

const saveROMButton = document.getElementById("save-rom-button") as HTMLButtonElement;
const saveROMInput = document.getElementById("save-rom") as HTMLButtonElement;

const loadingText = document.getElementById("loading-text") as HTMLElement;

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

async function saveRom(id: string, name: string, token: string) {
    const userId = id;
    const romName = name;

    console.log(token);

    const response = await fetch("http://localhost:8080/rom/save", {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: id, romName: name })
    });

    const message = await response.text();
    showErrorModal("Save ROM", message);
}



async function main() {
    let emulator: Emulator | null = null;
    let username = "Guest";
    let email = "Guest";
    let uuid = "";
    let token = "";
    
    // Fetches the uploaded ROMs
    listRoms();

    // Fetch user
    const { data: userData, error: userError } = await SUPABASE.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError.message);
    } else if (userData?.user) {
        const { id: userId, email: userEmail, user_metadata } = userData.user;
        username = user_metadata?.full_name || "User";
        email = userEmail ?? "User";
        uuid = userId;
        console.log("Logged in as:", username, email, uuid);

        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }

    // Fetch session token
    const { data: sessionData, error: sessionError } = await SUPABASE.auth.getSession();

    if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
    } else {
        token = sessionData.session?.access_token || "";
        console.log("JWT Token:", token);
    }

    // Handle login
    loginButton.addEventListener("click", async () => {
        await signInWithGoogle();
    });

    // Handle logout
    logoutButton.addEventListener("click", async () => {
        await signOut();
    });

    saveROMButton.addEventListener("click", function() {
        saveROMInput.value = ""; // Reset input to allow re-selecting the same file
        saveROMInput.click();
    });

    saveROMInput.addEventListener("change", async (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
    
        showLoading("Saving ROM...");
    
        try {
            const file = input.files[0];
            await saveRom(uuid, file.name, token);
        } catch (error) {
            console.error("Error saving ROM:", error);
        }

        hideLoading();
    });    
 
    uploadROMButton.addEventListener("click", function() {
        uploadROMInput.value = ""; // Reset input to allow re-selecting the same file
        uploadROMInput.click();
    });

    uploadROMInput.addEventListener("change", (event: Event) => {
        showLoading("Loading ROM...");

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

function showLoading(text: string) {
    loadingOverlay.style.display = "flex";
    loadingText.innerText = text;
}

function hideLoading() {
    loadingOverlay.style.display = "none";
    loadingText.innerText = "";
}

main();