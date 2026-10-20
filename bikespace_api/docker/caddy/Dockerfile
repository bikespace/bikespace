ARG CADDY_IMAGE_TAG=2.11
FROM caddy:${CADDY_IMAGE_TAG}

# Bake in rather than bind mount to resolve issue with how Coolify handles relative compose volumes
COPY Caddyfile /etc/caddy/Caddyfile
