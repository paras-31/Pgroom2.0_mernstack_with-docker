const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const constMessage = require("../constant/Message");

const MobileExists = {
  validate: async (value, helpers) => {
    const existingUser = await prisma.user.findFirst({
      where: {
        mobileNo: value
      }
    });

    if (existingUser) {
      return helpers.message(constMessage.ALREADY_EXIST.replace(":name", "Mobile No"),);
    }

    return value;
  }
};

module.exports = MobileExists;