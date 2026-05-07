/**
 * Canva モックアップ SVG から抽出した画像アセットの配置情報。
 * scripts/extract_login_svg_assets.py で自動生成（座標は viewBox 705.75x1254 上）。
 */
export const LOGIN_VIEWBOX = { w: 705.75, h: 1254 };

export type LoginAsset = {
  idx: number;
  key: string;
  src: string;
  x: number; // viewBox 座標 (左)
  y: number; // viewBox 座標 (上)
  w: number; // viewBox 上の表示幅
  h: number; // viewBox 上の表示高さ
  z?: number; // 重なり順
};

// 装飾ステッカー（背景レイヤー）
export const DECOR_ASSETS: LoginAsset[] = [
  { idx: 35, key: "speech_bubble", src: "/login-svg/img-35.png", x: 131.95, y: 74.45, w: 441.59, h: 418.35, z: 1 },
  { idx: 32, key: "pink_paw", src: "/login-svg/img-32.png", x: 80, y: 522, w: 118.46, h: 104.96, z: 2 },
  { idx: 33, key: "star_yellow", src: "/login-svg/img-33.png", x: 146.95, y: 59.45, w: 59.23, h: 60.73, z: 5 },
  { idx: 34, key: "star_mint", src: "/login-svg/img-34.png", x: 58.48, y: 223.64, w: 44.98, h: 45.73, z: 5 },
  { idx: 36, key: "yarn", src: "/login-svg/img-36.png", x: 440.84, y: 29.46, w: 88.47, h: 60.73, z: 5 },
  { idx: 37, key: "cat_face_grayblack", src: "/login-svg/img-37.png", x: 528.56, y: 59.45, w: 162.69, h: 164.94, z: 4 },
  { idx: 39, key: "cat_face_tabby", src: "/login-svg/img-39.png", x: 14.24, y: 298.62, w: 162.69, h: 164.94, z: 4 },
  { idx: 40, key: "star_blue", src: "/login-svg/img-40.png", x: 617.03, y: 238.64, w: 59.23, h: 45.73, z: 5 },
  { idx: 41, key: "pink_paw_small", src: "/login-svg/img-41.png", x: 587.79, y: 298.62, w: 74.22, h: 74.97, z: 5 },
  { idx: 42, key: "fish_blue", src: "/login-svg/img-42.png", x: 557.8, y: 387.83, w: 89.22, h: 60.73, z: 5 },
  { idx: 43, key: "fish_yellow", src: "/login-svg/img-43.png", x: 146.95, y: 447.81, w: 74.22, h: 59.98, z: 5 },
  { idx: 44, key: "star_yellow_small", src: "/login-svg/img-44.png", x: 14.24, y: 492.05, w: 44.98, h: 30.74, z: 5 },
  { idx: 46, key: "star_pink", src: "/login-svg/img-46.png", x: 0.0, y: 641.24, w: 74.22, h: 60.73, z: 5 },
  { idx: 47, key: "cat_face_blackpeek", src: "/login-svg/img-47.png", x: 249.66, y: 477.05, w: 191.93, h: 135.7, z: 4 },
  { idx: 48, key: "cat_face_orange", src: "/login-svg/img-48.png", x: 470.08, y: 432.82, w: 161.94, h: 149.95, z: 4 },
  { idx: 49, key: "paw_mint", src: "/login-svg/img-49.png", x: 617.03, y: 522.04, w: 88.47, h: 60.73, z: 5 },
  { idx: 51, key: "cat_face_calico", src: "/login-svg/img-51.png", x: 587.79, y: 627.0, w: 117.71, h: 119.96, z: 4 },
  { idx: 50, key: "ribbon_yellow", src: "/login-svg/img-50.png", x: 190.43, y: 701.22, w: 324.63, h: 45.73, z: 6 },
  { idx: 55, key: "smile_mark_left", src: "/login-svg/img-55.png", x: 161.19, y: 969.63, w: 44.98, h: 30.74, z: 5 },
  { idx: 56, key: "smile_mark_right", src: "/login-svg/img-56.png", x: 499.32, y: 969.63, w: 29.99, h: 30.74, z: 5 },
  { idx: 57, key: "feature_clipboard", src: "/login-svg/img-57.png", x: 43.48, y: 999.62, w: 177.69, h: 164.94, z: 4 },
  { idx: 58, key: "feature_cat_fish", src: "/login-svg/img-58.png", x: 249.66, y: 999.62, w: 191.93, h: 164.94, z: 4 },
  { idx: 59, key: "feature_book", src: "/login-svg/img-59.png", x: 455.09, y: 999.62, w: 191.93, h: 164.94, z: 4 },
  { idx: 60, key: "paw_mint_small", src: "/login-svg/img-60.png", x: 631.28, y: 1178.8, w: 74.22, h: 60.73, z: 5 },
];

// viewBox 座標から % に変換
export const pct = (v: number, dim: "w" | "h"): string => {
  const ref = dim === "w" ? LOGIN_VIEWBOX.w : LOGIN_VIEWBOX.h;
  return `${(v / ref) * 100}%`;
};
