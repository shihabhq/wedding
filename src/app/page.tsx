"use client";

import { useState } from "react";
import EnvelopeGate from "@/components/envelope-gate";
import Hero from "@/components/hero";

export default function Home() {
  const [gateClosed, setGateClosed] = useState(false);

  return (
    <>
      <EnvelopeGate onClosed={() => setGateClosed(true)} />
      <main className="w-full">
        <Hero gateClosed={gateClosed} />
      </main>
    </>
  );
}
