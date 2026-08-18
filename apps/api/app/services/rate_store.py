from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class RateStore:
    _rate: Decimal = Decimal("58.00")

    @classmethod
    def get_rate(cls) -> Decimal:
        return cls._rate

    @classmethod
    def set_rate(cls, new_rate: float | str | Decimal) -> Decimal:
        try:
            cls._rate = Decimal(str(new_rate))
            logger.info(f"Global PO Rate Lock updated to: ₹{cls._rate}/kg")
        except Exception as e:
            logger.error(f"Failed to set rate lock: {e}")
        return cls._rate

rate_store = RateStore()
