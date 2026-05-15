/**
 * VOICEVOXずんだもん歌唱 技術検証スクリプト
 *
 * 使い方:
 *   1. VOICEVOX を起動（localhost:50021 で待機）
 *   2. node scripts/voicevox-singing-test.mjs
 *   3. 生成された .wav ファイルを再生して確認
 *
 * 試す順番:
 *   方法1: SONG モード (v0.14+ 専用エンドポイント) — 最も自然な歌声
 *   方法2: ピッチ操作モード (通常 TTS のピッチを音符に合わせて書き換え)
 */

import fs from 'fs';

const BASE_URL = 'http://localhost:50021';

// 歌わせる歌詞と音符（MIDI ノート番号）
// "ずんだもんなのだ" を簡単なメロディで
const SONG = [
  { lyric: 'ず', midi: 64 }, // E4
  { lyric: 'ん', midi: 62 }, // D4
  { lyric: 'だ', midi: 60 }, // C4
  { lyric: 'も', midi: 62 }, // D4
  { lyric: 'ん', midi: 64 }, // E4
  { lyric: 'な', midi: 64 }, // E4
  { lyric: 'の', midi: 62 }, // D4
  { lyric: 'だ', midi: 60 }, // C4 (長め)
];

// MIDI ノート番号 → 周波数（Hz）
function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// VOICEVOX 起動確認
async function checkVoicevox() {
  try {
    const res = await fetch(`${BASE_URL}/version`);
    const version = await res.text();
    console.log(`✅ VOICEVOX ${version.trim()} 起動確認`);
    return true;
  } catch {
    console.error('❌ VOICEVOX が起動していません。localhost:50021 で起動してから再試行してください。');
    return false;
  }
}

// ずんだもんのスピーカー一覧を取得
async function getZundamonSpeakers() {
  const res = await fetch(`${BASE_URL}/speakers`);
  const speakers = await res.json();

  const zundamon = speakers.find((s) => s.name === 'ずんだもん');
  if (!zundamon) throw new Error('ずんだもんが見つかりません');

  console.log('\n🐸 ずんだもんのスタイル一覧:');
  for (const style of zundamon.styles) {
    console.log(`  ID:${style.id}  ${style.name}  (type: ${style.type ?? 'talk'})`);
  }

  const singStyle = zundamon.styles.find(
    (s) => s.type === 'sing' || s.type === 'singing' || s.name.includes('ソング') || s.name.toLowerCase().includes('song')
  );
  const talkStyle = zundamon.styles.find((s) => !s.type || s.type === 'talk') ?? zundamon.styles[0];

  return { singStyle, talkStyle };
}

// ============================================================
// 方法1: SONG モード（v0.14+ の歌声合成エンドポイント）
// ============================================================
async function trySongMode(speakerId) {
  console.log(`\n🎵 方法1: SONG モード (speaker_id=${speakerId})`);

  const score = {
    notes: [
      // 冒頭の無音（息継ぎ用）
      { id: 'rest_start', key: null, frame_length: 24, lyric: '' },
      ...SONG.map((n, i) => ({
        id: `note_${i}`,
        key: n.midi,
        frame_length: i === SONG.length - 1 ? 72 : 48, // 最後の音は長め
        lyric: n.lyric,
      })),
      // 末尾の無音
      { id: 'rest_end', key: null, frame_length: 24, lyric: '' },
    ],
  };

  const queryRes = await fetch(`${BASE_URL}/sing_frame_audio_query?speaker=${speakerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(score),
  });

  if (!queryRes.ok) {
    const err = await queryRes.text();
    throw new Error(`sing_frame_audio_query 失敗: ${queryRes.status} ${err}`);
  }

  const frameQuery = await queryRes.json();
  console.log('  ✅ sing_frame_audio_query 成功');

  const synthRes = await fetch(`${BASE_URL}/frame_synthesis?speaker=${speakerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(frameQuery),
  });

  if (!synthRes.ok) {
    const err = await synthRes.text();
    throw new Error(`frame_synthesis 失敗: ${synthRes.status} ${err}`);
  }

  const wav = await synthRes.arrayBuffer();
  const outPath = 'zundamon_song_mode.wav';
  fs.writeFileSync(outPath, Buffer.from(wav));
  console.log(`  ✅ 歌声生成完了 → ${outPath}  (${(wav.byteLength / 1024).toFixed(1)} KB)`);
  return outPath;
}

