const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const constMessage = require("../constant/Message");

const EmailExists = {
  validate: async (value, helpers) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: value
      }
    });

    if (existingUser) {
        return helpers.message(constMessage.ALREADY_EXIST.replace(":name", "Email"),);
    }

    return value;
  }
};

module.exports = EmailExists;