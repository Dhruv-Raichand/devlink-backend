export const sanitizeUser = (user: any) => {
  const userObj = user.toObject ? user.toObject() : user;

  delete userObj.password;
  delete userObj.__v;
  delete userObj.refreshToken;

  return userObj;
};

export const toSelectString = (fields: string[]) => fields.join(' ');
