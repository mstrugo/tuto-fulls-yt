export const postsSQLQuery = (limit: number, cursor: any, userId: number) =>
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
      !!userId
        ? `(select value from updoot where "userId" = ${userId} and "postId" = p.id) "voteStatus"`
        : 'null as "voteStatus"'
    }
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${!!cursor ? `where p."createdAt" < '${cursor}'` : ''}
    order by p."createdAt" DESC
    limit ${limit}
  `;

export const updatePostPointsSQLQuery = (postId: number, value: number) =>
  `
    update post
    set points = points + ${value}
    where id = ${postId};
  `;
