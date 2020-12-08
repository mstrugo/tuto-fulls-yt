import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import argon2 from 'argon2';
import { getConnection } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import { User } from '../entities';
import { MyContext, UsernamePasswordInput } from '../types';
import {
  __COOKIE_NAME__,
  __FRONTEND_RECOVERY_PSW__,
  __FORGET_PREFIX__,
} from '../constants';
import { validateEmptyPassword, validateRegister } from '../utils/validations';
import { sendEmail } from '../utils/sendEmail';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // Prevent showing private data
    return '';
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId); // .findOne({ where: { id: req.session.userId }})
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (!!errors) {
      return { errors };
    }

    const hashPass = await argon2.hash(options.password);
    let user;

    try {
      // Using create()
      // const result = await User.create({
      //   email: options.email.toLowerCase(),
      //     username: options.username.toLowerCase(),
      //     password: hashPass,
      // }).save();

      // Using createQueryBuilder()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: options.email.toLowerCase(),
          username: options.username.toLowerCase(),
          password: hashPass,
        })
        .returning('*')
        .execute();

      user = result.raw[0];
    } catch (error) {
      console.log({ error });
      if (
        error.code === '23505' ||
        error.details.includes('already exists') ||
        error.details.includes('ya existe')
      ) {
        // Duplicated user
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already taken.',
            },
          ],
        };
      }
    }

    // Store session and keep logged in
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const input = usernameOrEmail.includes('@') ? 'email' : 'username';
    const user = await User.findOne({
      where: {
        [input]: usernameOrEmail.toLowerCase(),
      },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "That user doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Incorrect password',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext,
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Avoid return the error to the user
      return true;
    }

    const token = uuid4();
    await redis.set(
      __FORGET_PREFIX__ + token,
      user.id,
      'ex',
      1000 * 3600 * 72,
    ); // 3 days

    await sendEmail(
      email,
      `<p>Change your password <a href="${__FRONTEND_RECOVERY_PSW__}/${token}">clicking here</a>`,
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('token') token: string,
    @Ctx() { redis, req }: MyContext,
  ): Promise<UserResponse> {
    const invalidPassword = validateEmptyPassword('newPassword', newPassword);
    if (!!invalidPassword) {
      return {
        errors: {
          ...invalidPassword,
        },
      };
    }

    const redisKey = __FORGET_PREFIX__ + token;
    const userId = await redis.get(redisKey);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Invalid or expired token.',
          },
        ],
      };
    }

    const uID = parseInt(userId);
    const user = await User.findOne(uID);
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User not available',
          },
        ],
      };
    }

    const hashPass = await argon2.hash(newPassword);

    await User.update({ id: uID }, { password: hashPass });
    await redis.del(redisKey);

    // Login user automatically after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(__COOKIE_NAME__);

        if (err) {
          console.log({ err });
          resolve(false);
          return;
        }

        resolve(true);
      }),
    );
  }
}
