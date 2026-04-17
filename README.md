# Smart Healthcare Microservices Platform

Smart Healthcare is a university microservices telemedicine platform built with Node.js, React, MongoDB Atlas, Docker Compose, and Kubernetes.

The platform supports:

- patient registration and login
- doctor account creation, profile setup, verification, and availability management
- doctor browsing and search
- appointment booking, update, cancel, accept, reject, and complete
- payment only for accepted or completed appointments
- patient profiles, medical reports, prescriptions, notifications, and Jitsi consultation links

This README is the shared guide for:

- service responsibilities
- API routes
- local run commands
- Docker and Kubernetes usage
- smoke-test and validation commands

## Architecture

### Services

| Component | Port | Database | Purpose | Health URL |
| --- | --- | --- | --- | --- |
| Frontend | `5173` | None | React UI for patient, doctor, and admin workflows | `http://localhost:5173` |
| Gateway | `8080` | None | Single API entry point + reverse proxy | `http://localhost:8080/` |
| Auth Service | `5001` | MongoDB Atlas | JWT auth, patient registration, doctor/admin account creation | `http://localhost:5001/` |
| Doctor Service | `5002` | MongoDB Atlas | Doctor profiles, specialization, availability, verification | `http://localhost:5002/` |
| Appointment Service | `5003` | MongoDB Atlas | Slots, booking lifecycle, appointment rules | `http://localhost:5003/` |
| Patient Service | `5004` | MongoDB Atlas | Patient profile, reports, prescriptions | `http://localhost:5004/` |
| Payment Service | `5005` | MongoDB Atlas | Mock payment + Stripe checkout integration | `http://localhost:5005/` |
| Notification Service | `5006` | None | Email notifications (SMTP or JSON fallback) | `http://localhost:5006/` |
| Telemedicine Service | `5007` | MongoDB Atlas | Telemedicine sessions and meeting links | `http://localhost:5007/` |

### Public API entry point

All client-facing API requests should go through:

```text
http://localhost:8080
```

Gateway route prefixes:

- `/auth`
- `/doctors`
- `/appointments`
- `/patients`
- `/payments`
- `/notifications`
- `/telemedicine`

### Authentication and roles

- Header format: `Authorization: Bearer <token>`
- Roles:
  - `PATIENT`
  - `DOCTOR`
  - `ADMIN`

## Project structure

```text
frontend/
gateway/
services/
  auth-service/
  doctor-service/
  appointment-service/
  patient-service/
  payment-service/
  notification-service/
  telemedicine-service/
k8s/
docker-compose.yml
seed-doctors.js
```

## Local setup

### Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop
- kubectl (optional, for Kubernetes)
- internet access to MongoDB Atlas

### Install dependencies

Run from project root:

```bash
npm install
npm install --prefix gateway
npm install --prefix services/auth-service
npm install --prefix services/doctor-service
npm install --prefix services/appointment-service
npm install --prefix services/patient-service
npm install --prefix services/payment-service
npm install --prefix services/notification-service
npm install --prefix services/telemedicine-service
npm install --prefix frontend
```

## Run commands

### Run methods (quick guide)

Use one of these methods:

1. Full stack with Docker Compose (best for consistent setup)
2. Local development mode with `npm run dev` per service
3. Local production-style mode with `npm run start` per backend service

### Option 1: Docker Compose (recommended)

```bash
docker compose up --build
```

Useful commands:

```bash
docker compose up --build -d
docker compose logs -f
docker compose down
docker compose config
```

After startup:

- frontend: `http://localhost:5173`
- gateway: `http://localhost:8080`

### Option 2: Run services locally

```bash
npm run dev --prefix gateway
npm run dev --prefix services/auth-service
npm run dev --prefix services/doctor-service
npm run dev --prefix services/appointment-service
npm run dev --prefix services/patient-service
npm run dev --prefix services/payment-service
npm run dev --prefix services/notification-service
npm run dev --prefix services/telemedicine-service
npm run dev --prefix frontend
```

### Option 3: Run services locally (production-style commands)

```bash
npm run start --prefix gateway
npm run start --prefix services/auth-service
npm run start --prefix services/doctor-service
npm run start --prefix services/appointment-service
npm run start --prefix services/patient-service
npm run start --prefix services/payment-service
npm run start --prefix services/notification-service
npm run start --prefix services/telemedicine-service
npm run preview --prefix frontend
```

### Service command reference

| Component | Dev command | Start command |
| --- | --- | --- |
| Gateway | `npm run dev --prefix gateway` | `npm run start --prefix gateway` |
| Auth Service | `npm run dev --prefix services/auth-service` | `npm run start --prefix services/auth-service` |
| Doctor Service | `npm run dev --prefix services/doctor-service` | `npm run start --prefix services/doctor-service` |
| Appointment Service | `npm run dev --prefix services/appointment-service` | `npm run start --prefix services/appointment-service` |
| Patient Service | `npm run dev --prefix services/patient-service` | `npm run start --prefix services/patient-service` |
| Payment Service | `npm run dev --prefix services/payment-service` | `npm run start --prefix services/payment-service` |
| Notification Service | `npm run dev --prefix services/notification-service` | `npm run start --prefix services/notification-service` |
| Telemedicine Service | `npm run dev --prefix services/telemedicine-service` | `npm run start --prefix services/telemedicine-service` |
| Frontend | `npm run dev --prefix frontend` | `npm run preview --prefix frontend` |

## Seed command

```bash
node seed-doctors.js
```

Typical demo credentials:

- Admin: `admin@hospital.com / admin123`
- Seeded doctors: password `password123`

## Validation commands

```bash
docker compose config
node --check gateway/server.js
node --check services/appointment-service/controllers/appointmentController.js
node --check services/patient-service/controllers/patientController.js
node --check services/payment-service/controllers/paymentController.js
npm run build --prefix frontend
```

Basic health checks:

```bash
curl http://localhost:8080/
curl http://localhost:5001/
curl http://localhost:5002/
curl http://localhost:5003/
curl http://localhost:5004/
curl http://localhost:5005/
curl http://localhost:5006/
curl http://localhost:5007/
```

## Core workflow rules

- patient self-registration creates only `PATIENT` users
- admin creates doctor login accounts in `auth-service`
- admin creates doctor profiles in `doctor-service`
- appointment booking requires doctor profile id (not auth user id)
- payment is allowed only for `ACCEPTED` or `COMPLETED` appointments
- accepted appointments can expose a meeting link

## Kubernetes

Manifests are in `k8s/`, including:

- `app-secret.yaml`
- `auth-*`, `doctor-*`, `appointment-*`, `patient-*`, `payment-*`, `notification-*`, `telemedicine-*`
- `gateway-*`, `frontend-*`
- legacy `mongo-*` manifests

Apply all current manifests:

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
```

See `k8s/README.md` for deployment details.

## Environment notes

- keep `.env` files local and out of git
- commit `.env.example` templates with placeholders
- frontend local API base URL should be:
  - `VITE_API_BASE_URL=http://localhost:8080`
- rotate all real credentials before production use
