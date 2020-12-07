export const postsSQLQuery = (limit: number, cursor: any) =>
  `
    select p.*
    from post p
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
