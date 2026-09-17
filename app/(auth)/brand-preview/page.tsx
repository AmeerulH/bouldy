import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandWordmark } from "@/components/brand-wordmark";

const proposals = [
  { id: "bolt-b", name: "Bolt B", letter: "A", description: "A leaning B with bolt-hole counters. Compact, friendly and unmistakably climbing hardware." },
  { id: "crux", name: "Crux", letter: "B", description: "A cut, angular B with a red finishing hold. Sharper, more athletic, more like a mark on climbing gear." },
  { id: "three-moves", name: "Three Moves", letter: "C", description: "Three holds, one upward sequence. An open, playful symbol for progress, attempt by attempt." },
];

export default function BrandPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="px-6 py-8">
      <BrandWordmark />
      <h1 className="mt-8 font-display text-4xl font-extrabold uppercase leading-none">Find our mark.</h1>
      <p className="mt-3 text-sm leading-6 text-ink-muted">Bolt B is now Bouldy’s selected app mark. The others remain here as reference proposals.</p>
      {proposals.map((logo) => (
        <section key={logo.id} className="border-b border-hairline py-8">
          <div className="flex min-h-32 items-center justify-center gap-4">
            <Image src={`/brand/proposals/${logo.id}.svg`} alt={`${logo.name} logo proposal`} width={100} height={100} unoptimized />
            <BrandWordmark />
          </div>
          <div className="my-5 flex items-center justify-center gap-6" aria-label="Small icon previews">
            <Image src={`/brand/proposals/${logo.id}.svg`} alt="" width={24} height={24} unoptimized />
            <Image src={`/brand/proposals/${logo.id}.svg`} alt="" width={40} height={40} unoptimized />
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-tint"><Image src={`/brand/proposals/${logo.id}.svg`} alt="" width={48} height={48} unoptimized /></span>
          </div>
          <h2 className="text-lg font-bold">{logo.letter}. {logo.name}{logo.id === "bolt-b" ? " · Selected" : ""}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{logo.description}</p>
          <a href={`/brand/proposals/${logo.id}.svg`} download className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4">Download SVG</a>
        </section>
      ))}
      <Link href="/welcome" className="mt-6 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Preview the welcome screen →</Link>
    </main>
  );
}
