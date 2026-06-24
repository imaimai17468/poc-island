import { ServiceCard } from "./ServiceCard";

type Service = {
  id: string;
  name: string;
  prompt: string;
  description: string | null;
  url: string;
  createdAt: Date | string;
};

type GalleryGridProps = {
  services: Service[];
};

export const GalleryGrid = ({ services }: GalleryGridProps) => {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-muted-foreground text-lg">No services yet</p>
        <p className="text-muted-foreground text-sm">
          Generated services will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} {...service} />
      ))}
    </div>
  );
};