// ============================================================
// 方法2: ピッチ操作モード（通常 TTS のピッチを音符値に書き換え）
// ============================================================
async function tryPitchMode(speakerId) {
  console.log(`\n🎵 方法2: ピッチ操作モード (speaker_id=${speakerId})`);

  const text = SONG.map((n) => n.lyric).join('');

  const queryRes = await fetch(
    `${BASE_URL}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`,
    { method: 'POST' }
  );

  if (!queryRes.ok) {
    throw new Error(`audio_query 失敗: ${queryRes.status}`);
  }

  const audioQuery = await queryRes.json();

  // モーラ（1音節）を順番に音符のピッチへ書き換える
  // VOICEVOX の pitch は ln(Hz) 形式
  let noteIndex = 0;
  for (const phrase of audioQuery.accent_phrases) {
    for (const mora of phrase.moras) {
      if (mora.pitch > 0 && noteIndex < SONG.length) {
        const hz = midiToHz(SONG[noteIndex].midi);
        mora.pitch = Math.log(hz);
        // 発音時間も統一（単位: 秒）
        mora.vowel_length = 0.25;
        mora.consonant_length = mora.consonant ? 0.05 : 0;
        noteIndex++;
      }
    }
    if (phrase.pause_mora) phrase.pause_mora = null; // 句読点の間を削除
  }

  // テンポを少し遅くして歌らしくする
  audioQuery.speed_scale = 0.75;

  const synthRes = await fetch(`${BASE_URL}/synthesis?speaker=${speakerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(audioQuery),
  });

  if (!synthRes.ok) {
    throw new Error(`synthesis 失敗: ${synthRes.status}`);
  }

  const wav = await synthRes.arrayBuffer();
  const outPath = 'zundamon_pitch_mode.wav';
  fs.writeFileSync(outPath, Buffer.from(wav));
  console.log(`  ✅ 生成完了 → ${outPath}  (${(wav.byteLength / 1024).toFixed(1)} KB)`);
  return outPath;
}

// ============================================================
// メイン
// ============================================================
async function main() {
  console.log('=== VOICEVOXずんだもん歌唱 技術検証 ===\n');

  if (!(await checkVoicevox())) process.exit(1);

  const { singStyle, talkStyle } = await getZundamonSpeakers();

  const results = [];

  // 方法1: SONG モード（歌声スタイルがある場合のみ）
  if (singStyle) {
    try {
      const path = await trySongMode(singStyle.id);
      results.push({ method: 'SONG モード', path, ok: true });
    } catch (e) {
      console.error(`  ❌ SONG モード失敗: ${e.message}`);
      results.push({ method: 'SONG モード', ok: false, error: e.message });
    }
  } else {
    console.log('\n⚠️  SONG スタイルが見つかりません（VOICEVOX v0.14+ が必要）');
    console.log('   通常スタイルで SONG モードを試します...');
    try {
      const path = await trySongMode(talkStyle.id);
      results.push({ method: 'SONG モード（通常スタイル）', path, ok: true });
    } catch (e) {
      console.error(`  ❌ SONG モード失敗: ${e.message}`);
      results.push({ method: 'SONG モード', ok: false, error: e.message });
    }
  }

  // 方法2: ピッチ操作モード
  try {
    const path = await tryPitchMode(talkStyle.id);
    results.push({ method: 'ピッチ操作モード', path, ok: true });
  } catch (e) {
    console.error(`  ❌ ピッチ操作モード失敗: ${e.message}`);
    results.push({ method: 'ピッチ操作モード', ok: false, error: e.message });
  }

  // 結果サマリー
  console.log('\n=== 結果サマリー ===');
  for (const r of results) {
    if (r.ok) {
      console.log(`✅ ${r.method} → ${r.path}`);
    } else {
      console.log(`❌ ${r.method} → ${r.error}`);
    }
  }
}

main().catch((e) => {
  console.error('\n予期しないエラー:', e);
  process.exit(1);
});
