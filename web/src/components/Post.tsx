import React, { FC } from 'react';
import { Box, Heading, Text } from '@chakra-ui/core';

interface PostProps {
  data: any;
}

export const Post: FC<PostProps> = ({ data }) => {
  return (
    <Box p={5} shadow="md" borderWidth="1px">
      <Heading fontSize="xl">{data.title}</Heading>
      <Text mt={4}>{data.textSnippet}</Text>
    </Box>
  );
};
