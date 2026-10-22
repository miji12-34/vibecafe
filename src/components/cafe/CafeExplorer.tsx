"use client";

import { useCallback, useState } from "react";
import type { Cafe } from "@/types/cafe";
import CafeMap from "@/components/map/CafeMap";
import ChatWidget from "@/components/chat/ChatWidget";
import CafeDetailSheet from "./CafeDetailSheet";

// 지도, 상세 카드, 추천 챗봇이 공유하는 선택 상태를 관리한다.
export default function CafeExplorer({ cafes }: { cafes: Cafe[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = cafes.find((cafe) => cafe.id === selectedId) ?? null;
  const clearSelection = useCallback(() => setSelectedId(null), []);

  return (
    <div className="relative h-full w-full">
      <CafeMap cafes={cafes} selectedId={selectedId} onSelect={setSelectedId} onMapClick={clearSelection} />
      {selected && <CafeDetailSheet key={selected.id} cafe={selected} onClose={clearSelection} />}
      <ChatWidget cafes={cafes} onSelectCafe={setSelectedId} hideButton={selected !== null} />
    </div>
  );
}
