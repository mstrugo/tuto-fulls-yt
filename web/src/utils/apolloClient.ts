import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PaginatedPosts } from 'generated/graphql';
import { NextPageContext } from 'next';
import { __GRAPHQL_URL__ } from '../constants';

export const apolloClient = (ctx: NextPageContext) =>
  new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts,
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
    credentials: 'include',
    headers: {
      cookie:
        (typeof window === 'undefined' ? ctx.req?.headers.cookie : '') || '',
    },
    uri: __GRAPHQL_URL__,
  });
