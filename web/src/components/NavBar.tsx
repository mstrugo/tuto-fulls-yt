import React, { FC } from "react";
import { Box, Button, Flex, Link, Spinner } from "@chakra-ui/core";
import NextLink from 'next/link';
import { __INTERNAL_URL__ } from "../constants";
import { useLogoutMutation, useMeQuery } from "generated/graphql";
import { isSSR } from "utils/isSSR";

interface NavBarProps {}

export const NavBar: FC<NavBarProps> = () => {
  const [{ data, fetching }] = useMeQuery({
    // Don't call this query if this component is rendering from ServerSide
    pause: isSSR(),
  });
  const [{ fetching: isLogginOut }, logout] = useLogoutMutation();

  let body = null;

  if (!!fetching) { // data is loading
    body = <Spinner />;
  } else if (!data?.me) { // user is not logged in
    body = (
      <>
        <NextLink href={__INTERNAL_URL__.login}>
          <Link color="white" mr={2}>Login</Link>
        </NextLink>
        <NextLink href={__INTERNAL_URL__.register}>
          <Link color="white">Register</Link>
        </NextLink>
      </>
    );
  } else { // user is logged in
    body = (
      <Flex>
        <Box mr={2}>{data?.me.username}</Box>
        <Button onClick={() => logout()} isLoading={isLogginOut}>Logout</Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" p={4}>
      <Box ml="auto">
        {body}
      </Box>
    </Flex>
  )
};
