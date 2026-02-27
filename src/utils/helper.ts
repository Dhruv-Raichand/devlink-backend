const sanitizeUser = (user: any) => {
  const userObj = user.toObject ? user.toObject() : user;

  delete userObj.password;
  delete userObj.__v;

  return userObj;
};
export default sanitizeUser;
