// Anything on the page can open the terminal (the hero button, for one) by
// dispatching this on `window`; the terminal in the root layout listens for it.
export const OPEN_TERMINAL_EVENT = "portfolio:open-terminal";

export function openTerminal() {
    window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT));
}
