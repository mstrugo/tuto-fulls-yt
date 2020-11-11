import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation } from "generated/graphql";
import { __GRAPHQL_URL__ } from "../constants";

function updQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any );
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
              }
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
              }
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
    ssrExchange,
    fetchExchange
  ],
});
