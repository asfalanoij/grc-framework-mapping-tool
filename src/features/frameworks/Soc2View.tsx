import { soc2 } from '../../data/frameworks/soc2';
import { HierarchyFrameworkView } from './HierarchyFrameworkView';

export default function Soc2View() {
  return (
    <HierarchyFrameworkView
      framework="SOC 2"
      title="SOC 2 Trust Services Criteria"
      subtitle="5 Trust Services Categories / 9 Criteria Groups / 61 Criteria (CC1–CC9, A1, P1)."
      hierarchy={soc2}
    />
  );
}
