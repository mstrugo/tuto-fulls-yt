import React, { FC, useState } from 'react';
import { Form, Formik } from 'formik';
import { Button, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import Wrapper from 'components/Wrapper';
import InputField from 'components/InputField';
import { useForgotPasswordMutation } from 'generated/graphql';
import { createUrqlClient } from 'utils/createUrqlClient';

interface forgotPasswordProps {}

const ForgotPassword: FC<forgotPasswordProps> = () => {
  const [requestComplete, setRequestComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async vals => {
          await forgotPassword(vals);

          setRequestComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          requestComplete ? (
            <Text>
              If an account with that email exists, an email will be sent
            </Text>
          ) : (
            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              />
              <Button
                mt={4}
                type="submit"
                variantColor="red"
                isLoading={isSubmitting}
              >
                Forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
