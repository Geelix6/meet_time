import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient, User } from "@prisma/client";
import userRouter from "./user/user.controller";
import path from "path";

dotenv.config();
export const prisma = new PrismaClient();

const app = express();

async function main() {
  // Middleware для парсинга JSON
  app.use(express.json());

  // обрабатываем с помощью контроллера
  app.use("/api/users", userRouter);

  // Указываем Express использовать папку dist для отдачи Vue-приложения
  // только если оно собрано build
  // иначе можно разделить фронт (он на 8080) и бэк (он на 5000)
  // а на фронте делать проксирование на 5000 чтобы не было проблем с CORS
  app.use(express.static(path.join(__dirname, "../dist")));
  //
  // Для всех остальных запросов отдавать index.html из dist
  // vue-router может их еще там обрабатывать, да
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
  });

  const PORT = process.env.PORT || 80;
  app.listen(PORT, () => {
    console.log("сервер запущен");
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
