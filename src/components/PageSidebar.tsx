import SponsorCard from "@/components/SponsorCard";
import SidebarEvents from "@/components/SidebarEvents";
import type { SponsorTargetType } from "@/lib/store";

interface Props {
  /** Which page is being sponsored - a category (eat-drink, plumbers...) or a town. */
  sponsor: { type: SponsorTargetType; id: string; label: string };
  /** Narrows the events card to one town (a town page, or a category page filtered by ?town=). */
  town?: string;
}

/** The right-hand column shared by every category page and town page: this
 * page's sponsor above the upcoming events. Goes inside a
 * `.home-layout.home-layout--single-row` next to a `.home-main`. */
export default function PageSidebar({ sponsor, town }: Props) {
  return (
    <aside className="home-sidebar">
      <SponsorCard type={sponsor.type} id={sponsor.id} label={sponsor.label} />
      <SidebarEvents town={town} />
    </aside>
  );
}
