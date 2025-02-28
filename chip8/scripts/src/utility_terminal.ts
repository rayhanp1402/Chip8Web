import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const xTermContainer = document.getElementById("xterm-container") as HTMLElement;

export class UtilityTerminal {
    private username = "Guest";
    private term: Terminal;
    private lineLimit = 50;
    private buffer = ""; // Stores the current input line
    private cursorPosition = 0;
    private commandHistory: string[] = [];    // Will be treated as a stack
    private maxCommandHistory = 14;
    private commandHistoryPointer = 0;

    // Only allow one listener per UtilityTerminal fields
    private setCycleListener: (speed: number) => number = (speed: number) => -1;
    private setCycleIncrementListener: (increment: number) => number = (increment: number) => -1;
    private gotoMemoryListener: (address: number) => number = (address: number) => -1;
    private gotoInstructionListener: (address: number) => number = (address: number) => -1;
    private setBreakpointListener: (address: number) => string = (address: number) => "";
    private removeBreakpointListener: (address: number) => string = (address: number) => "";
    private clearBreakpointListener: () => string = () => "";
    private showBreakpointListener: () => Set<Number> = () => new Set();
    private stepListener: () => number = () => -1;

    // Allowed characters to be typed
    private terminalCharacters = new Set([
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        " "
    ]);

    constructor() {
        this.term = new Terminal({
            cursorBlink: true,
            theme: {
                background: "#000000",
                foreground: "#ffffff",
            },
        });  

        xTermContainer.innerHTML = ``;

    
        this.term.open(xTermContainer);
    
        this.term.writeln(`Welcome to CHIP-8 Web Emulator, ${this.username}!\n`);
        this.writeNewline();
    
        // Handle user input
        this.term.onData((data: string) => this.handleInput(data));

        // Support for copy-paste
        this.setupClipboardHandlers();
    }

    public listenToSetCycle(listener: ((speed: number) => number)) {
        this.setCycleListener = listener;
    }

    private notifyCycleListener(speed: number) {
        return this.setCycleListener(speed);
    }

    public listenToSetCycleIncrement(listener: ((increment: number) => number)) {
        this.setCycleIncrementListener = listener;
    }

    private notifyCycleIncrementListener(increment: number) {
        return this.setCycleIncrementListener(increment);
    }
    
    public listenToGotoMemory(listener: ((address: number) => number)) {
        this.gotoMemoryListener = listener;
    }

    private notifyGotoMemoryListener(address: number) {
        return this.gotoMemoryListener(address);
    }
    
    public listenToGotoInstruction(listener: ((address: number) => number)) {
        this.gotoInstructionListener = listener;
    }

    private notifyGotoInstructionListener(address: number) {
        return this.gotoInstructionListener(address);
    }

    public listenToSetBreakpoint(listener: ((address: number) => string)) {
        this.setBreakpointListener = listener;
    }

    private notifySetBreakpointListener(address: number) {
        return this.setBreakpointListener(address);
    }

    public listenToRemoveBreakpoint(listener: ((address: number) => string)) {
        this.removeBreakpointListener = listener;
    }

    private notifyRemoveBreakpointListener(address: number) {
        return this.removeBreakpointListener(address);
    }

    public listenToClearBreakpoint(listener: (() => string)) {
        this.clearBreakpointListener = listener;
    }

    private notifyClearBreakpointListener() {
        return this.clearBreakpointListener();
    }
    
    public listenToShowBreakpoint(listener: (() => Set<Number>)) {
        this.showBreakpointListener = listener;
    }

    private notifyShowBreakpointListener() {
        return this.showBreakpointListener();
    }

    public listenToStep(listener: (() => number)) {
        this.stepListener = listener;
    }

    private notifyStepListener() {
        return this.stepListener();
    }

    private handleInput(data: string) {
        if (this.terminalCharacters.has(data) && this.buffer.length < this.lineLimit) {
            this.buffer =
                this.buffer.slice(0, this.cursorPosition) +
                data +
                this.buffer.slice(this.cursorPosition);
            this.cursorPosition++;
            this.updateTerminal();
        } 
        else if (data === "\r") { // Enter key
            this.processCommand();
        } 
        else if (data === "\x7f" && this.cursorPosition > 0) { // Backspace
            this.buffer =
                this.buffer.slice(0, this.cursorPosition - 1) +
                this.buffer.slice(this.cursorPosition);
            this.cursorPosition--;
            this.updateTerminal();
        } 
        else if (data === "\x1b[D" && this.cursorPosition > 0) { // Move Cursor Left
            this.cursorPosition--;
            this.updateTerminal();
        } 
        else if (data === "\x1b[C" && this.cursorPosition < this.buffer.length) { // Move Cursor Right
            this.cursorPosition++;
            this.updateTerminal();
        } 
        else if (data === "\x1b[3~" && this.cursorPosition < this.buffer.length) { // Delete Key
            this.buffer =
                this.buffer.slice(0, this.cursorPosition) +
                this.buffer.slice(this.cursorPosition + 1);
            this.updateTerminal();
        } 
        else if (data === "\x1b[A") { // Up Arrow Key (go to earlier command history)
            if (this.commandHistory.length > 0) {
                if (this.commandHistoryPointer > 0) {
                    this.commandHistoryPointer--;
                }
                this.buffer = this.commandHistory[this.commandHistoryPointer] || "";
                this.cursorPosition = this.buffer.length;
                this.updateTerminal();
            }
        } 
        else if (data === "\x1b[B") { // Down Arrow Key (go to later command history)
            if (this.commandHistory.length > 0) {
                if (this.commandHistoryPointer < this.commandHistory.length - 1) {
                    this.commandHistoryPointer++;
                    this.buffer = this.commandHistory[this.commandHistoryPointer];
                } else {
                    // If at the last command, clear the buffer
                    this.commandHistoryPointer = this.commandHistory.length;
                    this.buffer = "";
                }
                this.cursorPosition = this.buffer.length;
                this.updateTerminal();
            }
        }
    }

