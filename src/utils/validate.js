const validator = require("validator");

function validate(data) {
  const { firstName, lastName, emailId, password } = data;
  if (!firstName || !lastName) {
    throw new Error("Name cannot be Empty");
  } else if (firstName.length < 4 && firstName.length > 20) {
    throw new Error("Invalid name length");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("password is weak");
  }
}

function validateUserEdit(data) {
  const allowedEditField = [
    "firstName",
    "lastName",
    "gender",
    "age",
    "skills",
    "about",
    "photoUrl",
  ];
  const isValid = Object.keys(data).every((field) =>
    allowedEditField.includes(field)
);
  return isValid;
}

module.exports = {
  validate,
  validateUserEdit,
};
