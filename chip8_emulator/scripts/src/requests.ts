import Swal from "sweetalert2";

const romDropdownMenu = document.getElementById("rom-dropdown-menu") as HTMLElement;
romDropdownMenu.innerHTML = ``;

export async function listPublicRoms() {
    try {
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

export async function listPersonalRoms(userId: string, token: string) {
    try {
        const response = await fetch(`http://localhost:8080/rom/personal/list?userId=${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

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
        console.error("Error fetching personal ROMs:", error);
        return [];
    }
}


export async function saveRom(id: string, name: string, token: string) {
    try {
        const response = await fetch("http://localhost:8080/rom/save", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: id, romName: name })
        });

        const message = await response.text();

        if (response.status === 401) {
            Swal.fire({
                icon: "warning",
                title: "Unauthorized",
                text: "You must log in first to save a ROM.",
                confirmButtonColor: "#3085d6",
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload;
                }
            });
            return;
        }

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Error Saving ROM",
                text: message,
                confirmButtonColor: "#d33",
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Success",
            text: message,
            confirmButtonColor: "#3085d6",
        });

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Failed to save ROM.",
            confirmButtonColor: "#d33",
        });
    }
}
