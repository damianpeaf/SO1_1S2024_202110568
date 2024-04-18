

```bash
kubectl create secret generic kafka-boostrap-secret \
  --from-literal=bootstrap.servers=my-cluster-kafka-bootstrap.kafka.svc:9092 \
  -n kafka
```