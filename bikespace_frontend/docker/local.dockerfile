# Dev-only image for the Next.js frontend, used by the root compose.yaml (`make dev`).
# Source is bind-mounted and node_modules lives in a named volume, so nothing from
# the app is baked in here.
FROM node:24-slim

# Create the mount points owned by `node` so new named volumes inherit that owner
RUN mkdir -p /app/node_modules /app/.next /home/node/.npm \
    && chown -R node:node /app /home/node/.npm

COPY --chmod=755 dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh

USER node
WORKDIR /app

EXPOSE 8080
ENTRYPOINT ["dev-entrypoint.sh"]
