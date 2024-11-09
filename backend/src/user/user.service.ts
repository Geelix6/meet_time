import { prisma } from "../server";
import { User } from "@prisma/client";

export default class UserService {
  createUser(user: User) {
    return prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        salt: user.salt,
      },
    });
  }

  async getAllUsers() {
    const users = await prisma.user.findMany();
    return users;
  }

  async findUserById(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    return user;
  }

  async findUserByNickOrEmail(nickOrEmail: string) {
    const user = await prisma.user.findFirst({ where: { OR: [{ username: nickOrEmail }, { email: nickOrEmail }] } });
    return user;
  }

  async createFriendship(firstFriendId: string, secondFriendId: string) {
    const friendRow = await prisma.friends.create({ data: { firstFriendId, secondFriendId } });
    await prisma.userToFriends.create({
      data: { userId: firstFriendId, pairId: friendRow.id, initiator: firstFriendId },
    });
    await prisma.userToFriends.create({
      data: { userId: secondFriendId, pairId: friendRow.id, initiator: firstFriendId },
    });
  }

  async getUserFriends(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    const userIdd = user?.id;
    const friends = await prisma.userToFriends.findMany({ where: { userId: userIdd } });
  }

  // async deleteUser(userId: string) {
  //   return prisma.user.delete({
  //     where: { id: userId },
  //   });
  // }
}
