FROM python:3.12-slim
WORKDIR /app

RUN apt-get update \
    && apt-get -y install libpq-dev gcc

COPY bikespace_api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY bikespace_api/ docker/test/api-boot.sh ./
# COPY docker/test/api-boot.sh ./api-boot.sh
RUN chmod a+x api-boot.sh

EXPOSE 8000
ENTRYPOINT ["./api-boot.sh"]