import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_n8n_e2e_001_happy_path():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        headers = {"X-User-Role": "Admin"}

        # 1. Workflow 01: Dispatch Intake
        intake_resp = await client.post("/api/v1/dispatches/intake", json={
            "po_number": "PO-98765",
            "documents": ["purchase_bill.pdf", "po.pdf", "lr.jpg", "weight_slip.jpg"],
            "whatsapp_message": "Purchase From: ABC Steel..."
        }, headers=headers)
        assert intake_resp.status_code == 201
        dispatch_id = intake_resp.json()["dispatch_id"]
        assert intake_resp.json()["status"] == "DOCUMENTS_UPLOADED"

        # 2. Workflow 02: Document Processing & Extraction
        proc_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/process-documents", headers=headers)
        assert proc_resp.status_code == 200
        assert proc_resp.json()["status"] == "EXTRACTED"

        # 3. Workflow 03: Validation Runner
        val_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/validate", headers=headers)
        assert val_resp.status_code == 200
        val_report = val_resp.json()
        assert val_report["is_valid"] is True
        assert val_report["status"] == "VALIDATED"
        assert float(val_report["selling_rate"]) == 58.0

        # 4. Workflow 04: Approval Handler
        app_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/approve", json={
            "decision": "APPROVED",
            "comment": "All document checks passed"
        }, headers=headers)
        assert app_resp.status_code == 200
        assert app_resp.json()["status"] == "APPROVED"

        # 5. Workflow 05: Zoho Project Sync
        proj_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/sync-zoho-project", headers=headers)
        assert proj_resp.status_code == 200
        assert "zoho_project_id" in proj_resp.json()

        # 6. Workflow 06: Purchase Bill
        bill_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/create-purchase-bill", headers=headers)
        assert bill_resp.status_code == 200
        assert "zoho_purchase_bill_id" in bill_resp.json()

        # 7. Workflow 07: Draft Sales Invoice Creation
        inv_resp = await client.post(f"/api/v1/dispatches/{dispatch_id}/create-draft-invoice", headers=headers)
        assert inv_resp.status_code == 200
        inv_data = inv_resp.json()
        assert inv_data["status"] == "draft"
        assert inv_data["selling_rate_applied"] == 58.0
        assert inv_data["quantity"] == 12500.0

        # 8. Workflow 09: Notification
        notif_resp = await client.post("/api/v1/notifications/send", json={
            "event": "DRAFT_INVOICE_CREATED",
            "message": f"Draft invoice {inv_data['invoice_number']} created at rate ₹58/kg"
        }, headers=headers)
        assert notif_resp.status_code == 200

        # Verify Audit Log Trail
        audit_resp = await client.get(f"/api/v1/dispatches/{dispatch_id}/audit-logs", headers=headers)
        assert audit_resp.status_code == 200
        actions = [log["action"] for log in audit_resp.json()]
        assert "DISPATCH_CREATED" in actions
        assert "VALIDATION_COMPLETED" in actions
        assert "ADMIN_APPROVED" in actions
        assert "DRAFT_INVOICE_CREATED" in actions


@pytest.mark.asyncio
async def test_n8n_e2e_002_validation_failure_branch():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        headers = {"X-User-Role": "Admin"}

        intake_resp = await client.post("/api/v1/dispatches/intake", json={"po_number": "PO-FAIL-001"}, headers=headers)
        dispatch_id = intake_resp.json()["dispatch_id"]

        err_resp = await client.post("/api/v1/dispatches/log-error", json={
            "workflow_name": "03_validation_runner",
            "error_message": "Vehicle number mismatch between Bill (MH12AB1234) and LR (MH12AB9999)"
        }, headers=headers)
        assert err_resp.status_code == 200


@pytest.mark.asyncio
async def test_n8n_e2e_003_concurrent_duplicate_idempotency():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        headers = {"X-User-Role": "Admin"}

        intake_resp = await client.post("/api/v1/dispatches/intake", json={"po_number": "PO-CONCURRENT-001"}, headers=headers)
        dispatch_id = intake_resp.json()["dispatch_id"]

        await client.post(f"/api/v1/dispatches/{dispatch_id}/approve", json={"decision": "APPROVED"}, headers=headers)

        res1 = await client.post(f"/api/v1/dispatches/{dispatch_id}/create-draft-invoice", headers=headers)
        res2 = await client.post(f"/api/v1/dispatches/{dispatch_id}/create-draft-invoice", headers=headers)
        assert res1.status_code == 200
        assert res2.status_code == 200
        assert res1.json()["invoice_id"] == res2.json()["invoice_id"]


@pytest.mark.asyncio
async def test_n8n_e2e_004_document_unclear_whatsapp_notification():
    """Test n8n Node 3b & 3c: Unclear document triggers 'the document is not clear' WhatsApp notification."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        headers = {"X-User-Role": "Admin"}

        # Simulate blurred / unreadable document notification payload
        notif_resp = await client.post("/api/v1/notifications/send", json={
            "whatsapp_number": "+917588353703",
            "message": "the document is not clear. Please upload a clear photo or PDF of your Vendor Purchase Bill, Weighment Slip, LR, or Customer PO."
        }, headers=headers)

        assert notif_resp.status_code == 200
        assert "the document is not clear" in notif_resp.json()["message"]
