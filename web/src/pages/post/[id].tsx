import React from 'react';
import { Box, Text, Heading, Spinner, Flex } from '@chakra-ui/core';
import Layout from 'components/Layout';
import { __OUT_OF_RANGE__ } from '../../constants';
import { parseDate } from 'utils/parseDate';
import { withApollo } from 'utils/withApollo';
import Actions from 'components/Actions';
import { useGetPostFromUrl } from 'utils/useGetPostFromUrl';

const Post = () => {
  const { data, loading } = useGetPostFromUrl();

  if (loading) {
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

export default withApollo({ ssr: true })(Post);
