const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send a message to the admin Telegram chat
 * Non-blocking, fire-and-forget
 */
export async function sendTelegramAlert(text) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn("[Telegram] BOT_TOKEN or CHAT_ID not configured, skipping alert");
        return;
    }

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text,
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });
    } catch (err) {
        console.error("[Telegram] Failed to send alert:", err.message);
    }
}

/**
 * Alert: New user registered
 */
export function alertNewUser(name, email, role) {
    const roleLabel = role === "provider" ? "Massagista" : "Cliente";
    const bonus = role === "provider" ? "$50" : "$5";
    const text = [
        `<b>🆕 Novo cadastro no RubRhythm</b>`,
        ``,
        `<b>Nome:</b> ${name || "Sem nome"}`,
        `<b>Email:</b> ${email}`,
        `<b>Tipo:</b> ${roleLabel}`,
        `<b>Bonus:</b> ${bonus} welcome credits`,
        ``,
        `<a href="https://www.rubrhythm.com/admin/users">Ver no admin →</a>`,
    ].join("\n");

    sendTelegramAlert(text).catch(() => {});
}

/**
 * Alert: New listing created
 */
export function alertNewListing(title, city, state, providerName) {
    const text = [
        `<b>📋 Novo anuncio no RubRhythm</b>`,
        ``,
        `<b>Titulo:</b> ${title}`,
        `<b>Local:</b> ${city}, ${state}`,
        `<b>Provider:</b> ${providerName || "—"}`,
        ``,
        `<a href="https://www.rubrhythm.com/admin/listings">Moderar →</a>`,
    ].join("\n");

    sendTelegramAlert(text).catch(() => {});
}

/**
 * Alert: New verification request
 */
export function alertNewVerification(name, email) {
    const text = [
        `<b>🪪 Nova verificacao no RubRhythm</b>`,
        ``,
        `<b>Nome:</b> ${name || "Sem nome"}`,
        `<b>Email:</b> ${email}`,
        ``,
        `<a href="https://www.rubrhythm.com/admin/verificacao">Revisar →</a>`,
    ].join("\n");

    sendTelegramAlert(text).catch(() => {});
}

/**
 * Alert: Credits purchased (payment confirmed)
 */
export function alertPurchase(name, email, credits, paymentId) {
    const text = [
        `<b>💰 Compra de creditos no RubRhythm!</b>`,
        ``,
        `<b>Nome:</b> ${name || "Sem nome"}`,
        `<b>Email:</b> ${email}`,
        `<b>Creditos:</b> ${credits}`,
        `<b>Valor:</b> $${credits}`,
        `<b>Payment ID:</b> ${paymentId || "—"}`,
        ``,
        `<a href="https://www.rubrhythm.com/admin/financeiro">Ver financeiro →</a>`,
    ].join("\n");

    sendTelegramAlert(text).catch(() => {});
}

/**
 * Alert: New report/fraud submitted
 */
export function alertReport(reporterName, reportedName, type, severity) {
    const text = [
        `<b>🚨 Novo report no RubRhythm</b>`,
        ``,
        `<b>Reporter:</b> ${reporterName || "Anonimo"}`,
        `<b>Reportado:</b> ${reportedName || "—"}`,
        `<b>Tipo:</b> ${type || "—"}`,
        `<b>Severidade:</b> ${severity || "medium"}`,
        ``,
        `<a href="https://www.rubrhythm.com/admin/users">Ver no admin →</a>`,
    ].join("\n");

    sendTelegramAlert(text).catch(() => {});
}
