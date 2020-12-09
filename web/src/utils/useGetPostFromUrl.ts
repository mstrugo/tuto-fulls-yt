import { usePostQuery } from 'generated/graphql';
import { useRouter } from 'next/dist/client/router';
import { __OUT_OF_RANGE__ } from '../constants';

export const useGetPostFromUrl = () => {
  const router = useRouter();
  const { id } = router.query;

  const postId =
    !!id && typeof id === 'string' ? parseInt(id) : __OUT_OF_RANGE__;
  const shouldStop = postId === __OUT_OF_RANGE__;

  return usePostQuery({
    skip: shouldStop,
    variables: { id: postId },
  });
};
