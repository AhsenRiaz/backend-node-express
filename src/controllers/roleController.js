const APIError = require("../utils/apiError");
import Role from "../models/roleModel";
import httpStatus from "http-status";

export const createRole = async (req, res) => {
  const role = await Role.createRole(req.body);
  return res.status(200).json({
    success: true,
    data: role,
  });
};

export const getRole = async (req, res) => {
  const role = await Role.getRoleById(req.params.roleId);
  if (!role) {
    throw new APIError("Role not found", httpStatus.NOT_FOUND);
  }
  return res.json({
    success: true,
    data: role,
  });
};

export const getRoles = async (req, res) => {
  const { q, limit, page, sortBy, sortDirection } = req.query;

  const queryFilters = q && {
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  };

  const options = { limit, page, sortBy, sortDirection };

  try {
    const roles = await Role.paginate(queryFilters, "permissions", options);

    return res.json({
      success: true,
      data: roles.results,
      pagination: { total: roles.totalResults },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const updateRole = async (req, res) => {
  const role = await Role.updateRoleById(req.params.roleId, req.body);
  return res.json({
    success: true,
    data: role,
  });
};

export const deleteRole = async (req, res) => {
  if (await User.isRoleIdAlreadyExists(req.params.roleId)) {
    throw new APIError(
      "A role cannot be deleted if associated with users",
      httpStatus.BAD_REQUEST
    );
  }
  await Role.deleteRoleById(req.params.roleId);
  return res.json({
    success: true,
    data: {},
  });
};
