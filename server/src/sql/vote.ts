export const voteSQLQuery = (userId: any, postId: number, value: number) => (`
    START TRANSACTION;

    insert into updoot ("userId", "postId", value)
    values (${userId}, ${postId}, ${value});

    update post
    set points = points + ${value}
    where p.id = ${postId};

    COMMIT;
  `);
