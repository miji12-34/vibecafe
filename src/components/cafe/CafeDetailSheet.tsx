"use client";

import { Clock, Coffee, ExternalLink, X } from "lucide-react";
import type { Cafe } from "@/types/cafe";
import { NOISE_LABEL, OUTLET_LABEL, WORK_FIT_LABEL } from "@/types/cafe";
import { formatHours, isOpenAt } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Attribute({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={cn("rounded-lg px-3 py-2", good ? "bg-positive/10 text-positive" : "bg-muted text-muted-foreground")}>
      <div className="text-xs opacity-80">{label}</div>
      <div className={cn("text-sm font-semibold", !good && "text-foreground")}>{value}</div>
    </div>
  );
}

export default function CafeDetailSheet({ cafe, onClose }: { cafe: Cafe; onClose: () => void }) {
  const open = isOpenAt(cafe, new Date());

  return (
    <Card
      aria-label={`${cafe.name} 상세 정보`}
      className="absolute inset-x-0 bottom-0 z-10 mx-auto max-h-[65%] max-w-md overflow-y-auto rounded-b-none shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto -mb-1 h-1 w-10 shrink-0 rounded-full bg-border" />

      <CardHeader>
        <CardTitle className="text-lg font-bold">{cafe.name}</CardTitle>
        <CardDescription>{cafe.address}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="닫기">
            <X />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={open ? "bg-positive text-positive-foreground" : ""} variant={open ? "default" : "secondary"}>
            {open ? "영업 중" : "영업 종료"}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            {formatHours(cafe)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Attribute label="콘센트" value={OUTLET_LABEL[cafe.outlet]} good={cafe.outlet === "many"} />
          <Attribute label="와이파이" value={cafe.wifi ? "있음" : "없음"} good={cafe.wifi} />
          <Attribute label="소음" value={NOISE_LABEL[cafe.noise]} good={cafe.noise === "quiet"} />
          <Attribute label="작업 적합도" value={WORK_FIT_LABEL[cafe.work_fit]} good={cafe.work_fit === "good"} />
        </div>

        <Separator />

        <p className="flex items-center gap-1.5">
          <Coffee className="size-4 text-muted-foreground" aria-hidden />
          아이스 아메리카노
          <span className="font-semibold">{cafe.iced_americano_price.toLocaleString("ko-KR")}원</span>
        </p>

        {cafe.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {cafe.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline">#{tag}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter>
        <a
          href={cafe.naver_place_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          네이버 지도에서 보기
          <ExternalLink aria-hidden />
        </a>
      </CardFooter>
    </Card>
  );
}
