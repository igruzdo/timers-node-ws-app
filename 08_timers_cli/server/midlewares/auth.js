const auth = (findUserBySession) => async (req, res, next) => {
  console.log(req)
  const token = req.header('sessionId')
  if (!token) {
    return next();
  }

  const user = await findUserBySession(token);
  req.user = user;
  req.sessionId = token;
  next();
};

module.exports = auth;
