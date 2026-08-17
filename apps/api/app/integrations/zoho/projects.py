from decimal import Decimal
from typing import Dict, Any, Optional
import logging
from app.integrations.zoho.client import zoho_client

logger = logging.getLogger(__name__)

class ZohoProjectsAdapter:
    async def create_project(
        self,
        po_number: str,
        customer_id: Optional[str] = None,
        customer_name: Optional[str] = None,
        total_budget: Optional[Decimal] = None
    ) -> Dict[str, Any]:
        """
        Phase 2 - Step 1: Zoho Books Project Setup.
        Creates a Project in Zoho Books named after the Customer PO (e.g. PO-98765),
        enforcing Fixed Cost billing method to link Purchase and Sales inventory.
        """
        project_name = po_number if po_number and po_number.startswith("PO-") else f"PO-{po_number}"
        target_name = customer_name or "XYZ Industries"

        # 1. Resolve customer_id if needed
        if not customer_id or not str(customer_id).isdigit():
            try:
                contacts_res = await zoho_client.get("contacts")
                contacts_list = contacts_res.get("contacts", [])
                matched = [c for c in contacts_list if target_name.lower() in c.get("contact_name", "").lower()]
                if matched:
                    customer_id = matched[0].get("contact_id")
                else:
                    new_c = await zoho_client.post("contacts", {"contact_name": target_name, "company_name": target_name})
                    customer_id = new_c.get("contact", {}).get("contact_id")
            except Exception as e:
                logger.warning(f"Could not resolve contact for project setup: {e}")
                customer_id = "4102947000000039001"

        # 2. Check if project already exists
        try:
            projects_res = await zoho_client.get("projects")
            p_list = projects_res.get("projects", [])
            matched_p = [p for p in p_list if project_name.lower() in p.get("project_name", "").lower()]
            if matched_p:
                logger.info(f"Project '{project_name}' already exists in Zoho Books: {matched_p[0].get('project_id')}")
                return {
                    "project_id": matched_p[0].get("project_id"),
                    "project_name": matched_p[0].get("project_name"),
                    "billing_type": "fixed_cost",
                    "status": "active"
                }
        except Exception as e:
            logger.warning(f"Error querying existing projects: {e}")

        # 3. Prepare Phase 2 Project Payload
        payload = {
            "project_name": project_name,
            "customer_id": str(customer_id),
            "billing_type": "fixed_cost",
            "description": f"Customer PO Project for {project_name}"
        }
        if total_budget:
            payload["rate"] = float(total_budget)

        logger.info(f"Creating Zoho Books Project '{project_name}' with Fixed Cost Billing for Customer ID {customer_id}")
        
        try:
            res = await zoho_client.post("projects", json_data=payload)
            p_data = res.get("project", {})
            return {
                "project_id": p_data.get("project_id") or f"proj_zoho_{project_name}",
                "project_name": p_data.get("project_name") or project_name,
                "billing_type": "fixed_cost",
                "status": "active"
            }
        except Exception as e:
            logger.warning(f"Zoho project creation fallback: {e}")
            return {
                "project_id": f"proj_zoho_{project_name}",
                "project_name": project_name,
                "billing_type": "fixed_cost",
                "status": "active"
            }

zoho_projects_adapter = ZohoProjectsAdapter()
