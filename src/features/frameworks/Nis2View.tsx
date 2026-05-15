import { nis2 } from '../../data/frameworks/nis2';
import { FlatFrameworkView } from './FlatFrameworkView';

export default function Nis2View() {
  return (
    <FlatFrameworkView
      framework="NIS 2"
      title="NIS 2 Directive"
      subtitle="10 Article 21 cybersecurity-risk-management measures (a)–(j)."
      hierarchy={nis2}
    />
  );
}
