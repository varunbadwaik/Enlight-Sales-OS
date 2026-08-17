import re
from typing import Optional
from decimal import Decimal

class Normalizer:
    @staticmethod
    def normalize_vehicle_number(vehicle_str: Optional[str]) -> Optional[str]:
        """Normalizes vehicle registration string e.g. 'MH 12 AB 1234' -> 'MH12AB1234'."""
        if not vehicle_str:
            return None
        # Remove all whitespace, hyphens, and dots, convert to uppercase
        cleaned = re.sub(r'[\s\-\.]', '', vehicle_str).upper()
        return cleaned if cleaned else None

    @staticmethod
    def normalize_weight_kg(value: Optional[float | Decimal], unit: Optional[str]) -> Optional[Decimal]:
        """Converts weight to KG standard based on unit."""
        if value is None:
            return None
        dec_val = Decimal(str(value))
        if not unit:
            return dec_val

        unit_clean = unit.strip().upper()
        if unit_clean in ["MT", "TON", "TONNE", "TONNES", "METRIC TON"]:
            return dec_val * Decimal("1000")
        elif unit_clean in ["KG", "KGS", "KILOGRAM"]:
            return dec_val
        elif unit_clean in ["QUINTAL", "QTL"]:
            return dec_val * Decimal("100")
        
        return dec_val

    @staticmethod
    def normalize_identifier(id_str: Optional[str]) -> Optional[str]:
        """Trims whitespace and uppercasing for PO numbers, LR numbers, bill numbers."""
        if not id_str:
            return None
        cleaned = id_str.strip().upper()
        return cleaned if cleaned else None

normalizer = Normalizer()
