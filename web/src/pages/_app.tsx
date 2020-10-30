import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import { createClient, Provider } from 'urql';
import { __GRAPHQL_URL__ } from '../constants';
import theme from '../theme'

const client = createClient({
  url: __GRAPHQL_URL__,
  fetchOptions: {
    credentials: 'include',
  }
});

const MyApp = ({ Component, pageProps }) => (
  <Provider value={client}>
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  </Provider>
);

export default MyApp;
