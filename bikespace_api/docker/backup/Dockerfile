# restic and supercronic are installed from upstream sources and verified
# against their published download hashes.
ARG GO_IMAGE_TAG=1.26-alpine3.24
FROM golang:${GO_IMAGE_TAG} AS restic
ARG RESTIC_VERSION=0.19.1
ARG RESTIC_SRC_SHA256=bb9b1a19040744d26d8a79be029d4e6b189c45ccc9d8831d7fe367d3c33df725
ARG X_NET_VERSION=v0.62.0
WORKDIR /src
RUN wget -q -O restic.tar.gz \
      "https://github.com/restic/restic/releases/download/v${RESTIC_VERSION}/restic-${RESTIC_VERSION}.tar.gz" \
 && echo "${RESTIC_SRC_SHA256}  restic.tar.gz" | sha256sum -c - \
 && tar -xzf restic.tar.gz --strip-components=1 \
 && rm restic.tar.gz \
 && go get "golang.org/x/net@${X_NET_VERSION}" \
 && go mod tidy \
 && CGO_ENABLED=0 GOTOOLCHAIN=local go build -trimpath -ldflags "-s -w" -o /out/restic ./cmd/restic

FROM alpine:3.24
ARG SUPERCRONIC_VERSION=0.2.51
ARG SUPERCRONIC_SHA1=1692066e350a88ff4d7d6474fe3c7a6c41ec5e89
RUN apk upgrade --no-cache \
 && apk add --no-cache postgresql18-client ca-certificates tzdata gettext \
 && apk add --no-cache --virtual .build-deps curl \
 && cd /tmp \
 && curl -fsSL -o supercronic \
      "https://github.com/aptible/supercronic/releases/download/v${SUPERCRONIC_VERSION}/supercronic-linux-amd64" \
 && echo "${SUPERCRONIC_SHA1}  supercronic" | sha1sum -c - \
 && install -m 0755 supercronic /usr/local/bin/supercronic \
 && rm -rf /tmp/* \
 && apk del --no-network .build-deps
COPY --from=restic /out/restic /usr/local/bin/restic
COPY *.sh /usr/local/bin/
COPY crontab.template /etc/crontab.template
RUN chmod +x /usr/local/bin/*.sh
CMD ["entrypoint.sh"]
