#!/bin/bash

# Configuration
API_URL="http://localhost:5000/api/logs/ingest"

echo "[*] Initializing Cloud Security Monitoring Baseline..."

# Generate normal traffic
for i in {1..20}; do
  curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{
      "user": "sys_admin",
      "event": "login_success",
      "ip": "192.168.1.'$((RANDOM % 50))'",
      "source": "web_portal",
      "severity": "info"
    }' > /dev/null
done
echo "[+] Normal traffic baseline generated."
sleep 2

echo "[*] Simulating Brute Force Attack from 10.0.0.99..."
for i in {1..12}; do
  curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{
      "user": "root",
      "event": "login_failed",
      "ip": "10.0.0.99",
      "source": "ssh",
      "severity": "warning"
    }' > /dev/null
    sleep 0.1
done
echo "[!] Brute force complete."
sleep 2

echo "[*] Simulating API Abuse (Rate Limit Exceeded) from 45.33.22.11..."
for i in {1..60}; do
  curl -s -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d '{
      "user": "anonymous",
      "event": "api_request",
      "ip": "45.33.22.11",
      "source": "public_api",
      "severity": "info"
    }' > /dev/null
done
echo "[!] API abuse complete."
sleep 1

echo "[*] Simulating Malicious File Upload from 172.16.0.4..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "user": "guest",
    "event": "file_upload",
    "ip": "172.16.0.4",
    "source": "upload_portal",
    "severity": "critical",
    "fileType": ".sh"
  }' > /dev/null

echo ""
echo "[SUCCESS] All simulated attacks sent. Check the React Dashboard!"
