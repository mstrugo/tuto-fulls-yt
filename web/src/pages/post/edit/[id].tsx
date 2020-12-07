import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Spinner, Button } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import Layout from 'components/Layout';
import { useUpdatePostMutation } from 'generated/graphql';
import { createUrqlClient } from 'utils/createUrqlClient';
import InputField from 'components/InputField';
import { __INTERNAL_URL__, __OUT_OF_RANGE__ } from '../../../constants';
import { useGetPostFromUrl } from 'utils/useGetPostFromUrl';

const EditPost = () => {
  const router = useRouter();
  const [{ data, fetching }] = useGetPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout variant="small">
        <Spinner />
      </Layout>
    );
  }

  if (!data?.post) {
    return <Layout variant="small">Wrong PostID</Layout>;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async vals => {
          await updatePost({ id: data.post!.id, ...vals });

          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              label="Post title"
              placeholder="Post title"
            />
            <Box mt={4}>
              <InputField
                name="text"
                label="Post"
                placeholder="Post"
                textarea
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              variantColor="blue"
              isLoading={isSubmitting}
            >
              Update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
