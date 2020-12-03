// export const voteSQLQuery = (userId: any, postId: number, value: number) => (`
//     START TRANSACTION;

//     insert into updoot ("userId", "postId", value)
//     values (${userId}, ${postId}, ${value});

//     update post
//     set points = points + ${value}
//     where id = ${postId};

//     COMMIT;
//   `);

export const voteSQLQuery = (userId: any, postId: number, value: number) => `
  insert into updoot ("userId", "postId", value)
  values (${userId}, ${postId}, ${value});
`;

export const updateVoteSQLQuery = (
  userId: any,
  postId: number,
  value: number,
) => `
  update updoot
  set value = ${value}
  where "postId" = ${postId} and "userId" = ${userId}
`;
