import mongoose from "mongoose";
import APIError from "../utils/apiError.js";
import httpStatus from "http-status";
import Permission from "./permissionModel.js";

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },

    permissions: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "permissions",
      },
    ],
  },
  {
    timestamps: true,
  }
);

roleSchema.set("toJSON");

class RoleClass {
  static async isNameAlreadyExists(name, excludeUserId) {
    return !!(await this.findOne({ name, _id: { $ne: excludeUserId } }));
  }

  static async getRoleByName(name) {
    return await this.findOne({ name });
  }

  static async getRoleById(id) {
    return await this.findById(id);
  }

  static async createRole(body) {
    if (await this.isNameAlreadyExists(body.name)) {
      throw new APIError("Name already exists", httpStatus.BAD_REQUEST);
    }

    if (body.permissions) {
      await Promise.all(
        body.permissions.map(async (pid) => {
          if (!(await Permission.findById(pid))) {
            throw new APIError("Permissions not exist", httpStatus.BAD_REQUEST);
          }
        })
      );
    }
    return await this.create(body);
  }

  static async updateRoleById(roleId, body) {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new APIError("Role not found", httpStatus.NOT_FOUND);
    }
    if (await this.isNameAlreadyExists(body.name, roleId)) {
      throw new APIError("Name already exists", httpStatus.BAD_REQUEST);
    }
    if (body.permissions) {
      await Promise.all(
        body.permissions.map(async (pid) => {
          if (!(await Permission.findById(pid))) {
            throw new APIError("Permissions not exist", httpStatus.BAD_REQUEST);
          }
        })
      );
    }
    Object.assign(role, body);
    return await role.save();
  }

  static async deleteRoleById(roleId) {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new APIError("Role not found", httpStatus.NOT_FOUND);
    }
    return await role.delete();
  }
}

roleSchema.loadClass(RoleClass);

const Role = mongoose.model("roles", roleSchema);

export default Role;
