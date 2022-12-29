import express from "express";
import {
  blockUser,
  CreateUser,
  deleteUser,
  getUser,
  getUsers,
  loginUser,
  logout,
  refreshToken,
  unblockUser,
  updateUser,
} from "../controllers/userController.js";
import { AuthMiddleware, forgotPassword, isAdmin, updatePassword } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/register", CreateUser);
router.post("/login", loginUser);
router.get("/refresh", refreshToken);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.patch("/updatePassword", AuthMiddleware, updatePassword);
router.get("/users", AuthMiddleware, isAdmin, getUsers);
router.get("/users/:id", getUser);
router.delete("/users/delete/:id",AuthMiddleware, isAdmin, deleteUser);
router.patch("/users/update/:id", AuthMiddleware, updateUser);
router.patch("/users/update/block/:id", AuthMiddleware, isAdmin, blockUser);
router.patch("/users/update/unblock/:id", AuthMiddleware, isAdmin, unblockUser);

export default router;
