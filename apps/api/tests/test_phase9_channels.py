import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_whatsapp_webhook_intake():
    payload = {
        "sender_phone": "+919876543210",
        "message_text": "Dispatch for PO-98765 vehicle MH12AB1234 weight 12500kg",
        "media_urls": ["http://s3.amazonaws.com/bill.pdf", "http://s3.amazonaws.com/slip.jpg"],
        "po_number": "PO-98765"
    }
    response = client.post("/api/v1/whatsapp/webhook", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "dispatch_id" in data

def test_slack_alert_notification():
    payload = {
        "dispatch_id": "DSP-002",
        "exception_type": "VEHICLE_MISMATCH",
        "description": "Bill vehicle MH12AB9999 does not match LR vehicle MH12AB1234"
    }
    response = client.post("/api/v1/notifications/slack", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "slack_alert_dispatched"
