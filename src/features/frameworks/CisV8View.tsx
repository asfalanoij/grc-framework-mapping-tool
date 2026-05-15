import { cisV8 } from '../../data/frameworks/cis-v8';
import { HierarchyFrameworkView } from './HierarchyFrameworkView';

export default function CisV8View() {
  return (
    <HierarchyFrameworkView
      framework="CIS v8"
      title="CIS Controls v8"
      subtitle="18 Controls / 153 Safeguards across IG1, IG2, IG3 tiers."
      hierarchy={cisV8}
    />
  );
}
