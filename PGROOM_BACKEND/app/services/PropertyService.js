const constant = require("../constant/Constant");
const {
  uploadFileToS3,
  getFileFromS3,
  deleteFileFromS3,
} = require("../utils/AwsHelper");
const { v4: uuidv4 } = require("uuid");
const propertyRepository = require("../repository/PropertyRepository");
const { PrismaClient } = require("@prisma/client");

class PropertyService {
  constructor() {
    this.prisma = new PrismaClient();
    this.propertyRepository = new propertyRepository();
  }

  /**
   * Function to add a property
   */
  async addProperty(req) {
    try {
      // Extract request body and uploaded files
      const data = req.body;
      const image = req.files;

      // Get authenticated user ID
      const userId = req.authUser.userId;

      // Parse state and city values as integers
      const state = parseInt(data.state, 10);
      const city = parseInt(data.city, 10);

      // Process and store the uploaded image, retrieving its filename
      const imageName = await this.createOrUpdateImage(image[0]);

      // Add or update the property record in the repository
      return await this.propertyRepository.addOrUpdateProperty(
        userId,
        state,
        city,
        data.propertyName,
        imageName,
        data.propertyContact,
        data.propertyAddress,
        constant.ACTIVE
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async createOrUpdateImage(newImage, id = null, oldImage = null) {
    try {
      // If `id` is present, it means we are updating the image
      if (id) {
        // Delete the existing file from S3 if updating
        await deleteFileFromS3(oldImage);
      }

      // Generate a unique file name for the new image
      const uniqueFileName = `${uuidv4()}-${newImage.originalname}`;
      // Upload the single image to S3
      const uploadedImage = await uploadFileToS3(
        newImage.buffer,
        uniqueFileName,
        newImage.mimetype,
        constant.PROPERTY_FOLDER
      );

      // Return the uploaded image details (e.g., URL or metadata)
      return uploadedImage;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Function to get a property
   */
  async getProperty(req) {
    try {
      // Parse the property ID from the request parameters
      const id = parseInt(req.params.id, 10);

      // Fetch the property along with state and city details
      const property = await this.prisma.UserProperties.findUnique({
        where: {
          id: id,
          status: constant.ACTIVE,
        },
        include: {
          state: {
            select: { stateName: true },
          },
          city: {
            select: { cityName: true },
          },
        },
      });

      // If no property is found, return a consistent response
      if (!property) {
        return constant.NOT_FOUND;
      }

      // Generate the signed URL for the property image
      const propertyImage = await getFileFromS3(
        property.propertyImage,
        constant.S3_EXPIRY
      );

      // Construct the final response object
      const responseData = {
        id: property.id,
        state: property.state.stateName,
        city: property.city.cityName,
        propertyName: property.propertyName,
        propertyImage: propertyImage,
        propertyAddress: property.propertyAddress,
        propertyContact: property.propertyContact,
        propertyStatus : property.status
      };

      return responseData;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Function to delete a property
   */
  async deleteProperty(req) {
    try {
      // Parse the property ID from the request parameters
      const id = parseInt(req.params.id, 10);
      // Fetch the property record from the database
      const property = await this.prisma.UserProperties.findUnique({
        where: {
          id: id
        },
      });

      // If no property is found, return a consistent response
      if (!property) {
        return constant.NOT_FOUND;
      }

      // Update the property status to 'DELETED'
      const updatedProperty = await this.prisma.UserProperties.update({
        where: {
          id: id,
        },
        data: {
          status: constant.DELETED,
        },
      });
      if (updatedProperty) {
        await deleteFileFromS3(property.propertyImage);
      }
      return updatedProperty;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * function to update a property
   */
  async updateProperty(req) {
    try {
      // Extract data from the request body
      const data = req.body;
      const image = req.files;
      const userId = req.authUser.userId;
      let imageName = null;
      const useExistingImage = data.useExistingImage === 'true';

      // Convert state, city, and id to integers for consistency
      const state = parseInt(data.state, 10);
      const city = parseInt(data.city, 10);
      const id = parseInt(data.id, 10);

      // Fetch the existing property details based on the provided ID and active status
      const propertyImage = await this.prisma.UserProperties.findUnique({
        where: {
          id: id,
          status: constant.ACTIVE,
        },
        select: {
          propertyImage: true,
        },
      });
      
      // Update or create a new property image
      if (!useExistingImage) {
        imageName = await this.createOrUpdateImage(
          image[0],
          id,
          propertyImage.propertyImage
        );
      } else {
        imageName = propertyImage.propertyImage;
      }

      // Add or update the property details in the repository
      return await this.propertyRepository.addOrUpdateProperty(
        userId,
        state,
        city,
        data.propertyName,
        imageName,
        data.propertyContact,
        data.propertyAddress,
        constant.ACTIVE,
        id
      );
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * Function to get all properties
   */
  async getAllProperties(req) {
    try {
      // Get authenticated user ID and role
      const userId = req?.authUser?.userId;
      const userRole = req?.authUser?.roleId;

      const page = parseInt(req?.body?.page, 10) || 1;
      const limit = parseInt(req?.body?.limit, 10) || 10;
      const cityId = parseInt(req?.body?.city, 10) || null;
      const stateId = parseInt(req?.body?.state, 10) || null;
      const searchInput = req?.body?.search || null;
      const propertyStatus = req?.body?.status;
  
      // Determine if we should filter by userId based on user role
      // For tenants (roleId = 3), show all available properties
      // For owners (roleId = 2), show only their own properties
      let filterUserId = null;
      if (userRole === constant.ADMIN_ROLE_ID) { // Owner role
        filterUserId = userId;
      }
      // For tenants, filterUserId remains null, so all properties are fetched

      // Fetch all properties from the repository with pagination
      const paginatedResult = await this.propertyRepository.getAllProperties(filterUserId, page, limit, cityId, stateId, searchInput, propertyStatus);
  
      // Extract the paginated properties data
      const properties = paginatedResult.data;
  
      // Extract all property images that need signed URLs
      const propertyImages = properties
        .filter((property) => property.propertyImage)
        .map((property) => property.propertyImage);
  
      // Batch generate signed URLs for all property images
      const signedUrls = await Promise.all(
        propertyImages.map((image) => getFileFromS3(image, constant.S3_EXPIRY))
      );
  
      // Create a map of propertyImage to signed URL for quick lookup
      const imageSignedUrlMap = new Map(
        propertyImages.map((image, index) => [image, signedUrls[index]])
      );
  
      // Transform the properties array into the desired response format
      const responseData = properties.map((property) => {
        return {
          id: property.id,
          state: property.state.stateName,
          city: property.city.cityName,
          propertyName: property.propertyName,
          propertyImage: property.propertyImage
            ? imageSignedUrlMap.get(property.propertyImage)
            : null,
          propertyStatus: property.status,
          propertyAddress: property.propertyAddress,
          propertyContact: property.propertyContact,
        };
      });
  
      // Return the transformed data along with pagination metadata
      return {
        data: responseData,
        meta: paginatedResult.meta,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to update property status
   */
  async updatePropertyStatus(req) {
    try {
      // Extract the property ID and status from the request body
      const { id, status } = req.body;

      // Update the property status in the repository
      return await this.propertyRepository.updatePropertyStatus(id, status);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get all properties for admin with enhanced data
   */
  async getAllPropertiesForAdmin(req) {
    try {
      const page = parseInt(req?.body?.page, 10) || 1;
      const limit = parseInt(req?.body?.limit, 10) || 12;
      const cityId = parseInt(req?.body?.city, 10) || null;
      const stateId = parseInt(req?.body?.state, 10) || null;
      const searchInput = req?.body?.search || null;
      const propertyStatus = req?.body?.status || null;

      // Fetch all properties with enhanced admin data
      const paginatedResult = await this.propertyRepository.getAllPropertiesForAdmin(
        page, limit, cityId, stateId, searchInput, propertyStatus
      );

      // Extract the paginated properties data
      const properties = paginatedResult.data;

      // Extract all property images that need signed URLs
      const propertyImages = properties
        .filter((property) => property.propertyImage)
        .map((property) => property.propertyImage);

      // Batch generate signed URLs for all property images
      const signedUrls = await Promise.all(
        propertyImages.map((image) => getFileFromS3(image, constant.S3_EXPIRY))
      );

      // Create a map of propertyImage to signed URL for quick lookup
      const imageSignedUrlMap = new Map(
        propertyImages.map((image, index) => [image, signedUrls[index]])
      );

      // Transform the properties array into the desired admin response format
      const responseData = properties.map((property) => {
        // Calculate monthly revenue based on rooms with active tenants
        const monthlyRevenue = property.rooms?.reduce((total, room) => {
          return total + (room._count?.Tenant > 0 ? (parseFloat(room.rent) || 0) : 0);
        }, 0) || 0;

        return {
          id: property.id,
          name: property.propertyName,
          address: property.propertyAddress,
          city: property.city.cityName,
          state: property.state.stateName,
          ownerName: `${property.user.firstName} ${property.user.lastName}`,
          ownerEmail: property.user.email,
          ownerContact: property.user.mobileNo,
          totalRooms: property._count?.rooms || 0,
          status: property.status,
          monthlyRevenue: monthlyRevenue,
          createdDate: property.createdAt,
          lastUpdated: property.updatedAt,
          propertyImage: property.propertyImage
            ? imageSignedUrlMap.get(property.propertyImage)
            : null,
          propertyContact: property.propertyContact,
        };
      });

      // Return the transformed data along with pagination metadata
      return {
        data: responseData,
        meta: paginatedResult.meta,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get property statistics for admin dashboard
   */
  async getPropertyStatistics(req) {
    try {
      const stats = await this.propertyRepository.getPropertyStatistics();
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PropertyService;
