import Image from "next/image";

// next/image only accepts hosts listed in next.config.ts, and *throws* during
// render for anything else - which would take a whole page down because of
// one odd value in a database column (these URLs can be edited by hand in
// Supabase). So: images from our own two Storage buckets go through the
// optimiser; anything else falls back to a plain <img>.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const OPTIMISED_PREFIXES = SUPABASE_URL
  ? ["sponsor-images", "journal-images"].map((bucket) => `${SUPABASE_URL}/storage/v1/object/public/${bucket}/`)
  : [];

interface Props {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** Fills its (position: relative) parent, cropping to cover it. */
export default function RemoteImage({ src, alt, sizes, className, priority }: Props) {
  if (OPTIMISED_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
