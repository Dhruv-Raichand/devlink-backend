import validator from 'validator';

export function validate(data: any) {
  const { firstName, lastName, emailId, password } = data;
  if (!firstName || !lastName) {
    throw new Error('Name cannot be Empty');
  } else if (firstName.length < 4 && firstName.length > 20) {
    throw new Error('Invalid name length');
  } else if (!validator.isEmail(emailId)) {
    throw new Error('Invalid Email');
  } else if (!validator.isStrongPassword(password)) {
    throw new Error('password is weak');
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
  ];

  const isValidField = Object.keys(data).every((field) =>
    allowedEditField.includes(field)
  );
  if (!isValidField) return false;

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 13 || data.age > 100) {
      throw new Error('Invalid age');
    }
  }

  if (data.gender !== undefined) {
    const allowedGenders = ['male', 'female', 'others'];
    if (!allowedGenders.includes(data.gender)) {
      throw new Error('Invalid gender');
    }
  }

  return true;
}
