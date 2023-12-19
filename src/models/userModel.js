import mongoose from "mongoose";
import APIError from "../utils/apiError.js";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import Role from '../models/roleModel.js'

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },

    lastName: {
      type: String,
      require: true,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      private: true,
    },

    avatar: {
      type: String,
      default: "avatar.png",
    },

    confirmed: {
      type: Boolean,
      default: false,
    },

    roles: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "roles",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

userSchema.virtual("avatarUrl").get(() => {
  return; // incomplete logic
});

class UserClass {
  static async isUserNameAlreadyExists(userName, excludeUserId) {
    return !!(await this.findOne({ userName, _id: { $ne: excludeUserId } }));
  }

  static async isEmailAlreadyExists(email, excludeUserId) {
    return !!(await this.findOne({ email, _id: { $ne: excludeUserId } }));
  }

  // static async isRoleIdAlreadyExists(roleId, excludeUserId) {
  // 	return !!(await this.findOne({ roles: roleId, _id: { $ne: excludeUserId } }));
  // }

  static async getUserById(id) {
    return await this.findById(id);
  }

  // static async getUserByIdWithRoles(id) {
  // 	return await this.findById(id).populate({ path: 'roles', select: 'name description createdAt updatedAt' });
  // }

  static async getUserByUserName(userName) {
    return await this.findOne({ userName});
  }

  static async getUserByEmail(email) {
    return await this.findOne({ email });
  }

  static async createUser(body) {
    if (await this.isUserNameAlreadyExists(body.userName)) {
      throw new APIError("Username already exists", httpStatus.BAD_REQUEST);
    }

    if (await this.isEmailAlreadyExists(body.email)) {
      throw new APIError("Email already exists", httpStatus.BAD_REQUEST);
    }

    if (body.roles) {
      await Promise.all(
        body.roles.map(async (rid) => {
          if (!(await Role.findById(rid))) {
            throw new APIError("Role not exist", httpStatus.BAD_REQUEST);
          }
        })
      );
    }

    return await this.create(body);
  }

  static async updateUserById(userId, body) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new APIError("User not found", httpStatus.NOT_FOUND);
    }
    if (await this.isUserNameAlreadyExists(body.userName, userId)) {
      throw new APIError("User name already exists", httpStatus.BAD_REQUEST);
    }
    if (await this.isEmailAlreadyExists(body.email, userId)) {
      throw new APIError("Email already exists", httpStatus.BAD_REQUEST);
    }
    if (body.roles) {
      await Promise.all(
        body.roles.map(async (rid) => {
          if (!(await Role.findById(rid))) {
            throw new APIError("Roles not exist", httpStatus.BAD_REQUEST);
          }
        })
      );
    }
    Object.assign(user, body);
    return await user.save();
  }

  async isPasswordMatch(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

userSchema.loadClass(UserClass);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const passwordGenSalt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, passwordGenSalt);
  }
  next();
});

const User = mongoose.model("users", userSchema);

export default User
