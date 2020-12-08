import { ConnectionOptions } from 'typeorm';
import path from 'path';
import { __ENV_DATABASE_URL__, __PROD__ } from './constants';
import { Post, User, Updoot } from './entities';

export const typeormConfig: ConnectionOptions = {
  entities: [Post, User, Updoot],
  // database: 'lireddit2',
  url: __ENV_DATABASE_URL__,
  type: 'postgres',
  logging: !__PROD__,
  synchronize: !__PROD__,
  // username: 'postgres',
  // password: '8728',
  migrations: [path.join(__dirname, './migrations/*')],
};
