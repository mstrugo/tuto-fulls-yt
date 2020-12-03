export const postsSQLQuery = (cursor: boolean, loggedIn: boolean) =>
  `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator,
    ${
      loggedIn
        ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
        : 'null as "voteStatus"'
    }
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $3` : ''}
    order by p."createdAt" DESC
    limit $1
  `;

export const updatePostPointsSQLQuery = (postId: number, value: number) =>
  `
    update post
    set points = points + ${value}
    where id = ${postId};
  `;
