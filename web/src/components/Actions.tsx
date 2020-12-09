import React from 'react';
import { Box, IconButton } from '@chakra-ui/core';
import { useDeletePostMutation, useMeQuery } from 'generated/graphql';
import Link from 'next/link';
import { __INTERNAL_URL__ } from '../constants';

interface ActionsProps {
  size?: 'sm' | 'md' | 'xs';
  creatorId: number;
  postId: number;
}

const Actions = ({ creatorId, postId, size = 'md' }: ActionsProps) => {
  const [deletePost] = useDeletePostMutation();
  const { data: user } = useMeQuery();

  const handleDelete = async () => {
    await deletePost({
      variables: {
        id: postId,
      },
      update: cache => {
        // Post:77
        cache.evict({ id: `Post:${postId}` });
      },
    });
  };

  if (user?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box ml="auto">
      <Link
        href={__INTERNAL_URL__.editPostSlug}
        as={`${__INTERNAL_URL__.editPost}/${postId}`}
      >
        <IconButton aria-label="Edit Post" icon="edit" mr={4} size={size}>
          Edit
        </IconButton>
      </Link>
      <IconButton
        aria-label="Delete Post"
        icon="delete"
        onClick={handleDelete}
        size={size}
      >
        Delete
      </IconButton>
    </Box>
  );
};

export default Actions;
