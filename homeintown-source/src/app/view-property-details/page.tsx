"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { apiRequest } from "@/lib/api";

interface PropertyDetail {
  id: string;
  projectName: string;
  location: string;
  city: string;
  builderName: string;
  projectType: string;
  projectStatus: string;
  pricing: {
    startingPrice: number;
    pricePerSqFt: number;
  };
  configuration: {
    bhkOptions: string[];
    carpetAreaRange: string;
  };
  amenities: string[];
  media: {
    coverImage?: { url: string };
    galleryImages?: { url: string }[];
  };
  cta: {
    whatsappNumber: string;
    callNumber: string;
    buttonText: string;
  };
}

function PropertyDetailsContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProperty = async () => {
    try {
      const data = await apiRequest<PropertyDetail>(`public/projects/${slug}`);
      setProperty(data);
    } catch (err) {
      setError("Property not found");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || "Property not found."}</p>
      </div>
    );
  }

  const coverUrl = property.media?.coverImage?.url || "/property.jpg";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image */}
      <div className="relative h-[350px] w-full rounded-xl overflow-hidden mb-6">
        <Image
          src={coverUrl}
          alt={property.projectName}
          fill
          className="object-cover"
        />
        <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
          {property.projectStatus}
        </span>
      </div>

      {/* Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">{property.projectName}</h1>
        <p className="text-gray-600 mt-1">
          {property.location}, {property.city}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Builder: <span className="font-medium">{property.builderName}</span>
        </p>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Starting Price</p>
            <p className="text-xl font-bold text-green-700">
              ₹{property.pricing.startingPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Price per Sq. Ft.</p>
            <p className="text-xl font-bold text-gray-800">
              ₹{property.pricing.pricePerSqFt.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Configuration */}
        {property.configuration.bhkOptions.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">Configuration</h3>
            <div className="flex gap-2 mt-2 flex-wrap">
              {property.configuration.bhkOptions.map((bhk) => (
                <span
                  key={bhk}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                >
                  {bhk}
                </span>
              ))}
            </div>
            {property.configuration.carpetAreaRange && (
              <p className="text-sm text-gray-500 mt-2">
                Area: {property.configuration.carpetAreaRange}
              </p>
            )}
          </div>
        )}

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">Amenities</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {property.amenities.map((a, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-amber-50 text-gray-700 text-sm rounded-full border border-amber-200"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3 mt-8">
          <a
            href={`https://wa.me/${property.cta.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
          >
            💬 WhatsApp
          </a>
          <a
            href={`tel:${property.cta.callNumber}`}
            className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition"
          >
            📞 Call
          </a>
        </div>
      </div>

      {/* Gallery */}
      {property.media?.galleryImages && property.media.galleryImages.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-800 mb-3">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {property.media.galleryImages.map((img, i) => (
              <div key={i} className="relative h-[150px] rounded-lg overflow-hidden">
                <Image src={img.url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewPropertyDetailsPage() {
  return (
    <div>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        }
      >
        <PropertyDetailsContent />
      </Suspense>
    </div>
  );
}
