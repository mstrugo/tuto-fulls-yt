import React, { FC } from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/core";
import { useRouter } from 'next/router';
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "utils/createUrqlClient";
import Wrapper from "components/Wrapper";
import InputField from "components/InputField";
import { useLoginMutation } from "generated/graphql";
import { toErrorMap } from "utils/errorMap";

interface loginProps {}

const Login: FC<loginProps> = () => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (vals, { setErrors }) => {
          const res = await login({ options: vals });

          if (res.data?.login.errors) {
            setErrors(toErrorMap(res.data.login.errors));
          } else if (res.data?.login.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" label="Username" placeholder="Username" />
            <Box mt={4}>
              <InputField name="password" label="Password" placeholder="Password" type="password" />
            </Box>
            <Button mt={4} type="submit" variantColor="blue" isLoading={isSubmitting}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
};

export default withUrqlClient(createUrqlClient)(Login);
