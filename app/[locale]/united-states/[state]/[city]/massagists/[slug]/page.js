import prisma from "@lib/prisma.js";
import { formatImageUrls } from "@/lib/json-utils";
import ListingProfileClient from "./ListingProfileClient";

const SITE = process.env.NEXTAUTH_URL || "https://rubrhythm.com";

function extractIdFromSlug(slug) {
  const parts = slug.split("-");
  return parts.length >= 5 ? parts.slice(-5).join("-") : parts.at(-1);
}

export async function generateMetadata({ params }) {
  const { state, city, slug } = await params;
  const id = extractIdFromSlug(slug);

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        images: true,
        user: { select: { name: true, verified: true } },
      },
    });

    if (!listing) {
      return { title: "Listing Not Found | RubRhythm" };
    }

    const formattedCity = city.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const formattedState = state.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const title = `${listing.title} in ${formattedCity}, ${formattedState}`;
    const description = listing.description
      ? listing.description.slice(0, 155) + (listing.description.length > 155 ? "\u2026" : "")
      : `Book a session with ${listing.title} in ${formattedCity}, ${formattedState}. Verified provider on RubRhythm.`;

    const pageUrl = `${SITE}/united-states/${state}/${city}/massagists/${slug}`;

    const images = formatImageUrls(listing.images);
    const ogImage = images[0] || `${SITE}/opengraph-image`;

    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: "RubRhythm",
        locale: "en_US",
        type: "profile",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: listing.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "RubRhythm - Body Rubs & Massage Directory" };
  }
}

export default function ListingProfilePage(props) {
  return <ListingProfileClient {...props} />;
}
