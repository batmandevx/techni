import os
import random
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Tenchi SmartOrder SAP Service", version="1.0.0")

SAP_MOCK = os.getenv("SAP_MOCK", "true").lower() != "false"


class OrderItem(BaseModel):
    material: str
    quantity: float
    price: Optional[float] = None
    plant: str = "1000"
    uom: str = "EA"


class SalesOrderPayload(BaseModel):
    order_type: str = "OR"
    sales_org: str
    dist_channel: str
    division: str
    sold_to: str
    ship_to: str
    req_del_date: Optional[str] = None
    currency: str = "USD"
    po_number: Optional[str] = None
    items: List[OrderItem]


class BulkOrderPayload(BaseModel):
    orders: List[SalesOrderPayload]


def mock_order_number() -> str:
    return str(random.randint(1000000000, 1999999999))


def create_sales_order(payload: SalesOrderPayload) -> Dict[str, Any]:
    time.sleep(0.5)

    if not SAP_MOCK:
        raise NotImplementedError("Real PyRFC wiring is not enabled in this scaffold.")

    if random.random() <= 0.95:
        order_number = mock_order_number()
        return {
            "success": True,
            "order_number": order_number,
            "response": {
                "SALESDOCUMENT": order_number,
                "RETURN": [
                    {
                        "TYPE": "S",
                        "ID": "V1",
                        "NUMBER": "311",
                        "MESSAGE": "Sales document created successfully.",
                    }
                ],
            },
        }

    return {
        "success": False,
        "errors": [
            {
                "TYPE": "E",
                "ID": "V1",
                "NUMBER": "311",
                "MESSAGE": "Credit limit exceeded for sold-to party.",
            }
        ],
    }


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "mock": SAP_MOCK,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/api/create-sales-order")
def create_sales_order_endpoint(payload: SalesOrderPayload) -> Dict[str, Any]:
    return create_sales_order(payload)


@app.post("/api/bulk-create-orders")
def bulk_create_orders(payload: BulkOrderPayload) -> Dict[str, Any]:
    results = []
    for order in payload.orders:
        attempt = 0
        result: Dict[str, Any] = {"success": False}
        while attempt < 3:
            attempt += 1
            result = create_sales_order(order)
            if result.get("success"):
                break
        results.append(
            {
                "sold_to": order.sold_to,
                "attempts": attempt,
                **result,
            }
        )
    return {"results": results}


@app.get("/api/check-availability")
def check_availability(material: str, plant: str = "1000", qty: float = 1) -> Dict[str, Any]:
    available = random.randint(100, 5000)
    return {
        "material": material,
        "plant": plant,
        "requested_qty": qty,
        "available_qty": available,
        "success": available >= qty,
    }


@app.get("/api/customer-info/{customer_id}")
def customer_info(customer_id: str) -> Dict[str, Any]:
    return {
        "customer_id": customer_id,
        "company_name": f"Mock Customer {customer_id}",
        "sales_org": "1000",
        "dist_channel": "10",
        "division": "00",
        "country": "US",
    }
