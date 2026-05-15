import { pciDss } from '../../data/frameworks/pci-dss';
import { FlatFrameworkView } from './FlatFrameworkView';

export default function PciDssView() {
  return (
    <FlatFrameworkView
      framework="PCI DSS"
      title="PCI DSS 4.0.1"
      subtitle="12 Requirements covering cardholder data environments."
      hierarchy={pciDss}
    />
  );
}
