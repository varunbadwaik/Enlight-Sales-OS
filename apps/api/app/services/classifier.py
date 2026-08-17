"""Document Classifier Service for WhatsApp Agent Intake."""

import re
from typing import Optional

CLASSIFICATION_PATTERNS = {
    "PURCHASE_ORDER": [
        r"po", r"purchase[_\s-]*order", r"cust[_\s-]*po", r"client[_\s-]*po", r"order"
    ],
    "PURCHASE_BILL": [
        r"bill", r"purchase[_\s-]*bill", r"vendor[_\s-]*bill", r"tax[_\s-]*invoice", r"supplier", r"inv"
    ],
    "LORRY_RECEIPT": [
        r"lr", r"lorry", r"lorry[_\s-]*receipt", r"consignment", r"transport", r"bilty"
    ],
    "WEIGHT_SLIP": [
        r"weight", r"weighment", r"weigh", r"slip", r"weighbridge", r"kanta", r"tare"
    ],
}


class DocumentClassifier:
    def classify_by_filename(self, filename: str) -> str:
        """Classifies document type based on filename keywords."""
        fname_lower = filename.lower()
        
        # Check patterns
        for doc_type, patterns in CLASSIFICATION_PATTERNS.items():
            for pattern in patterns:
                if re.search(r"\b" + pattern + r"\b", fname_lower) or pattern in fname_lower:
                    return doc_type

        return "UNKNOWN"

    def classify_by_hint(self, hint: Optional[str]) -> str:
        """Classifies document type based on user text hint or caption."""
        if not hint:
            return "UNKNOWN"
        return self.classify_by_filename(hint)


classifier = DocumentClassifier()
