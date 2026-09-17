import Image from "next/image";

/** Bolt B is Bouldy's selected app mark. It scales from header lockup to app icon. */
export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-wordmark${compact ? " brand-wordmark--compact" : ""}`}>
      <Image
        src="/brand/bolt-b.svg"
        alt=""
        width={36}
        height={36}
        className="brand-wordmark__mark"
        unoptimized
      />
      {!compact ? <span>bouldy<span className="text-accent">.</span></span> : null}
    </span>
  );
}
