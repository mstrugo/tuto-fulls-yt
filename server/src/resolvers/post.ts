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
import { Post, Updoot } from '../entities';
import { postsSQLQuery, voteSQLQuery } from '../sql';
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

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const moreThanLimit = realLimit + 1;

    const replacements: any[] = [moreThanLimit];

    if (!!cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      postsSQLQuery(!!cursor),
      replacements,
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
  post(@Arg('id') id: number): Promise<Post | undefined> {
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
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } }); // or -> findOne(id);

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
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

    await getConnection().query(voteSQLQuery(userId, postId, realValue));

    return true;
  }
}
