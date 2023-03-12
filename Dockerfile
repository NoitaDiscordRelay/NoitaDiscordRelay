FROM node:16-alpine3.17

WORKDIR /app
COPY . .
RUN npm install  --loglevel verbose && npm run build  --loglevel verbose

ENV PID_FILE=./noita-relay-pidfile

EXPOSE 6667

CMD ["npm", "start"]
