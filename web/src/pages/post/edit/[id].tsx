import React from 'react';
import { Box, Text, Heading, Spinner } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import Layout from 'components/Layout';
import { usePostQuery } from 'generated/graphql';
import { createUrqlClient } from 'utils/createUrqlClient';

import { parseDate } from 'utils/parseDate';

const EditPost = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout variant="small">
      edit
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPost);
