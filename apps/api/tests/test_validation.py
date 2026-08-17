import pytest
from decimal import Decimal
from app.services.validator import validator_engine
from app.services.normalizer import Normalizer

def test_vehicle_normalization():
    assert Normalizer.normalize_vehicle_number("MH 12 AB 1234") == "MH12AB1234"
    assert Normalizer.normalize_vehicle_number("mh-12-ab-1234.") == "MH12AB1234"
    assert Normalizer.normalize_vehicle_number(None) is None

def test_weight_unit_normalization():
    assert Normalizer.normalize_weight_kg(12.5, "MT") == Decimal("12500")
    assert Normalizer.normalize_weight_kg(12500, "KG") == Decimal("12500")

def test_validator_vehicle_match_passed():
    report = validator_engine.validate_dispatch(
        purchase_bill_data={"vehicle_number": "MH 12 AB 1234"},
        lr_data={"vehicle_number": "MH12AB1234"},
        weighment_data={"vehicle_number": "MH-12-AB-1234"},
        customer_po_data={"selling_rate": 58.00}
    )
    vehicle_rule = next(r for r in report.results if r.rule_name == "VEHICLE_MATCH")
    assert vehicle_rule.status == "PASSED"

def test_validator_vehicle_match_failed():
    report = validator_engine.validate_dispatch(
        purchase_bill_data={"vehicle_number": "MH 12 AB 1234"},
        lr_data={"vehicle_number": "MH 12 AB 9999"},
        customer_po_data={"selling_rate": 58.00}
    )
    vehicle_rule = next(r for r in report.results if r.rule_name == "VEHICLE_MATCH")
    assert vehicle_rule.status == "FAILED"
    assert report.is_valid is False

def test_weight_tolerance_within_1_percent():
    # 12500 vs 12550 -> 50kg diff = 0.4% diff (under 1.0%)
    report = validator_engine.validate_dispatch(
        weighment_data={"net_weight_kg": 12550},
        whatsapp_data={"weight_kg": 12500},
        customer_po_data={"selling_rate": 58.00}
    )
    weight_rule = next(r for r in report.results if r.rule_name == "WEIGHT_TOLERANCE")
    assert weight_rule.status == "PASSED"

def test_weight_tolerance_exceeds_1_percent():
    # 12500 vs 13000 -> 500kg diff = 4.0% diff (exceeds 1.0%)
    report = validator_engine.validate_dispatch(
        weighment_data={"net_weight_kg": 13000},
        whatsapp_data={"weight_kg": 12500},
        customer_po_data={"selling_rate": 58.00}
    )
    weight_rule = next(r for r in report.results if r.rule_name == "WEIGHT_TOLERANCE")
    assert weight_rule.status == "FAILED"
    assert report.is_valid is False
