import requests
import json
import sys

# Ensure UTF-8 output encoding for Windows terminal compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def trigger_live_n8n_flow():
    # Test both active production webhook and test mode webhook URLs
    webhook_urls = [
        "http://localhost:5678/webhook-test/dispatch-intake",
        "http://localhost:5678/webhook/dispatch-intake"
    ]
    
    payload = {
        "po_number": "PO-98765",
        "dispatch_date": "2026-08-11",
        "documents": [
            "clean_po.pdf",
            "clean_bill.pdf",
            "clean_lr.pdf",
            "clean_slip.jpg"
        ],
        "whatsapp_message": "Purchase From: ABC Steel\nSale To: XYZ Industries\nPO: PO-98765\nVehicle: MH12AB1234\nWeight: 12500 KG"
    }

    for url in webhook_urls:
        print(f"Triggering n8n Webhook: {url}...")
        try:
            response = requests.post(url, json=payload, timeout=10)
            print(f"Response Status Code: {response.status_code}")
            print("Response Body:")
            try:
                print(json.dumps(response.json(), indent=2))
            except Exception:
                print(response.text)
            if response.status_code == 200:
                print(f"SUCCESS: Triggered workflow via {url}")
                break
        except Exception as e:
            print(f"Connection Exception: {e}")

if __name__ == "__main__":
    trigger_live_n8n_flow()
