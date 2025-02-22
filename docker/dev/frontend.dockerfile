FROM node:22-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY bikespace_frontend/package*.json ./
RUN npm install
COPY bikespace_frontend/next.config.mjs bikespace_frontend/tsconfig.json ./
COPY bikespace_frontend/src/ ./src/
COPY bikespace_frontend/public/ ./public
 
# Expose the port your app runs on
EXPOSE 3000
 
# Define the command to run your app
CMD ["npm", "run", "develop"]