// Página unificada para massagists
import MainLayout from '@components/MainLayout';
import ProfileInfo from '../../../../../components/ProfileInfo';
import Sidebar from '../../../../../components/Sidebar';
import Image from "next/image";
import locations from "../../../../../data/datalocations.js";
import prisma from "../../../../../lib/prisma.js";
import { getFirstListingImage, processListingImages } from "@/lib/image-utils";
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
      url: `/united-states/${listing.state.toLowerCase().replace(/\s+/g, '-')}/${listing.city.toLowerCase().replace(/\s+/g, '-')}/massagists/${listing.id}`,
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
      imageUrl: listing.imageUrl || '/default-image.svg',
      images: listing.images,
      location: `${listing.city}, ${listing.state.toUpperCase()}`,
      bodyType: listing.bodyType || 'N/A',
      ethnicity: listing.ethnicity || 'N/A',
      serviceLocation: listing.serviceLocation || 'N/A',
      description: listing.description || 'No description available.',
      services: listing.services,
      contact: listing.phoneArea && listing.phoneNumber ? `${listing.phoneArea}-${listing.phoneNumber}` : 'N/A',
      telegram: listing.telegram || 'N/A',
      whatsapp: listing.whatsapp || 'N/A',
      country: listing.country || 'United States',
      state: listing.state,
      reviews: listing.reviews || [],
      user: listing.user
    };
  } catch (error) {
    profile = {
      id,
      name: 'Massagista Not Found',
      imageUrl: '/default-image.svg',
      images: [],
      location: `${city.charAt(0).toUpperCase() + city.slice(1)}, ${state.toUpperCase()}`,
      bodyType: 'N/A',
      ethnicity: 'N/A',
      serviceLocation: 'N/A',
      description: 'This massagista does not exist.',
      services: [],
      contact: 'N/A',
      telegram: 'N/A',
      whatsapp: 'N/A',
      country: 'United States',
      state,
      reviews: [],
    };
  }

  // Gera a lista de cidades do estado atual
  const currentState = locations.find(
    (loc) => loc.state.toLowerCase().replace(/\s+/g, '-') === state
  );
  const cities = currentState
    ? currentState.cities.map((c) => ({
      id: c.name,
      name: c.name,
      url: `/united-states/${state}/${c.name.toLowerCase().replace(/\s+/g, '-')}`,
      count: 0, // Ajustar com contagem real se quiser
    }))
    : [];

  // Busca posts recentes da cidade atual
  const recentPosts = await getRecentPosts(city);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Seção principal */}
        <div className="md:col-span-3">
          {/* Título com contato */}
          <h1 className="text-2xl font-bold text-text mb-4">
            {profile.telegram || profile.whatsapp
              ? `Add me ${profile.telegram ? `telegram ${profile.telegram}` : ''}${profile.telegram && profile.whatsapp ? ' / ' : ''
              }${profile.whatsapp ? `whatsapp ${profile.whatsapp}` : ''}`
              : profile.name}
          </h1>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Galeria de fotos à esquerda */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              {(() => {
                const processedImages = processListingImages(profile.images);
                return processedImages.length > 0 ? (
                  processedImages.map((img, index) => (
                    <div key={index} className="relative w-full h-32">
                      <Image
                        src={img}
                        alt={`Photo ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/default-image.svg';
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="relative w-full h-32">
                    <Image
                      src="/default-image.svg"
                      alt="No photo"
                      fill
                      unoptimized
                      className="object-cover rounded"
                    />
                  </div>
                );
              })()}
            </div>

            {/* Foto principal e infos */}
            <div className="w-full md:w-3/4">
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={getFirstListingImage(profile.images) || '/default-image.svg'}
                  alt={profile.name}
                  fill
                  unoptimized
                  className="object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/default-image.svg';
                  }}
                />
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">{profile.name}</h2>
              <p className="text-text mb-2"><strong>Title:</strong> {profile.name}</p>
              <p className="text-text mb-2"><strong>Body Type:</strong> {profile.bodyType}</p>
              <p className="text-text mb-2"><strong>Ethnicity:</strong> {profile.ethnicity}</p>
              <p className="text-text mb-2"><strong>Service Location:</strong> {profile.serviceLocation}</p>
              <p className="text-text mb-4"><strong>Description:</strong> {profile.description}</p>
              {profile.services.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-text">Services:</h3>
                  <ul className="flex flex-wrap gap-2">
                    {profile.services.map((service, index) => (
                      <li key={index} className="text-text text-sm bg-primary px-2 py-1 rounded">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-text">Contact Details:</h3>
                <p className="text-text"><strong>Phone number:</strong> {profile.contact}</p>
                <p className="text-text"><strong>Country:</strong> {profile.country}</p>
                <p className="text-text"><strong>State/Province:</strong> {profile.state}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <Sidebar cities={cities} recentPosts={recentPosts} />
        </div>
      </div>
    </MainLayout>
  );
}