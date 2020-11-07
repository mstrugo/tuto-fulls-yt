import React from 'react';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import { Cache, cacheExchange, QueryInput } from '@urql/exchange-graphcache';
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import { __GRAPHQL_URL__ } from '../constants';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import theme from '../theme'

function updQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any );
}

const client = createClient({
  url: __GRAPHQL_URL__,
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [dedupExchange, cacheExchange({
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
  }) as any, fetchExchange],
});

const MyApp = ({ Component, pageProps }) => (
  <Provider value={client}>
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  </Provider>
);

export default MyApp;
