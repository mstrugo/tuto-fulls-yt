import { UsernamePasswordInput } from '../types/UsernamePasswordInput';

export const validateEmptyPassword = (field: string, value: string) => {
  if (!value) {
    return [
      {
        field,
        message: "Password can't be blank",
      },
    ];
  }

  return null;
};

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

  const invalidPass = validateEmptyPassword('password', options.password);
  if (!!invalidPass) {
    return invalidPass;
  }

  return null;
};