    private updateTerminal() {
        // Clear current line
        this.term.write("\r" + " ".repeat(this.term.cols) + "\r");
    
        // Rewrite the prompt and buffer
        this.term.write(`@${this.username}:$ ${this.buffer}`);
        
        // Reset cursor position
        this.term.write(`\r@${this.username}:$ ${this.buffer.slice(0, this.cursorPosition)}`);
    }
    

    private processCommand() {
        this.term.writeln("");
    
        const tokens = this.tokenizeCommand(this.buffer);
        if (tokens.length === 0) {
            this.writeNewline();
            return;
        }
    
        const [command, sub1, sub2, sub3] = tokens;
        let validCommand = true;
    
        switch (command) {
            case "clear":
                if (sub1 === "bp") {
                    this.term.writeln(`${this.notifyClearBreakpointListener()}`);
                } else {
                    this.term.clear();
                }
                break;
            case "help":
                this.term.writeln("Available commands:");
                this.term.writeln("clear                           Clears the terminal's screen.");
                this.term.writeln("");
                this.term.writeln("help                            Shows a list of available commands.");
                this.term.writeln("");
                this.term.writeln("history                         Shows up to 14 past entered commands.");
                this.term.writeln("");
                this.term.writeln("set cycle <value>               Sets the cycle speed/frequency to <value> Hz.");
                this.term.writeln("                                Value must be a base-10 positive integer.");
                this.term.writeln("");
                this.term.writeln("set cycle increment <value>     Sets the increment of cycle speed.");
                this.term.writeln("                                Value must be a base-10 positive integer.");
                this.term.writeln("");
                this.term.writeln("goto instruction <address>      Instructions view jumps to <address>.");
                this.term.writeln("                                Address must be a base-16 non-negative integer.");
                this.term.writeln("");
                this.term.writeln("goto memory <address>           Memory view jumps to <address>.");
                this.term.writeln("                                Address must be a base-16 non-negative integer.");
                this.term.writeln("");
                this.term.writeln("set bp <address>                Sets a breakpoint at <address>.");
                this.term.writeln("                                Address must be a base-16 non-negative integer.");
                this.term.writeln("");
                this.term.writeln("remove bp <address>             Removes the breakpoint at <address>.");
                this.term.writeln("                                Address must be a base-16 non-negative integer.");
                this.term.writeln("");
                this.term.writeln("clear bp                        Removes all breakpoints.");
                this.term.writeln("");
                this.term.writeln("bp                              Shows all breakpoints.");
                this.term.writeln("");
                this.term.writeln("step                            Execute the next instruction once.");
                break;
            case "history":
                let isHistoryFull = this.commandHistory.length >= this.maxCommandHistory;
                let i = isHistoryFull ? 1 : 0;
                for (i; i < this.commandHistory.length; ++i) {
                    this.term.writeln(`${isHistoryFull ? i : i + 1}. ${this.commandHistory[i]}`);
                }
                this.term.writeln(`${isHistoryFull ? i : i + 1}. history`);
                break;
            case "bp":
                this.term.writeln("Breakpoints:");
                const breakpoints = this.notifyShowBreakpointListener();
                let j = 1;
                for (const breakpoint of breakpoints) {
                    this.term.writeln(`${j}. 0x${breakpoint.toString(16)}`);
                    ++j;
                }
                break;
            case "step":
                const stepAddress = this.notifyStepListener();
                if (stepAddress === -1) {
                    this.term.writeln(`Cannot step! Program is running.`);
                } else {
                    this.term.writeln(`Stepped to instruction at address 0x${stepAddress.toString(16)}`);
                }
                break;
            case "set":
                if (sub1 === "cycle") {
                    if (sub2 === "increment") {
                        if (!sub3 || isNaN(parseInt(sub3, 10)) || parseInt(sub3, 10) <= 0) {
                            this.term.writeln("Error: Please provide a valid base-10 positive integer for cycle increment.");
                        } else {
                            const incrementValue = this.notifyCycleIncrementListener(parseInt(sub3, 10));
                            this.term.writeln(`Cycle increment set to ${incrementValue} Hz.`);
                        }
                    } else {
                        if (!sub2 || isNaN(parseInt(sub2, 10)) || parseInt(sub2, 10) <= 0) {
                            this.term.writeln("Error: Please provide a valid base-10 positive integer for cycle value.");
                        } else {
                            const cycleValue = this.notifyCycleListener(parseInt(sub2, 10));
                            this.term.writeln(`Cycle set to ${cycleValue} Hz.`);
                        }
                    }
                } else if (sub1 === "bp") {
                    if (!sub2 || isNaN(parseInt(sub2, 16)) || parseInt(sub2, 16) < 0) {
                        this.term.writeln("Error: Please provide a valid base-16 non-negative integer for breakpoint address.");
                    } else {
                        this.term.writeln(`${this.notifySetBreakpointListener(parseInt(sub2, 16))}`);
                    }
                }
                break;
            case "remove":
                if (sub1 === "bp") {
                    if (!sub2 || isNaN(parseInt(sub2, 16)) || parseInt(sub2, 16) < 0) {
                        this.term.writeln("Error: Please provide a valid base-16 non-negative integer for breakpoint address.");
                    } else {
                        this.term.writeln(`${this.notifyRemoveBreakpointListener(parseInt(sub2, 16))}`);
                    }
                }
                break;
            case "goto":
                if (sub1 === "memory") {
                    if (!sub2 || isNaN(parseInt(sub2, 16)) || parseInt(sub2, 16) < 0) {
                        this.term.writeln(`Error: Please provide a valid base-16 non-negative integer for ${sub1} address.`);
                    } else {
                        const memoryAddressValue = this.notifyGotoMemoryListener(parseInt(sub2, 16));
                        this.term.writeln(`Going to ${sub1} address 0x${memoryAddressValue.toString(16).padStart(3, "0")}.`);
                    }
                }
                else if (sub1 === "instruction") {
                    if (!sub2 || isNaN(parseInt(sub2, 16)) || parseInt(sub2, 16) < 0) {
                        this.term.writeln(`Error: Please provide a valid base-16 non-negative integer for ${sub1} address.`);
                    } else {
                        const instructionAddressValue = this.notifyGotoInstructionListener(parseInt(sub2, 16));
                        this.term.writeln(`Going to ${sub1} address 0x${instructionAddressValue.toString(16).padStart(3, "0")}.`);
                    }
                }
                break;
            default:
                this.term.writeln("Unknown command. Type 'help' for a list of commands.");
                validCommand = false;
        }
    
        // Append executed command to history
        if (validCommand) {
            this.commandHistory.push(this.buffer);
            if (this.commandHistory.length > this.maxCommandHistory) this.commandHistory.shift();
            this.commandHistoryPointer = this.commandHistory.length;
        }
    
        this.buffer = "";
        this.cursorPosition = 0;
        this.writeNewline();
    }    

