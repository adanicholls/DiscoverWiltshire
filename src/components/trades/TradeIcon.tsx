import {
  AppWindow,
  Bath,
  BrickWall,
  Briefcase,
  Bug,
  Building2,
  Calculator,
  Camera,
  Car,
  CookingPot,
  Droplets,
  Flower2,
  Gauge,
  HardHat,
  Hammer,
  House,
  KeyRound,
  Layers,
  LayoutGrid,
  PaintRoller,
  PawPrint,
  PiggyBank,
  Route,
  Scale,
  Scissors,
  Shovel,
  Smile,
  Sparkles,
  SprayCan,
  Sun,
  TreePine,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Icons are from Lucide (https://lucide.dev, ISC licence) - a free, open-source
// outline icon set that matches the line style used elsewhere on the site.
//
// Trade categories are admin-editable, so this is keyed by category id and any
// id not listed here (a category added later in /admin/categories) falls back
// to a generic briefcase - add a line below to give a new category its own.
const ICONS: Record<string, LucideIcon> = {
  painters: PaintRoller,
  plumbers: Droplets,
  electricians: Zap,
  builders: HardHat,
  roofers: House,
  carpenters: Hammer,
  plasterers: BrickWall,
  tilers: LayoutGrid,
  flooring: Layers,
  "kitchen-fitters": CookingPot,
  "bathroom-fitters": Bath,
  gardeners: Shovel,
  "tree-surgeons": TreePine,
  cleaners: SprayCan,
  "window-cleaners": AppWindow,
  locksmiths: KeyRound,
  handymen: Wrench,
  removals: Truck,
  "pest-control": Bug,
  driveways: Route,
  accountants: Calculator,
  solicitors: Scale,
  "financial-advisers": PiggyBank,
  "estate-agents": Building2,
  vets: PawPrint,
  dentists: Smile,
  hairdressers: Scissors,
  "beauty-salons": Sparkles,
  "driving-instructors": Car,
  photographers: Camera,
  motoring: Gauge,
  solar: Sun,
  "garden-centres": Flower2,
};

/** The icon for a trade category, in a rounded tile. Decorative: the
 * category's name always appears beside it. */
export default function TradeIcon({ id, size = 22, className = "" }: { id: string; size?: number; className?: string }) {
  const Icon = ICONS[id] ?? Briefcase;
  return (
    <span className={`trade-icon ${className}`.trim()} aria-hidden="true">
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}
