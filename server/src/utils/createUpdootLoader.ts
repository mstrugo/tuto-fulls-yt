import DataLoader from 'dataloader';
import { Updoot } from '../entities';

// Keys = [{ postId: 5, userId: 10 }]
// return [{ postId: 5, userId: 10, value: 1 }]
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async keys => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootsMap: Record<string, Updoot> = {};

      updoots.forEach(upd => {
        updootsMap[`${upd.userId}|${upd.postId}`] = upd;
      });

      return keys.map(k => updootsMap[`${k.userId}|${k.postId}`]);
    },
  );
