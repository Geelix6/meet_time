import { NextFunction, Request, Response, Router } from "express";
import UserService from "./user.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { console } from "inspector";

const userRouter = Router();
const userService = new UserService();

const secretjwtKey = process.env.SECRET_JWT_KEY;

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

userRouter.get("/get/freetime", authMiddleware, async (req, res) => {
  const freetime = await userService.getFreeTime(req.body.$user.id);
  res.status(200).json(freetime);
});

userRouter.post("/get/freetime", authMiddleware, async (req, res) => {
  const userId = req.body.id;
  const freetime = await userService.getFreeTime(userId);
  res.status(200).json(freetime);
});

userRouter.post("/check/freetime", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const freetimeId = req.body.id;
  const freetimeStatus = req.body.title;

  const check = await userService.checkFreeTime(userId, freetimeId, freetimeStatus);

  if (!check) {
    res.status(228).json();
  } else {
    res.status(200).json();
  }
});

userRouter.post("/set/freetime", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const timeStart = req.body.timeStart;
  const timeEnd = req.body.timeEnd;

  const userToFreeTime = await userService.setFreeTime(userId, timeStart, timeEnd);
  if (!userToFreeTime) {
    res.status(228).json("1");
  } else {
    res.status(200).json(userToFreeTime);
  }
});

userRouter.post("/delete/freetime", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const timeStart = req.body.timeStart;
  const timeEnd = req.body.timeEnd;

  const userToFreeTime = await userService.deleteFreeTime(userId, timeStart, timeEnd);
  res.status(200).json();
});

userRouter.get("/get/friends", authMiddleware, async (req, res) => {
  const friends = await userService.getUserFriends(req.body.$user.id);
  res.status(200).json(friends);
});

userRouter.post("/set/friendship", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const nickOrEmail = req.body.nickOrEmail;

  const checkForMyself = (await userService.findUserByNickOrEmail(nickOrEmail))?.id;
  if (userId == checkForMyself) {
    res.status(262).json("1");
    return;
  }

  const friendRow = await userService.createFriendship(userId, nickOrEmail);

  if (!friendRow) {
    res.status(228).json("1");
  } else {
    res.status(200).json(friendRow);
  }
});

userRouter.post("/accept/friend", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const friendId = req.body.friendId;
  const pairId = req.body.pairId;

  await userService.acceptFriend(pairId, friendId, userId);
  res.status(200).json("1");
});

userRouter.post("/delete/friend", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const friendId = req.body.friendId;
  const pairId = req.body.pairId;

  await userService.deleteFriend(pairId, friendId, userId);
  res.status(200).json("1");
});

userRouter.post("/set/meeting", authMiddleware, async (req, res) => {
  const userId = req.body.$user.id;
  const name = (await userService.findUserById(userId))?.username;
  const id = req.body.freetimeId;

  await userService.setMeeting(id, name!);
  res.status(200).json("1");
});

userRouter.post("/delete/meeting", authMiddleware, async (req, res) => {
  const id = req.body.freetimeId;

  await userService.deleteMeeting(id);
  res.status(200).json("1");
});

export default userRouter;
