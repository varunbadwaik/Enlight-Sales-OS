import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, patch
from app.integrations.zoho.sales_invoices import zoho_sales_invoice_adapter

@pytest.mark.asyncio
async def test_selling_rate_locked_to_customer_po():
    vendor_purchase_rate = Decimal("50.00")
    customer_po_selling_rate = Decimal("58.00")

    mock_zoho_response = {
        "invoice": {
            "invoice_id": "inv_12345",
            "invoice_number": "INV-001",
            "status": "draft"
        }
    }

    with patch("app.integrations.zoho.sales_invoices.zoho_client.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_zoho_response

        res = await zoho_sales_invoice_adapter.create_draft_invoice(
            customer_id="cust_999",
            po_number="PO-98765",
            customer_po_selling_rate=customer_po_selling_rate,
            quantity=Decimal("12500"),
            material="HR Plate",
            vehicle_number="MH12AB1234",
            lr_number="LR-16094"
        )

        # Assert payload passed to Zoho has rate = 58.0, NOT 50.0
        called_json = mock_post.call_args.kwargs["json_data"]
        line_item_rate = called_json["line_items"][0]["rate"]

        assert line_item_rate == 58.0
        assert line_item_rate != float(vendor_purchase_rate)
        assert res["status"] == "draft"
        assert res["selling_rate_applied"] == 58.0
