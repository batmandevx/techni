import { prisma } from "@/lib/prisma";
import { createSeedStore } from "@/lib/smart-order/seed";
import {
  SmartAuditLog,
  SmartMappingResult,
  SmartOrderBatch,
  SmartOrderCustomer,
  SmartOrderLine,
  SmartOrderMaterial,
  SmartOrderStore,
  SmartPricingCondition,
  SmartUploadDraft,
} from "@/lib/smart-order/types";

const prismaAny = prisma as any;

function safeParse<T>(value: unknown, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

function normalizeBatchPayload(batch: SmartOrderBatch) {
  return JSON.stringify({
    mappingConfig: batch.mappingConfig,
    filePreview: batch.filePreview,
    report: batch.report,
  });
}

function serializeLine(batchId: string, line: SmartOrderLine) {
  return {
    id: line.id,
    batchId,
    rowIndex: line.rowIndex,
    orderType: line.orderType,
    salesOrg: line.salesOrg,
    distChannel: line.distChannel,
    division: line.division,
    soldTo: line.soldTo,
    shipTo: line.shipTo,
    material: line.material,
    quantity: line.quantity,
    unitPrice: line.price ?? null,
    lineTotal: line.price ? line.price * line.quantity : null,
    requestedDeliveryDate: line.requestedDeliveryDate ? new Date(line.requestedDeliveryDate) : null,
    plant: line.plant,
    poNumber: line.poNumber ?? null,
    currency: line.currency,
    sapOrderNumber: line.sapOrderNumber ?? null,
    sapItemNumber: line.sapItemNumber ?? null,
    status: line.status,
    validationErrors: JSON.stringify(line.validationErrors ?? []),
    sapResponse: line.sapResponse ? JSON.stringify(line.sapResponse) : null,
    retryCount: line.retryCount,
    createdAt: line.createdAt ? new Date(line.createdAt) : new Date(),
    updatedAt: line.updatedAt ? new Date(line.updatedAt) : new Date(),
  };
}

function deserializeLine(record: any): SmartOrderLine {
  return {
    id: record.id,
    rowIndex: record.rowIndex,
    orderType: record.orderType,
    salesOrg: record.salesOrg,
    distChannel: record.distChannel,
    division: record.division,
    soldTo: record.soldTo,
    shipTo: record.shipTo,
    material: record.material,
    quantity: Number(record.quantity),
    price: record.unitPrice ?? null,
    requestedDeliveryDate: record.requestedDeliveryDate
      ? new Date(record.requestedDeliveryDate).toISOString().slice(0, 10)
      : null,
    plant: record.plant ?? "1000",
    poNumber: record.poNumber ?? null,
    currency: record.currency ?? "USD",
    sapOrderNumber: record.sapOrderNumber ?? null,
    sapItemNumber: record.sapItemNumber ?? null,
    status: record.status,
    validationErrors: safeParse<string[]>(record.validationErrors, []),
    warnings: [],
    sapResponse: safeParse<Record<string, unknown> | null>(record.sapResponse, null),
    retryCount: record.retryCount ?? 0,
    processingDurationMs: record.processingDurationMs ?? null,
    createdAt: record.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: record.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function deserializeBatch(record: any): SmartOrderBatch {
  const payload = safeParse<{
    mappingConfig?: SmartMappingResult;
    filePreview?: Record<string, unknown>[];
    report?: SmartOrderBatch["report"];
  }>(record.mappingConfig, {});

  return {
    id: record.id,
    batchName: record.batchName,
    fileName: record.fileName,
    fileUrl: record.fileUrl,
    totalOrders: record.totalOrders,
    successCount: record.successCount,
    failedCount: record.failedCount,
    pendingCount: record.pendingCount,
    status: record.status,
    aiMappingConfidence: record.aiMappingConfidence,
    uploadedBy: record.uploadedBy,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    mappingConfig:
      payload.mappingConfig ??
      ({
        mappings: [],
        unmappedColumns: [],
        warnings: [],
        overallConfidence: 0,
        provider: "heuristic",
      } satisfies SmartMappingResult),
    filePreview: payload.filePreview ?? [],
    lines: (record.orderLines ?? []).map(deserializeLine),
    report: payload.report,
  };
}

function deserializeCustomer(record: any): SmartOrderCustomer {
  return {
    id: record.id,
    customerNumber: record.customerNumber,
    companyName: record.companyName,
    salesOrg: record.salesOrg,
    distChannel: record.distChannel,
    division: record.division,
    paymentTerms: record.paymentTerms,
    shippingCondition: record.shippingCondition,
    country: record.country,
    region: record.region ?? "",
    city: record.city ?? "",
    isActive: record.isActive,
    lastSyncAt: record.updatedAt?.toISOString?.(),
  };
}

function deserializeMaterial(record: any): SmartOrderMaterial {
  return {
    id: record.id,
    materialNumber: record.materialNumber,
    description: record.description,
    baseUom: record.baseUom,
    salesUom: record.salesUom,
    plant: record.plant,
    storageLocation: record.storageLocation ?? "",
    materialGroup: record.materialGroup ?? "",
    isActive: record.isActive,
    availableQty: record.availableQty ?? 0,
    category: record.category ?? "General",
    lastSyncAt: record.updatedAt?.toISOString?.(),
  };
}

function deserializePricing(record: any): SmartPricingCondition {
  return {
    id: record.id,
    conditionType: record.conditionType,
    materialNumber: record.materialNumber,
    customerNumber: record.customerNumber,
    salesOrg: record.salesOrg,
    amount: Number(record.amount),
    currency: record.currency,
    validFrom: record.validFrom.toISOString(),
    validTo: record.validTo?.toISOString?.() ?? new Date().toISOString(),
  };
}

function getTimestamp(records: Array<{ updatedAt?: Date }>): string | undefined {
  const timestamps = records
    .map((record) => record.updatedAt?.getTime?.() ?? 0)
    .filter((value) => value > 0);

  if (!timestamps.length) {
    return undefined;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

export async function prismaAvailable(): Promise<boolean> {
  try {
    if (!prismaAny.orderBatch || !prismaAny.customerMaster || !prismaAny.materialMaster) {
      return false;
    }

    await prismaAny.$connect?.();
    await prismaAny.customerMaster.findMany({ take: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function readPrismaSmartOrderStore(): Promise<SmartOrderStore> {
  const [users, customers, materials, pricing, batches] = await Promise.all([
    prismaAny.user?.findMany?.() ?? [],
    prismaAny.customerMaster.findMany({ orderBy: { companyName: "asc" } }),
    prismaAny.materialMaster.findMany({ orderBy: { description: "asc" } }),
    prismaAny.pricingCondition.findMany({ orderBy: { materialNumber: "asc" } }),
    prismaAny.orderBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: { orderLines: { orderBy: { rowIndex: "asc" } } },
    }),
  ]);

  return {
    metadata: {
      version: "1.0.0",
      customerSyncAt: getTimestamp(customers),
      materialSyncAt: getTimestamp(materials),
      pricingSyncAt: getTimestamp(pricing),
      lastUpdatedAt: new Date().toISOString(),
    },
    users: (users ?? []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive ?? true,
    })),
    customers: customers.map(deserializeCustomer),
    materials: materials.map(deserializeMaterial),
    pricing: pricing.map(deserializePricing),
    batches: batches.map(deserializeBatch),
    auditLogs: [],
  };
}

export async function listPrismaBatches(): Promise<SmartOrderBatch[]> {
  const store = await readPrismaSmartOrderStore();
  return store.batches;
}

export async function getPrismaBatch(batchId: string): Promise<SmartOrderBatch | undefined> {
  const batch = await prismaAny.orderBatch.findUnique({
    where: { id: batchId },
    include: { orderLines: { orderBy: { rowIndex: "asc" } } },
  });

  return batch ? deserializeBatch(batch) : undefined;
}

export async function createPrismaBatch(draft: SmartUploadDraft): Promise<SmartOrderBatch> {
  const batch = await prismaAny.orderBatch.create({
    data: {
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
      mappingConfig: JSON.stringify({
        mappingConfig: draft.mappingConfig,
        filePreview: draft.filePreview,
        report: {
          progressPercent: 0,
          createdGroups: 0,
          failedGroups: 0,
          averageProcessingTimeMs: 0,
          message: "Ready for SAP processing.",
        },
      }),
      orderLines: {
        create: draft.lines.map((line) => serializeLine("placeholder", line)).map(({ batchId: _batchId, ...line }) => line),
      },
    },
    include: { orderLines: { orderBy: { rowIndex: "asc" } } },
  });

  return deserializeBatch(batch);
}

async function persistPrismaBatch(batch: SmartOrderBatch): Promise<SmartOrderBatch> {
  await prismaAny.orderBatch.update({
    where: { id: batch.id },
    data: {
      batchName: batch.batchName,
      fileName: batch.fileName,
      fileUrl: batch.fileUrl,
      totalOrders: batch.totalOrders,
      successCount: batch.successCount,
      failedCount: batch.failedCount,
      pendingCount: batch.pendingCount,
      status: batch.status,
      aiMappingConfidence: batch.aiMappingConfidence,
      uploadedBy: batch.uploadedBy,
      mappingConfig: normalizeBatchPayload(batch),
    },
  });

  await prismaAny.orderLineBatch.deleteMany({ where: { batchId: batch.id } });
  if (batch.lines.length) {
    await prismaAny.orderLineBatch.createMany({
      data: batch.lines.map((line) => serializeLine(batch.id, line)),
    });
  }

  const refreshed = await getPrismaBatch(batch.id);
  if (!refreshed) {
    throw new Error("Failed to reload batch after persistence.");
  }

  return refreshed;
}

export async function updatePrismaBatch(
  batchId: string,
  updater: (batch: SmartOrderBatch) => SmartOrderBatch,
): Promise<SmartOrderBatch | null> {
  const current = await getPrismaBatch(batchId);
  if (!current) {
    return null;
  }

  return persistPrismaBatch({
    ...updater(current),
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePrismaBatch(batchId: string): Promise<SmartOrderStore> {
  await prismaAny.orderLineBatch.deleteMany({ where: { batchId } });
  await prismaAny.orderBatch.delete({ where: { id: batchId } });
  return readPrismaSmartOrderStore();
}

export async function upsertPrismaCustomer(input: Partial<SmartOrderCustomer> & { customerNumber: string; companyName: string }) {
  await prismaAny.customerMaster.upsert({
    where: { customerNumber: input.customerNumber },
    update: {
      companyName: input.companyName,
      salesOrg: input.salesOrg ?? "1000",
      distChannel: input.distChannel ?? "10",
      division: input.division ?? "00",
      paymentTerms: input.paymentTerms ?? "N30",
      shippingCondition: input.shippingCondition ?? "01",
      country: input.country ?? "United States",
      region: input.region ?? "",
      city: input.city ?? "",
      isActive: input.isActive ?? true,
    },
    create: {
      customerNumber: input.customerNumber,
      companyName: input.companyName,
      salesOrg: input.salesOrg ?? "1000",
      distChannel: input.distChannel ?? "10",
      division: input.division ?? "00",
      paymentTerms: input.paymentTerms ?? "N30",
      shippingCondition: input.shippingCondition ?? "01",
      country: input.country ?? "United States",
      region: input.region ?? "",
      city: input.city ?? "",
      isActive: input.isActive ?? true,
    },
  });

  return readPrismaSmartOrderStore();
}

export async function upsertPrismaMaterial(input: Partial<SmartOrderMaterial> & { materialNumber: string; description: string }) {
  await prismaAny.materialMaster.upsert({
    where: { materialNumber: input.materialNumber },
    update: {
      description: input.description,
      baseUom: input.baseUom ?? "EA",
      salesUom: input.salesUom ?? "EA",
      plant: input.plant ?? "1000",
      storageLocation: input.storageLocation ?? "",
      materialGroup: input.materialGroup ?? "GENERAL",
      category: input.category ?? "General",
      isActive: input.isActive ?? true,
      availableQty: input.availableQty ?? 0,
    },
    create: {
      materialNumber: input.materialNumber,
      description: input.description,
      baseUom: input.baseUom ?? "EA",
      salesUom: input.salesUom ?? "EA",
      plant: input.plant ?? "1000",
      storageLocation: input.storageLocation ?? "",
      materialGroup: input.materialGroup ?? "GENERAL",
      category: input.category ?? "General",
      isActive: input.isActive ?? true,
      availableQty: input.availableQty ?? 0,
    },
  });

  return readPrismaSmartOrderStore();
}

export async function upsertPrismaPricing(input: Partial<SmartPricingCondition> & { materialNumber: string; conditionType: string; amount: number }) {
  if (input.id) {
    await prismaAny.pricingCondition.update({
      where: { id: input.id },
      data: {
        conditionType: input.conditionType,
        materialNumber: input.materialNumber,
        customerNumber: input.customerNumber ?? null,
        salesOrg: input.salesOrg ?? "1000",
        amount: input.amount,
        currency: input.currency ?? "USD",
        validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
        validTo: input.validTo ? new Date(input.validTo) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  } else {
    await prismaAny.pricingCondition.create({
      data: {
        conditionType: input.conditionType,
        materialNumber: input.materialNumber,
        customerNumber: input.customerNumber ?? null,
        salesOrg: input.salesOrg ?? "1000",
        amount: input.amount,
        currency: input.currency ?? "USD",
        validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
        validTo: input.validTo ? new Date(input.validTo) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return readPrismaSmartOrderStore();
}

export async function deletePrismaEntity(collection: "customers" | "materials" | "pricing", identifier: string) {
  if (collection === "customers") {
    await prismaAny.customerMaster.delete({ where: { customerNumber: identifier } });
  } else if (collection === "materials") {
    await prismaAny.materialMaster.delete({ where: { materialNumber: identifier } });
  } else {
    await prismaAny.pricingCondition.delete({ where: { id: identifier } });
  }

  return readPrismaSmartOrderStore();
}

export async function appendPrismaAuditLog(log: Omit<SmartAuditLog, "id" | "createdAt">) {
  const existingBatch = log.entityType === "OrderBatch" ? await prismaAny.orderBatch.findUnique({ where: { id: log.entityId } }) : null;

  if (existingBatch) {
    await prismaAny.auditLogBatch.create({
      data: {
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: JSON.stringify(log.details),
      },
    });
  }

  return readPrismaSmartOrderStore();
}

export function prismaSeedStore(): SmartOrderStore {
  return createSeedStore();
}
