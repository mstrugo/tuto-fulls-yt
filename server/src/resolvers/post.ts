import { getConnection } from 'typeorm';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types/context';
import { Post, Updoot, User } from '../entities';
import {
  postsSQLQuery,
  updatePostPointsSQLQuery,
  updateVoteSQLQuery,
  voteSQLQuery,
} from '../sql';
import { __POST_LENGTH__ } from '../constants';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    if (root.text.length > __POST_LENGTH__) {
      return root.text.slice(0, __POST_LENGTH__ - 3).concat('...');
    }

    return root.text;
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext,
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return !!updoot ? updoot.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const moreThanLimit = realLimit + 1;

    let cursorVal = null;
    if (!!cursor) {
      cursorVal = new Date(parseInt(cursor)).toLocaleString();
    }

    const posts = await getConnection().query(
      postsSQLQuery(moreThanLimit, cursorVal),
    );

    // const query = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'creator', 'creator.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(moreThanLimit);

    // if (!!cursor) {
    //   query.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await query.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === moreThanLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    // return Post.findOne(id, { relations: ['creator'] });
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', { nullable: true }) title: string,
    @Arg('text', { nullable: true }) text: string,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext,
  ): Promise<boolean> {
    // Not cascade way
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }

    // if (post.creatorId !== req.session.userId) {
    //   throw new Error('Not authorized');
    // }

    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });

    // Cascade version
    await Post.delete({ id, creatorId: req.session.userId });

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // The user has voted before
    // and is changing their vote
    if (!!updoot && updoot.value !== realValue) {
      await getConnection().transaction(async trans => {
        await trans.query(updateVoteSQLQuery(userId, postId, realValue));
        // Double points to go from 1 to -1 instead of 0
        await trans.query(updatePostPointsSQLQuery(postId, realValue * 2));
      });
    } else if (!updoot) {
      // Never voted
      // await getConnection().query(voteSQLQuery(userId, postId, realValue));
      await getConnection().transaction(async trans => {
        await trans.query(voteSQLQuery(userId, postId, realValue));
        await trans.query(updatePostPointsSQLQuery(postId, realValue));
      });
    }

    return true;
  }
}
