import { CURRENCY_EMOJI } from "@/lib/types";

type Props = {
  fish: number;
  paw: number;
};

export function CurrencyDisplay({ fish, paw }: Props) {
  return (
    <div className="flex items-center gap-2">
      <CurrencyChip emoji={CURRENCY_EMOJI.fish} value={fish} bg="bg-blue-100" />
      <CurrencyChip emoji={CURRENCY_EMOJI.paw} value={paw} bg="bg-pink-100" />
    </div>
  );
}

function CurrencyChip({
  emoji,
  value,
  bg,
}: {
  emoji: string;
  value: number;
  bg: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} text-sm font-bold`}
    >
      <span>{emoji}</span>
      <span>{value}</span>
    </div>
  );
}
