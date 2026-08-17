from decimal import Decimal
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.config import settings
from app.services.normalizer import normalizer

class ValidationRuleResult(BaseModel):
    rule_name: str
    status: str # PASSED, FAILED, WARNING
    message: str
    source_values: Dict[str, Any]

class DispatchValidationReport(BaseModel):
    is_valid: bool
    status: str # VALIDATED, VALIDATION_REQUIRED
    results: List[ValidationRuleResult]
    selling_rate: Optional[Decimal] = None
    purchase_rate: Optional[Decimal] = None

class ValidatorEngine:
    def __init__(self, weight_tolerance_percent: float = settings.DEFAULT_WEIGHT_TOLERANCE_PERCENT):
        self.weight_tolerance_percent = Decimal(str(weight_tolerance_percent))

    def validate_dispatch(
        self,
        purchase_bill_data: Optional[Dict[str, Any]] = None,
        customer_po_data: Optional[Dict[str, Any]] = None,
        lr_data: Optional[Dict[str, Any]] = None,
        weighment_data: Optional[Dict[str, Any]] = None,
        whatsapp_data: Optional[Dict[str, Any]] = None
    ) -> DispatchValidationReport:
        results: List[ValidationRuleResult] = []
        is_valid = True

        # Rule 1: Vehicle Matching across documents
        vehicles = {}
        if purchase_bill_data and purchase_bill_data.get("vehicle_number"):
            vehicles["purchase_bill"] = normalizer.normalize_vehicle_number(purchase_bill_data["vehicle_number"])
        if lr_data and lr_data.get("vehicle_number"):
            vehicles["lr"] = normalizer.normalize_vehicle_number(lr_data["vehicle_number"])
        if weighment_data and weighment_data.get("vehicle_number"):
            vehicles["weighment_slip"] = normalizer.normalize_vehicle_number(weighment_data["vehicle_number"])
        if whatsapp_data and whatsapp_data.get("vehicle_number"):
            vehicles["whatsapp"] = normalizer.normalize_vehicle_number(whatsapp_data["vehicle_number"])

        if vehicles:
            unique_vehicles = set(v for v in vehicles.values() if v)
            if len(unique_vehicles) == 1:
                results.append(ValidationRuleResult(
                    rule_name="VEHICLE_MATCH",
                    status="PASSED",
                    message=f"Vehicle number '{list(unique_vehicles)[0]}' matches across all documents.",
                    source_values=vehicles
                ))
            else:
                is_valid = False
                results.append(ValidationRuleResult(
                    rule_name="VEHICLE_MATCH",
                    status="FAILED",
                    message=f"Vehicle mismatch detected between documents: {vehicles}",
                    source_values=vehicles
                ))
        else:
            results.append(ValidationRuleResult(
                rule_name="VEHICLE_MATCH",
                status="WARNING",
                message="No vehicle numbers found in documents.",
                source_values={}
            ))

        # Rule 2: Net Weight Tolerance Check (DEFAULT_WEIGHT_TOLERANCE_PERCENT = 1.0%)
        weights = {}
        if weighment_data and weighment_data.get("net_weight_kg"):
            weights["weighment_slip"] = Decimal(str(weighment_data["net_weight_kg"]))
        if whatsapp_data and whatsapp_data.get("weight_kg"):
            weights["whatsapp"] = Decimal(str(whatsapp_data["weight_kg"]))

        if "weighment_slip" in weights and "whatsapp" in weights:
            w_slip = weights["weighment_slip"]
            w_wa = weights["whatsapp"]
            diff_percent = abs(w_slip - w_wa) / w_wa * Decimal("100")
            if diff_percent <= self.weight_tolerance_percent:
                results.append(ValidationRuleResult(
                    rule_name="WEIGHT_TOLERANCE",
                    status="PASSED",
                    message=f"Net weight diff ({diff_percent:.2f}%) is within allowed tolerance ({self.weight_tolerance_percent}%).",
                    source_values={"weighment_slip": float(w_slip), "whatsapp": float(w_wa)}
                ))
            else:
                is_valid = False
                results.append(ValidationRuleResult(
                    rule_name="WEIGHT_TOLERANCE",
                    status="FAILED",
                    message=f"Net weight diff ({diff_percent:.2f}%) exceeds allowed tolerance ({self.weight_tolerance_percent}%).",
                    source_values={"weighment_slip": float(w_slip), "whatsapp": float(w_wa)}
                ))

        # Rule 3: Customer PO Selling Rate Rule (MANDATORY)
        selling_rate = None
        if customer_po_data and customer_po_data.get("selling_rate"):
            selling_rate = Decimal(str(customer_po_data["selling_rate"]))
            results.append(ValidationRuleResult(
                rule_name="SELLING_RATE_PRESENCE",
                status="PASSED",
                message=f"Authoritative Customer PO selling rate ₹{selling_rate}/unit identified.",
                source_values={"po_number": customer_po_data.get("po_number"), "selling_rate": float(selling_rate)}
            ))
        else:
            is_valid = False
            results.append(ValidationRuleResult(
                rule_name="SELLING_RATE_PRESENCE",
                status="FAILED",
                message="CRITICAL: Customer PO selling rate is missing. Sales Invoice creation requires a PO selling rate.",
                source_values={}
            ))

        purchase_rate = None
        if purchase_bill_data and purchase_bill_data.get("purchase_rate"):
            purchase_rate = Decimal(str(purchase_bill_data["purchase_rate"]))

        status_str = "VALIDATED" if is_valid else "VALIDATION_REQUIRED"

        return DispatchValidationReport(
            is_valid=is_valid,
            status=status_str,
            results=results,
            selling_rate=selling_rate,
            purchase_rate=purchase_rate
        )

validator_engine = ValidatorEngine()
