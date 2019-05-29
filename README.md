# Bikespace Backend

This is the backend service for the bikespace application. We are running it on the Flask framework paired with a Postgres database.

# Docker Workflow

Supplied is a `docker-compose-dev.yml` for a containerized workflow.

[Install](https://docs.docker.com/install/) docker and docker-compose for your OS.

For Mac and Windows if you install docker, docker-compose is already installed
so don't have to worry about that.

Supplied is a `docker-compose-dev.yml` file for spinning up a containerized Flask and Postgres instances. Feel free to look around in the `bikespace_backend/db` and `bikespace_backend` folder for all the container startup files.

```shell
# To run the the docker container of the project
docker-compose -f docker-compose-dev.yml up -d --build

# For first time setup recreate and seed db for backend api
docker-compose -f docker-compose-dev.yml run users python manage.py recreate-db

docker-compose -f docker-compose-dev.yml run users python manage.py seed-db
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

While working on the project any major changes to the application in the frontend or the backend will require a rebuild of the containers.
```shell
docker-compose -f docker-compose-dev.yml up -d --build
```

# Development Workflow

Please when always working on a new feature checkout a new branch from the latest master branch and when submitting Pull Requests please submit PRs to the development branch from the feature branch you are working off. There are automated tests setup through gitlab's CI to test all PRs and branch pushes. All the development dependecies are in the containers themselves, but sometimes you have to update dependecies and for that you may need to build an run the service outside the docker workflow.

## Backend service
The backend service resides in `bikespace_backend/`, it is a Flask application and we are using `pipenv` for dependencies management. To develop the backend service only:

* Activate the virtual environment: `pipenv install` in the `bikespace_backend/bikespace_backend` folder
* To install new packages `pipenv install [package]` this will update the `Pipfile`

