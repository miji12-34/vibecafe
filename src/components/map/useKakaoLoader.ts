"use client";

import { useEffect, useState } from "react";

type LoaderState = "loading" | "ready" | "error";

let loadPromise: Promise<void> | null = null;

// SDK 스크립트는 페이지당 한 번만 삽입한다.
function loadKakaoSdk(appKey: string): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useKakaoLoader(): LoaderState {
  const [state, setState] = useState<LoaderState>("loading");

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appKey) {
      setState("error");
      return;
    }
    loadKakaoSdk(appKey)
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, []);

  return state;
}
