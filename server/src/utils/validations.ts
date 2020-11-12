import { UsernamePasswordInput } from '../types/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email || !options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'Invalid Email',
      },
    ];
  }

  if (!options.username || options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'Invalid username',
      },
    ];
  }

  if (!options.password) {
    return [
      {
        field: 'password',
        message: "Password can't be blank",
      },
    ];
  }

  return null;
};
