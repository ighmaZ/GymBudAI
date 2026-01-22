import { Navbar, Features, ScrollyTelling } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar />
      <main className="pb-20">
        <ScrollyTelling />
        <Features />
      </main>
    </div>
  );
}
