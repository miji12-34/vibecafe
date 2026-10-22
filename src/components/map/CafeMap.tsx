"use client";

import { useEffect, useRef } from "react";
import type { Cafe } from "@/types/cafe";
import { useKakaoLoader } from "./useKakaoLoader";

// 송파·잠실 (데이터가 없을 때의 기본 중심)
const DEFAULT_CENTER = { lat: 37.5079, lng: 127.0898 };

interface CafeMapProps {
  cafes: Cafe[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMapClick: () => void;
}

export default function CafeMap({ cafes, selectedId, onSelect, onMapClick }: CafeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const status = useKakaoLoader();

  // 지도를 다시 만들지 않도록 콜백은 ref로 최신 값만 참조한다.
  const handlersRef = useRef({ onSelect, onMapClick });
  handlersRef.current = { onSelect, onMapClick };

  useEffect(() => {
    if (status !== "ready" || !containerRef.current) return;
    const { maps } = window.kakao;

    const map = new maps.Map(containerRef.current, {
      center: new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 5,
    });
    mapRef.current = map;

    const bounds = new maps.LatLngBounds();
    const markers = cafes.map((cafe) => {
      const position = new maps.LatLng(cafe.lat, cafe.lng);
      bounds.extend(position);

      const marker = new maps.Marker({ map, position, title: cafe.name });
      maps.event.addListener(marker, "click", () => handlersRef.current.onSelect(cafe.id));
      return marker;
    });
    maps.event.addListener(map, "click", () => handlersRef.current.onMapClick());

    if (cafes.length > 0) map.setBounds(bounds, 60, 40, 40, 40);

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      mapRef.current = null;
    };
  }, [status, cafes]);

  // 선택된 카페를 상세 카드에 가리지 않도록 화면 위쪽으로 옮긴다.
  useEffect(() => {
    const map = mapRef.current;
    const cafe = cafes.find((c) => c.id === selectedId);
    if (!map || !cafe || !containerRef.current) return;
    const { maps } = window.kakao;

    map.setCenter(new maps.LatLng(cafe.lat, cafe.lng));
    const offsetY = containerRef.current.clientHeight * 0.25;
    map.panBy(0, offsetY);
  }, [selectedId, cafes]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
          {status === "loading"
            ? "지도를 불러오는 중…"
            : "지도를 불러오지 못했습니다. 카카오 앱 키와 도메인 등록을 확인해 주세요."}
        </div>
      )}
    </div>
  );
}
