import { prisma } from "../server";
import { FreeTime, User } from "@prisma/client";

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
    const friends = await prisma.userToFriends.findMany({ where: { userId /*: userIdd */ } });
  }

  async getFreeTime(userId: string) {
    const userToFreeTime = await prisma.userToFreeTime.findMany({ where: { userId } });

    const freeTimes = await Promise.all(
      userToFreeTime.map(async (e) => {
        return await prisma.freeTime.findFirst({ where: { id: e.freeTimeId } });
      })
    );

    return freeTimes;
  }

  async setFreeTime(userId: string, timeStart: Date, timeEnd: Date) {
    const overlappingSlot = await prisma.freeTime.findFirst({
      where: {
        OR: [
          {
            timeStart: {
              lte: timeEnd,
            },
            timeEnd: {
              gte: timeStart,
            },
          },
        ],
      },
    });

    if (overlappingSlot) return;

    const freeTimeId = (await prisma.freeTime.create({ data: { timeStart, timeEnd } })).id;
    const userToFreeTime = await prisma.userToFreeTime.create({ data: { freeTimeId, userId } });
    return userToFreeTime;
  }

  async deleteFreeTime(userId: string, timeStart: Date, timeEnd: Date) {
    const freeTimeId = (await prisma.freeTime.findFirst({ where: { timeStart, AND: { timeEnd } } }))!.id;
    const userId_freeTimeId = { userId, freeTimeId };
    await prisma.userToFreeTime.delete({ where: { userId_freeTimeId } });
    await prisma.freeTime.delete({ where: { id: freeTimeId } });
  }
}
