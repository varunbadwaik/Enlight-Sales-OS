import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_full_dispatch_workflow_e2e():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        headers = {"X-User-Role": "Admin"}
        # 1. Dispatch Intake
        intake_resp = await client.post("/api/v1/dispatches/intake", json={
            "po_number": "PO-98765",
            "dispatch_date": "2026-08-11",
            "documents": ["purchase_bill.pdf", "po.pdf", "lr.jpg", "weight_slip.jpg"],
            "whatsapp_message": "Purchase From: ABC Steel, Sale To: XYZ Industries..."
        }, headers=headers)
        assert intake_resp.status_code == 201
        intake_data = intake_resp.json()
        dispatch_id = intake_data["dispatch_id"]
        assert intake_data["status"] == "DOCUMENTS_UPLOADED"

        # 2. Validation Engine Call
        val_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/validate", headers=headers)
        assert val_resp.status_code == 200
        val_data = val_resp.json()
        assert val_data["is_valid"] is True
        assert val_data["status"] == "VALIDATED"
        assert float(val_data["selling_rate"]) == 58.0

        # 3. Admin Approval
        appr_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/approve", json={
            "decision": "APPROVED",
            "comment": "All documents verified"
        }, headers=headers)
        assert appr_resp.status_code == 200
        assert appr_resp.json()["status"] == "APPROVED"

        # 4. Draft Sales Invoice Creation
        inv_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/create-draft-invoice", headers=headers)
        assert inv_resp.status_code == 200
        inv_data = inv_resp.json()
        assert inv_data["status"] == "draft"
        assert inv_data["selling_rate_applied"] == 58.0
        assert inv_data["source"] == "Customer PO (PO-98765)"

        # 5. Idempotency Test: Repeat request returns cached result
        inv_repeat_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/create-draft-invoice", headers=headers)
        assert inv_repeat_resp.status_code == 200
        assert inv_repeat_resp.json() == inv_data

        # 6. Audit Trail Check
        audit_resp = await client.get(f"/api/v1/dispatches/{dispatch_id}/audit-logs", headers=headers)
        assert audit_resp.status_code == 200
        audit_logs = audit_resp.json()
        actions = [log["action"] for log in audit_logs]

        assert "DISPATCH_CREATED" in actions
        assert "VALIDATION_COMPLETED" in actions
        assert "ADMIN_APPROVED" in actions
        assert "DRAFT_INVOICE_CREATED" in actions
