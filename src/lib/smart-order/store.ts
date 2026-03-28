import { promises as fs } from "fs";
import path from "path";
import { createSeedStore } from "@/lib/smart-order/seed";
import {
  SmartAuditLog,
  SmartOrderBatch,
  SmartOrderCustomer,
  SmartOrderMaterial,
  SmartOrderStore,
  SmartPricingCondition,
  SmartUploadDraft,
} from "@/lib/smart-order/types";
import { createId } from "@/lib/smart-order/utils";

const STORE_PATH = path.join(process.cwd(), "data", "smart-order-store.json");

async function ensureStore(): Promise<SmartOrderStore> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as SmartOrderStore;
  } catch {
    const seed = createSeedStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function writeStore(store: SmartOrderStore): Promise<void> {
  const nextStore = {
    ...store,
    metadata: {
      ...store.metadata,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  await fs.writeFile(STORE_PATH, JSON.stringify(nextStore, null, 2), "utf8");
}

export async function readSmartOrderStore(): Promise<SmartOrderStore> {
  return ensureStore();
}

export async function updateSmartOrderStore(
  updater: (store: SmartOrderStore) => SmartOrderStore | Promise<SmartOrderStore>,
): Promise<SmartOrderStore> {
  const current = await ensureStore();
  const updated = await updater(current);
  await writeStore(updated);
  return updated;
}

export async function listCustomers(): Promise<SmartOrderCustomer[]> {
  const store = await readSmartOrderStore();
  return store.customers.slice().sort((left, right) => left.companyName.localeCompare(right.companyName));
}

export async function listMaterials(): Promise<SmartOrderMaterial[]> {
  const store = await readSmartOrderStore();
  return store.materials.slice().sort((left, right) => left.description.localeCompare(right.description));
}

export async function listPricing(): Promise<SmartPricingCondition[]> {
  const store = await readSmartOrderStore();
  return store.pricing.slice().sort((left, right) => left.materialNumber.localeCompare(right.materialNumber));
}

export async function listBatches(): Promise<SmartOrderBatch[]> {
  const store = await readSmartOrderStore();
  return store.batches.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getBatch(batchId: string): Promise<SmartOrderBatch | undefined> {
  const store = await readSmartOrderStore();
  return store.batches.find((batch) => batch.id === batchId);
}

export async function createBatch(draft: SmartUploadDraft): Promise<SmartOrderBatch> {
  const batch: SmartOrderBatch = {
    id: createId("batch"),
    batchName: draft.batchName,
    fileName: draft.fileName,
    fileUrl: `/uploads/${draft.fileName}`,
    totalOrders: draft.lines.length,
    successCount: 0,
    failedCount: 0,
    pendingCount: draft.lines.length,
    status: "VALIDATED",
    aiMappingConfidence: draft.mappingConfig.overallConfidence,
    uploadedBy: draft.uploadedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mappingConfig: draft.mappingConfig,
    filePreview: draft.filePreview,
    lines: draft.lines,
    report: {
      progressPercent: 0,
      createdGroups: 0,
      failedGroups: 0,
      averageProcessingTimeMs: 0,
      message: "Ready for SAP processing.",
    },
  };

  await updateSmartOrderStore((store) => ({
    ...store,
    batches: [batch, ...store.batches],
    auditLogs: [
      {
        id: createId("audit"),
        userId: draft.uploadedBy,
        action: "UPLOAD",
        entityType: "OrderBatch",
        entityId: batch.id,
        details: { fileName: batch.fileName, totalOrders: batch.totalOrders },
        createdAt: new Date().toISOString(),
      },
      ...store.auditLogs,
    ],
  }));

  return batch;
}

export async function updateBatch(
  batchId: string,
  updater: Partial<SmartOrderBatch> | ((batch: SmartOrderBatch) => SmartOrderBatch),
): Promise<SmartOrderBatch | null> {
  let updatedBatch: SmartOrderBatch | null = null;

  await updateSmartOrderStore((store) => ({
    ...store,
    batches: store.batches.map((batch) => {
      if (batch.id !== batchId) {
        return batch;
      }

      if (typeof updater === 'function') {
        updatedBatch = {
          ...updater(batch),
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedBatch = {
          ...batch,
          ...updater,
          updatedAt: new Date().toISOString(),
        };
      }

      return updatedBatch;
    }),
  }));

  return updatedBatch;
}

export async function deleteBatch(batchId: string): Promise<SmartOrderStore> {
  return updateSmartOrderStore((store) => ({
    ...store,
    batches: store.batches.filter((batch) => batch.id !== batchId),
  }));
}

export async function upsertCustomer(input: Partial<SmartOrderCustomer> & { customerNumber: string; companyName: string }) {
  return updateSmartOrderStore((store) => {
    const existing = store.customers.find((customer) => customer.customerNumber === input.customerNumber);
    const next: SmartOrderCustomer = existing
      ? { ...existing, ...input }
      : {
          id: createId("cust"),
          customerNumber: input.customerNumber,
          companyName: input.companyName,
          salesOrg: input.salesOrg ?? "1000",
          distChannel: input.distChannel ?? "10",
          division: input.division ?? "00",
          paymentTerms: input.paymentTerms ?? "N30",
          shippingCondition: input.shippingCondition ?? "01",
          country: input.country ?? "United States",
          region: input.region ?? "N/A",
          city: input.city ?? "N/A",
          isActive: input.isActive ?? true,
          lastSyncAt: new Date().toISOString(),
        };

    return {
      ...store,
      customers: existing
        ? store.customers.map((customer) => (customer.customerNumber === input.customerNumber ? next : customer))
        : [next, ...store.customers],
    };
  });
}

export async function upsertMaterial(input: Partial<SmartOrderMaterial> & { materialNumber: string; description: string }) {
  return updateSmartOrderStore((store) => {
    const existing = store.materials.find((material) => material.materialNumber === input.materialNumber);
    const next: SmartOrderMaterial = existing
      ? { ...existing, ...input }
      : {
          id: createId("mat"),
          materialNumber: input.materialNumber,
          description: input.description,
          baseUom: input.baseUom ?? "EA",
          salesUom: input.salesUom ?? "EA",
          plant: input.plant ?? "1000",
          storageLocation: input.storageLocation ?? "FG01",
          materialGroup: input.materialGroup ?? "GENERAL",
          isActive: input.isActive ?? true,
          availableQty: input.availableQty ?? 0,
          category: input.category ?? "General",
          lastSyncAt: new Date().toISOString(),
        };

    return {
      ...store,
      materials: existing
        ? store.materials.map((material) => (material.materialNumber === input.materialNumber ? next : material))
        : [next, ...store.materials],
    };
  });
}

export async function upsertPricing(input: Partial<SmartPricingCondition> & { materialNumber: string; conditionType: string; amount: number }) {
  return updateSmartOrderStore((store) => {
    const existing = input.id ? store.pricing.find((pricing) => pricing.id === input.id) : undefined;
    const next: SmartPricingCondition = existing
      ? { ...existing, ...input }
      : {
          id: createId("pricing"),
          conditionType: input.conditionType,
          materialNumber: input.materialNumber,
          customerNumber: input.customerNumber ?? null,
          salesOrg: input.salesOrg ?? "1000",
          amount: input.amount,
          currency: input.currency ?? "USD",
          validFrom: input.validFrom ?? new Date().toISOString(),
          validTo: input.validTo ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        };

    return {
      ...store,
      pricing: existing ? store.pricing.map((item) => (item.id === next.id ? next : item)) : [next, ...store.pricing],
    };
  });
}

export async function deleteEntity(collection: "customers" | "materials" | "pricing", identifier: string) {
  return updateSmartOrderStore((store) => {
    if (collection === "customers") {
      return {
        ...store,
        customers: store.customers.filter((customer) => customer.customerNumber !== identifier),
      };
    }

    if (collection === "materials") {
      return {
        ...store,
        materials: store.materials.filter((material) => material.materialNumber !== identifier),
      };
    }

    return {
      ...store,
      pricing: store.pricing.filter((pricing) => pricing.id !== identifier),
    };
  });
}

export async function appendAuditLog(log: Omit<SmartAuditLog, "id" | "createdAt">) {
  return updateSmartOrderStore((store) => ({
    ...store,
    auditLogs: [
      {
        ...log,
        id: createId("audit"),
        createdAt: new Date().toISOString(),
      },
      ...store.auditLogs,
    ],
  }));
}

export async function markSync(kind: "customer" | "material" | "pricing") {
  return updateSmartOrderStore((store) => ({
    ...store,
    metadata: {
      ...store.metadata,
      ...(kind === "customer" ? { customerSyncAt: new Date().toISOString() } : {}),
      ...(kind === "material" ? { materialSyncAt: new Date().toISOString() } : {}),
      ...(kind === "pricing" ? { pricingSyncAt: new Date().toISOString() } : {}),
      lastUpdatedAt: new Date().toISOString(),
    },
  }));
}
