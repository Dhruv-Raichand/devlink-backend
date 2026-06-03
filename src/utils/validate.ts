import validator from 'validator';
import { ApiError } from './apiError.js';

export function validate(data: any) {
  const { firstName, lastName, emailId, password } = data;
  if (!firstName || !lastName) {
    throw new ApiError(400, 'Name cannot be Empty');
  } else if (firstName.length < 4 || firstName.length > 20) {
    throw new ApiError(400, 'Invalid name length');
  } else if (!validator.isEmail(emailId)) {
    throw new ApiError(400, 'Invalid Email');
  } else if (!validator.isStrongPassword(password)) {
    throw new ApiError(400, 'password is weak');
  }
}

export function validateUserEdit(data: Record<string, any>) {
  const allowedEditField = [
    'firstName',
    'lastName',
    'gender',
    'age',
    'skills',
    'about',
    'photoUrl',
    'githubUsername',
  ];

  const isValidField = Object.keys(data).every((field) =>
    allowedEditField.includes(field)
  );
  if (!isValidField) {
    throw new ApiError(400, 'Invalid update fields');
  }

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 18 || data.age > 100) {
      throw new ApiError(400, 'Invalid age');
    }
  }

  if (data.gender !== undefined) {
    const allowedGenders = ['male', 'female', 'others'];
    if (!allowedGenders.includes(data.gender)) {
      throw new ApiError(400, 'Invalid gender');
    }
  }

  return true;
}
