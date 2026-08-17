from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import date

class CustomerPOExtraction(BaseModel):
    customer_name: Optional[str] = Field(None, description="Name of the customer placing the order")
    po_number: Optional[str] = Field(None, description="Customer Purchase Order Number")
    po_date: Optional[date] = Field(None, description="Date of the Purchase Order")
    material: Optional[str] = Field(None, description="Material or product description")
    grade: Optional[str] = Field(None, description="Material grade or specification")
    size: Optional[str] = Field(None, description="Material size dimensions")
    quantity: Optional[Decimal] = Field(None, description="Ordered quantity")
    unit: Optional[str] = Field(None, description="Unit of measurement e.g. KG, MT")
    selling_rate: Optional[Decimal] = Field(None, description="Agreed selling rate per unit")
    currency: Optional[str] = Field("INR", description="Currency code")
    delivery_location: Optional[str] = Field(None, description="Destination or delivery city/address")

class PurchaseBillExtraction(BaseModel):
    vendor_name: Optional[str] = Field(None, description="Name of the vendor/supplier")
    bill_number: Optional[str] = Field(None, description="Vendor Purchase Bill / Invoice Number")
    bill_date: Optional[date] = Field(None, description="Bill date")
    vehicle_number: Optional[str] = Field(None, description="Vehicle number used for dispatch")
    lr_number: Optional[str] = Field(None, description="Lorry Receipt / Transporter bill number")
    material: Optional[str] = Field(None, description="Material description")
    grade: Optional[str] = Field(None, description="Grade")
    size: Optional[str] = Field(None, description="Dimensions")
    quantity: Optional[Decimal] = Field(None, description="Billed quantity")
    unit: Optional[str] = Field(None, description="Unit e.g. KG, MT")
    purchase_rate: Optional[Decimal] = Field(None, description="Vendor purchase rate per unit")
    taxable_amount: Optional[Decimal] = Field(None, description="Subtotal before taxes")
    cgst: Optional[Decimal] = Field(None, description="CGST amount")
    sgst: Optional[Decimal] = Field(None, description="SGST amount")
    igst: Optional[Decimal] = Field(None, description="IGST amount")
    gst_rate: Optional[Decimal] = Field(None, description="GST rate percentage e.g. 18")
    total_amount: Optional[Decimal] = Field(None, description="Grand total bill amount")

class LorryReceiptExtraction(BaseModel):
    lr_number: Optional[str] = Field(None, description="Lorry Receipt Number")
    lr_date: Optional[date] = Field(None, description="LR Date")
    vehicle_number: Optional[str] = Field(None, description="Transport vehicle registration number")
    transporter: Optional[str] = Field(None, description="Name of transport company")
    consignor: Optional[str] = Field(None, description="Consignor / Sender company name")
    consignee: Optional[str] = Field(None, description="Consignee / Recipient company name")
    origin: Optional[str] = Field(None, description="Dispatch origin location")
    destination: Optional[str] = Field(None, description="Delivery destination location")

class WeighmentSlipExtraction(BaseModel):
    slip_number: Optional[str] = Field(None, description="Weighment slip reference number")
    date: Optional[date] = Field(None, description="Weighment date")
    vehicle_number: Optional[str] = Field(None, description="Weighed vehicle registration number")
    gross_weight_kg: Optional[Decimal] = Field(None, description="Gross vehicle weight in KG")
    tare_weight_kg: Optional[Decimal] = Field(None, description="Tare (empty vehicle) weight in KG")
    net_weight_kg: Optional[Decimal] = Field(None, description="Net material weight in KG")

class WhatsAppDispatchExtraction(BaseModel):
    purchase_from: Optional[str] = Field(None, description="Vendor name")
    sale_to: Optional[str] = Field(None, description="Customer name")
    delivery_as_per: Optional[str] = Field(None, description="Customer PO reference")
    do_number: Optional[str] = Field(None, description="Delivery Order number")
    sales_officer: Optional[str] = Field(None, description="Sales executive name")
    grade: Optional[str] = Field(None, description="Material grade")
    size: Optional[str] = Field(None, description="Material size")
    weight_kg: Optional[Decimal] = Field(None, description="Weight in KG")
    vehicle_number: Optional[str] = Field(None, description="Vehicle number")
    driver: Optional[str] = Field(None, description="Driver name")
    transporter: Optional[str] = Field(None, description="Transporter name")
    dispatch_location: Optional[str] = Field(None, description="Dispatch source city/factory")
