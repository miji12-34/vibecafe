// 카카오맵 SDK 중 이 프로젝트에서 쓰는 부분만 선언한다.
declare namespace kakao.maps {
  function load(callback: () => void): void;

  class LatLng {
    constructor(lat: number, lng: number);
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
    relayout(): void;
    setCenter(latlng: LatLng): void;
    panBy(dx: number, dy: number): void;
  }

  class Marker {
    constructor(options: { position: LatLng; map?: Map; title?: string });
    setMap(map: Map | null): void;
  }


  namespace event {
    function addListener(target: Marker | Map, type: string, handler: () => void): void;
  }
}

interface Window {
  kakao: typeof kakao;
}
