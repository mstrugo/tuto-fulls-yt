import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
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
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
