import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Spinner, Button } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';
import { useUpdatePostMutation } from 'generated/graphql';
import InputField from 'components/InputField';
import { __INTERNAL_URL__, __OUT_OF_RANGE__ } from '../../../constants';
import { useGetPostFromUrl } from 'utils/useGetPostFromUrl';
import { withApollo } from 'utils/withApollo';

const EditPost = () => {
  const router = useRouter();
  const { data, loading } = useGetPostFromUrl();
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
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
          await updatePost({ variables: { id: data.post!.id, ...vals } });

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

export default withApollo({ ssr: false })(EditPost);
