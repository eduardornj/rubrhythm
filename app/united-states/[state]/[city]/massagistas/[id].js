// Página unificada para massagistas
import MainLayout from '@components/MainLayout';
import ProfileInfo from '../../../../../components/ProfileInfo';
import Sidebar from '../../../../../components/Sidebar';
import locations from "../../../../../data/datalocations.js";
import prisma from "../../../../../lib/prisma.js";
import { safeJsonParse } from "@/lib/json-utils";

async function getListing(id) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            verified: true,
            image: true
          }
        }
      }
    });
    if (!listing) throw new Error('Listing not found');
    return {
      ...listing,
      images: safeJsonParse(listing.images),
      services: safeJsonParse(listing.services),
      availability: safeJsonParse(listing.availability)
    };
  } catch (error) {
    throw new Error('Listing not found');
  }
}

async function getRecentPosts(city) {
  try {
    const listings = await prisma.listing.findMany({
      where: { 
        city: {
          contains: city.replace('-', ' '),
          mode: 'insensitive'
        },
        isApproved: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      url: `/united-states/${listing.state.toLowerCase().replace(/\s+/g, '-')}/${listing.city.toLowerCase().replace(/\s+/g, '-')}/massagistas/${listing.id}`,
    }));
  } catch (error) {
    return [];
  }
}

export default async function ListingPage({ params }) {
  const { id, state, city } = params;

  // Busca os dados reais do listing
  let profile;
  try {
    const listing = await getListing(id);
    profile = {
      id: listing.id,
      name: listing.title,
      description: listing.description,
      images: listing.images,
      services: listing.services,
      availability: listing.availability,
      phone: listing.phoneNumber,
      location: `${listing.city}, ${listing.state}`,
      user: listing.user
    };
  } catch (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Listing Not Found</h1>
            <p className="text-gray-600">The listing you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const recentPosts = await getRecentPosts(city);
  const location = locations.find(loc => 
    loc.state.toLowerCase().replace(/\s+/g, '-') === state && 
    loc.city.toLowerCase().replace(/\s+/g, '-') === city
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProfileInfo profile={profile} />
          </div>
          <div className="lg:col-span-1">
            <Sidebar 
              location={location} 
              recentPosts={recentPosts}
              currentPath={`/united-states/${state}/${city}/massagistas`}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}