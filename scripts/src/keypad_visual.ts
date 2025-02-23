// Maps the KeyboardEvent codes into key elements in the HTML
const keyElementMap: Record<string, HTMLElement> = {
    "Digit1": document.getElementById("key_1") as HTMLElement,
    "Digit2": document.getElementById("key_2") as HTMLElement,
    "Digit3": document.getElementById("key_3") as HTMLElement,
    "Digit4": document.getElementById("key_c") as HTMLElement,
    "KeyQ": document.getElementById("key_4") as HTMLElement,
    "KeyW": document.getElementById("key_5") as HTMLElement,
    "KeyE": document.getElementById("key_6") as HTMLElement,
    "KeyR": document.getElementById("key_d") as HTMLElement,
    "KeyA": document.getElementById("key_7") as HTMLElement,
    "KeyS": document.getElementById("key_8") as HTMLElement,
    "KeyD": document.getElementById("key_9") as HTMLElement,
    "KeyF": document.getElementById("key_e") as HTMLElement,
    "KeyZ": document.getElementById("key_a") as HTMLElement,
    "KeyX": document.getElementById("key_0") as HTMLElement,
    "KeyC": document.getElementById("key_b") as HTMLElement,
    "KeyV": document.getElementById("key_f") as HTMLElement,
};

// Interact with keypad elements in the HTML using keyboard
// Follows the CSS .key:active style when keyboard is pressed
document.addEventListener("keydown", (e) => {
    if (e.code in keyElementMap) {
        keyElementMap[e.code].classList.add("active");
    }
});

// Revert to original style when keyboard is released
document.addEventListener("keyup", (e) => {
    if (e.code in keyElementMap) {
        keyElementMap[e.code].classList.remove("active");
    }
});