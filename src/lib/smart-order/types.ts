export type SmartOrderField =
  | "ORDER_TYPE"
  | "SALES_ORG"
  | "DIST_CHANNEL"
  | "DIVISION"
  | "SOLD_TO"
  | "SHIP_TO"
  | "MATERIAL"
  | "QTY"
  | "PRICE"
  | "REQ_DEL_DATE"
  | "PLANT"
  | "PO_NUMBER"
  | "CURRENCY";

export type BatchStatus =
  | "UPLOADED"
  | "VALIDATING"
  | "AI_MAPPING"
  | "VALIDATED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "PARTIAL_SUCCESS";

export type LineStatus =
  | "PENDING"
  | "VALIDATING"
  | "VALID"
  | "INVALID"
  | "PROCESSING"
  | "CREATED"
  | "FAILED";

export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

export interface SmartUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface SmartOrderCustomer {
  id: string;
  customerNumber: string;
  companyName: string;
  salesOrg: string;
  distChannel: string;
  division: string;
  paymentTerms: string;
  shippingCondition: string;
  country: string;
  region: string;
  city: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export interface SmartOrderMaterial {
  id: string;
  materialNumber: string;
  description: string;
  baseUom: string;
  salesUom: string;
  plant: string;
  storageLocation: string;
  materialGroup: string;
  isActive: boolean;
  availableQty: number;
  category: string;
  lastSyncAt?: string;
}

export interface SmartPricingCondition {
  id: string;
  conditionType: string;
  materialNumber: string;
  customerNumber?: string | null;
  salesOrg: string;
  amount: number;
  currency: string;
  validFrom: string;
  validTo: string;
}

export interface SmartColumnMapping {
  sourceColumn: string;
  targetField: SmartOrderField;
  confidence: number;
  rationale: string;
}

export interface SmartMappingResult {
  mappings: SmartColumnMapping[];
  unmappedColumns: string[];
  warnings: string[];
  overallConfidence: number;
  provider: "gemini" | "heuristic";
}

export interface SmartOrderLine {
  id: string;
  rowIndex: number;
  orderType: string;
  salesOrg: string;
  distChannel: string;
  division: string;
  soldTo: string;
  shipTo: string;
  material: string;
  quantity: number;
  price?: number | null;
  requestedDeliveryDate: string | null;
  plant: string;
  poNumber?: string | null;
  currency: string;
  sapOrderNumber?: string | null;
  sapItemNumber?: string | null;
  status: LineStatus;
  validationErrors: string[];
  warnings: string[];
  sapResponse?: Record<string, unknown> | null;
  retryCount: number;
  processingDurationMs?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SmartValidationRow {
  line: SmartOrderLine;
  valid: boolean;
  duplicate: boolean;
  suggestions: {
    soldTo: SmartSuggestion[];
    material: SmartSuggestion[];
  };
}

export interface SmartValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  duplicates: number;
}

export interface SmartSuggestion {
  value: string;
  label: string;
  score: number;
}

export interface SmartBatchReport {
  startedAt?: string;
  completedAt?: string;
  progressPercent: number;
  createdGroups: number;
  failedGroups: number;
  averageProcessingTimeMs: number;
  message?: string;
}

export interface SmartOrderBatch {
  id: string;
  batchName: string;
  fileName: string;
  fileUrl: string;
  totalOrders: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  status: BatchStatus;
  aiMappingConfidence?: number | null;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  mappingConfig: SmartMappingResult;
  filePreview: Record<string, unknown>[];
  lines: SmartOrderLine[];
  report?: SmartBatchReport;
}

export interface SmartAuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface SmartOrderStore {
  metadata: {
    version: string;
    customerSyncAt?: string;
    materialSyncAt?: string;
    pricingSyncAt?: string;
    lastUpdatedAt: string;
  };
  users: SmartUser[];
  customers: SmartOrderCustomer[];
  materials: SmartOrderMaterial[];
  pricing: SmartPricingCondition[];
  batches: SmartOrderBatch[];
  auditLogs: SmartAuditLog[];
}

export interface SmartUploadDraft {
  batchName: string;
  fileName: string;
  uploadedBy: string;
  filePreview: Record<string, unknown>[];
  mappingConfig: SmartMappingResult;
  lines: SmartOrderLine[];
}

export interface SmartAnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  salesOrg?: string;
  customer?: string;
  status?: string;
}

export interface SmartAnalyticsSnapshot {
  filters: SmartAnalyticsFilters;
  kpis: {
    ordersCreated: number;
    ordersCreatedChange: number;
    totalOrderValue: number;
    totalOrderValueChange: number;
    skuMix: number;
    fillRate: number;
    backordersQty: number;
    backordersValue: number;
    successRate: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
    totalCustomers: number;
    totalMaterials: number;
  };
  ordersOverTime: Array<{ period: string; count: number; value: number }>;
  orderValueByCustomer: Array<{ customer: string; value: number }>;
  skuDistribution: Array<{ name: string; value: number }>;
  statusBreakdown: Array<{ period: string; created: number; failed: number; pending: number }>;
  processingTrend: Array<{ period: string; avgMs: number }>;
  topCustomers: Array<{ customerNumber: string; companyName: string; value: number; orderCount: number }>;
  recentBatches: SmartOrderBatch[];
}
