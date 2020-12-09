import React, { FC } from 'react';
import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import Wrapper from 'components/Wrapper';
import InputField from 'components/InputField';
import { MeDocument, MeQuery, useRegisterMutation } from 'generated/graphql';
import { toErrorMap } from 'utils/errorMap';
import { withApollo } from 'utils/withApollo';

interface registerProps {}

const Register: FC<registerProps> = () => {
  const router = useRouter();
  const [register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (vals, { setErrors }) => {
          const res = await register({
            variables: { options: vals },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user,
                },
              });
            },
          });

          if (res.data?.register.errors) {
            setErrors(toErrorMap(res.data.register.errors));
          } else if (res.data?.register.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
            />
            <Box mt={4}>
              <InputField
                name="username"
                label="Username"
                placeholder="Username"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              variantColor="teal"
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Register);
