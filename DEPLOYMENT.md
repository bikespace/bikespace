# Deployment Instructions

## Set up

Make sure to fill in the seed user email

## Validate docker compose:

```sh
SERVICE_PASSWORD_64_BIKESPACESECRETKEY=x \
SERVICE_PASSWORD_64_PASSWORDSALT=x \
SEED_USER_EMAIL=x \
SERVICE_PASSWORD_64_SEEDUSERPASSWORD=x \
SERVICE_USER_POSTGRES=x \
SERVICE_PASSWORD_64_POSTGRES=x \
docker compose -f bikespace_api/docker/compose-prod.yaml config -q
```

