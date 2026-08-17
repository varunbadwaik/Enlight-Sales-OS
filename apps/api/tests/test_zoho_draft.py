import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, patch
from app.integrations.zoho.sales_invoices import zoho_sales_invoice_adapter, DraftStatusViolationException

@pytest.mark.asyncio
async def test_zoho_draft_status_violation_raises_exception():
    mock_non_draft_response = {
        "invoice": {
            "invoice_id": "inv_99999",
            "invoice_number": "INV-FINAL-999",
            "status": "sent" # VIOLATION: Should be 'draft'
        }
    }

    with patch("app.integrations.zoho.sales_invoices.zoho_client.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_non_draft_response

        with pytest.raises(DraftStatusViolationException) as exc_info:
            await zoho_sales_invoice_adapter.create_draft_invoice(
                customer_id="cust_999",
                po_number="PO-98765",
                customer_po_selling_rate=Decimal("58.00"),
                quantity=Decimal("12500"),
                material="HR Plate",
                vehicle_number="MH12AB1234",
                lr_number="LR-16094"
            )

        assert "CRITICAL SECURITY VIOLATION" in str(exc_info.value)
        assert "expected 'draft'" in str(exc_info.value)
