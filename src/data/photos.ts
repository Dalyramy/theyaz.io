
export interface Photo {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  tags: string[];
}

export const photos: Photo[] = [
  {
    id: "1",
    title: "Mountain Sunrise",
    caption: "Beautiful sunrise captured from the mountain peak after a challenging hike.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
    date: "2025-04-20",
    tags: ["nature", "mountains", "sunrise"]
  },
  {
    id: "2",
    title: "Urban Geometry",
    caption: "Fascinating geometric patterns from modern architecture in the city center.",
    imageUrl: "https://images.unsplash.com/photo-1486728297118-82a07bc48a28?q=80&w=2069",
    date: "2025-04-18",
    tags: ["urban", "architecture", "geometry"]
  },
  {
    id: "3",
    title: "Ocean Waves",
    caption: "Mesmerizing ocean waves captured during sunset at the coastal shore.",
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2057",
    date: "2025-04-15",
    tags: ["ocean", "waves", "sunset"]
  },
  {
    id: "4",
    title: "Forest Paths",
    caption: "Mysterious forest path through the ancient redwoods, dappled with morning light.",
    imageUrl: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?q=80&w=2070",
    date: "2025-04-12",
    tags: ["forest", "nature", "path"]
  },
  {
    id: "5",
    title: "City Lights",
    caption: "City skyline illuminated at night, creating a magical urban landscape.",
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2113",
    date: "2025-04-10",
    tags: ["city", "night", "lights"]
  },
  {
    id: "6",
    title: "Desert Tranquility",
    caption: "The peaceful solitude of sand dunes stretching to the horizon.",
    imageUrl: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070",
    date: "2025-04-05",
    tags: ["desert", "landscape", "tranquility"]
  }
];
