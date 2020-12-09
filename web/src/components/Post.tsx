import React, { FC, useState } from 'react';
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/core';
import {
  PostSnippetFragment,
  useMeQuery,
  useVoteMutation,
  VoteMutation,
} from 'generated/graphql';
import Link from 'next/link';
import { __INTERNAL_URL__ } from '../constants';
import Actions from './Actions';
import gql from 'graphql-tag';
import { ApolloCache } from '@apollo/client';

interface PostProps {
  data: PostSnippetFragment;
}

type LoadingState = 'upvote' | 'downvote' | 'quiet';

interface VoteFragment {
  id: PostSnippetFragment['id'];
  points: PostSnippetFragment['points'];
  voteStatus: PostSnippetFragment['voteStatus'];
}

const updateVote = (
  id: number,
  value: number,
  cache: ApolloCache<VoteMutation>,
) => {
  const postId = `Post:${id}`;

  const data = cache.readFragment<VoteFragment>({
    id: postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (!!data) {
    if (data.voteStatus === value) {
      return;
    }

    const multiplier = data.voteStatus ? 2 : 1;
    const newPoints = data.points + value * multiplier;

    cache.writeFragment<VoteFragment>({
      id: postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: {
        id,
        points: newPoints,
        voteStatus: value,
      },
    });
  }
};

export const Post: FC<PostProps> = ({ data }) => {
  const [fetchState, setFetchState] = useState<LoadingState>('quiet');
  const [vote] = useVoteMutation();
  const { data: user } = useMeQuery();

  const handleUpvote = async () => {
    setFetchState('upvote');
    await vote({
      variables: { postId: data.id, value: 1 },
      update: cache => updateVote(data.id, 1, cache),
    });
    setFetchState('quiet');
  };

  const handleDownvote = async () => {
    setFetchState('downvote');
    await vote({
      variables: { postId: data.id, value: -1 },
      update: cache => updateVote(data.id, -1, cache),
    });
    setFetchState('quiet');
  };

  const notLoggedIn = !user?.me?.id;
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
          isDisabled={notLoggedIn || alreadyUpvoted}
        />
        <Text>{data.points}</Text>
        <IconButton
          icon="chevron-down"
          size="md"
          aria-label="Downvote"
          onClick={handleDownvote}
          isLoading={fetchState === 'downvote'}
          variantColor={alreadyDownvoted ? 'red' : undefined}
          isDisabled={notLoggedIn || alreadyDownvoted}
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
