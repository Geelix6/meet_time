import { Router } from "express";
import UserService from "./user.service";

const userRouter = Router();

const userService = new UserService();

userRouter.post("/", async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

userRouter.get("/", async (req, res) => {
  const users = await userService.getUsers();
  res.status(200).json(users);
});

userRouter.delete("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  await userService.deleteUser(userId);
  res.status(200).json({ message: "user was deleted" });
});

export default userRouter;
