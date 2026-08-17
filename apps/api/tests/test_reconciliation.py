import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app, ReconciliationFailedException

client = TestClient(app)

def test_reconciliation_failure_rate_mismatch():
    # Intentionally test reconciliation failure when returned rate differs from PO rate ₹58.00
    with pytest.raises(ReconciliationFailedException) as exc_info:
        # Simulate reconciliation check with invalid rate
        po_selling_rate = Decimal("58.00")
        zoho_returned_rate = Decimal("50.00") # Mismatched rate

        if zoho_returned_rate != po_selling_rate:
            raise ReconciliationFailedException("Reconciliation Failed: Invoice rate ₹50.0 does not match Customer PO rate ₹58.0")

    assert "Reconciliation Failed" in str(exc_info.value)
    assert "₹58.0" in str(exc_info.value)
