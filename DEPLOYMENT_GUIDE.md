# Enlight Sales OS V1.0 — Production Cloud Deployment Guide

This guide details how to deploy **Enlight Sales OS** to any Linux Cloud Server (AWS EC2, DigitalOcean Droplet, Hetzner, or VPS) using **Docker Compose** and **Nginx Reverse Proxy with SSL**.

---

## 1. System Requirements & Architecture

* **Operating System**: Ubuntu 22.04 LTS or 24.04 LTS (Recommended)
* **Minimum Specifications**: 2 vCPU, 4 GB RAM, 20 GB SSD
* **Required Software**: Docker Engine (v24.0+) & Docker Compose (v2.20+)

### **Containerized Services Topology**

```
 ┌────────────────────────────────────────────────────────┐
 │                Nginx Reverse Proxy (Port 80/443)       │
 └──────┬────────────────────┬─────────────────────┬──────┘
        │                    │                     │
 ┌──────▼───────┐    ┌───────▼──────┐      ┌───────▼──────┐
 │ Next.js Web  │    │ FastAPI API  │      │ n8n Engine   │
 │ (Port 3000)  │    │ (Port 8000)  │      │ (Port 5678)  │
 └──────────────┘    └───────┬──────┘      └──────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
          ┌───────▼──────┐      ┌───────▼──────┐
          │ PostgreSQL   │      │ Redis Cache  │
          │ (Port 5432)  │      │ (Port 6379)  │
          └──────────────┘      └──────────────┘
```

---

## 2. Server Preparation & Environment Setup

### **Step 1: Clone Repository & Transfer Files**
```bash
git clone https://github.com/your-org/enlight-sales-os.git /opt/enlight-sales-os
cd /opt/enlight-sales-os
```

### **Step 2: Create Production Environment Configuration**
Ensure `.env.production` contains your live production credentials:

```bash
cat << 'EOF' > .env.production
ENVIRONMENT=production
PORT=8000

# Database & Redis
DATABASE_URL=postgresql://enlight_sales_os_user:enlight_sales_os_password@postgres:5432/enlight_sales_os_db
REDIS_URL=redis://redis:6379/0

# Gemini Multimodal OCR
GEMINI_API_KEY=your-gemini-api-key

# Live Zoho Books Credentials
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-zoho-refresh-token
ZOHO_ORG_ID=60082578964

# WhatsApp Business Integration
WHATSAPP_ACCOUNT_SID=your-twilio-account-sid
WHATSAPP_AUTH_TOKEN=your-twilio-auth-token
WHATSAPP_NUMBER=+917588353703

# Statutory Protections
FORCE_DRAFT_STATUS=true
HARD_LOCK_PO_SELLING_RATE=true
MAX_WEIGHT_TOLERANCE_PCT=1.0
EOF
```

---

## 3. Deploy Stack via Docker Compose

Run the multi-container build command:

```bash
docker-compose --env-file .env.production up -d --build
```

### **Verify Container Health**
```bash
docker-compose ps
```

*Expected output*:
- `enlight_sales_os_postgres` (Up, healthy)
- `enlight_sales_os_redis` (Up, healthy)
- `enlight_sales_os_api` (Up, healthy)
- `enlight_sales_os_web` (Up, healthy)
- `enlight_sales_os_n8n` (Up, healthy)

---

## 4. Nginx Reverse Proxy & Free SSL Setup (Let's Encrypt)

### **Step 1: Install Nginx & Certbot**
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### **Step 2: Configure Nginx Virtual Host**
Create `/etc/nginx/sites-available/enlight-sales-os`:

```nginx
server {
    server_name enlight.yourdomain.com;

    # Next.js Web Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI Core Backend API
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # n8n Automation Console
    location /n8n/ {
        proxy_pass http://localhost:5679/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/enlight-sales-os /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 3: Enable Free SSL Certificate**
```bash
sudo certbot --nginx -d enlight.yourdomain.com
```

---

## 5. System Health Verification

- **Web Portal**: `https://enlight.yourdomain.com/login`
- **FastAPI API Health Check**: `https://enlight.yourdomain.com/api/v1/health`
- **WhatsApp Webhook Target**: `https://enlight.yourdomain.com/api/v1/whatsapp/webhook`
- **n8n Automation Console**: `https://enlight.yourdomain.com/n8n/`

---

## 6. Maintenance Commands

- **View Combined Logs**: `docker-compose logs -f`
- **View API Logs**: `docker-compose logs -f api`
- **Restart Stack**: `docker-compose restart`
- **Update Application**:
  ```bash
  git pull
  docker-compose --env-file .env.production up -d --build
  ```
