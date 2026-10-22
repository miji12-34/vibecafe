import type { Cafe } from "@/types/cafe";

const DAY = 24 * 60;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// 마감이 시작보다 이르거나 같으면(예: 12:00–00:00, 08:00–02:00) 익일 마감으로 본다.
function closeMinutes(cafe: Cafe): number {
  const open = toMinutes(cafe.open_time);
  const close = toMinutes(cafe.close_time);
  return close <= open ? close + DAY : close;
}

export function isOpenAt(cafe: Cafe, date: Date): boolean {
  if (cafe.is_24h) return true;
  const open = toMinutes(cafe.open_time);
  const close = closeMinutes(cafe);
  const now = date.getHours() * 60 + date.getMinutes();
  return (now >= open && now < close) || (now + DAY >= open && now + DAY < close);
}

export function formatHours(cafe: Cafe): string {
  if (cafe.is_24h) return "24시간";
  if (cafe.close_time === "00:00") return `${cafe.open_time} – 24:00`;
  const overnight = closeMinutes(cafe) > DAY;
  return `${cafe.open_time} – ${overnight ? "익일 " : ""}${cafe.close_time}`;
}
