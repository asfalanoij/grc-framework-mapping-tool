import { nistCsf2 } from '../../data/frameworks/nist-csf-2';
import { HierarchyFrameworkView } from './HierarchyFrameworkView';

export default function NistCsfView() {
  return (
    <HierarchyFrameworkView
      framework="NIST CSF 2.0"
      title="NIST Cybersecurity Framework 2.0"
      subtitle="6 Functions / 22 Categories / 106 Subcategories."
      hierarchy={nistCsf2}
    />
  );
}
