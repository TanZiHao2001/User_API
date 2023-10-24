const bcrypt = require("bcryptjs");
const cookie = require("cookie");
const createError = require("http-errors");
const { errorHandler } = require("../../../error_helper");
const user = require("../../../models/user")
const {signToken, getVendorIdFromToken} = require("../../../jwt_helper");

const login = async (ctx) => {
  try {
    const { email, password } = ctx.request.body;
    if (!email || !password || !validateEmail(email)) {
      throw createError.BadRequest();
    }

    const entry = await user.findBy("email", email)

    if (!entry || entry.password === null) {
      return ctx.response.body = { error: "Invalid email / password" };
    }

    const isPasswordValid = await bcrypt.compare(password, entry.password);

    if (!isPasswordValid) {
      return ctx.response.body = {error: "Invalid email / password"};
    }

    // sign the tokens
    const accessToken = await signToken("accessToken", entry.id);
    const refreshToken = await signToken("refreshToken", entry.id);

    // set tokens in the cookie
    setToken(ctx, "accessToken", accessToken);
    setToken(ctx, "refreshToken", refreshToken);

    // update refresh token upon login
    await user.updateRefreshToken(refreshToken, entry.id);

    return ctx.response.body = { message: "successfully logged in" };
  } catch (error) {
    await errorHandler(ctx, error);
  }
};

const logout = async (ctx) => {
  try {
    const parsedCookies = cookie.parse(ctx.request.header.cookie || "");
    const refreshToken = parsedCookies?.refreshToken;
    const accessToken = parsedCookies?.accessToken;

    if (!refreshToken && !accessToken) {
      return ctx.response.body = {message: "logout successful"};
    }

    const userId = await getVendorIdFromToken("refreshToken", refreshToken);
    if (!userId) {
      throw createError.Unauthorized();
    }

    await user.updateRefreshToken("", userId)

    ctx.cookies.set("accessToken", null, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });

    ctx.cookies.set("refreshToken", null, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });

    return ctx.response.body = {message: "logout successful"};
  } catch (error) {
    await errorHandler(ctx, error)
  }
};

const checkTokenIsValid = async (ctx) => {
  try {
    const parsedCookies = cookie.parse(ctx.request.header.cookie || "");
    const accessToken = parsedCookies?.accessToken;

    if (!accessToken) {
      throw new Error();
    } else {
      const userId = await getVendorIdFromToken("accessToken", accessToken);
      userId ? ctx.response.body = {message: "valid"} : ctx.response.body = {message: "invalid"};
    }
  } catch (error) {
    if (error.message) {
      ctx.response.status = error.status || 500;
      ctx.response.body = {error: error.message};
    } else {
      ctx.response.body = {message: "invalid"};
    }
  }
};

module.exports = {
  login,
  logout,
  checkTokenIsValid,
};

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function setToken(ctx, key, value) {
  ctx.cookies.set(key, value, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge:
      key === "refreshToken" ? 60 * 60 * 24 * 1000 * 365 : 60 * 60 * 24 * 1000,
    path: "/",
  });
}

// const register = async (ctx) => {
//   try {
//     const {email, password, organisation} = ctx.request.body;

//     if (!validateEmail(email)) {
//       throw new Error("Please enter a valid email!");
//     }

//     //find if email existed
//     const result = await user.findBy("email", email);
//     if (result) {
//       return ctx.response.body = {error: "Email already existed!"};
//     }

//     //create an entry for new user
//     const entry = await user.createNewUser(email, organisation);

//     //sign and set verify token
//     const verifyToken = await signToken("verifyToken", entry.id);
//     setToken(ctx, "verifyToken", verifyToken);

//     return ctx.response.body = {message: "User created"};
//   } catch (error) {
//     await errorHandler(ctx, error)
//   }
// };