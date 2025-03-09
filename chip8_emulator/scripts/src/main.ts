import { Emulator } from "./emulator";
import { signInWithGoogle, signOut } from "./auth";
import { SUPABASE } from "./auth";
import { showErrorModal, showEmulatorErrorModal, showLoading, hideLoading } from "./ui_utils";
import { listRoms, saveRom } from "./requests";

const uploadROMButton = document.getElementById("upload-rom-button") as HTMLButtonElement;
const uploadROMInput = document.getElementById("upload-rom") as HTMLInputElement;

const loginButton = document.getElementById("login-button") as HTMLButtonElement;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;

const saveROMButton = document.getElementById("save-rom-button") as HTMLButtonElement;
const saveROMInput = document.getElementById("save-rom") as HTMLButtonElement;

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

main();