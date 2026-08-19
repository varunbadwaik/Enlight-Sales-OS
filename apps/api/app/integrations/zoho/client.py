import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

import time
import asyncio

class ZohoClient:
    def __init__(self):
        self.accounts_url = settings.ZOHO_ACCOUNTS_URL
        self.api_url = settings.ZOHO_BOOKS_API_URL
        self.organization_id = settings.effective_zoho_org_id
        self.access_token: Optional[str] = None
        self.token_expiry: float = 0.0

    async def get_access_token(self) -> str:
        """Retrieves a fresh OAuth access token using refresh token with caching and backoff."""
        now = time.time()
        if self.access_token and now < self.token_expiry:
            return self.access_token

        params = {
            "refresh_token": settings.ZOHO_REFRESH_TOKEN,
            "client_id": settings.ZOHO_CLIENT_ID,
            "client_secret": settings.ZOHO_CLIENT_SECRET,
            "grant_type": "refresh_token"
        }

        max_retries = 3
        for attempt in range(max_retries):
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.accounts_url}/oauth/v2/token", params=params)
                data = response.json()
                if response.status_code == 200 and "access_token" in data:
                    self.access_token = data.get("access_token")
                    expires_in = data.get("expires_in", 3600)
                    self.token_expiry = time.time() + (expires_in - 100)
                    logger.info("Successfully refreshed Zoho OAuth access token.")
                    return self.access_token
                else:
                    err_detail = data.get("error_description") or data.get("error") or response.text
                    logger.warning(f"Attempt {attempt + 1}/{max_retries} failed to refresh Zoho OAuth token: {err_detail}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                    else:
                        raise Exception(f"Zoho OAuth Token Refresh Failed: {err_detail}")

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        token = await self.get_access_token()
        headers = {"Authorization": f"Zoho-oauthtoken {token}"}
        queryParams = {"organization_id": self.organization_id}
        if params:
            queryParams.update(params)

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.api_url}/{endpoint}", headers=headers, params=queryParams)
            return response.json()

    async def post(self, endpoint: str, json_data: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        token = await self.get_access_token()
        headers = {"Authorization": f"Zoho-oauthtoken {token}", "Content-Type": "application/json"}
        queryParams = {"organization_id": self.organization_id}
        if params:
            queryParams.update(params)

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.api_url}/{endpoint}", headers=headers, params=queryParams, json=json_data)
            return response.json()

zoho_client = ZohoClient()
