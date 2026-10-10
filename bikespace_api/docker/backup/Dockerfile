FROM alpine:3.24
# supercronic pinned to v0.2.33 and verified against the published SHA1
RUN apk add --no-cache postgresql18-client rclone restic ca-certificates tzdata curl gettext \
 && curl -fsSL -o /tmp/supercronic \
    https://github.com/aptible/supercronic/releases/download/v0.2.33/supercronic-linux-amd64 \
 && echo "71b0d58cc53f6bd72cf2f293e09e294b79c666d8  /tmp/supercronic" | sha1sum -c - \
 && install -m 0755 /tmp/supercronic /usr/local/bin/supercronic \
 && rm /tmp/supercronic
COPY *.sh /usr/local/bin/
COPY crontab.template /etc/crontab.template
RUN chmod +x /usr/local/bin/*.sh
CMD ["entrypoint.sh"]
