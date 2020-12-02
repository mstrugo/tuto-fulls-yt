export const postsSQLQuery = (cursor: boolean) =>
  `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $2` : ''}
    order by p."createdAt" DESC
    limit $1
  `;
  // `
  //   select p.* from post p
  //   ${cursor ? `where p."createdAt" < $2` : ''}
  //   order by p."createdAt" DESC
  //   limit $1
  // `;
