# base image
FROM python:3.7.0-slim

# install dependecies
RUN apt-get update && \
    apt-get -y install netcat && \
    apt-get clean

RUN pip3 install pipenv

# set working directory
WORKDIR /usr/src/app

# add and install requirements
COPY ./Pipfile /usr/src/app/Pipfile
COPY ./Pipfile.lock /usr/src/app/Pipfile.lock
RUN pipenv install --system

# add entrypoint.sh
COPY ./entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# add app
COPY . /usr/src/app

# run server
CMD ["/usr/src/app/entrypoint.sh"]