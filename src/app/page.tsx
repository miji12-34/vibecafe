import { Coffee } from "lucide-react";
import CafeExplorer from "@/components/cafe/CafeExplorer";
import { Badge } from "@/components/ui/badge";
import { getCafes } from "@/lib/cafes";

export default async function Home() {
  const cafes = await getCafes();

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <Coffee className="size-5" aria-hidden />
          느좋카페
        </h1>
        <Badge variant="secondary">송파·잠실 · 카페 {cafes.length}곳</Badge>
      </header>
      <div className="flex-1">
        <CafeExplorer cafes={cafes} />
      </div>
    </main>
  );
}
