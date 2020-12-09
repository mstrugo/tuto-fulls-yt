import React from 'react';
import { Button, Flex, Stack } from '@chakra-ui/core';
import Layout from 'components/Layout';
import { Post } from 'components/Post';
import { PostSnippetFragment, usePostsQuery } from 'generated/graphql';
import { withApollo } from 'utils/withApollo';

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      cursor: null,
      limit: 10,
    },
  });

  const loadMoreHandler = () => {
    fetchMore({
      variables: {
        cursor: data!.posts.posts[data!.posts.posts.length - 1].createdAt,
        limit: variables?.limit,
      },
    });
  };

  return (
    <Layout>
      {!data && loading ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {!!data?.posts?.posts?.length ? (
            <>
              {data.posts.posts
                .filter(post => post)
                .map((p: PostSnippetFragment) => (
                  <Post key={p.id} data={p} />
                ))}
              {!!data.posts.hasMore && (
                <Flex>
                  <Button
                    onClick={loadMoreHandler}
                    isLoading={loading}
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

export default withApollo({ ssr: true })(Index);
