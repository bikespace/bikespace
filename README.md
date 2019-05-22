# Bikespace Backend

This is the backend service for the bikespace application. We are running it on the Flask framework paired with a Postgres database.

# Docker Workflow

Supplied is a `docker-compose.yml` for a containerized workflow.

[Install](https://docs.docker.com/install/) docker and docker-compose for your OS.

For Mac and Windows if you install docker, docker-compose is already installed
so don't have to worry about that.

Supplied is a `docker-compose.yml` file for spinning up a containerized Flask and Postgres instances. Feel free to look around in the `bikespace_backend/db` and `bikespace_backend` folder for all the container startup files.

```shell
# To run the the docker container of the project
docker-compose -f docker-compose-dev.yml up -d --build
```

Note: Windows users might need to open some files in vim and set the fileformat to unix
```vim
:set fileformat=unix
```

If all goes well and it confirms that you have succesfully ran the docker image, you can test to see if the flask is running. 
On your browser you can visit `localhost:5001/answers/ping` it should return a json message with `pong`. That signifies that the Flask app is running.

To shutdown the containers, just run:
```shell
docker-compose -f docker-compose-dev.yml down
```

# Development Workflow

TODO