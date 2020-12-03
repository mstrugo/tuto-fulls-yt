export const __PROD__ = process.env.NODE_ENV === 'production';

export const __BACKEND_APP__ = 'http://localhost:4000';
export const __GRAPHQL_URL__ = `${__BACKEND_APP__}/graphql`;

export const __INTERNAL_URL__ = {
  home: '/',
  login: '/login',
  register: '/register',
  createPost: '/create-post',
  postDetail: '/detail',
  postDetailSlug: '/detail/[slug]',
};

export const __OUT_OF_RANGE__ = -1;
