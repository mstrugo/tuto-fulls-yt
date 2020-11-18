import React, { FC } from 'react';
import { Box } from '@chakra-ui/core';

export type WrapperVariant = 'small' | 'regular';

interface wrapperProps {
  variant?: WrapperVariant;
}

const Wrapper: FC<wrapperProps> = ({ children, variant = 'regular' }) => (
  <Box mt={8} mx="auto" maxW={variant === 'regular' ? 800 : 400} w="100%">
    {children}
  </Box>
);

export default Wrapper;
