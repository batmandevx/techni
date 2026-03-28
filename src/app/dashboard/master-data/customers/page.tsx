import { MasterDataManager } from "@/components/smart-order/master-data-manager";

export default function CustomersPage() {
  return (
    <MasterDataManager
      title="Customer Master"
      description="Search, edit, and sync sold-to master data used by the SmartOrder validation engine."
      resourcePath="/api/master-data/customers"
      rowsKey="customers"
      deleteKey="customerNumber"
      syncEntity="customer"
      fields={[
        { key: "customerNumber", label: "Customer Number" },
        { key: "companyName", label: "Company Name" },
        { key: "salesOrg", label: "Sales Org" },
        { key: "distChannel", label: "Dist Channel" },
        { key: "division", label: "Division" },
        { key: "country", label: "Country" },
      ]}
    />
  );
}
