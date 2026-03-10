// lib/contentFilter.js
// Content filter for RubRhythm — detects prohibited and flagged terms in listings.
// Used on: provider listing form (real-time), API (block/flag), admin panel (highlight).

// RED = blocked (listing rejected automatically, provider warned)
// YELLOW = flagged (listing allowed but flagged for admin review)

const RED_TERMS = [
  // Sexual services — explicit
  "escort", "escorts", "escorting",
  "prostitut", "prostitu",
  "full service", "fs ", " fs",
  "happy ending", "happy endings", "happyending",
  "hand job", "handjob", "handjobs", "hj ",
  "blow job", "blowjob", "blowjobs", "bj ",
  "oral sex", "anal sex", "anal",
  "sex ", " sex", "sexual intercourse",
  "gfe", "girlfriend experience",
  "pse", "porn star experience",
  "bbbj", "bbfs", "cim", "cof", "cob",
  "bareback",
  "cum ", " cum", "cumshot",
  "orgasm",
  "porn", "porno", "pornstar",
  "naked",
  "dildo", "vibrator",
  "bdsm", "bondage", "dominat", "submissiv",
  "strip", "stripper", "striptease",
  "erotic massage", "erotic touch",
  "tantric sex",
  "rub and tug", "rubandtug", "rub n tug",
  "massage with happy ending",
  "sensual release",
  "full body to body",
  "nuru gel",
  "mutual touch", "mutual massage",
  "sugar daddy", "sugardaddy", "sugar baby", "sugarbaby",
  "findom",
  "onlyfans.com", "fansly", "manyvids",
  // Trafficking / exploitation signals
  "underage", "under age", "minor",
  "teen ", " teen", "teens", "teenage",
  "lolita", "schoolgirl", "school girl",
  "virgin",
  "barely legal",
  "fresh off the boat", "fob ",
  // Illegal substances
  "420 friendly", "420friendly", "party friendly", "partyfriendly",
  "pnp", "party and play", "partyandplay",
  "roses", "donations",
  // Code words commonly used
  "greek", "french kiss", "french kissing",
  "covered ", "uncovered",
  "bbw special",
  "incall special",
  "quickie",
];

const YELLOW_TERMS = [
  // Borderline — could be legit massage but needs review
  "sensual", "intimate",
  "body to body", "b2b", "bodytobody",
  "nuru",
  "tantric",
  "fetish",
  "nude ", " nude", "nudes", "nudity",
  "prostate",
  "lingam", "yoni",
  "happy",
  "extra service", "extras",
  "special service", "specials",
  "private session", "private sessions",
  "discreet", "discretion",
  "no rush", "norush",
  "overnight", "over night",
  "cash only", "cashonly", "cash app", "cashapp", "venmo", "zelle",
  "hotel visit", "hotel visits",
  "available now", "avail now",
  "new in town", "new girl", "new arrival",
  "real photos", "real pics",
  "100%", "no fake",
  "satisfaction", "guaranteed",
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
