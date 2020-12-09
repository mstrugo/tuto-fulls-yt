import React, { FC } from 'react';
import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';
import InputField from 'components/InputField';
import { useCreatePostMutation } from 'generated/graphql';
import { useIsAuth } from 'utils/useIsAuth';
import { withApollo } from 'utils/withApollo';

interface createPostProps {}

const CreatePost: FC<createPostProps> = () => {
  useIsAuth();
  const router = useRouter();
  const [createPost] = useCreatePostMutation();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async vals => {
          const res = await createPost({
            variables: { input: vals },
            update: cache => cache.evict({ fieldName: 'posts:{}' }),
          });
          if (!res.errors) {
            router.push('/');
          }
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
              Add Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
