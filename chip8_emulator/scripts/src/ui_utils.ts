declare const bootstrap: any;

const loadingOverlay = document.getElementById("loadingOverlay") as HTMLElement;
const loadingText = document.getElementById("loading-text") as HTMLElement;

export function showErrorModal(title: string, message: string) {
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

export function showEmulatorErrorModal(title: string, message: string) {
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

export function showLoading(text: string) {
    loadingOverlay.style.display = "flex";
    loadingText.innerText = text;
}

export function hideLoading() {
    loadingOverlay.style.display = "none";
    loadingText.innerText = "";
}