import type { Metadata } from "next";
import HeroBanner from "@/components/home/HeroBanner";
import HomeFeed from "@/components/home/HomeFeed";

export const metadata: Metadata = {
  title: "Discover Wiltshire — the county's favourites, ranked by the people who live here",
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;

  return (
    <>
      <HeroBanner />
      <HomeFeed town={town} />
    </>
  );
}
