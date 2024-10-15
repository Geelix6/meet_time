import { prisma } from "../server";
import { PrismaClient, User } from "@prisma/client";

type ICreateUser = {
  firstName: string;
  lastName: string;
  age: number;
};

export default class UserService {
  createUser(user: ICreateUser): Promise<User> {
    return prisma.user.create({
      data: {
        firstName: user.firstName, // Убедись, что это имя соответствует модели Prisma
        lastName: user.lastName,
        age: user.age,
      },
    });
  }

  async getUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async deleteUser(userID: number): Promise<User | null> {
    return prisma.user.delete({
      where: { ID: userID },
    });
  }
}
