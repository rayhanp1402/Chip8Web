import { ON_COLOR, OFF_COLOR } from "./screen";

const volumeSlider = document.getElementById("volume-slider") as HTMLInputElement;

let oscillator: OscillatorNode | null = null;
const audioContext: AudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const gainNode: GainNode = audioContext.createGain();
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Default 30% volume
gainNode.connect(audioContext.destination);

export function playAudio() {
    if (oscillator) return; // Prevent multiple oscillators from playing

    oscillator = audioContext.createOscillator();
    oscillator.type = "square"; // Classic CHIP-8 buzzer
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.connect(gainNode);
    oscillator.start();
}

export function stopAudio() {
    if (oscillator) {
        oscillator.disconnect();
        oscillator.stop();
        oscillator = null;
    }
}

// Handle volume slider changes
volumeSlider.addEventListener("input", (event) => {
    const volume = parseFloat((event.target as HTMLInputElement).value);
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    const sliderPc = (parseFloat(volumeSlider.value) - parseFloat(volumeSlider.min)) / 
                     (parseFloat(volumeSlider.max) - parseFloat(volumeSlider.min)) * 100;
    
    volumeSlider.style.background = `linear-gradient(to right,${ON_COLOR} ${sliderPc}%, ${OFF_COLOR} ${sliderPc}%)`;
});
