import { nist80053 } from '../../data/frameworks/nist-800-53';
import { FlatFrameworkView } from './FlatFrameworkView';

export default function Nist80053View() {
  return (
    <FlatFrameworkView
      framework="NIST 800-53"
      title="NIST SP 800-53 Rev 5"
      subtitle="20 control families covering federal information-system controls."
      hierarchy={nist80053}
    />
  );
}
