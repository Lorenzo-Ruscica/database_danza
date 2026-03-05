"use client"
import React, { useRef, useState, useEffect } from "react"
import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"

export function VirtualKeyboard() {
    const [inputName, setInputName] = useState<string | null>(null)
    const [layoutName, setLayoutName] = useState("default")
    const keyboardRef = useRef<any>(null)
    const focusedInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                const input = target as HTMLInputElement | HTMLTextAreaElement;

                // Skip hidden, checkbox, radio, date, submit inputs
                if (
                    input.type === "checkbox" ||
                    input.type === "radio" ||
                    input.type === "date" ||
                    input.type === "submit" ||
                    input.type === "button" ||
                    input.type === "file"
                ) return;

                focusedInputRef.current = input;
                setInputName(input.name || input.id || "default");

                // Sync the keyboard value with input explicitly
                if (keyboardRef.current) {
                    keyboardRef.current.setInput(input.value);
                }
            }
        };

        const handleBlur = (e: FocusEvent) => {
            // Check if the newly focused element is within the keyboard wrapper
            setTimeout(() => {
                const activeEl = document.activeElement;
                const isWithinKeyboard = activeEl?.closest('.keyboard-wrapper') || activeEl?.closest('.kiosk-keyboard-container');
                const isInput = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";

                if (!activeEl || (!isInput && !isWithinKeyboard)) {
                    setInputName(null);
                    // Non impostiamo focusedInputRef.current a null qui per gestire un corretto reinserimento post-chiusura
                }
            }, 100);
        };

        const handleInput = (e: Event) => {
            if (focusedInputRef.current === e.target && keyboardRef.current) {
                keyboardRef.current.setInput((e.target as HTMLInputElement).value);
            }
        };

        const handleKeyboardMouseDown = (e: MouseEvent) => {
            // Evita che il click sui bottoni della tastiera faccia perdere il focus all'input
            const target = e.target as HTMLElement;
            if (target.closest('.hg-button') || target.closest('.keyboard-wrapper')) {
                e.preventDefault();
            }
        };

        window.addEventListener("focusin", handleFocus);
        window.addEventListener("focusout", handleBlur);
        window.addEventListener("input", handleInput);
        window.addEventListener("mousedown", handleKeyboardMouseDown, { capture: true });

        return () => {
            window.removeEventListener("focusin", handleFocus);
            window.removeEventListener("focusout", handleBlur);
            window.removeEventListener("input", handleInput);
            window.removeEventListener("mousedown", handleKeyboardMouseDown, { capture: true });
        };
    }, []);

    const onChange = (input: string) => {
        // Disabilitiamo onChange default perché gestiamo tutto in onKeyPress
        // per avere il controllo esatto della posizione del cursore!
    };

    const onKeyPress = (button: string) => {
        if (button === "{lock}" || button === "{shift}") {
            setLayoutName(layoutName === "default" ? "shift" : "default");
            return;
        }

        if (button === "{enter}" || button === "{close}") {
            setInputName(null);
            if (focusedInputRef.current) {
                focusedInputRef.current.blur();
            }
            return;
        }

        if (!focusedInputRef.current) return;

        const input = focusedInputRef.current;
        let start = input.selectionStart || 0;
        let end = input.selectionEnd || 0;
        const value = String(input.value || "");

        let newValue = "";
        let newCursorPos = start;

        if (button === "{bksp}") {
            // Gestione Backspace con selezione o singolo carattere
            if (start === end && start > 0) {
                newValue = value.substring(0, start - 1) + value.substring(end);
                newCursorPos = start - 1;
            } else if (start !== end) {
                newValue = value.substring(0, start) + value.substring(end);
                newCursorPos = start;
            } else {
                newValue = value; // Niente da cancellare
            }
        } else {
            // Inserimento Caratteri Standard
            let charToInsert = button;
            if (button === "{space}") charToInsert = " ";

            newValue = value.substring(0, start) + charToInsert + value.substring(end);
            newCursorPos = start + charToInsert.length;
        }

        // 1. Aggiorna lo stato interno della tastiera
        if (keyboardRef.current) {
            keyboardRef.current.setInput(newValue);
        }

        // 2. Dispatch event nativo per far capire a React (e a RHF/Zustand) che il valore è cambiato
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
            || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, newValue);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
            input.value = newValue;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // 3. IMPORTANTISSIMO: Reimposta il focus e la posizione corretta del caret
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    if (!inputName) return null;

    return (
        <div className="kiosk-keyboard-container fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-3xl border-t border-black/10 p-3 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] animate-fade-in-up-soft overflow-hidden overscroll-none touch-none">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs text-black/40 font-bold tracking-widest uppercase">Tastiera Kiosk</span>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            setInputName(null);
                            if (focusedInputRef.current) {
                                focusedInputRef.current.blur();
                            }
                        }}
                        className="text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer bg-black text-white hover:bg-black/80 transition-all shadow-[0_5px_15px_-5px_rgba(0,0,0,0.5)] uppercase tracking-wider"
                    >
                        Chiudi ↵
                    </button>
                </div>
                <div className="keyboard-wrapper relative z-10 w-full overflow-hidden">
                    <Keyboard
                        keyboardRef={r => (keyboardRef.current = r)}
                        layoutName={layoutName}
                        onChange={onChange}
                        onKeyPress={onKeyPress}
                        theme="hg-theme-default dance-keyboard"
                        disableButtonHold={false}
                        maxLength={150} // Safety
                        layout={{
                            default: [
                                "1 2 3 4 5 6 7 8 9 0 -",
                                "q w e r t y u i o p",
                                "a s d f g h j k l @",
                                "{shift} z x c v b n m . {bksp}",
                                "{space} {enter}"
                            ],
                            shift: [
                                "! \\\" £ $ % & \/ ( ) = ?",
                                "Q W E R T Y U I O P",
                                "A S D F G H J K L \\\"",
                                "{shift} Z X C V B N M , {bksp}",
                                "{space} {enter}"
                            ]
                        }}
                        display={{
                            "{bksp}": "⌫ Canc",
                            "{enter}": "Invio ↵",
                            "{shift}": "⇧",
                            "{space}": "Spazio",
                            "{lock}": "Maiusc"
                        }}
                    />
                </div>
            </div>
            {/* Styles defined here overrides the internal style of the keyboard package elegantly */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .dance-keyboard {
           background: transparent !important;
        }
        .dance-keyboard .hg-button {
           background: white !important;
           color: black !important;
           border: 1px solid rgba(0,0,0,0.1) !important;
           border-bottom-width: 2px !important;
           border-radius: 8px !important;
           box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
           font-family: inherit !important;
           font-size: 1.1rem !important;
           height: 50px !important;
           margin: 3px !important;
        }
        .dance-keyboard .hg-button:active, .dance-keyboard .hg-activeButton {
           background: #f8f8f8 !important;
           transform: translateY(2px) !important;
           border-bottom-width: 1px !important;
           box-shadow: 0 1px 2px rgba(0,0,0,0.02) !important;
        }
        .dance-keyboard .hg-button-space {
           background: rgba(0,0,0,0.02) !important;
        }
        .dance-keyboard .hg-button-enter, .dance-keyboard .hg-button-shift, .dance-keyboard .hg-button-bksp {
           background: rgba(0,0,0,0.05) !important;
           font-weight: 500 !important;
        }
      `}} />
        </div>
    )
}
