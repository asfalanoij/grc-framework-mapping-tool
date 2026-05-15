import { iso27017 } from '../../data/frameworks/iso27017';
import { FlatFrameworkView } from './FlatFrameworkView';

export default function Iso27017View() {
  return (
    <FlatFrameworkView
      framework="ISO 27017"
      title="ISO/IEC 27017:2015"
      subtitle="Cloud-service security — 14 sections."
      hierarchy={iso27017}
    />
  );
}
