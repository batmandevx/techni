import { MasterDataManager } from "@/components/smart-order/master-data-manager";

export default function PricingPage() {
  return (
    <MasterDataManager
      title="Pricing Conditions"
      description="Manage PR00, K004, MWST, and KF00 pricing rows that enrich the SmartOrder pipeline."
      resourcePath="/api/master-data/pricing"
      rowsKey="pricing"
      deleteKey="id"
      syncEntity="pricing"
      fields={[
        { key: "id", label: "ID" },
        { key: "conditionType", label: "Condition Type" },
        { key: "materialNumber", label: "Material Number" },
        { key: "customerNumber", label: "Customer Number" },
        { key: "salesOrg", label: "Sales Org" },
        { key: "amount", label: "Amount", type: "number" },
        { key: "currency", label: "Currency" },
        { key: "validFrom", label: "Valid From", type: "date" },
        { key: "validTo", label: "Valid To", type: "date" },
      ]}
    />
  );
}
