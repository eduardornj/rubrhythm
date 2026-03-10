// lib/contentFilter.js
// Content filter for RubRhythm — detects prohibited and flagged terms in listings.
// Used on: provider listing form (real-time), API (block/flag), admin panel (highlight).

// RED = blocked (listing rejected automatically, provider warned)
// YELLOW = flagged (listing allowed but flagged for admin review)

const RED_TERMS = [
  // Serviços sexuais — explícito e inequívoco
  "escort", "escorts", "escorting",
  "prostitut", "prostitu",
  "full service", "fs ", " fs",
  "happy ending", "happy endings", "happyending",
  "hand job", "handjob", "handjobs",
  "blow job", "blowjob", "blowjobs",
  "oral sex", "anal sex",
  "sexual intercourse",
  "gfe", "girlfriend experience",
  "pse", "porn star experience",
  "bbbj", "bbfs", "cim", "cof", "cob",
  "bareback",
  "cumshot",
  "porn", "porno", "pornstar",
  "dildo", "vibrator",
  "striptease",
  "erotic massage", "erotic touch",
  "tantric sex",
  "rub and tug", "rubandtug", "rub n tug",
  "massage with happy ending",
  "sensual release",
  "mutual touch", "mutual massage",
  "sugar daddy", "sugardaddy", "sugar baby", "sugarbaby",
  "findom",
  "onlyfans.com", "fansly", "manyvids",
  // Tráfico / exploração — sinais claros
  "underage", "under age",
  "lolita", "schoolgirl", "school girl",
  "virgin",
  "barely legal",
  "new girl", "new arrival",
  // Substâncias
  "420 friendly", "420friendly",
  "pnp", "party and play",
  // Eufemismos clássicos de pagamento por sexo
  "roses", "donations",
  "quickie",
];

const YELLOW_TERMS = [
  // Borderline — contexto define, vai para revisão manual
  "bdsm", "bondage",
  "fetish",
  "prostate",
  "lingam", "yoni",
  "nude ", " nude", "nudes", "nudity",
  "overnight", "over night",
  " sex ", " cum ",
];

// Normalize text for matching (lowercase, collapse whitespace)
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")  // Remove punctuation
    .replace(/\s+/g, " ")       // Collapse whitespace
    .trim();
}

/**
 * Scan text for prohibited/flagged content.
 * @param {string} text — text to scan (title + description combined)
 * @returns {{ blocked: string[], flagged: string[], hasBlocked: boolean, hasFlagged: boolean }}
 */
export function scanContent(text) {
  const normalized = " " + normalize(text) + " ";

  const blocked = [];
  const flagged = [];

  for (const term of RED_TERMS) {
    const normalizedTerm = normalize(term);
    if (normalized.includes(normalizedTerm)) {
      // Avoid duplicate matches (e.g. "escort" matching "escorts")
      if (!blocked.some(b => b.includes(normalizedTerm) || normalizedTerm.includes(b))) {
        blocked.push(term.trim());
      }
    }
  }

  for (const term of YELLOW_TERMS) {
    const normalizedTerm = normalize(term);
    if (normalized.includes(normalizedTerm)) {
      if (!flagged.some(f => f.includes(normalizedTerm) || normalizedTerm.includes(f))) {
        flagged.push(term.trim());
      }
    }
  }

  return {
    blocked,
    flagged,
    hasBlocked: blocked.length > 0,
    hasFlagged: flagged.length > 0,
  };
}

/**
 * Quick check — returns true if content has any RED terms.
 */
export function isBlocked(text) {
  return scanContent(text).hasBlocked;
}

// For use in server-side (API routes) — CommonJS compatible export
export default { scanContent, isBlocked };
