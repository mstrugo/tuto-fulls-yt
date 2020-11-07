import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from "../entities/User";
import { MyContext } from "../types";
import { __COOKIE_NAME__ } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

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
  async me(
    @Ctx() { req, em }: MyContext
  ) {
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
    if (!options.username) {
      return {
        errors: [{
          field: 'username',
          message: "Username can't be blank",
        }],
      }
    }

    if (!options.password) {
      return {
        errors: [{
          field: 'password',
          message: "Password can't be blank",
        }],
      }
    }

    const hashPass = await argon2.hash(options.password)
    let user;

    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username.toLowerCase(),
          password: hashPass,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      user = result[0];
    } catch (error) {
      console.log({error});
      if (error.code === '23505' || error.details.includes('already exists')) {
        // Duplicated user
        return {
          errors: [{
            field: 'username',
            message: 'Username already taken.'
          }]
        }
      }
    }

    // Store session and keep logged in
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username.toLowerCase()
    });

    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: "That username doesn't exist",
        }],
      }
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: "Incorrect password",
        }],
      }
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie(__COOKIE_NAME__);

      if (err) {
        console.log({err});
        resolve(false);
        return;
      }

      resolve(true);
    }));
  }
}
