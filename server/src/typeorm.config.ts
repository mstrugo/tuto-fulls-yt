import { ConnectionOptions } from 'typeorm';
import path from 'path';
import { __PROD__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

export const typeormConfig: ConnectionOptions = {
  entities: [Post, User],
  database: 'lireddit2',
  type: 'postgres',
  logging: !__PROD__,
  synchronize: !__PROD__,
  username: 'postgres',
  password: '8728',
  migrations: [path.join(__dirname, './migrations/*')],
};
