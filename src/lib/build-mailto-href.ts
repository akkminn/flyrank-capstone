const EMAIL = "maungkokominn@gmail.com";

export function buildMailtoHref(name: string, replyTo: string, message: string): string {
    const subject = `Portfolio message from ${name || "a visitor"}`;
    const body = `${message}\n\n— ${name || "a visitor"}${replyTo ? ` (${replyTo})` : ""}`;
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
