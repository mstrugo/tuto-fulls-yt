import Router from 'next/router';
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from 'urql';
import {
  cacheExchange,
  Cache,
  QueryInput,
  Resolver,
} from '@urql/exchange-graphcache';
import gql from 'graphql-tag';
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
  VoteMutationVariables,
} from 'generated/graphql';
import { pipe, tap } from 'wonka';
import { __GRAPHQL_URL__ } from '../constants';

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login');
      }
    }),
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);

    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      'posts',
    );

    info.partial = !isItInTheCache;

    let hasMore = true;
    const results: string[] = [];

    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    };
  };
};

function updQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query,
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

export const createUrqlClient = (ssrExchange: any) => ({
  url: __GRAPHQL_URL__,
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          login: (result, _args, cache, _info) => {
            updQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (res, query) => {
                if (!!res.login.errors) {
                  return query;
                }

                return {
                  me: res.login.user,
                };
              },
            );
          },
          register: (result, _args, cache, _info) => {
            updQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (res, query) => {
                if (!!res.register.errors) {
                  return query;
                }

                return {
                  me: res.register.user,
                };
              },
            );
          },
          logout: (result, _args, cache, _info) => {
            updQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              () => ({ me: null }),
            );
          },
          createPost: (_result, _args, cache, _info) => {
            const allFields = cache.inspectFields('Query');
            const fieldInfos = allFields.filter(
              info => info.fieldName === 'posts',
            );

            fieldInfos.forEach(fi => {
              cache.invalidate('Query', 'posts', fi.arguments || {});
            });
          },
          vote: (_result, args, cache, _info) => {
            const { postId, value } = args as VoteMutationVariables;
            const data: any = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId },
            );

            if (!!data) {
              if (data.voteStatus === value) {
                return;
              }

              const multiplier = data.voteStatus ? 2 : 1;
              const newPoints = data.points + value * multiplier;

              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                {
                  id: postId,
                  points: newPoints,
                  voteStatus: value,
                },
              );
            }
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
