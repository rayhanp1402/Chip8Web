let oscillator: OscillatorNode | null = null;
const audioContext: AudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const gainNode: GainNode = audioContext.createGain();
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
