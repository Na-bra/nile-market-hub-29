import {
  Book,
  Bike,
  Shirt,
  Laptop,
  Smartphone,
  Home,
  Utensils,
  Dumbbell,
  Gamepad2,
  Music,
  Car,
  Camera,
  Sparkles,
  Package,
  GraduationCap,
  Sofa,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const ICONS: Record<string, ComponentType<LucideProps>> = {
  book: Book,
  books: Book,
  textbook: Book,
  textbooks: Book,
  stationery: Book,
  bike: Bike,
  bicycle: Bike,
  transport: Bike,
  clothing: Shirt,
  clothes: Shirt,
  fashion: Shirt,
  apparel: Shirt,
  laptop: Laptop,
  laptops: Laptop,
  electronics: Laptop,
  computer: Laptop,
  computers: Laptop,
  phone: Smartphone,
  phones: Smartphone,
  mobile: Smartphone,
  home: Home,
  household: Home,
  kitchen: Utensils,
  food: Utensils,
  fitness: Dumbbell,
  sports: Dumbbell,
  gaming: Gamepad2,
  games: Gamepad2,
  music: Music,
  instruments: Music,
  car: Car,
  vehicles: Car,
  camera: Camera,
  photography: Camera,
  beauty: Sparkles,
  academic: GraduationCap,
  education: GraduationCap,
  furniture: Sofa,
};

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getCategoryIcon(name?: string | null): ComponentType<LucideProps> {
  if (!name) return Package;
  const n = normalize(name);
  if (ICONS[n]) return ICONS[n];
  // Try partial match
  for (const key of Object.keys(ICONS)) {
    if (n.includes(key) || key.includes(n)) return ICONS[key];
  }
  return Package;
}

interface CategoryIconProps extends LucideProps {
  name?: string | null;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = getCategoryIcon(name);
  return <Icon {...props} />;
}
