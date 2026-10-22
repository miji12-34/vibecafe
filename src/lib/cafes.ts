import type { Cafe } from "@/types/cafe";
import cafesData from "@data/cafes.json";

// 데이터 접근 계층: 화면은 이 함수들만 호출한다.
// 로그인·제보 단계에서 내부 구현만 DB 조회로 교체한다.
const cafes = cafesData as Cafe[];

export async function getCafes(): Promise<Cafe[]> {
  return cafes;
}

export async function getCafeById(id: string): Promise<Cafe | undefined> {
  return cafes.find((cafe) => cafe.id === id);
}
