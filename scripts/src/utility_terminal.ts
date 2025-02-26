import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const xTermContainer = document.getElementById("xterm-container") as HTMLElement;

export class UtilityTerminal {
    private username = "Guest";
    private term: Terminal;
    private lineLimit = 50;
    private buffer = ""; // Stores the current input line
    private cursorPosition = 0;

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
    
        this.term.open(xTermContainer);
    
        this.term.writeln(`Welcome to CHIP-8 Emulator, ${this.username}!\n`);
        this.writeNewline();
    
        // Handle user input
        this.term.onData((data: string) => this.handleInput(data));

        // Support for copy-paste
        this.setupClipboardHandlers();
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
    }

    private updateTerminal() {
        this.term.write("\r@" + this.username + ":$ " + this.buffer + " ");
        this.term.write("\r@" + this.username + ":$ " + this.buffer.slice(0, this.cursorPosition));
    }

    private processCommand() {
        this.term.writeln("");
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
};