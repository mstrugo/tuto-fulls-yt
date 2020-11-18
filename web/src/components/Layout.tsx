import React, { FC } from 'react';
import Wrapper, { WrapperVariant } from './Wrapper';
import { NavBar } from './NavBar';

interface layoutProps {
  variant?: WrapperVariant;
}

const Layout: FC<layoutProps> = ({ children, variant }) => (
  <>
    <NavBar />
    <Wrapper variant={variant}>{children}</Wrapper>
  </>
);

export default Layout;
