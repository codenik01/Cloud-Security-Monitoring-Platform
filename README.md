<h1 align="center">
  <br>
  🛡️ Cloud Security Monitoring Platform
  <br>
</h1>

<h4 align="center">A real-time threat detection and logging engine built with Node.js, React, and MongoDB.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#detection-engine">Detection Engine</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

![App Screenshot](https://via.placeholder.com/1200x600/0a0a0f/10b981?text=Cloud+Security+Monitoring+Dashboard)

## Key Features

- **Real-Time Log Ingestion**: High-throughput event ingestion from multiple sources (Server, API, Docker).
- **Active Threat Detection Engine**: Automatically identify malicious patterns including Brute Force attacks, API Abuse, and Suspicious File Uploads.
- **WebSocket Streaming**: Live alerts and anomalous traffic visualization pushed to the dashbaord instantly.
- **Dockerized Infrastructure**: Complete environment orchestrated using `docker-compose`.
- **Premium Security Dashboard**: Analytics mapping traffic anomalies visually and tracking security health over time.

## Architecture

```text
Traffic Sources (Users / APIs)
  │
  ▼
Log Collector (Node.js API)
  │   └── Winston Logger
  ▼
Detection Engine  ──────▶ Trigger Rules
  │                          │
  ▼                          ▼
MongoDB ◀────────────────  WebSocket (Socket.io)
  │                          │
  ▼                          ▼
[======= React + Vite Security Dashboard =======]
```

## Quick Start

You will need **Docker** and **Docker Compose** installed on your system.

### 1. Build and Run

Clone the repository and spin up the complete environment using Docker:

```bash
git clone https://github.com/your-username/cloud-sec-monitoring.git
cd cloud-sec-monitoring

# Start the cluster in detached mode
docker-compose up -d --build
```
> The dashboard will be available at [http://localhost:3000](http://localhost:3000)

### 2. Simulate Attacks

To see the platform actively detect threats, run the included attack simulation script:

```bash
# Simulates Brute Force, API Abuse, and Malicious Uploads
./test-attack.sh
```

## Detection Engine

The core brain of the platform checks incoming events against active rules:

1. **Brute Force Defense**: Triggers when `login_failed` exceeds 5 attempts within a 60-second sliding window for a single IP.
2. **API Abuse**: Detects over 50 requests from a single IP address in one minute.
3. **Suspicious Files**: Checks `file_upload` events for executable extensions (`.sh`, `.exe`, `.bat`).

## Tech Stack

| Domain | Technology |
| --- | --- |
| **Frontend** | React, Vite, Recharts, Lucide React, Vanilla CSS Var tokens |
| **Backend** | Node.js, Express, Winston, Socket.io |
| **Database** | MongoDB |
| **Infrastructure**| Docker, Docker Compose |

---

> Built by **[Your Name]** as a demonstration of Cloud Architecture and Security Operations (SecOps) engineering.
# Cloud Security Monitoring Platform
