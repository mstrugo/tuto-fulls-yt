import { withApollo as withNextApollo } from 'next-apollo';
import { apolloClient } from './apolloClient';

export const withApollo = withNextApollo(apolloClient);
