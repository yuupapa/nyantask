"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type Props = {
  remaining: number;
  completed: number;
  total: number;
};

export function HomeCatHero({ remaining, completed, total }: Props) {
  return (
    <div
      className="relative w-full overflow-visible"
      style={{ height: 260 }}
    >
      {/* 装飾ステッカー（背景） */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          zIndex: 1,
        }}
      >
        <Image
          src="/home-assets/deco_stickers.png"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "top center" }}
          priority
        />
      </div>

      {/* 猫キャラクター（右側・上からはみ出す・ふわふわアニメ） */}
      <motion.div
        style={{
          position: "absolute",
          right: "0%",
          top: "-30px",
          width: "52%",
          zIndex: 3,
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/home-assets/cat_home.png"
          alt="にゃんこ"
          width={485}
          height={487}
          style={{ width: "100%", height: "auto" }}
          priority
        />
      </motion.div>

      {/* 吹き出し（左～中央） */}
      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "28px",
          width: "52%",
          zIndex: 4,
        }}
      >
        {total === 0 ? (
          <Link href="/tasks">
            <SpeechBubble color="#5DAEE8">
              <span className="text-sm font-bold text-white leading-snug">
                タスクを<br />追加してね！
              </span>
            </SpeechBubble>
          </Link>
        ) : remaining === 0 ? (
          <SpeechBubble color="#56C17B">
            <span className="text-sm font-bold text-white leading-snug">
              🎉 今日も<br />完了！えらい！
            </span>
          </SpeechBubble>
        ) : (
          <Link href="/tasks">
            <SpeechBubble color="#FF8566">
              <span className="text-white font-bold leading-snug">
                今日はあと
                <span className="text-3xl font-black mx-1">{remaining}</span>
                つ！
              </span>
            </SpeechBubble>
          </Link>
        )}
      </div>
    </div>
  );
}

function SpeechBubble({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="relative inline-block w-full">
      <div
        className="rounded-[22px] px-4 py-3 text-center shadow-md"
        style={{ background: color }}
      >
        {children}
      </div>
      {/* 吹き出し尻尾（右下向き） */}
      <div
        className="absolute -right-1 bottom-3 w-4 h-4 rotate-45 rounded-sm"
        style={{ background: color }}
      />
    </div>
  );
}
