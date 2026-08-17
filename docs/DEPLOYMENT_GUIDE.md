# Enlight Sales OS — Cloud Production Deployment Guide

This guide outlines step-by-step production deployment for **Enlight Sales OS** using Docker Compose and Nginx reverse proxy.

---

## 1. Prerequisites & Server Setup

- **Cloud VPS**: AWS EC2 / DigitalOcean Droplet / Hetzner (Ubuntu 22.04 LTS recommended, 2 vCPU, 4GB RAM minimum).
- **Installed Software**:
  - Docker Engine v24+
  - Docker Compose v2.20+
  - Git

```bash
# Update and install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 2. Clone Repository & Environment Setup

```bash
git clone https://github.com/enlight/sales-os.git
cd sales-os

# Create production environment configuration
cp .env.production .env
```

Ensure `.env` contains your live credentials:
- `GEMINI_API_KEY`
- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ORG_ID`
- `DATABASE_URL=postgresql://enlight_sales_os_user:enlight_sales_os_password@postgres:5432/enlight_sales_os_db`
- `REDIS_URL=redis://redis:6379/0`

---

## 3. Database Initialization & Migrations

Boot the PostgreSQL container and execute Alembic migrations:

```bash
# Start PostgreSQL database container
docker-compose --env-file .env up -d postgres

# Run database migrations
docker-compose --env-file .env run --rm api alembic upgrade head
```

---

## 4. Launch Full Production Stack

```bash
# Build and start all 5 containers
docker-compose --env-file .env up -d --build
```

### Container Stack Verification:
- **`enlight_sales_os_postgres`**: Port `5432` (Internal)
- **`enlight_sales_os_redis`**: Port `6379` (Internal)
- **`enlight_sales_os_api`**: Port `8000` (FastAPI Core Backend)
- **`enlight_sales_os_web`**: Port `3000` (Next.js Web Admin Portal)
- **`enlight_sales_os_n8n`**: Port `5678` (n8n Workflow Engine)

---

## 5. Domain & SSL Setup (Certbot)

To secure `app.enlightsalesos.com` and `api.enlightsalesos.com` with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d app.enlightsalesos.com -d api.enlightsalesos.com
```

---

## 6. Verification & Health Monitoring

```bash
# Check container health status
docker-compose ps

# View API logs
docker-compose logs -f api

# Test API Health Endpoint
curl http://localhost:8000/health
# Response: {"status":"healthy","project":"Invoice Automation API","version":"1.0.0","env":"production"}
```
