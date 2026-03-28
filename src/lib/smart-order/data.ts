import * as fileStore from "@/lib/smart-order/store";
import { SmartAuditLog, SmartOrderBatch, SmartOrderStore, SmartUploadDraft } from "@/lib/smart-order/types";

type StorageMode = "auto" | "file" | "prisma";

const storageMode = (process.env.SMARTORDER_STORAGE ?? "auto") as StorageMode;
let prismaReadyPromise: Promise<boolean> | null = null;
let prismaStoreModule: typeof import("@/lib/smart-order/prisma-store") | null = null;

async function checkPrismaReady(): Promise<boolean> {
  if (!prismaReadyPromise) {
    prismaReadyPromise = (async () => {
      try {
        // Dynamically import prisma-store only when needed
        prismaStoreModule = await import("@/lib/smart-order/prisma-store");
        return await prismaStoreModule.prismaAvailable();
      } catch {
        return false;
      }
    })();
  }

  return prismaReadyPromise;
}

async function usePrisma(): Promise<boolean> {
  if (storageMode === "file") {
    return false;
  }

  const ready = await checkPrismaReady();
  if (storageMode === "prisma" && !ready) {
    throw new Error(
      "SMARTORDER_STORAGE is set to 'prisma', but the Prisma SmartOrder store is unavailable. Check DATABASE_URL, Prisma schema compatibility, and generated client state.",
    );
  }

  return ready;
}

export async function readSmartOrderStore(): Promise<SmartOrderStore> {
  return (await usePrisma()) && prismaStoreModule 
    ? prismaStoreModule.readPrismaSmartOrderStore() 
    : fileStore.readSmartOrderStore();
}

export async function listBatches() {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.listPrismaBatches()
    : fileStore.listBatches();
}

export async function getBatch(batchId: string) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.getPrismaBatch(batchId)
    : fileStore.getBatch(batchId);
}

export async function createBatch(draft: SmartUploadDraft) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.createPrismaBatch(draft)
    : fileStore.createBatch(draft);
}

export async function updateBatch(
  batchId: string,
  updater: ((batch: SmartOrderBatch) => SmartOrderBatch) | Partial<SmartOrderBatch>,
) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.updatePrismaBatch(batchId, updater as any)
    : fileStore.updateBatch(batchId, updater as any);
}

export async function deleteBatch(batchId: string) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.deletePrismaBatch(batchId)
    : fileStore.deleteBatch(batchId);
}

export async function upsertCustomer(input: Parameters<typeof fileStore.upsertCustomer>[0]) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.upsertPrismaCustomer(input)
    : fileStore.upsertCustomer(input);
}

export async function upsertMaterial(input: Parameters<typeof fileStore.upsertMaterial>[0]) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.upsertPrismaMaterial(input)
    : fileStore.upsertMaterial(input);
}

export async function upsertPricing(input: Parameters<typeof fileStore.upsertPricing>[0]) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.upsertPrismaPricing(input)
    : fileStore.upsertPricing(input);
}

export async function deleteEntity(collection: "customers" | "materials" | "pricing", identifier: string) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.deletePrismaEntity(collection, identifier)
    : fileStore.deleteEntity(collection, identifier);
}

export async function appendAuditLog(log: Omit<SmartAuditLog, "id" | "createdAt">) {
  return (await usePrisma()) && prismaStoreModule
    ? prismaStoreModule.appendPrismaAuditLog(log)
    : fileStore.appendAuditLog(log);
}

export async function markSync(kind: "customer" | "material" | "pricing") {
  // Until sync timestamps are persisted in Prisma, keep metadata on the file-backed store.
  return fileStore.markSync(kind);
}
