import { Navbar, Hero, Features } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <main className="pb-20">
        <Hero />
        <Features />
      </main>
    </div>
  );
}
