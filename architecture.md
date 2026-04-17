# Smart Healthcare System - Architecture Documentation

## Overview

The Smart Healthcare System is a **microservices-based architecture** designed to provide scalable, modular healthcare services. The system follows a distributed architecture pattern with service-oriented components, enabling independent scaling, deployment, and maintenance of each service.

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Applications                          │
│                    (Web Browser/Mobile)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   Frontend     │
                    │  (React/Vite)  │
                    └────────┬───────┘
                             │ HTTP/HTTPS
                             ▼
                    ┌────────────────┐
                    │  API Gateway   │
                    │  (Express.js)  │
                    └────────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │   Auth     │    │  Doctor    │    │ Appointment│
    │  Service   │    │  Service   │    │  Service   │
    └────────┬───┘    └────────┬───┘    └────────┬───┘
             │                 │                 │
        ┌────┴────┐     ┌──────┴──────┐    ┌────┴──────────┐
        ▼         ▼     ▼             ▼    ▼               ▼
    ┌────────────────────┐    ┌────────────────┐    ┌────────────┐
    │   Patient Service  │    │ Payment Service│    │ Notification│
    │                    │    │                │    │  Service   │
    └────────┬───────────┘    └────────┬───────┘    └────────┬───┘
             │                        │                      │
             └────────────────┬───────┴──────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │    MongoDB       │
                    │   (Database)     │
                    └──────────────────┘
