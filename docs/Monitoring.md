# Monitoring & Logging

## Built-in Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /health` | None | Liveness — always 200 while process is up |
| `GET /ready` | None | Readiness — 200 only when MongoDB is connected |
| `GET /metrics` | None (restrict in prod) | Process memory + DB connection state |

Restrict `/metrics` in production by adding IP allowlist middleware or putting it behind a VPN.

## Logging

### Winston Configuration (`server/utils/logger.js`)

| Environment | Format | Transports |
|-------------|--------|-----------|
| `development` | Colorized, human-readable | Console only |
| `production` | JSON (structured) | Console + `logs/error.log` + `logs/combined.log` |

### Log Levels

`error` > `warn` > `info` > `http` > `debug`

Set via `LOG_LEVEL` env var. Default: `info`.

### HTTP Access Logs

Morgan `combined` format is piped to Winston at `http` level. Every request is logged with method, path, status, and response time.

## Log Rotation

Winston file transports are configured with:
- Max file size: 10 MB
- Max files: 5 (auto-rotates)

For production, also consider shipping logs to CloudWatch, Datadog, or ELK.

## AWS CloudWatch (recommended)

Install the CloudWatch agent on EKS nodes or use Fluent Bit as a DaemonSet to forward container stdout/stderr to CloudWatch Logs.

Suggested log groups:
- `/student-management/server/app`
- `/student-management/server/errors`
- `/student-management/client/nginx`

## Prometheus / Grafana (future)

To expose Prometheus metrics, add the `prom-client` package:

```bash
npm install prom-client
```

Then expose a `/metrics` endpoint in Prometheus text format. Deploy Prometheus + Grafana via Helm to the EKS cluster.

## Alerts (recommended)

| Alert | Condition |
|-------|-----------|
| High error rate | `5xx` responses > 1% over 5 min |
| Pod restart | Pod restartCount > 3 in 10 min |
| Memory pressure | Memory > 80% of limit |
| DB disconnected | `/ready` returns non-200 for > 30 sec |
