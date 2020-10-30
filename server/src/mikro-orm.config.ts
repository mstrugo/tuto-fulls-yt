import path from 'path';
import { MikroORM } from "@mikro-orm/core";
import { __PROD__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const config: Parameters<typeof MikroORM.init>[0] = {
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__PROD__,
  // user: '',
  password: '8728',
};

export default config;
