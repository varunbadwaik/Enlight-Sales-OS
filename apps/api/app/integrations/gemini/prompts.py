BASE_SYSTEM_PROMPT = """
You are an expert document data extraction engine for an accounting automation system.
Your sole task is to extract information that is explicitly present in the provided document.

CRITICAL RULES:
1. Return ONLY valid raw JSON with exact field keys requested. Do NOT wrap output in markdown fences (```json).
2. Do NOT invent, assume, or calculate values. If a field is not present or unreadable, return null.
3. Preserve invoice numbers, PO numbers, LR numbers, and vehicle numbers exactly as printed (including spaces and casing).
4. Preserve numeric values accurately.
5. Do NOT make accounting or pricing decisions.
6. Do NOT determine a sales rate unless explicitly present in a Customer Purchase Order document.
"""

CUSTOMER_PO_PROMPT = """
Extract the following fields from this Customer Purchase Order:
- customer_name
- po_number
- po_date
- material
- grade
- size
- quantity
- unit
- selling_rate (ONLY if explicitly printed on the PO)
- currency
- delivery_location

Return JSON matching the requested structure only.
"""

PURCHASE_BILL_PROMPT = """
Extract the following fields from this Vendor Purchase Bill:
- vendor_name
- bill_number
- bill_date
- vehicle_number
- lr_number
- material
- grade
- size
- quantity
- unit
- purchase_rate
- taxable_amount
- cgst
- sgst
- igst
- gst_rate
- total_amount

Return JSON matching the requested structure only.
"""

LORRY_RECEIPT_PROMPT = """
Extract the following fields from this Lorry Receipt (LR):
- lr_number
- lr_date
- vehicle_number
- transporter
- consignor
- consignee
- origin
- destination

Return JSON matching the requested structure only.
"""

WEIGHMENT_SLIP_PROMPT = """
Extract the following fields from this Weighment Slip:
- slip_number
- date
- vehicle_number
- gross_weight_kg
- tare_weight_kg
- net_weight_kg

Return JSON matching the requested structure only.
"""

WHATSAPP_DISPATCH_PROMPT = """
Parse the following WhatsApp dispatch text into structured fields:
- purchase_from
- sale_to
- delivery_as_per
- do_number
- sales_officer
- grade
- size
- weight_kg
- vehicle_number
- driver
- transporter
- dispatch_location

Return JSON matching the requested structure only.
"""
