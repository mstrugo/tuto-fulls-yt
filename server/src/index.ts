// import 'reflect-medatada';
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MikroORM } from "@mikro-orm/core";
import cors from 'cors';
import { __FRONTEND_APP__, __PROD__ } from "./constants";
import config from './mikro-orm.config';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(cors({
    origin: __FRONTEND_APP__,
    credentials: true,
  }));
  app.use(
    session({
      name: 'uid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2, // 2 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __PROD__ // cookie only works in https
      },
      saveUninitialized: false,
      secret: 'cangrejitacangrejit',
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => { console.log("server localhost:4000")});
};


main().catch(err => console.error(err));
