import Swal from "sweetalert2";

const romDropdownMenu = document.getElementById("rom-dropdown-menu") as HTMLElement;
romDropdownMenu.innerHTML = ``;

const deleteRomList = document.getElementById("delete-rom-list") as HTMLElement;
deleteRomList.innerHTML = ``;

const confirmDeleteRomButton = document.getElementById("confirm-delete-rom-button") as HTMLButtonElement;

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
                <a class="dropdown-item" href="#" data-rom='${JSON.stringify(rom)}'>${rom.id.romName.replace(/\.ch8$/, "")}</a>
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

        if (roms.length > 0) {
            confirmDeleteRomButton.removeAttribute("disabled");
        }

        let i = 0;
        roms.forEach((rom: { id: { romName: string } }) => {
            romDropdownMenu.innerHTML += `
            <li>
                <a class="dropdown-item" href="#" data-rom='${JSON.stringify(rom)}'>${rom.id.romName.replace(/\.ch8$/, "")}</a>
            </li>`;

            ++i;
            deleteRomList.innerHTML += `
                <tr>
                    <td>${i}</td>
                    <td>${rom.id.romName}</td>
                    <td>
                        <input type="checkbox" class="form-check-input" name="romSelect" value="${rom.id.romName}">
                    </td>
                </tr>
            `;
        });    
    } catch (error) {
        console.error("Error fetching personal ROMs:", error);
        return [];
    }
}


export async function saveRom(id: string, file: File, token: string) {
    try {
        const formData = new FormData();
        formData.append("userId", id);
        formData.append("romName", file.name);
        formData.append("file", file); // Attach file

        const response = await fetch("http://localhost:8080/rom/save", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
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
                    window.location.reload();
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
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
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

export async function deleteRoms(roms: { userId: string; romName: string }[], token: string) {
    try {
        const response = await fetch("http://localhost:8080/rom/delete", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(roms)
        });

        const message = await response.text();

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: message,
                confirmButtonColor: "#d33",
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Deleted",
            text: message,
            confirmButtonColor: "#3085d6",
        }).then(() => {
            window.location.reload();
        });

    } catch (error) {
        console.error("Error deleting ROMs:", error);
        Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Failed to delete ROMs.",
            confirmButtonColor: "#d33",
        });
    }
}

export async function readPublicRom(id: string, name: string) {
    try {
        const response = await fetch(`http://localhost:8080/rom/public/get?userId=${id}&romName=${encodeURIComponent(name)}`, {
            method: "GET"
        });

        if (!response.ok) {
            const message = await response.text();
            Swal.fire({
                icon: "error",
                title: "Error Reading ROM",
                text: message,
                confirmButtonColor: "#d33",
            });
            return;
        }

        const downloadUrl = await response.text();

        // Open the file in a new tab
        window.open(downloadUrl, "_blank");

    } catch (error) {
        console.error("Error reading ROM:", error);
        Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Failed to fetch ROM.",
            confirmButtonColor: "#d33",
        });
    }
}

export async function readPersonalRom(id: string, name: string, token: string) {
    try {
        const response = await fetch(`http://localhost:8080/rom/personal/get?userId=${id}&romName=${encodeURIComponent(name)}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const message = await response.text();
            Swal.fire({
                icon: "error",
                title: "Error Reading ROM",
                text: message,
                confirmButtonColor: "#d33",
            });
            return;
        }

        const downloadUrl = await response.text();

        // Open the file in a new tab
        window.open(downloadUrl, "_blank");

    } catch (error) {
        console.error("Error reading ROM:", error);
        Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Failed to fetch ROM.",
            confirmButtonColor: "#d33",
        });
    }
}
