import DataLoader from 'dataloader';
import { User } from '../entities/User';

// Keys = [1, 7, 8, 78, 9]
// return [{ id: 1, username: 'x' }, {...}]
export const createUserLoader = () =>
  new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]);
    const usersMap: Record<number, User> = {};

    users.forEach(u => (usersMap[u.id] = u));

    return userIds.map(userId => usersMap[userId]);
  });
