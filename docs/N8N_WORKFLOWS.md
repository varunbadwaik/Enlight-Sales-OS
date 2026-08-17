# n8n Workflows Specification — Automated Draft Invoice Generation System

## Overview
The n8n workflow engine orchestrates events, retries, webhooks, and sub-workflow execution across 9 modular workflows in `workflows/n8n/`.

---

## Workflow Directory

| Workflow File | Name | Trigger | Responsibility |
|---|---|---|---|
| `01_dispatch_intake.json` | Dispatch Intake | Webhook | Ingests WhatsApp/Web intake payloads, saves files to S3, calls FastAPI. |
| `02_document_processing.json` | Document Processing | Execute Workflow | Triggers Gemini AI multimodal extraction for PO, Bill, LR, Weighment slip. |
| `03_validation_runner.json` | Validation Runner | Execute Workflow | Calls FastAPI validation engine; routes to Notification if passed or Error Handler if failed. |
| `04_approval.json` | Approval Handler | Webhook | Ingests Admin approval decision and triggers Zoho project sync. |
| `05_zoho_project_sync.json` | Zoho Project Sync | Execute Workflow | Looks up/creates Customer PO Project in Zoho Books. |
| `06_purchase_bill.json` | Purchase Bill | Execute Workflow | Prepares Vendor Purchase Bill in Zoho Books. |
| `07_draft_invoice.json` | Draft Sales Invoice | Execute Workflow | Creates Sales Invoice forced to DRAFT status using Customer PO selling rate. |
| `08_error_handler.json` | Error Handler | Error Trigger | Captures execution exceptions and logs failure audit trail. |
| `09_notification.json` | Notification | Execute Workflow | Sends approval and status alerts to team. |
