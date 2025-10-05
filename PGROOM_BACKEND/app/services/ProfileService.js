const { PrismaClient } = require("@prisma/client");
const helper = require("../utils/Helper");
const http = require("../constant/StatusCodes");
const constMessage = require("../constant/Message");
const bcrypt = require("bcrypt");
const constant = require("../constant/Constant");
const sendEmail = require('../utils/Mailer');
const message = require("../constant/Message");

class ProfileService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Function to get all states
   */
  async login(req, res) {
    const { email, password } = req.body;
    try {
      let token = null;
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          userRoleLink: {
            include: {
              userRole: true,
            },
          },
        },
      });
      
      if (!user) {
        throw {
          message: constMessage.NOT_FOUND.replace(":name", "User"),
          statusCode: http.NOT_FOUND
        };
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      const roleId = user.userRoleLink[0].roleId;
      
      if (!isPasswordValid) {
        throw {
          message: constMessage.WRONG_PASSWORD,
          statusCode: http.UNAUTHORIZED
        };
      }

      if (user && isPasswordValid) {
        token = helper.generateToken(user.id, roleId);
      }
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNo: user.mobileNo,
        state: user.stateId,
        city: user.cityId,
        address: user.address,
        token: token,
        roleId : roleId
      };
    } catch (error) {
      throw new Error(error);
    }
  }
  
  /**
   * Function to get user profile details
   */
  async getUserProfile(req) {
    try {
      const userId = req.authUser.userId;
      
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          NOT: { status: "Deleted" }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobileNo: true,
          address: true,
          status: true,
          createdAt: true,
          stateId: true,
          cityId: true,
          state: {
            select: {
              id: true,
              stateName: true
            }
          },
          city: {
            select: {
              id: true,
              cityName: true
            }
          }
        }
      });

      if (!user) {
        throw {
          message: constMessage.NOT_FOUND.replace(":name", "User"),
          statusCode: http.NOT_FOUND
        };
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        mobileNo: user.mobileNo,
        address: user.address,
        status: user.status,
        state: user.state,
        city: user.city,
        memberSince: user.createdAt
      };
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * Function to update user profile
   */
  async updateUserProfile(req) {
    try {
      const userId = req.authUser.userId;
      const { firstName, lastName, email, mobileNo, address, stateId, cityId } = req.body;

      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw {
          message: constMessage.NOT_FOUND.replace(":name", "User"),
          statusCode: http.NOT_FOUND
        };
      }

      // If email is being updated, check if it's already taken by another user
      if (email && email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          throw {
            message: "Email address is already taken",
            statusCode: http.BAD_REQUEST
          };
        }
      }

      // Update user profile
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          ...(email && { email }),
          mobileNo,
          address,
          ...(stateId && { stateId: parseInt(stateId) }),
          ...(cityId && { cityId: parseInt(cityId) })
        },
        include: {
          state: {
            select: {
              id: true,
              stateName: true
            }
          },
          city: {
            select: {
              id: true,
              cityName: true
            }
          }
        }
      });

      return {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        mobileNo: updatedUser.mobileNo,
        address: updatedUser.address,
        status: updatedUser.status,
        state: updatedUser.state,
        city: updatedUser.city
      };
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * function to create account
   */
  async createAccount(req, res) {
    try {
      const roleId = req.body.isAdmin
      ? constant.ADMIN_ROLE_ID
        : constant.TENANT_ROLE_ID;
      const status = req.body?.status ?? constant.ACTIVE;
      // Create the user
      const user = await this.prisma.user.create({
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          mobileNo: req.body.mobileNo,
          state: {
            connect: { id: req.body.state },
          },
          city: {
            connect: { id: req.body.city },
          },
          password: await bcrypt.hash(req.body.password, 10),
          status: status,
          address: req.body.address,
        },
      });

      // Create the user role link
      const userRoleLink = await this.prisma.userRoleLink.create({
        data: {
          userId: user.id,
          roleId: roleId,
        },
      });
      if (user && userRoleLink) {
        const templateData = {
          firstName: user.firstName,
          lastName: user.lastName,
          password: req.body.password,
        };
  
        sendEmail(
          res,
          user.email,
          message.ACCOUNT_CREATED,
          'accountCreated',
          templateData
        );
      }
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Function to change user password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.authUser.userId;

      // Get user with current password
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw {
          message: constMessage.NOT_FOUND.replace(":name", "User"),
          statusCode: http.NOT_FOUND
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw {
          message: "Current password is incorrect",
          statusCode: http.BAD_REQUEST
        };
      }

      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      return {
        message: "Password changed successfully",
        statusCode: http.OK
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProfileService;
