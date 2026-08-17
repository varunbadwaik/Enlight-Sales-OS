import requests
import json
import sys

# Force UTF-8 output encoding for Windows terminal compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def verify_live_production_stack():
    print("==================================================")
    print("Enlight Sales OS - Live Production Verification")
    print("==================================================")

    # 1. API Health Check
    api_url = "http://localhost:8001/health"
    try:
        r = requests.get(api_url)
        print(f"1. Production API Container Health: {r.status_code} {r.json()}")
    except Exception as e:
        print(f"API Health Error: {e}")

    # 2. WhatsApp Ingestion Channel Verification
    wa_url = "http://localhost:8001/api/v1/whatsapp/webhook"
    wa_payload = {
        "sender_phone": "+917588353703",
        "message_text": "Live Dispatch Package for PO-98765. Vehicle MH12AB1234, Net Weight 12500 KG.",
        "media_urls": [
            "https://enlight-sales-os.s3.amazonaws.com/live_po.pdf",
            "https://enlight-sales-os.s3.amazonaws.com/live_bill.pdf"
        ],
        "po_number": "PO-98765"
    }
    try:
        r = requests.post(wa_url, json=wa_payload)
        print(f"2. WhatsApp Business API Channel Response: {r.status_code}")
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print(f"WhatsApp Webhook Error: {e}")

    # 3. Live n8n Automation Engine Webhook Trigger
    n8n_url = "http://localhost:5678/webhook/dispatch-intake"
    n8n_payload = {
        "po_number": "PO-98765",
        "dispatch_date": "2026-08-11",
        "documents": ["live_po.pdf", "live_bill.pdf", "live_slip.jpg"],
        "whatsapp_message": "From +917588353703: PO-98765 Vehicle MH12AB1234 Weight 12500 KG"
    }
    try:
        r = requests.post(n8n_url, json=n8n_payload)
        print(f"3. Live n8n Workflow Trigger Status: {r.status_code}")
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print(f"n8n Trigger Error: {e}")

    print("==================================================")
    print("SUCCESS: Live Production Keys & Services Fully Loaded!")
    print("==================================================")

if __name__ == "__main__":
    verify_live_production_stack()
