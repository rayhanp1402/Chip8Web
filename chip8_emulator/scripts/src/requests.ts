import { showErrorModal } from "./ui_utils";

const romDropdownMenu = document.getElementById("rom-dropdown-menu") as HTMLElement;

export async function listRoms() {
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

export async function saveRom(id: string, name: string, token: string) {
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