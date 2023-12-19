import passport from "passport";
import httpStatus from "http-status";
import APIError from "../utils/apiError.js";
import Role from "../models/roleModel.js";

async function verifyUserRoles(user, requiredRights) {
  const userRights = [];

  const roles = await Role.find({ _id: { $in: user.roles } }).populate(
    "permissions"
  );

  for (const role of roles) {
    for (const permission of role.permissions) {
      userRights.push(`${permission.controller}:${permission.action}`);
    }
  }

  return requiredRights.every((requiredRight) =>
    userRights.includes(requiredRight)
  );
}

function authenticate(...requiredRights) {
  return async (req, res, next) => {
    try {
      await passport.authenticate(
        "jwt",
        { session: false },
        async (err, user, info) => {
          if (err || info || !user) {
            return next(
              new APIError(
                httpStatus[httpStatus.UNAUTHORIZED],
                httpStatus.UNAUTHORIZED
              )
            );
          }

          req.user = user;

          if (requiredRights.length) {
            const hasRequiredRights = await verifyUserRoles(
              user,
              requiredRights
            );

            if (!hasRequiredRights) {
              return next(
                new APIError("Resource access denied", httpStatus.FORBIDDEN)
              );
            }
          }

          return next();
        }
      )(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

export default authenticate;
