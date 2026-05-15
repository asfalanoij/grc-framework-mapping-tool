import { cyberEssentials } from '../../data/frameworks/cyber-essentials';
import { HierarchyFrameworkView } from './HierarchyFrameworkView';

export default function CyberEssentialsView() {
  return (
    <HierarchyFrameworkView
      framework="Cyber Essentials"
      title="Cyber Essentials"
      subtitle="5 technical control themes plus 16 sub-requirements."
      hierarchy={cyberEssentials}
    />
  );
}
