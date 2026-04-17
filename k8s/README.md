# Kubernetes Deployment Notes

## Backend + Database manifests
- `app-secret.yaml`
- `mongo-pvc.yaml`
- `mongo-deployment.yaml`
- `mongo-service.yaml`
- `auth-deployment.yaml`
- `auth-service.yaml`
- `doctor-deployment.yaml`
- `doctor-service.yaml`
- `telemedicine-deployment.yaml`
- `telemedicine-service.yaml`
- `appointment-deployment.yaml`
- `appointment-service.yaml`
- `patient-deployment.yaml`
- `patient-service.yaml`
- `payment-deployment.yaml`
- `payment-service.yaml`
- `notification-deployment.yaml`
- `notification-service.yaml`
- `gateway-deployment.yaml`
- `gateway-service.yaml`

## Frontend manifests
- `frontend-deployment.yaml`
- `frontend-service.yaml`

## Before applying
1. Build and push each image to your container registry.
2. Update image names in all deployment YAML files.
3. Set `VITE_API_BASE_URL` in `frontend-deployment.yaml` to a browser-reachable gateway URL.
4. Keep `JWT_SECRET` in `app-secret.yaml` aligned with all JWT-based services.

## Apply order
```bash
kubectl apply -f k8s/app-secret.yaml
kubectl apply -f k8s/mongo-pvc.yaml
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/mongo-service.yaml

kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/doctor-deployment.yaml
kubectl apply -f k8s/doctor-service.yaml
kubectl apply -f k8s/telemedicine-deployment.yaml
kubectl apply -f k8s/telemedicine-service.yaml
kubectl apply -f k8s/appointment-deployment.yaml
kubectl apply -f k8s/appointment-service.yaml
kubectl apply -f k8s/patient-deployment.yaml
kubectl apply -f k8s/patient-service.yaml
kubectl apply -f k8s/payment-deployment.yaml
kubectl apply -f k8s/payment-service.yaml
kubectl apply -f k8s/notification-deployment.yaml
kubectl apply -f k8s/notification-service.yaml
kubectl apply -f k8s/gateway-deployment.yaml
kubectl apply -f k8s/gateway-service.yaml

kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## Verify
```bash
kubectl get pods
kubectl get svc
```
