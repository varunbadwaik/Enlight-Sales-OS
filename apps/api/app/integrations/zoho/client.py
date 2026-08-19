import time
import asyncio
import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

GLOBAL_ACCESS_TOKEN: Optional[str] = None
GLOBAL_TOKEN_EXPIRES_AT: float = 0.0

class ZohoClient:
    def __init__(self):
        self.accounts_url = settings.ZOHO_ACCOUNTS_URL
        self.api_url = settings.ZOHO_BOOKS_API_URL
        self.organization_id = settings.effective_zoho_org_id

    async def get_access_token(self) -> str:
        """Retrieves a fresh OAuth access token using refresh token with global caching and exponential backoff."""
        global GLOBAL_ACCESS_TOKEN, GLOBAL_TOKEN_EXPIRES_AT

        now = time.time()
        if GLOBAL_ACCESS_TOKEN and now < GLOBAL_TOKEN_EXPIRES_AT:
            return GLOBAL_ACCESS_TOKEN

        params = {
            "refresh_token": settings.ZOHO_REFRESH_TOKEN,
            "client_id": settings.ZOHO_CLIENT_ID,
            "client_secret": settings.ZOHO_CLIENT_SECRET,
            "grant_type": "refresh_token"
        }

        # Try up to 3 times with exponential backoff if rate limited
        for attempt in range(1, 4):
            async with httpx.AsyncClient(timeout=15.0) as client:
                try:
                    response = await client.post(f"{self.accounts_url}/oauth/v2/token", params=params)
                    data = response.json()
                    if response.status_code == 200 and "access_token" in data:
                        GLOBAL_ACCESS_TOKEN = data.get("access_token")
                        expires_in = data.get("expires_in", 3600)
                        GLOBAL_TOKEN_EXPIRES_AT = time.time() + float(expires_in) - 120.0
                        logger.info(f"Successfully refreshed Zoho OAuth token (attempt {attempt}), valid for {expires_in}s")
                        return GLOBAL_ACCESS_TOKEN
                    else:
                        err_detail = data.get("error_description") or data.get("error") or response.text
                        logger.warning(f"Zoho OAuth Token Refresh Notice (attempt {attempt}/3): {err_detail}")
                        if GLOBAL_ACCESS_TOKEN:
                            return GLOBAL_ACCESS_TOKEN
                        if "too many requests" in err_detail.lower() and attempt < 3:
                            await asyncio.sleep(attempt * 2.0)
                            continue
                        raise Exception(f"Zoho OAuth Token Refresh Failed: {err_detail}")
                except Exception as e:
                    logger.error(f"Zoho OAuth token error (attempt {attempt}/3): {e}")
                    if GLOBAL_ACCESS_TOKEN:
                        return GLOBAL_ACCESS_TOKEN
                    if attempt < 3:
                        await asyncio.sleep(attempt * 2.0)
                        continue
                    raise e

        return GLOBAL_ACCESS_TOKEN or ""

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            token = await self.get_access_token()
            headers = {"Authorization": f"Zoho-oauthtoken {token}"}
            queryParams = {"organization_id": self.organization_id}
            if params:
                queryParams.update(params)

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{self.api_url}/{endpoint}", headers=headers, params=queryParams)
                res_data = response.json()

                if response.status_code in (401, 403) or res_data.get("code") in (57, 1002):
                    logger.warning("Zoho token invalid or expired (401/403). Invalidating cache and retrying...")
                    global GLOBAL_ACCESS_TOKEN, GLOBAL_TOKEN_EXPIRES_AT
                    GLOBAL_ACCESS_TOKEN = None
                    GLOBAL_TOKEN_EXPIRES_AT = 0.0
                    token = await self.get_access_token()
                    headers = {"Authorization": f"Zoho-oauthtoken {token}"}
                    response = await client.get(f"{self.api_url}/{endpoint}", headers=headers, params=queryParams)
                    return response.json()

                return res_data
        except Exception as e:
            logger.error(f"Zoho GET '{endpoint}' exception: {e}")
            return {}

    async def post(self, endpoint: str, json_data: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            token = await self.get_access_token()
            headers = {"Authorization": f"Zoho-oauthtoken {token}", "Content-Type": "application/json"}
            queryParams = {"organization_id": self.organization_id}
            if params:
                queryParams.update(params)

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(f"{self.api_url}/{endpoint}", headers=headers, params=queryParams, json=json_data)
                res_data = response.json()

                if response.status_code in (401, 403) or res_data.get("code") in (57, 1002):
                    logger.warning("Zoho token invalid or expired (401/403). Invalidating cache and retrying...")
                    GLOBAL_ACCESS_TOKEN = None
                    GLOBAL_TOKEN_EXPIRES_AT = 0.0
                    token = await self.get_access_token()
                    headers = {"Authorization": f"Zoho-oauthtoken {token}", "Content-Type": "application/json"}
                    response = await client.post(f"{self.api_url}/{endpoint}", headers=headers, params=queryParams, json=json_data)
                    return response.json()

                return res_data
        except Exception as e:
            logger.error(f"Zoho POST '{endpoint}' exception: {e}")
            return {}

zoho_client = ZohoClient()
