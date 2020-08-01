FROM gcr.io/google_appengine/nodejs

ENV NODE_ENV=production
ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

WORKDIR /app
COPY . /app/

RUN yarn install --production=false

RUN yarn build:server

CMD ["node", "./packages/server/build/src/index.js"]

