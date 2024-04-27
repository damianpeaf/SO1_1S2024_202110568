Pasos para instalar ingress

```bash
kubectl create ns nginx-ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 
helm repo update 
helm install nginx-ingress ingress-nginx/ingress-nginx -n nginx-ingress
```

Obtener la ip del nodo master
```bash
# minikube tunnel # Para asignar ip al servicio
kubectl get services -n nginx-ingress
```
