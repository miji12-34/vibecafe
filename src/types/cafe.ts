export type OutletLevel = "many" | "some" | "few" | "none";
export type NoiseLevel = "quiet" | "normal" | "loud";
export type WorkFit = "good" | "ok" | "bad";

export interface Cafe {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  naver_place_url: string;
  /** "HH:MM" — 자정 이후 마감은 "00:00", "02:00" 형태 */
  open_time: string;
  close_time: string;
  is_24h: boolean;
  iced_americano_price: number;
  outlet: OutletLevel;
  wifi: boolean;
  noise: NoiseLevel;
  work_fit: WorkFit;
  tags: string[];
}

export const OUTLET_LABEL: Record<OutletLevel, string> = {
  many: "많음",
  some: "보통",
  few: "적음",
  none: "없음",
};

export const NOISE_LABEL: Record<NoiseLevel, string> = {
  quiet: "조용함",
  normal: "보통",
  loud: "시끄러움",
};

export const WORK_FIT_LABEL: Record<WorkFit, string> = {
  good: "작업 좋음",
  ok: "작업 무난",
  bad: "작업 비추",
};
