import { MasterDataManager } from "@/components/smart-order/master-data-manager";

export default function MaterialsPage() {
  return (
    <MasterDataManager
      title="Material Master"
      description="Maintain SKU, plant, storage location, and availability attributes used during batch validation."
      resourcePath="/api/master-data/materials"
      rowsKey="materials"
      deleteKey="materialNumber"
      syncEntity="material"
      fields={[
        { key: "materialNumber", label: "Material Number" },
        { key: "description", label: "Description" },
        { key: "plant", label: "Plant" },
        { key: "storageLocation", label: "Storage Location" },
        { key: "materialGroup", label: "Material Group" },
        { key: "availableQty", label: "Available Qty", type: "number" },
      ]}
    />
  );
}
