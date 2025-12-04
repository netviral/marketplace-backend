import express from "express";
import UserService from "../../services/UserService.js";
import { ApiResponse } from "../../models/apiResponse.js";
import User from "../../models/User.model.js";

const router = express.Router({ mergeParams: true });

// CREATE
router.post("/", async (req, res) => {
  try {
    var { name, email, roles } = req.body;
    // console.log(req.body);
    roles = JSON.parse(roles);
    // console.log(name, email, roles);

    const user = await UserService.registerUser(name, email, roles);
    res.api(ApiResponse.success(201, "User created", user));
  } catch (err: any) {
    res.api(ApiResponse.error(400, "Failed to create user", err.message));
  }
});

// READ /me
router.get("/me", async (req, res) => {
  try {
    const user = req.user as User;
    if (!user.email) throw new Error("Unauthorized");
    console.log(user);
    // const user = await UserService.getOrCreateByEmail(email);
    res.api(ApiResponse.success(200, "User fetched", "user"));
  } catch (err: any) {
    res.api(ApiResponse.error(401, "Unauthorized", err.message));
  }
});

// READ by ID
router.get("/:id", async (req, res) => {
  try {
    // const user = await UserService.getUserById(req.params.id);
    if (true) return res.api(ApiResponse.error(404, "User not found"));

    res.api(ApiResponse.success(200, "User fetched", "user"));
  } catch (err: any) {
    res.api(ApiResponse.error(400, "Failed to fetch user", err.message));
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { name, roles } = req.body;
    // const user = await UserService.updateUser(req.params.id, { name, roles });
    res.api(ApiResponse.success(200, "User updated", "user"));
  } catch (err: any) {
    res.api(ApiResponse.error(400, "Failed to update user", err.message));
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    // await UserService.deleteUser(req.params.id);
    res.api(ApiResponse.success(204, "User deleted", null));
  } catch (err: any) {
    res.api(ApiResponse.error(400, "Failed to delete user", err.message));
  }
});

export default router;
