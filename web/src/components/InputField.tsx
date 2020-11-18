import React, { FC, InputHTMLAttributes } from 'react';
import { useField } from 'formik';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/core';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  placeholder: string;
  textarea?: boolean;
};

const InputField: FC<InputFieldProps> = ({
  label,
  placeholder,
  textarea,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);
  const Component = textarea ? Textarea : Input;

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Component
        {...props}
        {...field}
        id={field.name}
        placeholder={placeholder}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
