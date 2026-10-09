import Link from "next/link";
import Image from "next/image";
import { DESTINATIONS } from "./content";

type Destination = (typeof DESTINATIONS)[number];

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link href={`/trips?${new URLSearchParams({ to: destination.tripDestination })}`}
      className={`group relative block overflow-hidden rounded-3xl shadow-lg transition-shadow hover:shadow-2xl ${destination.large ? "h-[380px] sm:h-[460px]" : "h-[220px]"}`}>
      <Image src={destination.imageUrl} alt={destination.title} fill
        sizes={destination.large ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw"}
        className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <div>
          <h3 className="font-serif text-2xl font-black text-white group-hover:text-emerald-200">{destination.title}</h3>
          <p className="mt-1.5 text-sm font-medium text-white/90">📍 {destination.location} • {destination.duration}</p>
        </div>
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-text transition-colors group-hover:bg-brand-primary group-hover:text-white">→</span>
      </div>
    </Link>
  );
}

export default function FeaturedDestinations() {
  return (
    <section id="destinations" className="w-full mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-primary">GỢI Ý ĐIỂM ĐẾN</p>
        <h2 className="font-serif text-3xl font-black text-brand-text sm:text-4xl">Điểm đến nổi bật</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {DESTINATIONS.filter((destination) => destination.large).map((destination) => (
          <div key={destination.id} className="lg:col-span-7"><DestinationCard destination={destination} /></div>
        ))}
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {DESTINATIONS.filter((destination) => !destination.large).map((destination) => <DestinationCard key={destination.id} destination={destination} />)}
        </div>
      </div>
    </section>
  );
}
