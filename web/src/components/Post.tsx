import React, { FC } from 'react';
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/core';
import { Post as PostType } from 'generated/graphql';

interface PostProps {
  data: Pick<PostType, 'points' | 'title' | 'creator' | 'textSnippet'>;
}

export const Post: FC<PostProps> = ({ data }) => {
  const handleUpvote = () => console.log('upv');
  const handleDownvote = () => console.log('downv');

  return (
    <Flex p={5} shadow="md" borderWidth="1px">
      <Flex align="center" justify="center" direction="column">
        <IconButton
          icon="chevron-up"
          size="md"
          aria-label="Upvote"
          onClick={handleUpvote}
        />
        <Text>{data.points}</Text>
        <IconButton
          icon="chevron-down"
          size="md"
          aria-label="Downvote"
          onClick={handleDownvote}
        />
      </Flex>
      <Box ml={4}>
        <Heading fontSize="xl">{data.title}</Heading>
        <Text>Posted by {data.creator.username}</Text>
        <Text mt={4}>{data.textSnippet}</Text>
      </Box>
    </Flex>
  );
};
