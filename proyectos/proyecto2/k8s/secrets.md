

```bash
kubectl create secret generic kafka-boostrap-secret \
  --from-literal=bootstrap.servers=my-cluster-kafka-bootstrap.kafka.svc:9092 \
  -n so1-proyecto2
```

```bash
kubectl create secret generic mongo-secret \
  --from-literal=url=mongodb://root:m0nG0p4ssw0rD@mongo-svc-clusterip:27017 \
  -n so1-proyecto2
```

```bash
kubectl create secret generic redis-secret \
  --from-literal=url=redis-svc:6379 \
  -n so1-proyecto2

kubectl create secret generic redis-secret \
  --from-literal=password=R3d1sP4ssw0rd
```