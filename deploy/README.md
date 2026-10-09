# 🚀 Stratos Deployment & Infrastructure Guide

This guide details the deployment setup for hosting Stratos as a standalone SaaS web application (e.g. on Google Cloud Platform, AWS, DigitalOcean, or any Linux VPS).

---

## 🛠️ Infrastructure Overview

* **Host Architecture:** Linux x86_64 (Ubuntu 24.04 LTS or Debian 12)
* **Instance Specification:** `e2-micro` (2 vCPUs burstable, 1.0 GB RAM, Always Free tier eligible on GCP)
* **Storage:** 15 GB+ Standard Persistent Disk (`pd-standard`)
* **Reverse Proxy:** [Caddy](https://caddyserver.com/) for automatic Let's Encrypt TLS/SSL certificates and HTTP/2 proxying
* **Process Manager:** `systemd` (`stratos.service`)
* **Database:** `better-sqlite3` file persistence at `/opt/stratos/server/.data/stratos.db`

---

## ⚡ Quick One-Command Setup on a Fresh VM

```bash
#!/bin/bash
set -e

# 1. Create swap (essential for building on 1GB RAM machines)
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. Install Node 20 & Caddy
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update -y
sudo apt-get install -y nodejs git build-essential caddy debian-keyring

# 3. Clone Repository
sudo mkdir -p /opt/stratos
sudo git clone -b web-deploy https://github.com/ArionGD/STRATOS.git /opt/stratos
cd /opt/stratos

# 4. Install dependencies and build frontend
export NODE_OPTIONS="--max-old-space-size=400"
sudo npm install
sudo npm run build

# 5. Install systemd service & Caddyfile
sudo cp /opt/stratos/deploy/stratos.service /etc/systemd/system/stratos.service
sudo cp /opt/stratos/deploy/Caddyfile /etc/caddy/Caddyfile

sudo systemctl daemon-reload
sudo systemctl enable --now stratos
sudo systemctl restart caddy
```

---

## 💾 Database Backups

The SQLite database stores all multi-user accounts, workspaces, clusters, notes, and METIS AI conversation histories.
* Default Path: `server/.data/stratos.db`
* WAL Files: `server/.data/stratos.db-wal` and `server/.data/stratos.db-shm`
* A snapshot from the GCP test deployment is preserved in `Docs/database-backup-2026-10-09.json`.
