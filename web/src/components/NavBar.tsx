import React, { FC, ReactElement } from 'react';
import { Box, Button, Flex, Heading, Link, Spinner } from '@chakra-ui/core';
import NextLink from 'next/link';
import { __INTERNAL_URL__ } from '../constants';
import { useLogoutMutation, useMeQuery } from 'generated/graphql';
import { isSSR } from 'utils/isSSR';
import { useApolloClient } from '@apollo/client';

interface NavBarProps {}

type BodyContent = ReactElement | null;

export const NavBar: FC<NavBarProps> = () => {
  const { data, loading } = useMeQuery({
    // Don't call this query if this component is rendering from ServerSide
    skip: isSSR(),
  });
  const [logout, { loading: isLogginOut }] = useLogoutMutation();
  const apolloClient = useApolloClient();

  const logoutHandler = async () => {
    await logout();
    await apolloClient.resetStore();
  };

  let body: BodyContent = null;

  if (!!loading) {
    // data is loading
    body = <Spinner />;
  } else if (!data?.me) {
    // user is not logged in
    body = (
      <>
        <NextLink href={__INTERNAL_URL__.login}>
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href={__INTERNAL_URL__.register}>
          <Link color="white">Register</Link>
        </NextLink>
      </>
    );
  } else {
    // user is logged in
    body = (
      <Flex align="center">
        <NextLink href={__INTERNAL_URL__.createPost}>
          <Link mr={10} color="white">
            Create Post
          </Link>
        </NextLink>
        <Box mr={2}>{data?.me.username}</Box>
        <Button onClick={logoutHandler} isLoading={isLogginOut}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" p={4} position="sticky" zIndex={1}>
      <NextLink href={__INTERNAL_URL__.home}>
        <Link>
          <Heading>LiReddit</Heading>
        </Link>
      </NextLink>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};
