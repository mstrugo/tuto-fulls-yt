import React from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from 'utils/createUrqlClient';
import Layout from 'components/Layout';
import { usePostsQuery } from 'generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <Layout>
      {!!data ? (
        data.posts.map(p => <div key={p.id}>{p.title}</div>)
      ) : (
        <div>Loading...</div>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
