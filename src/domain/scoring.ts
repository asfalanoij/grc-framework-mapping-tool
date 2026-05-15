// Per-framework readiness math. Each framework view tracks its own scores
// keyed by item id; this module computes count / percent breakdowns.
// "Not Applicable" is excluded from the percent-implemented denominator
// to mirror Statement of Applicability semantics.

export const statusValues = ['not-started', 'in-progress', 'implemented', 'na'] as const;
export type Status = (typeof statusValues)[number];

export function isStatus(value: string): value is Status {
  return (statusValues as readonly string[]).includes(value);
}

export type ScoresByItem = Readonly<Record<string, Status>>;

export interface Readiness {
  readonly total: number;
  readonly implemented: number;
  readonly inProgress: number;
  readonly notStarted: number;
  readonly notApplicable: number;
  readonly applicable: number; // total - notApplicable
  readonly percentImplemented: number; // 0..100, rounded to 1 dp
}

const emptyReadiness: Readiness = Object.freeze({
  total: 0,
  implemented: 0,
  inProgress: 0,
  notStarted: 0,
  notApplicable: 0,
  applicable: 0,
  percentImplemented: 0,
});

// `itemIds` defines the universe of items (e.g. all 118 ISO control IDs
// or all 106 NIST subcategory IDs). Any score keys not in itemIds are
// ignored — keeps the math honest after frameworks are revised.
export function computeReadiness(
  itemIds: readonly string[],
  scores: ScoresByItem,
): Readiness {
  if (itemIds.length === 0) return emptyReadiness;
  let implemented = 0;
  let inProgress = 0;
  let notStarted = 0;
  let notApplicable = 0;
  for (const id of itemIds) {
    const s = scores[id] ?? 'not-started';
    switch (s) {
      case 'implemented':
        implemented += 1;
        break;
      case 'in-progress':
        inProgress += 1;
        break;
      case 'na':
        notApplicable += 1;
        break;
      case 'not-started':
      default:
        notStarted += 1;
        break;
    }
  }
  const total = itemIds.length;
  const applicable = total - notApplicable;
  const percent =
    applicable === 0 ? 0 : Math.round((implemented / applicable) * 1000) / 10;
  return Object.freeze({
    total,
    implemented,
    inProgress,
    notStarted,
    notApplicable,
    applicable,
    percentImplemented: percent,
  });
}

// Returns the count of items in a given status.
export function countByStatus(
  itemIds: readonly string[],
  scores: ScoresByItem,
  status: Status,
): number {
  let n = 0;
  for (const id of itemIds) {
    const s = scores[id] ?? 'not-started';
    if (s === status) n += 1;
  }
  return n;
}
