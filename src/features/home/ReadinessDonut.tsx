export interface ReadinessDonutProps {
  readonly percent: number;
  readonly size?: number;
  readonly label?: string;
}

// Pure-SVG donut chart. No chart lib needed for one ring.
export function ReadinessDonut({ percent, size = 96, label }: ReadinessDonutProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const colour = clamped >= 80 ? '#079455' : clamped >= 40 ? '#DC6803' : '#D92D20';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={label ?? `${clamped}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E4E7EC" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colour}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink font-mono text-base font-semibold"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
