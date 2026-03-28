import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { readSmartOrderStore } from "@/lib/smart-order/data";

export async function GET() {
  try {
    const store = await readSmartOrderStore();
    const workbook = XLSX.utils.book_new();

    const templateRows = [
      {
        OrderType: "OR",
        SalesOrg: "1000",
        DistChannel: "10",
        Division: "00",
        SoldTo: "100234",
        ShipTo: "100234",
        Material: "45000123",
        Qty: 120,
        Price: 5.5,
        ReqDate: "10.03.2026",
      },
    ];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(templateRows), "Orders");
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(store.customers.map((customer) => ({
        customerNumber: customer.customerNumber,
        companyName: customer.companyName,
        salesOrg: customer.salesOrg,
      }))),
      "Customers",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(store.materials.map((material) => ({
        materialNumber: material.materialNumber,
        description: material.description,
        plant: material.plant,
      }))),
      "Materials",
    );

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="tenchi-smartorder-template-v1.xlsx"',
      },
    });
  } catch (error) {
    console.error("template download error", error);
    return NextResponse.json({ error: "Failed to generate template." }, { status: 500 });
  }
}
