FROM node:12.0-slim
COPY . .
RUN npm ci
CMD [ "npm", "start" ]