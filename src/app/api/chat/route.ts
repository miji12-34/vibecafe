import OpenAI from "openai";
import { getCafes } from "@/lib/cafes";
import type { ChatMessage, ChatResponse } from "@/types/chat";

const MODEL = "gpt-6-luna";
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 1000;

const SYSTEM_PROMPT = `너는 '느좋카페'의 카페 추천 도우미다. 노트북 작업하기 좋은 카페를 찾는 사용자와 한국어로 짧고 친근하게 대화한다.

규칙:
- 아래 [카페 데이터]에 있는 카페만 추천한다. 목록에 없는 카페, 메뉴, 좌석 수, 분위기 등 데이터에 없는 정보는 절대 지어내지 않는다. 모르는 것은 "데이터에 없다"고 말한다.
- 조건이 모호하면 추천하기 전에 한 번에 하나씩 짧게 되묻는다 (예: 시간대, 콘센트 필요 여부, 조용함 선호).
- 추천은 최대 3곳. recommendations에 카페 id와 데이터 근거가 담긴 한 문장 이유를 넣는다. 추천하지 않는 응답이면 빈 배열.
- reply에는 대화 내용만 쓰고, 추천 카페의 상세 정보를 길게 나열하지 않는다 (화면에 카드로 따로 보여준다).
- 필드 의미: outlet(many 많음, some 보통), wifi(true 있음), noise(quiet 조용, normal 보통), work_fit(good 작업 좋음, ok 무난), close_time이 open_time보다 이르거나 같으면 익일 마감.`;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  // 키는 서버 환경변수에서만 읽는다 (로컬: .env.local, 배포: Vercel 환경변수).
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function parseMessages(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const parsed: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if ((m?.role !== "user" && m?.role !== "assistant") || typeof m.content !== "string") return null;
    parsed.push({ role: m.role, content: m.content.slice(0, MAX_CONTENT_LENGTH) });
  }
  return parsed;
}

function nowInSeoul(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "서버에 OPENAI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const cafes = await getCafes();
  const cafeIds = cafes.map((cafe) => cafe.id);
  const cafeData = cafes.map(({ naver_place_url: _url, lat: _lat, lng: _lng, ...rest }) => rest);

  try {
    const response = await getClient().responses.create({
      model: MODEL,
      reasoning: { effort: "none" },
      instructions: `${SYSTEM_PROMPT}\n\n현재 시각(서울): ${nowInSeoul()}\n\n[카페 데이터]\n${JSON.stringify(cafeData)}`,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      text: {
        format: {
          type: "json_schema",
          name: "cafe_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reply: { type: "string" },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", enum: cafeIds },
                    reason: { type: "string" },
                  },
                  required: ["id", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["reply", "recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.output_text) as ChatResponse;
    // 스키마 enum과 별개로, 실제 등록된 카페만 내려보낸다.
    const recommendations = result.recommendations.filter((r) => cafeIds.includes(r.id)).slice(0, 3);
    return Response.json({ reply: result.reply, recommendations } satisfies ChatResponse);
  } catch (error) {
    console.error("[api/chat]", error);
    return Response.json({ error: "추천을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
