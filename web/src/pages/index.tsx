import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { Button, Flex, Stack } from '@chakra-ui/core';
import Layout from 'components/Layout';
import { Post } from 'components/Post';
import { usePostsQuery } from 'generated/graphql';
import { createUrqlClient } from 'utils/createUrqlClient';

interface IVariables {
  limit: number;
  cursor: null | string;
}

const Index = () => {
  const [variables, setVariables] = useState<IVariables>({
    limit: 10,
    cursor: null,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  const loadMoreHandler = () =>
    setVariables({
      ...variables,
      cursor: data!.posts.posts[data!.posts.posts.length - 1].createdAt,
    });

  return (
    <Layout>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {!!data?.posts?.posts?.length ? (
            <>
              {data.posts.posts.map(p => (
                <Post key={p.id} data={p} />
              ))}
              {!!data.posts.hasMore && (
                <Flex>
                  <Button
                    onClick={loadMoreHandler}
                    isLoading={fetching}
                    m="auto"
                    my={4}
                  >
                    Load more
                  </Button>
                </Flex>
              )}
            </>
          ) : (
            <div>No posts! Create a new one!</div>
          )}
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
