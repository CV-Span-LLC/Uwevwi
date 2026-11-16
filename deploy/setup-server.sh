#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu/Debian VPS: Docker, a firewall and a little swap.
# Run as root on the server: bash setup-server.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then echo "Run this as root." >&2; exit 1; fi

apt-get update -y
apt-get install -y ca-certificates curl rsync ufw

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# Only SSH, HTTP and HTTPS are reachable from outside.
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

# Building the site needs memory; a small swap file stops the build being killed on smaller plans.
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

docker --version
docker compose version
echo "Server is ready."
