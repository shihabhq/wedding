import EnvelopeGate from "@/components/envelope-gate";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <>
      <EnvelopeGate />
      <main className="w-full bg-sand">
        <Hero />
      </main>
    </>
  );
}
