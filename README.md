# node-hello-prod

Small production-ready Node.js service with health check, ready for Jenkins CI/CD and Docker deployment.

- GET / → hello + version
- GET /health → health payload

Env:
- PORT (default 3000)
- APP_VERSION (baked/tagged by pipeline)

