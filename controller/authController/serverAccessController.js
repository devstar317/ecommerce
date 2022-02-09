import Admin from "../../models/AdminModel";
import User from "../../models/UserModel";
import RefreshToken from "../../models/RefreshTokenModel";
import { refreshTokenSubmiter } from "../../middleware/auth/refreshTokenSubmit";
import errorController from "../errorController";
import { tokenDecoder, tokenGanarator } from "../../middleware/auth/JWTUtils";
import { refreshToken, accessToken } from "../../shared/json";

/* 
check if user is authenticated
 if it waas unthenticated then next()
 if not it return a 401 respond with message "user not authorized"
*/
export async function serverAccessController(req, res) {
  //get tokens from cookies
  //headers have coockie if fetch is from server side
  var accToken = req.headers[accessToken.type];
  var refToken = req.headers[refreshToken.type];

  // req.cookies have cookies if fetch is from client side
  if (refToken === "undefined" || refToken === undefined) {
    refToken = req.cookies[refreshToken.type];
    accToken = req.cookies[accessToken.type];
  }
console.log("*********************")
console.log("refreshToken: ", refToken);
console.log("accessToken: ", accToken);
  //it's an unathorized request if refresh token is not provided
  if (refToken === "undefined" || refToken === undefined) {
    return unathorized(res);
  }

  try {
    const { isAdmin } = req.query;
    if (isAdmin === undefined) throw new Error("isAdmin is undefined");
    // if access token still exist
    if (accToken !== "undefined" && accToken !== undefined) {
      //first verify access token. if it was verified next()
      const validId = tokenDecoder(accToken, accessToken.type);
      var validPerson = isAdmin
        ? await Admin.findById(validId)
        : await User.findById(validId);
      if (validPerson && validPerson.suspend === true) unathorized(res);
      else if (validPerson && validPerson !== null) {
        // user athourized
        console.log("user athourized in access part");
        res.setHeader("authorized", "true");
        return res.status(200).json({ message: "user authorized" });
      } else {
        //  if access token not verified then verify refresh token
        // if refresh token was valid but not existed in DB,
        //then account will be suspended to avoid token highjacking
        const validRef = await refreshTokenVerifier(refToken, isAdmin, res);
        if (validRef.id) {
          //refresh token was valid
          return authenticated(req, res, validRef.id);
        } else {
          return unathorized(res);
        }
      }
    }
    // if only refresh token is  provided
    else if (accToken === "undefined" || accToken === undefined) {
      // if refresh token was valid but not existed in DB,
      //then account will be suspended to avoid token highjacking
      const validRef = await refreshTokenVerifier(refToken, isAdmin, res);
      if (validRef.id) {
        //refresh token was valid
        return authenticated(req, res, validRef.id);
      } else {
        return unathorized(res);
      }
    }
  } catch (err) {
    errorController(500, err, res);
  }
}

/* ****************
 * if refresh token existed in DB then it is valid and continue further proccess
 * but if no such token existed in DB but the token itself is a valid token then
 * someone has highjacked the token and the account should be suspended for safty
 ****************** */
async function refreshTokenVerifier(token, isAdmin, res) {
  const id = tokenDecoder(token, refreshToken.type);
  var validRefToken = await RefreshToken.findOneAndDelete({ token });

  // if refresh token not found in DB proccess if the account needs to get suspended
  if (!validRefToken) {
    const suspendedAccount = isAdmin
      ? await Admin.findByIdAndUpdate(id, { suspend: true })
      : await User.findByIdAndUpdate(id, { suspend: true });
    if (!suspendedAccount) {
      // no such account with this id found
      return { message: "account not found" };
    } else {
      return {
        message: `account suspended`,
      };
    }
  }
  return { message: `refresh token is valid`, id };
}

const authenticated = async (req, res, ownerID) => {
  const newAccess = tokenGanarator(ownerID, accessToken.type, accessToken.age);
  const newRefresh = tokenGanarator(
    ownerID,
    refreshToken.type,
    refreshToken.age
  );

  const data = await refreshTokenSubmiter(newRefresh, ownerID);
  if (!data.message) {
    return unathorized(res);
  } else {
    console.log("user athourized in refresh part");
    res.setHeader("authorized", "true");
    res.setHeader(refreshToken.type, newRefresh);
    res.setHeader(accessToken.type, newAccess);
    return res.status(200).json({ message: "user authorized" });
  }
};

const unathorized = (res) => {
  console.log("unathorized");
  res.setHeader("authorized", "false");
  res.setHeader(refreshToken.type, "");
  res.setHeader(accessToken.type, "");
  return res.status(401).json({ message: "user not authorized" });
};
