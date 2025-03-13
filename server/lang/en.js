const languageKeys = {
  "ServerError": "Internal server error occurred.",
  "Welcome": "Welcome to the official API of ClickClack!",
  "SignupUserAlreadyExists": "User already exists.",
  "SignupSuccess": "Successfully signed up user.",
  "BadRequest": "Bad request.",
  "InternalServerError": "Internal server error has occurred.",
  "LoginUserNotFound": "User account doesn't exist.",
  "LoginSuccess": "Successfully logged in user.",
  "LoginPasswordNotMatched": "Failed to log in user, incorrect password.",
  "LoginUserNotLoggedIn": "User is not logged in.",
  "LoginUserLoggedIn": "User is logged in.",
  "LoginNoUserToken": "No user token given.",
  "UserUnauthorized": "User is unauthorized.",
}

export default function lang(key, ...args) {
  if (!(key in languageKeys)) {
    return "";
  }

  let message = languageKeys[key];

  args.forEach(arg => {
    message = message.replace("%%", arg);
  });

  return message;
}