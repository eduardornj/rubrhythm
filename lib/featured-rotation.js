/**
 * lib/featured-rotation.js
 *
 * Weighted slot allocation for the featured listings rotation system.
 * Pure function — no DB access, fully testable.
 *
 * Rules:
 *   - Max 8 listings shown in the featured section per city
 *   - If total ≤ 8 → show all, PREMIUM first
 *   - If total > 8 → weighted pick: PREMIUM gets 63%, BASIC gets 37%
 *   - When one tier has fewer than its target slots, overflow goes to the other
 */

const MAX_FEATURED_SLOTS = 8;
const PREMIUM_WEIGHT = 0.63;

/**
 * Shuffles an array in-place using Fisher-Yates.
 * @param {Array} arr
 * @returns {Array} same array, shuffled
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Picks up to `maxSlots` listings using weighted tier allocation.
 *
 * @param {Array} premiumListings - Listings with featureTier === 'PREMIUM'
 * @param {Array} basicListings   - Listings with featureTier === 'BASIC'
 * @param {number} maxSlots       - Max slots to fill (default 8)
 * @returns {{ listings: Array, meta: object }}
 */
export function pickFeaturedSlots(premiumListings = [], basicListings = [], maxSlots = MAX_FEATURED_SLOTS) {
    const totalAvailable = premiumListings.length + basicListings.length;

    // No rotation needed — return everything, PREMIUM first
    if (totalAvailable <= maxSlots) {
        return {
            listings: [...premiumListings, ...basicListings],
            meta: {
                rotation: false,
                premiumCount: premiumListings.length,
                basicCount: basicListings.length,
                total: totalAvailable,
            },
        };
    }

    // Rotation mode — need to pick exactly maxSlots
    const targetPremium = Math.round(maxSlots * PREMIUM_WEIGHT); // 5
    const targetBasic = maxSlots - targetPremium;                 // 3

    // Shuffle both pools so rotation is fair within each tier
    const premiumPool = shuffle([...premiumListings]);
    const basicPool = shuffle([...basicListings]);

    // Pick with overflow: if one tier is short, give extra slots to the other
    let premiumPick = Math.min(targetPremium, premiumPool.length);
    let basicPick = Math.min(targetBasic, basicPool.length);

    // Redistribute unused slots
    if (premiumPick < targetPremium) {
        basicPick = Math.min(basicPool.length, maxSlots - premiumPick);
    } else if (basicPick < targetBasic) {
        premiumPick = Math.min(premiumPool.length, maxSlots - basicPick);
    }

    const selected = [
        ...premiumPool.slice(0, premiumPick),
        ...basicPool.slice(0, basicPick),
    ];

    return {
        listings: selected,
        meta: {
            rotation: true,
            premiumCount: premiumPick,
            basicCount: basicPick,
            total: selected.length,
            totalPool: totalAvailable,
        },
    };
}

/**
 * Convenience: accepts a combined array with featureTier field,
 * splits internally and applies the weighted pick.
 *
 * @param {Array} allFeaturedListings - Any listing with featureTier field
 * @param {number} maxSlots
 * @returns {{ listings: Array, meta: object }}
 */
export function applyFeaturedRotation(allFeaturedListings = [], maxSlots = MAX_FEATURED_SLOTS) {
    const premium = allFeaturedListings.filter(l => l.featureTier === 'PREMIUM');
    const basic = allFeaturedListings.filter(l => l.featureTier === 'BASIC' || !l.featureTier);

    return pickFeaturedSlots(premium, basic, maxSlots);
}

export { MAX_FEATURED_SLOTS, PREMIUM_WEIGHT };
