/**
 * 装飾用のステッカー風 SVG（モックアップ準拠）
 * すべて白縁 + drop-shadow をデフォルトで付与してステッカー感を出す。
 */

type IconProps = {
  className?: string;
  size?: number;
  rotate?: number;
};

const stickerStyle = (rotate?: number): React.CSSProperties => ({
  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.12)) drop-shadow(0 4px 8px rgba(0,0,0,0.08))",
  transform: rotate !== undefined ? `rotate(${rotate}deg)` : undefined,
});

export function PawSticker({ className, size = 32, rotate, color = "#FFB5C5" }: IconProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={stickerStyle(rotate)}
    >
      {/* 白フチ */}
      <g stroke="#fff" strokeWidth="6" strokeLinejoin="round" fill={color}>
        <ellipse cx="14" cy="20" rx="6" ry="8" />
        <ellipse cx="32" cy="14" rx="6.5" ry="8.5" />
        <ellipse cx="50" cy="20" rx="6" ry="8" />
        <ellipse cx="22" cy="32" rx="5" ry="6.5" />
        <ellipse cx="42" cy="32" rx="5" ry="6.5" />
        <path d="M16 50 Q16 38 32 38 Q48 38 48 50 Q48 58 32 58 Q16 58 16 50 Z" />
      </g>
    </svg>
  );
}

export function StarSticker({ className, size = 32, rotate, color = "#FFD668" }: IconProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={stickerStyle(rotate)}
    >
      <path
        d="M32 4 L40 24 L62 26 L46 40 L52 60 L32 50 L12 60 L18 40 L2 26 L24 24 Z"
        fill={color}
        stroke="#fff"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FishSticker({ className, size = 36, rotate, color = "#5DAEE8" }: IconProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 80 48"
      width={size}
      height={(size * 48) / 80}
      className={className}
      style={stickerStyle(rotate)}
    >
      <g stroke="#fff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {/* 体 */}
        <path
          d="M6 24 Q22 4 48 24 Q22 44 6 24 Z"
          fill={color}
        />
        {/* 尾びれ */}
        <path
          d="M48 24 L70 8 L66 24 L70 40 Z"
          fill={color}
        />
      </g>
      {/* 目 */}
      <circle cx="18" cy="22" r="3" fill="#fff" />
      <circle cx="18" cy="22" r="1.5" fill="#222" />
    </svg>
  );
}

export function YarnSticker({ className, size = 40, rotate }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={stickerStyle(rotate)}
    >
      <circle cx="32" cy="32" r="26" fill="#A8E0D0" stroke="#fff" strokeWidth="5" />
      <g stroke="#7BC9B5" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M12 22 Q32 12 52 22" />
        <path d="M10 32 Q32 24 54 32" />
        <path d="M12 42 Q32 52 52 42" />
        <path d="M22 10 Q32 32 22 54" />
        <path d="M42 10 Q32 32 42 54" />
      </g>
    </svg>
  );
}

/**
 * 猫画像をステッカー化するラッパー（白フチ + 影）
 */
export function CatStickerFrame({
  children,
  size = 80,
  rotate = 0,
  className = "",
}: {
  children: React.ReactNode;
  size?: number;
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1)) drop-shadow(0 8px 16px rgba(0,0,0,0.08))",
      }}
    >
      <div
        className="w-full h-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 4px #fff",
        }}
      >
        {children}
      </div>
    </div>
  );
}
