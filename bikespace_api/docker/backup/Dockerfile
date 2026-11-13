FROM alpine:3.24
# supercronic pinned to v0.2.51 and verified against the published SHA1
RUN apk add --no-cache postgresql18-client rclone restic ca-certificates tzdata curl gettext \
 && curl -fsSL -o /tmp/supercronic \
    https://github.com/aptible/supercronic/releases/download/v0.2.51/supercronic-linux-amd64 \
 && echo "1692066e350a88ff4d7d6474fe3c7a6c41ec5e89  /tmp/supercronic" | sha1sum -c - \
 && install -m 0755 /tmp/supercronic /usr/local/bin/supercronic \
 && rm /tmp/supercronic
COPY *.sh /usr/local/bin/
COPY crontab.template /etc/crontab.template
RUN chmod +x /usr/local/bin/*.sh
CMD ["entrypoint.sh"]
