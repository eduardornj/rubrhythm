import prisma from "@/lib/prisma";

// Cache sitemap for 12 hours — bots request this constantly, no need to hit DB every time
export const revalidate = 43200;

export default async function sitemap() {
  const baseUrl = "https://rubrhythm.com";

  // Static pages
  const staticPages = [
    "",
    "/get-verified",
    "/rubrhythm-credits",
    "/register-on-rubrhythm",
    "/letter-from-staff",
    "/info/terms",
    "/info/privacy-policy",
    "/info/law-and-legal",
    "/info/anti-trafficking",
    "/info/section-2257",
    "/info/get-help-from-staff",
    "/about",
    "/how-it-works",
    "/for-providers",
    "/for-clients",
    "/safety-guide",
    "/verification-guide",
    "/glossary",
    "/contact",
    "/why-verification-matters",
    "/united-states",
    "/blog",
    "/blog/how-to-find-legitimate-massage-provider",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  // Dynamic: active listings grouped by state/city
  let cityPages = [];
  let listingPages = [];

  try {
    // Get unique state/city combos from active listings
    const locations = await prisma.listing.findMany({
      where: { isActive: true, isApproved: true },
      select: { state: true, city: true, id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    // Unique states
    const states = [...new Set(locations.map((l) => l.state))];
    const statePages = states.map((state) => ({
      url: `${baseUrl}/united-states/${state.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Unique state+city combos
    const citySet = new Set();
    locations.forEach((l) => {
      const key = `${l.state}|${l.city}`;
      if (!citySet.has(key)) {
        citySet.add(key);
        cityPages.push({
          url: `${baseUrl}/united-states/${l.state.toLowerCase().replace(/\s+/g, "-")}/${l.city.toLowerCase().replace(/\s+/g, "-")}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
    });

    cityPages = [...statePages, ...cityPages];

    // Individual listing pages (limit to 1000 most recent)
    listingPages = locations.slice(0, 1000).map((l) => {
      const stateSlug = l.state.toLowerCase().replace(/\s+/g, "-");
      const citySlug = l.city.toLowerCase().replace(/\s+/g, "-");
      const titleSlug = (l.title || l.id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/united-states/${stateSlug}/${citySlug}/massagists/${titleSlug}-${l.id}`,
        lastModified: l.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error("[Sitemap] Error fetching dynamic data:", error);
  }

  return [...staticPages, ...cityPages, ...listingPages];
}
