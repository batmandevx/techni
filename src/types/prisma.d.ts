// Type declarations for Prisma Client
// Run `npm run db:generate` to generate the actual client

declare module '@prisma/client' {
  export interface PrismaClient {
    customer: {
      findMany: (args?: any) => Promise<any[]>;
      count: (args?: any) => Promise<number>;
      create: (args: any) => Promise<any>;
    };
    material: {
      findMany: (args?: any) => Promise<any[]>;
      count: (args?: any) => Promise<number>;
      create: (args: any) => Promise<any>;
    };
    order: {
      findMany: (args?: any) => Promise<any[]>;
      count: (args?: any) => Promise<number>;
      create: (args: any) => Promise<any>;
      aggregate: (args: any) => Promise<any>;
    };
    orderLine: {
      deleteMany: () => Promise<any>;
    };
    orderStatusHistory: {
      deleteMany: () => Promise<any>;
    };
    inventoryRecord: {
      deleteMany: () => Promise<any>;
      count: (args?: any) => Promise<number>;
      aggregate: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      fields: {
        safetyStock: any;
        closingStock: any;
      };
    };
    forecastRecord: {
      deleteMany: () => Promise<any>;
      findMany: (args?: any) => Promise<any[]>;
      upsert: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
    };
    user: {
      deleteMany: () => Promise<any>;
    };
    upload: {
      deleteMany: () => Promise<any>;
    };
    auditLog: {
      deleteMany: () => Promise<any>;
    };
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
  }

  export const PrismaClient: new () => PrismaClient;
}
