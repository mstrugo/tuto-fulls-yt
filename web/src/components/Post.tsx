import React, { FC, useState } from 'react';
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/core';
import { PostSnippetFragment, useVoteMutation } from 'generated/graphql';
import Link from 'next/link';
import { __INTERNAL_URL__ } from '../constants';
import Actions from './Actions';

interface PostProps {
  data: PostSnippetFragment;
}

type LoadingState = 'upvote' | 'downvote' | 'quiet';

export const Post: FC<PostProps> = ({ data }) => {
  const [fetchState, setFetchState] = useState<LoadingState>('quiet');
  const [, vote] = useVoteMutation();

  const handleUpvote = async () => {
    setFetchState('upvote');
    await vote({ postId: data.id, value: 1 });
    setFetchState('quiet');
  };

  const handleDownvote = async () => {
    setFetchState('downvote');
    await vote({ postId: data.id, value: -1 });
    setFetchState('quiet');
  };

  const alreadyUpvoted = data.voteStatus === 1;
  const alreadyDownvoted = data.voteStatus === -1;

  return (
    <Flex p={5} mb={4} shadow="md" borderWidth="1px">
      <Flex align="center" justify="center" direction="column">
        <IconButton
          icon="chevron-up"
          size="md"
          aria-label="Upvote"
          onClick={handleUpvote}
          isLoading={fetchState === 'upvote'}
          variantColor={alreadyUpvoted ? 'green' : undefined}
          isDisabled={alreadyUpvoted}
        />
        <Text>{data.points}</Text>
        <IconButton
          icon="chevron-down"
          size="md"
          aria-label="Downvote"
          onClick={handleDownvote}
          isLoading={fetchState === 'downvote'}
          variantColor={alreadyDownvoted ? 'red' : undefined}
          isDisabled={alreadyDownvoted}
        />
      </Flex>
      <Box ml={4} flex={1}>
        <Heading fontSize="xl">
          <Link
            href={__INTERNAL_URL__.postDetailSlug}
            as={`${__INTERNAL_URL__.postDetail}/${data.id}`}
          >
            {data.title}
          </Link>
        </Heading>
        <Text>Posted by {data.creator.username}</Text>
        <Flex>
          <Text flex={1} mt={4}>
            {data.textSnippet}
          </Text>

          <Actions creatorId={data.creator.id} postId={data.id} />
        </Flex>
      </Box>
    </Flex>
  );
};
