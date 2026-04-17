# Smart Healthcare Microservices

This project is a university-level smart healthcare platform using Node.js microservices, MongoDB, Docker, and React.

## Implemented services
- `auth-service` (registration/login/JWT/roles)
- `doctor-service` (doctor profile + availability)
- `appointment-service` (booking, modify, cancel, accept/reject, complete)
- `telemedicine-service` (video session integration + meeting links)
- `patient-service` (patient profile, report upload, prescription workflow)
- `payment-service` (mock payment with `PENDING/PAID/FAILED`)
- `notification-service` (email notifications)
- `gateway` (single API entry point)

## Run with Docker Compose
1. Go to project root.
2. Run:
   ```bash
   docker compose up --build
   ```
3. Open frontend at `http://localhost:5173`.
4. Gateway API base URL: `http://localhost:8080`.

## Main frontend flows
- Patient:
  - Register/Login
  - Book appointment
  - Modify/cancel appointment
  - Pay for accepted appointments
  - Join Jitsi consultation link
  - Update profile
  - Upload/download reports
  - View prescriptions
- Doctor:
  - Manage profile and availability
  - View appointment requests
  - Accept/reject/complete appointments
  - Join Jitsi consultation
  - Issue prescriptions
  - View patient reports
- Admin:
  - Create doctor account
  - Create doctor profile

## Kubernetes
All required backend and frontend manifests are in `k8s/`.
See `k8s/README.md` for apply order.
