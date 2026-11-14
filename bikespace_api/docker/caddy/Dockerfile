ARG CADDY_IMAGE_TAG=2.11
FROM caddy:${CADDY_IMAGE_TAG}

# Pick up Alpine security fixes not yet in the upstream base image
RUN apk upgrade --no-cache

# Bake in rather than bind mount to resolve issue with how Coolify handles relative compose volumes
COPY Caddyfile /etc/caddy/Caddyfile
