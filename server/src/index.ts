import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import {
  __COOKIE_NAME__,
  __ENV_BACKEND_PORT__,
  __ENV_FRONTEND_APP__,
  __ENV_REDIS_URL__,
  __ENV_SESSION_SECRET__,
  __PROD__,
} from './constants';
import { typeormConfig } from './typeorm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';
// import { Post } from './entities';

const main = async () => {
  const conn = await createConnection(typeormConfig);
  // Post.delete({});
  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(__ENV_REDIS_URL__);
  app.set('proxy', 1); // For NGIN-X
  app.use(
    cors({
      origin: __ENV_FRONTEND_APP__,
      credentials: true,
    }),
  );
  app.use(
    session({
      name: __COOKIE_NAME__,
      store: new RedisStore({
        // @ts-ignore
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2, // 2 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __PROD__, // cookie only works in https
        domain: __PROD__ ? '.example.com' : undefined,
      },
      saveUninitialized: false,
      secret: __ENV_SESSION_SECRET__,
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(parseInt(__ENV_BACKEND_PORT__), () => {
    console.log(`server localhost: ${__ENV_BACKEND_PORT__}`);
  });
};

main().catch(err => console.error(err));
