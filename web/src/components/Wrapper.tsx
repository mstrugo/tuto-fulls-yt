import React, { FC } from "react";
import { Box } from "@chakra-ui/core";

interface wrapperProps {
  variant?: 'small' | 'regular';
}

const Wrapper: FC<wrapperProps> = ({ children, variant="regular" }) => (
  <Box mt={8} mx="auto" maxW={variant === 'regular' ? 800 : 400} w="100%">
    {children}
  </Box>
);


export default Wrapper;
