export const __PROD__ = process.env.NODE_ENV === 'production';

export const __BACKEND_APP__ = 'http://localhost:4000';
export const __GRAPHQL_URL__ = `${__BACKEND_APP__}/graphql`;

export const __INTERNAL_URL__ = {
  login: '/login',
  register: '/register',
};