```

## System Components

### 1. Frontend Application

**Location:** `/frontend`  
**Technology Stack:** React, Vite, Tailwind CSS  
**Port:** 3000 (development) / 80 (production via Nginx)

**Features:**
- Single Page Application (SPA) with routing
- Role-based UI components (Admin, Doctor, Patient)
- Dashboard and management interfaces
- Appointment booking and scheduling
- User authentication and authorization
- Responsive design with Tailwind CSS

**Key Components:**
- Authentication Context for session management
- Protected routes and role guards
- Service layer for API communication

---

### 2. API Gateway

**Location:** `/gateway`  
**Technology Stack:** Express.js, http-proxy-middleware  
**Port:** 8080 (default)

**Responsibilities:**
- Central entry point for all client requests
- Request routing to appropriate microservices
- CORS handling and logging
- Service orchestration and load balancing
- Error handling and timeout management

**Routes:**
- `/auth` → Auth Service (5001)
- `/doctors` → Doctor Service (5002)
- `/appointments` → Appointment Service (5003)
- `/patients` → Patient Service (5004)
- `/payments` → Payment Service (5005)
- `/notifications` → Notification Service (5006)

**Configuration:**
- Dynamically configurable via environment variables
- Fallback to default Docker service URLs
- Proxy timeout: 5000ms

---

### 3. Microservices

#### 3.1 Auth Service
**Location:** `/services/auth-service`  
**Port:** 5001

**Responsibilities:**
- User authentication (login/logout)
- JWT token generation and validation
- Password hashing and management
- Session management
- Role assignment and verification

---

#### 3.2 Doctor Service
**Location:** `/services/doctor-service`  
**Port:** 5002

**Responsibilities:**
- Doctor profile management
- Doctor availability and schedule management
- Doctor specialization tracking
- Qualifications and certifications storage
- Doctor listings and search

---

#### 3.3 Appointment Service
**Location:** `/services/appointment-service`  
**Port:** 5003

**Responsibilities:**
- Appointment scheduling and booking
- Appointment status management
- Appointment rescheduling
- Appointment cancellation
- Availability slot management

**Dependencies:** Doctor Service

---

#### 3.4 Patient Service
**Location:** `/services/patient-service`  
**Port:** 5004

**Responsibilities:**
- Patient profile management
- Medical history tracking
- Patient registration
- Personal information management
- Document and file uploads

**Dependencies:** Appointment Service

---

#### 3.5 Payment Service
**Location:** `/services/payment-service`  
**Port:** 5005

**Responsibilities:**
- Payment processing
- Transaction management
- Payment status tracking
- Invoice generation
- Refund handling

**Dependencies:** Appointment Service

---

#### 3.6 Notification Service
**Location:** `/services/notification-service`  
**Port:** 5006

**Responsibilities:**
- Email notifications
- SMS notifications
- Appointment reminders
- System alerts
- Notification logging

---

### 4. Data Storage

**Technology:** MongoDB  
**Port:** 27017  
**Container:** mongo:7

**Database Design:**
- Separate collections for each entity (Users, Doctors, Appointments, Patients, Payments)
- Denormalization where appropriate for performance
- Indexes on frequently queried fields

**Persistence:** Docker volume `mongo-data` for data persistence

---

## Architecture Patterns

### 1. Microservices Pattern
- Each service handles a specific business domain
- Independent databases (per service)
- Service-to-service communication via HTTP/REST
- Loose coupling and high cohesion

### 2. API Gateway Pattern
- Single entry point for clients
- Request routing and load balancing
- Cross-cutting concerns (CORS, logging)
- Service discovery and failover

### 3. Circuit Breaker Pattern
- Timeout management (5000ms)
- Error handling and graceful degradation
- Service availability monitoring

### 4. Database Per Service
- MongoDB instances isolated per logical domain
- Shared MongoDB for this MVP (can be separated)
- Data consistency handled at service level

---

## Deployment Architecture

### Development Environment

**Method:** Docker Compose  
**File:** `docker-compose.yml`

**Services:**
- MongoDB (shared database)
- All 6 microservices
- Frontend (development server)
- API Gateway

**Setup:**
```bash
docker-compose up -d
```

---

### Production Environment

**Method:** Kubernetes (K8s)  
**Configuration Files:** `/k8s` directory

**Components:**
- Deployments for each service
- Services for networking and load balancing
- PersistentVolume for MongoDB data
- ConfigMaps for configuration
- Secrets for sensitive data (app-secret.yaml)

**Deployments:**
1. MongoDB deployment with persistent storage
2. API Gateway deployment
3. Individual service deployments (Auth, Doctor, Appointment, Patient, Payment, Notification)
4. Frontend deployment with Nginx

**Networking:**
- Internal service-to-service communication via ClusterIP services
- External access via LoadBalancer/Ingress services
- Service discovery via DNS

---

## Communication Patterns

### 1. Synchronous Communication
- Direct HTTP REST calls between services
- Client-to-Gateway communication
- Request-response model

### 2. Service-to-Service Communication
- Auth Service → Validates requests across all services
- Appointment Service → Communicates with Doctor Service for availability
- Patient Service → Communicates with Appointment Service for history
- Payment Service → Communicates with Appointment Service for payment verification
- Notification Service → Receives events from other services

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18+, Vite, Tailwind CSS |
| **API Gateway** | Express.js, http-proxy-middleware, Morgan, CORS |
| **Microservices** | Node.js, Express.js |
| **Database** | MongoDB 7 |
| **Authentication** | JWT |
| **Containerization** | Docker |
| **Orchestration** | Docker Compose, Kubernetes |
| **HTTP Client** | Axios (frontend), Node.js http module |

---

## Data Flow

### Appointment Booking Flow
```
1. User (Frontend) → API Gateway (/appointments/book)
2. API Gateway → Appointment Service (5003)
3. Appointment Service → Doctor Service (check availability)
4. Doctor Service → MongoDB (query schedules)
5. MongoDB → Doctor Service → Appointment Service
6. Appointment Service → MongoDB (save booking)
7. Appointment Service → API Gateway
8. API Gateway → Frontend (confirmation)
9. Notification Service (triggered for notifications)
```

---

## Scalability Considerations

### Horizontal Scaling
- Each microservice can scale independently
- Load balancing at API Gateway level
- Kubernetes HPA (Horizontal Pod Autoscaler) for automatic scaling
- Stateless services enabling easy replication

### Vertical Scaling
- Resource limits and requests per pod
- Database optimization and indexing
- Caching strategies for frequently accessed data

### Performance Optimization
- Service-to-service communication optimization
- Database connection pooling
- Request timeout management
- Error handling and circuit breakers

---

## Security Architecture

### 1. Authentication & Authorization
- JWT-based token authentication
- Role-based access control (RBAC)
- Protected routes on frontend
- Service-level authorization checks

### 2. API Security
- CORS configuration at Gateway
- HTTPS/TLS in production
- Request validation at service level
- Rate limiting (can be added)

### 3. Data Security
- MongoDB authentication
- Environment-based secrets management
- Kubernetes Secrets for sensitive data
- Encrypted connections between services

### 4. Network Security
- Private Docker network for service-to-service communication
- Kubernetes Network Policies (can be implemented)
- Service mesh (Istio) for advanced traffic management

---

## Environment Configuration

### Development
```
Docker Compose network: smart-healthcare-network
Services communicate via container names
Ports exposed for local debugging
Hot reload enabled
```

### Production (Kubernetes)
```
Cluster-internal communication via DNS
No direct port exposure except through LoadBalancer/Ingress
All configuration via ConfigMaps and Secrets
Service accounts and RBAC policies
```

---

## File Structure

```
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── context/            # React Context for state
│   │   └── router/             # Routing configuration
│   └── ...
├── gateway/                    # API Gateway
│   ├── server.js              # Main gateway application
│   └── ...
├── services/                   # Microservices
│   ├── auth-service/
│   ├── doctor-service/
│   ├── appointment-service/
│   ├── patient-service/
│   ├── payment-service/
│   └── notification-service/
├── k8s/                        # Kubernetes manifests
│   ├── *-deployment.yaml
│   ├── *-service.yaml
│   └── app-secret.yaml
└── docker-compose.yml         # Docker Compose configuration
```

---

## Future Enhancements

1. **Message Queue Integration** - RabbitMQ/Kafka for asynchronous communication
2. **Service Mesh** - Istio for advanced traffic management
3. **API Documentation** - Swagger/OpenAPI specifications
4. **Monitoring & Logging** - ELK stack, Prometheus, Grafana
5. **CI/CD Pipeline** - GitHub Actions, GitLab CI
6. **Caching Layer** - Redis for performance optimization
7. **Event Sourcing** - Event-driven architecture
8. **GraphQL** - Alternative to REST API
9. **Database Separation** - Individual databases per service
10. **Rate Limiting & Throttling** - DDoS protection and fairness

---

## Getting Started

### Local Development
```bash
# Start all services
docker-compose up -d

# Access frontend: http://localhost:3000
# Access gateway: http://localhost:8080
```

### Kubernetes Deployment
```bash
# Build and push images
docker build -t yourregistry/auth-service ./services/auth-service
# ... repeat for all services

# Apply Kubernetes manifests
kubectl apply -f k8s/

# Verify deployments
kubectl get deployments
kubectl get services
```

---

## Conclusion

The Smart Healthcare System is built with a modern microservices architecture that emphasizes scalability, maintainability, and flexibility. Each service handles a specific business domain, allowing independent development and deployment while maintaining a cohesive system through the API Gateway.

