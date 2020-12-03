import React from 'react';
import { Box, Text, Heading, Spinner, IconButton, Flex } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import Layout from 'components/Layout';
import { usePostQuery } from 'generated/graphql';
import { createUrqlClient } from 'utils/createUrqlClient';
import { __OUT_OF_RANGE__ } from '../../constants';
import { parseDate } from 'utils/parseDate';
import Actions from 'components/Actions';

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  let postId = !!id && typeof id === 'string' ? parseInt(id) : __OUT_OF_RANGE__;

  const [{ data, fetching }] = usePostQuery({
    pause: postId === __OUT_OF_RANGE__,
    variables: { id: postId },
  });

  if (fetching) {
    return (
      <Layout variant="small">
        <Spinner />
      </Layout>
    );
  } else if (!data?.post) {
    return <Layout variant="small">Wrong PostID</Layout>;
  }

  const { post } = data;

  return (
    <Layout variant="small">
      <Flex>
        <Heading>{post.title}</Heading>
        <Actions creatorId={post.creator.id} postId={post.id} size="xs" />
      </Flex>
      <Text mb={4}>
        Posted by {post.creator.username} {parseDate(parseInt(post.createdAt))}
      </Text>
      <Box>{post.text}</Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