    private writeNewline() {
        this.term.write(`@${this.username}:$ `);
    }

    private setupClipboardHandlers() {
        // Copy selected text using Ctrl+C
        this.term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "c") {
                const selectedText = this.term.getSelection();
                if (selectedText) {
                    navigator.clipboard.writeText(selectedText);
                }
                return false; // Prevent default behavior
            }
            return true;
        });

        // Handle paste using Ctrl+V
        this.term.onKey(async ({ domEvent }) => {
            if (domEvent.ctrlKey && domEvent.key === "v") {
                const pasteData = await navigator.clipboard.readText();
                if (pasteData) {
                    this.insertTextAtCursor(pasteData);
                }
            }
        });
    }

    private insertTextAtCursor(text: string) {
        for (const char of text) {
            if (this.terminalCharacters.has(char) && this.buffer.length < this.lineLimit) {
                this.buffer =
                    this.buffer.slice(0, this.cursorPosition) +
                    char +
                    this.buffer.slice(this.cursorPosition);
                this.cursorPosition++;
            }
        }
        this.updateTerminal();
    }

    private tokenizeCommand(input: string): string[] {
        const tokens = input.trim().toLowerCase().split(/\s+/);
    
        // Normalize commands that have subcommands
        return this.normalizeCommand(tokens);
    }

    private normalizeCommand(tokens: string[]): string[] {
        if (tokens.length === 0) return [];
    
        const [cmd, sub1, sub2, sub3] = tokens;
    
        if (cmd === "set") {
            if (sub1 === "cycle") {
                if (sub2 === "increment") return ["set", "cycle", "increment", sub3 || ""];
                return ["set", "cycle", sub2 || ""];
            }
            if (sub1 === "bp" && sub2) return ["set", "bp", sub2];
        }
        if (cmd === "remove" && sub1 === "bp" && sub2) return ["remove", "bp", sub2];
        if (cmd === "clear") {
            if (sub1 === "bp") return ["clear", "bp"];
            return ["clear"];
        }
        if (cmd === "goto") {
            if (sub1 === "instruction" || sub1 === "memory") return ["goto", sub1, sub2 || ""];
        }
        if (cmd === "help" || cmd === "history" || "bp" || "step") {
            return [cmd];
        }
    
        return ["invalid"];
    }    
};