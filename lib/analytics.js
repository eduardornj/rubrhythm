// GA4 Event Tracking Helper
// Usage: import { trackEvent, analytics } from '@/lib/analytics';

export function trackEvent(eventName, params = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
}

// Pre-built events
export const analytics = {
    signUp: (role, hasReferral) => trackEvent('sign_up', { method: 'email', role, has_referral: hasReferral }),
    login: () => trackEvent('login', { method: 'credentials' }),
    search: (city, state, query) => trackEvent('search', { search_term: query || `${city}, ${state}`, city, state }),
    viewListing: (listingId, title, city, state) => trackEvent('view_item', { item_id: listingId, item_name: title, item_category: 'listing', city, state }),
    sendMessage: (listingId) => trackEvent('generate_lead', { item_id: listingId, method: 'chat' }),
    purchaseCredits: (amount, packageName) => trackEvent('purchase', { value: amount, currency: 'USD', items: [{ item_name: packageName }] }),
    phoneClick: (listingId, city) => trackEvent('phone_click', { item_id: listingId, city }),
    whatsappClick: (listingId, city) => trackEvent('whatsapp_click', { item_id: listingId, city }),
    telegramClick: (listingId, city) => trackEvent('telegram_click', { item_id: listingId, city }),
    addFavorite: (listingId, title) => trackEvent('add_to_wishlist', { item_id: listingId, item_name: title }),
    listingCreated: (title, city, state) => trackEvent('listing_created', { item_name: title, city, state }),
    verificationSubmitted: () => trackEvent('verification_submitted'),
    creditsBuy: (packageName, amount) => trackEvent('begin_checkout', { value: amount, currency: 'USD', items: [{ item_name: packageName }] }),
    pageView: (pageName) => trackEvent('page_view', { page_title: pageName }),
};
