# Docker Notes

- Most guides for npm/js projects recommend having separate build and run steps in the dockerfile
- Wasn't able to figure out how to run the 'build' command in next while still using the dev or test environment variables (i.e. making a build that hits the localhost api URL instead of the real one)
- Wasn't able to figure out how to get the containers running and using their internal networking - I think this requires handling some CORS stuff in the Next config
- Some suggested workflows involve publishing images to docker hub, but this would require confidence that nothing sensitive is being included in the dockerfile build
- Docker recently added limits to usage for unauthenticated users, see: https://docs.docker.com/docker-hub/usage/ - should investigate if this is a potential problem for us

## References

- [Miguel Grinberg: How to Dockerize a React + Flask Project](https://blog.miguelgrinberg.com/post/how-to-dockerize-a-react-flask-project)
  - Helpful, though some of the Dockerfile configs are not very optimized
- [Docker Docs: Python language-specific guide](https://docs.docker.com/guides/python/)
  - Has some CI/CD examples, but they use docker hub
  - The NPM / JS language-specific guide has some examples that are more relevant to testing
- [DigitalOcean: How to run end-to-end tests using playwright and Docker](https://www.digitalocean.com/community/tutorials/how-to-run-end-to-end-tests-using-playwright-and-docker)
- [Playwright Docs: web server settings](https://playwright.dev/docs/test-webserver)
- [GitHub Actions Docs: using service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers)