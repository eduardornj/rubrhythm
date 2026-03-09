/**
 * lib/feature-pricing.js
 *
 * Single source of truth for Feature tier pricing.
 * All durations are in days, all costs are in credits.
 */

export const FEATURE_TIERS = {
    BASIC: {
        label: 'Feature',
        description: 'Appear in the Featured section. Open to all providers.',
        requiresVerification: false,
        priority: 2,
        rotationWeight: 0.37,
        badge: '⭐ Featured',
        pricing: {
            7: 15,  // 7 days  = 15 credits
            30: 45,  // 30 days = 45 credits
        },
    },
    PREMIUM: {
        label: 'Feature Premium',
        description: 'Top-priority Featured placement. Requires verified account.',
        requiresVerification: true,
        priority: 1,
        rotationWeight: 0.63,
        badge: '💎 Featured Premium',
        pricing: {
            7: 20,  // 7 days  = 20 credits
            30: 60,  // 30 days = 60 credits
        },
    },
};

export const VALID_TIERS = Object.keys(FEATURE_TIERS);          // ['BASIC', 'PREMIUM']
export const VALID_DURATIONS = [7, 30];

/**
 * Returns the credit cost for a given tier and duration.
 * @param {'BASIC'|'PREMIUM'} tier
 * @param {7|30} duration - days
 * @returns {number} credit cost
 */
export function getFeatureCost(tier, duration) {
    const tierConfig = FEATURE_TIERS[tier];
    if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);
    const cost = tierConfig.pricing[duration];
    if (cost === undefined) throw new Error(`Invalid duration: ${duration}`);
    return cost;
}
