"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, MessageCircle, Send, X } from "lucide-react";
import type { Cafe } from "@/types/cafe";
import type { ChatMessage, ChatResponse } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ChatWidgetProps {
  cafes: Cafe[];
  onSelectCafe: (id: string) => void;
  /** 상세 카드가 열려 있을 때는 떠 있는 버튼을 숨긴다 (모바일에서 겹침 방지) */
  hideButton: boolean;
}

// 이전 추천 내역도 모델이 알 수 있도록 대화 기록에 카페 이름과 id를 덧붙인다.
function toApiMessage(message: ChatMessage, cafes: Cafe[]) {
  if (!message.recommendations?.length) return { role: message.role, content: message.content };
  const names = message.recommendations
    .map((r) => `${cafes.find((c) => c.id === r.id)?.name}(${r.id})`)
    .join(", ");
  return { role: message.role, content: `${message.content}\n(추천한 카페: ${names})` };
}

export default function ChatWidget({ cafes, onSelectCafe, hideButton }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => toApiMessage(m, cafes)) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "추천을 가져오지 못했습니다.");

      const { reply, recommendations } = data as ChatResponse;
      setMessages([...next, { role: "assistant", content: reply, recommendations }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "추천을 가져오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function selectCafe(id: string) {
    onSelectCafe(id);
    setOpen(false);
  }

  if (!open) {
    if (hideButton) return null;
    return (
      <Button
        onClick={() => setOpen(true)}
        aria-label="AI 카페 추천 열기"
        className="fixed right-4 bottom-4 z-20 size-14 rounded-full shadow-lg"
      >
        <MessageCircle className="size-6" />
      </Button>
    );
  }

  return (
    <Card
      role="dialog"
      aria-label="AI 카페 추천"
      className="fixed inset-x-0 bottom-0 z-30 h-[85dvh] gap-0 rounded-b-none py-0 shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:h-[600px] sm:max-h-[calc(100dvh-2rem)] sm:w-96 sm:rounded-b-xl"
    >
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">AI 카페 추천</h2>
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="채팅 닫기">
          <X />
        </Button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <Bubble role="assistant">
          안녕하세요! 어떤 카페를 찾으세요? 시간대, 콘센트, 조용함처럼 원하는 조건을 편하게 말해 주세요.
        </Bubble>

        {messages.map((message, i) => (
          <div key={i} className="space-y-2">
            <Bubble role={message.role}>{message.content}</Bubble>
            {message.recommendations?.map((rec) => {
              const cafe = cafes.find((c) => c.id === rec.id);
              if (!cafe) return null;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => selectCafe(rec.id)}
                  className="block w-[85%] rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <MapPin className="size-3.5 text-positive" aria-hidden />
                    {cafe.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{rec.reason}</span>
                </button>
              );
            })}
          </div>
        ))}

        {loading && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            카페를 찾는 중…
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 밤늦게까지 조용한 곳"
          aria-label="메시지 입력"
          maxLength={500}
          className="h-10"
        />
        <Button type="submit" size="icon-lg" className="size-10" disabled={loading || !input.trim()} aria-label="보내기">
          <Send />
        </Button>
      </form>
    </Card>
  );
}

function Bubble({ role, children }: { role: ChatMessage["role"]; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "w-fit max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
        role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
      )}
    >
      {children}
    </div>
  );
}
