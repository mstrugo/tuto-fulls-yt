import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import { Button, Flex, Link, Text } from '@chakra-ui/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Wrapper from 'components/Wrapper';
import InputField from 'components/InputField';
import { MeDocument, MeQuery, useChangePasswordMutation } from 'generated/graphql';
import { toErrorMap } from 'utils/errorMap';
import { withApollo } from 'utils/withApollo';

const ChangePassword: NextPage = () => {
  const [tokenError, setTokenError] = useState('');
  const router = useRouter();
  const token = (router.query.token as string) ?? '';
  const [changePassword] = useChangePasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (val, { setErrors }) => {
          const res = await changePassword({
            variables: {
              token,
              newPassword: val.newPassword,
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              });
            }
          });

          if (res.data?.changePassword.errors) {
            const err = toErrorMap(res.data.changePassword.errors);
            if ('token' in err) {
              setTokenError(err.token);
            }
            setErrors(err);
          } else if (res.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              label="New Password"
              placeholder="Password"
              type="password"
            />
            {!!tokenError && (
              <Flex>
                <Text mr={2}>{tokenError}</Text>
                <NextLink href="/forgot-password">
                  <Link>Get a new one</Link>
                </NextLink>
              </Flex>
            )}
            <Button
              mt={4}
              type="submit"
              variantColor="teal"
              isLoading={isSubmitting}
            >
              Change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
