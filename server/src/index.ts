import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { __COOKIE_NAME__, __FRONTEND_APP__, __PROD__ } from './constants';
import { typeormConfig } from './typeorm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
  const conn = await createConnection(typeormConfig);

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: __FRONTEND_APP__,
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
      },
      saveUninitialized: false,
      secret: 'cangrejitacangrejit',
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('server localhost:4000');
  });
};

main().catch(err => console.error(err));
