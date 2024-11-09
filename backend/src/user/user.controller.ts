import { NextFunction, Request, Response, Router } from "express";
import UserService from "./user.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRouter = Router();
const userService = new UserService();

const secretjwtKey = process.env.secret_jwt_key;

userRouter.post("/create/user", async (req, res) => {
  try {
    const password = req.body.password;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await userService.createUser({ ...req.body, salt, password: hash });
    const userId = user.id;

    const token = jwt.sign({ userId: userId, password: hash }, secretjwtKey!, {
      expiresIn: "604800000", // Время жизни токена 7 дней
    });

    res.status(201).json(token);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

userRouter.post("/login", async (req, res) => {
  const nickOrEmail = req.body.nickOrEmail;
  const password = req.body.password;

  const user = await userService.findUserByNickOrEmail(nickOrEmail);
  if (!user) {
    res.status(400).json({ message: "not found" });
  } else if (user.password != bcrypt.hashSync(password, user.salt)) {
    res.status(400).json({ message: "incorrect password" });
  } else {
    const token = jwt.sign({ userId: user.id, password: user.password }, secretjwtKey!, {
      expiresIn: "604800000", // Время жизни токена 7 дней
    });

    res.status(201).json(token);
  }
});

// по сути будет использоваться во всех остальных путях, кроме логина и реги, которые и создают токен
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer и сам токен

  try {
    const decoded = jwt.verify(token!, secretjwtKey!) as jwt.JwtPayload;
    req.body.$user = await userService.findUserById(decoded.userId);
    next();
  } catch (_err) {
    const err = _err as Error;
    if (err.name == "JsonWebTokenError") {
      res.status(400).json({ message: "invalid token" });
    } else if (err.name == "TokenExpiredError") {
      res.status(403).json({ message: "jwt expired" });
    }
  }
};

userRouter.get("/get/user", authMiddleware, async (req, res) => {
  res.status(200).json(req.body.$user);
});

userRouter.get("/get/users", authMiddleware, async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

userRouter.get("/get/friends", authMiddleware, async (req, res) => {
  // const friends = await userService.getUserFriends(req.body.userId);
  res.status(200).json({ friends: [1, 2, 3, 4] });
});

userRouter.post("/create/friendship", async (req, res) => {
  const { firstFriendId, secondFriendId } = req.body;
  const user = await userService.createFriendship(firstFriendId, secondFriendId);
  res.status(201).json(user);
});

userRouter.post("/test", async (req, res) => {
  console.log(req.body.id);
});

export default userRouter;
