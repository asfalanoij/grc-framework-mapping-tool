import { iso27001Controls } from '../../data/frameworks/iso27001';
import {
  frameworkPropKeys,
  getIsoControlsForRef,
  getTransitiveMappings,
  type FrameworkPropKey,
} from '../../domain/mapping-engine';
import { frameworkRegistry } from '../../data/framework-registry';

const LABELS: Readonly<Record<FrameworkPropKey, string>> = Object.freeze({
  nistSub: 'NIST CSF 2.0',
  soc2: 'SOC 2',
  cis: 'CIS v8',
  pci: 'PCI DSS',
  ce: 'Cyber Essentials',
  n80053: 'NIST 800-53',
  nis2: 'NIS 2',
  iso22301: 'ISO 22301',
  iso27017: 'ISO 27017',
  caf: 'NCSC CAF',
});

const CHIP_BASE = 'rounded border px-2 py-0.5 font-mono text-xs';
const ISO_CHIP = `${CHIP_BASE} border-brand-200 bg-brand-50 text-brand-text`;
const FW_CHIP = `${CHIP_BASE} border-border bg-surface-2 text-ink-2`;

export interface TransitiveMappingBadgesProps {
  readonly sourceFramework: string; // human label, e.g. "NIST CSF 2.0"
  readonly itemId: string;
}

// Renders:
//   1. ISO 27001 controls that reference this item directly (the spine)
//   2. Refs in every OTHER framework reachable via those shared ISO controls
export function TransitiveMappingBadges({ sourceFramework, itemId }: TransitiveMappingBadgesProps) {
  const registry = frameworkRegistry.find((f) => f.id === sourceFramework);
  if (!registry || registry.prop === 'id') {
    return <p className="text-xs italic text-ink-4">No transitive mapping for this framework.</p>;
  }
  const sourceProp = registry.prop as FrameworkPropKey;

  const isoControlIds = getIsoControlsForRef(iso27001Controls, sourceProp, itemId);
  const transitive = getTransitiveMappings(iso27001Controls, sourceProp, itemId);

  if (isoControlIds.length === 0) {
    return (
      <p className="text-xs italic text-ink-4">
        No ISO 27001 controls reference this item directly. Cross-framework mappings unavailable.
      </p>
    );
  }

  return (
    <dl className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <dt className="min-w-[8rem] text-xs font-semibold uppercase tracking-wide text-ink-3">
          ISO 27001
        </dt>
        <dd className="flex flex-wrap gap-1.5">
          {isoControlIds.map((id) => (
            <span key={id} className={ISO_CHIP}>
              {id}
            </span>
          ))}
        </dd>
      </div>
      {frameworkPropKeys
        .filter((k) => k !== sourceProp && transitive[k].length > 0)
        .map((k) => (
          <div key={k} className="flex flex-wrap items-center gap-2">
            <dt className="min-w-[8rem] text-xs font-semibold uppercase tracking-wide text-ink-3">
              {LABELS[k]}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {transitive[k].map((ref) => (
                <span key={ref} className={FW_CHIP}>
                  {ref}
                </span>
              ))}
            </dd>
          </div>
        ))}
    </dl>
  );
}
