import { iso22301 } from '../../data/frameworks/iso22301';
import { FlatFrameworkView } from './FlatFrameworkView';

export default function Iso22301View() {
  return (
    <FlatFrameworkView
      framework="ISO 22301"
      title="ISO 22301:2019"
      subtitle="Business-continuity management — 7 top-level clauses."
      hierarchy={iso22301}
    />
  );
}
