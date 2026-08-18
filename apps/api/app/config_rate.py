from decimal import Decimal
import logging

logger = logging.getLogger("enlight_sales_os.config_rate")

# Global PO Selling Rate Lock (Synced with UI Rate Lock)
GLOBAL_SELLING_RATE: Decimal = Decimal("58.00")

def get_current_selling_rate() -> Decimal:
    return GLOBAL_SELLING_RATE

def set_current_selling_rate(new_rate: float) -> Decimal:
    global GLOBAL_SELLING_RATE
    GLOBAL_SELLING_RATE = Decimal(str(new_rate))
    logger.info(f"⚡ Global PO Selling Rate Lock updated to ₹{GLOBAL_SELLING_RATE}/kg")
    return GLOBAL_SELLING_RATE
