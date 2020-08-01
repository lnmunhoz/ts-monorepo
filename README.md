## Setup

1. `yarn`
2. `docker-compose up`
3. `yarn prisma:migrate:save`
4. `yarn prisma:migrate:up`
5. `yarn prisma:generate`
6. Done! Now you can run the server.

## Run the server

```
yarn dev:server
```

## Build for production

1. Run all the commands from setup section
2. Build the prod server with `yarn build:server`
3. Start the prod server with `yarn prod:server`. You need to setup the env variables somewhere!
