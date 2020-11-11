import React from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from 'utils/createUrqlClient';
import { NavBar } from '../components/NavBar';
import { usePostsQuery } from 'generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <div>
      <NavBar />
      {!!data ? (
        data.posts.map(p => <div key={p.id}>{p.title}</div>)
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
