"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Cat } from "@/lib/types";
import {
  getPatternLabel,
  getPersonalityLabel,
} from "@/lib/cat-traits";
import {
  getStage,
  STAGE_LABELS,
  getStatus,
  STATUS_LABELS,
  xpProgress,
} from "@/lib/cat";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * 猫が話しかけるメッセージを Gemini で生成。
 *  - profile.gemini_api_key を使う（ユーザー個人のキー）
 *  - 個性・状態・Lv に応じた発言
 */
export async function generateCatMessage(): Promise<string> {
  const profile = await requireAuth();

  const supabase = await createClient();

  const { data: geminiKey, error: keyError } = await supabase.rpc(
    "get_user_gemini_key"
  );
  if (keyError) {
    console.error("[gemini] get_user_gemini_key error:", keyError);
    throw new Error("APIキーの取得に失敗しました");
  }
  if (!geminiKey) {
    throw new Error(
      "Gemini APIキーが設定されていません。設定画面から登録してください。"
    );
  }

  const { data: cat, error: catError } = await supabase
    .from("cats")
    .select(
      "id, user_id, name, pattern, face, personality, rarity, hunger, mood, friendship_xp, is_active, is_runaway, born_at, last_decay_at, created_at"
    )
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (catError || !cat) {
    throw new Error("育てている猫がいません");
  }

  const prompt = buildCatPrompt(
    cat as Cat,
    profile.display_name ?? "あなた"
  );

  const response = await fetch(
    `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("[gemini] API error:", response.status, text);
    if (response.status === 400 || response.status === 403) {
      throw new Error(
        "Gemini APIキーが無効か権限がありません。設定画面で確認してください。"
      );
    }
    if (response.status === 429) {
      throw new Error(
        "APIの利用回数制限に達しました。しばらく時間を置いてから試してください。"
      );
    }
    throw new Error("Gemini API の呼び出しに失敗しました");
  }

  type GeminiResponse = {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const data: GeminiResponse = await response.json();
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  return message || "にゃ〜";
}

function buildCatPrompt(cat: Cat, ownerName: string): string {
  const stage = getStage(cat.born_at);
  const status = getStatus(cat);
  const xp = xpProgress(cat.friendship_xp);

  return `あなたは「${cat.name}」という猫キャラクターです。以下の設定で飼い主さんに一言だけ話しかけてください。

# あなたの設定
- 種類: ${getPatternLabel(cat.pattern)}
- 性格: ${getPersonalityLabel(cat.personality)}
- 成長段階: ${STAGE_LABELS[stage]}
- いまの気分: ${STATUS_LABELS[status]}
- なかよしレベル: ${xp.level}
- 満腹度: ${cat.hunger}/100
- 機嫌: ${cat.mood}/100

# 飼い主
- 呼び方: ${ownerName}さん

# ルール
- 一人称は「ぼく」または「ボク」
- 語尾は「〜にゃ」「〜だにゃ」など猫っぽく
- 性格「${getPersonalityLabel(cat.personality)}」が伝わる話し方
- いまの気分が「ごきげん」なら、嬉しい・感謝の言葉
- いまの気分が「しょんぼり」「体調不良」なら、寂しい・お腹すいたなど
- なかよしレベルが高ければ親しみのある言葉、低ければ控えめ
- 30〜60文字程度の短い1〜2文
- 説明や前置きは不要、メッセージだけ返す
- 絵文字は1つまで、なくてもOK

# 出力（メッセージのみ）：`;
}
