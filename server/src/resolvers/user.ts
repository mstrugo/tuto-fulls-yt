import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { v4 as uuid4 } from 'uuid';
import { User } from '../entities/User';
import { MyContext } from '../types/context';
import { __COOKIE_NAME__, ___FORGET_PREFIX__ } from '../constants';
import { validateRegister } from '../utils/validations';
import { sendEmail } from '../utils/sendEmail';
import { UsernamePasswordInput } from '../types/UsernamePasswordInput';

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

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (!!errors) {
      return { errors };
    }

    const hashPass = await argon2.hash(options.password);
    let user;

    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          email: options.email.toLowerCase(),
          username: options.username.toLowerCase(),
          password: hashPass,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      user = result[0];
    } catch (error) {
      console.log({ error });
      if (error.code === '23505' || error.details.includes('already exists')) {
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
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const input = usernameOrEmail.includes('@') ? 'email' : 'username';
    const user = await em.findOne(User, {
      [input]: usernameOrEmail.toLowerCase(),
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
    @Ctx() { em, redis }: MyContext,
  ) {
    const user = await em.findOne(User, { email });

    if (!user) {
      // Avoid return the error to the user
      return true;
    }

    const token = uuid4();
    await redis.set(
      ___FORGET_PREFIX__ + token,
      user.id,
      'ex',
      1000 * 3600 * 72,
    ); // 3 days

    await sendEmail(
      email,
      `<p>Change your password <a href="http://localhost:3000/change-passord/${token}">clicking here</a>`,
    );

    return true;
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
