const constant = require("../constant/Constant");
const {
  uploadFileToS3,
  getFileFromS3,
  deleteFolderFromS3,
} = require("../utils/AwsHelper");
const { v4: uuidv4 } = require("uuid");
const roomRepository = require("../repository/RoomRepository");

class RoomService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Function to add room
   */
  async addRoom(data, images) {
    try {
      const propertyId = parseInt(data.propertyId, 10);
      const roomNo = parseInt(data.roomNo, 10);
      const totalBed = parseInt(data.totalBeds, 10);
      const uploadedImages = await this.createOrUpdateImages(
        images,
        propertyId,
        data.roomNo
      );
      const Room = await this.repository.addOrUpdateRoom(
        propertyId,
        roomNo,
        JSON.stringify(uploadedImages),
        totalBed,
        data.status,
        data.description,
        data.rent
      );
      return Room;
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdateImages(images, subFolder, roomNo, id = null) {
    try {
      const roomFolder = `${constant.ROOM_FOLDER}/${subFolder}/${roomNo}`;
      if (id) {
        // If an ID is provided, delete the existing folder from S3
        const deletionResult = await deleteFolderFromS3(
          roomFolder
        );
        if (!deletionResult) {
          throw new Error(`Failed to delete folder: ${roomFolder}`);
        }
      }
      const uploadPromises = images.map(async (image) => {
        const uniqueFileName = `${uuidv4()}-${image.originalname}`;
        return uploadFileToS3(
          image.buffer,
          uniqueFileName,
          image.mimetype,
          roomFolder
        );
      });

      // Wait for all uploads to complete
      return Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Function to update room
   */
  async updateRoom(data, images) {
    try {
      const propertyId = parseInt(data.propertyId, 10);
      const roomNo = parseInt(data.roomNo, 10);
      const totalBed = parseInt(data.totalBeds, 10);
      const id = parseInt(data.id, 10);
      const uploadedImages = await this.createOrUpdateImages(
        images,
        propertyId,
        data.roomNo,
        id
      );
      const Room = await this.repository.addOrUpdateRoom(
        propertyId,
        roomNo,
        JSON.stringify(uploadedImages),
        totalBed,
        data.status,
        data.description,
        data.rent,
        id
      );
      return Room;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get all rooms
   */
  async getAllRooms(data) {
    try {
      // Parse input parameters
      const propertyId = parseInt(data.propertyId, 10);
      const page = parseInt(data.page, 10) || 1;
      const limit = parseInt(data.limit, 10) || 10;
      const status = data?.status ?? constant.ROOM_AVAILABLE;

      // Fetch paginated rooms from the repository
      const paginatedResult = await this.repository.getAllRooms(
        propertyId,
        page,
        limit,
        status
      );

      // Process each room to replace roomImage with signed URLs
      const processedData = await Promise.all(
        paginatedResult.data.map(async (room) => {
          // Parse the roomImage JSON string into an array
          const imagePaths = JSON.parse(room.roomImage);

          // Generate signed URLs for each image path
          const signedUrls = await Promise.all(
            imagePaths.map(async (filePath) => {
              return await getFileFromS3(filePath, constant.S3_EXPIRY);
            })
          );

          // Replace roomImage with the array of signed URLs
          return {
            ...room,
            roomImage: signedUrls,
          };
        })
      );

      // Return the updated paginated result
      return {
        ...paginatedResult,
        data: processedData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get room
   */
  async getRoom(id) {
    try {
      // Parse the room ID
      const roomId = parseInt(id, 10);
      const room = await this.repository.getRoom(roomId);
      const imagePaths = JSON.parse(room.roomImage);
      const signedUrls = await Promise.all(
        imagePaths.map(async (filePath) => {
          return await getFileFromS3(filePath, constant.S3_EXPIRY);
        })
      );
      room.roomImage = signedUrls;
      return room;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Function to delete room
   */
  async deleteRoom(id) {
    try {
      // Parse the room ID
      const roomId = parseInt(id, 10);
      const room = await this.repository.getRoom(roomId);
      const deletionResult = await deleteFolderFromS3(
        `${constant.ROOM_FOLDER}/${room.propertyId}/${room.roomNo}`
      );
      if (!deletionResult) {
        throw new Error(`Failed to delete folder: ${room.propertyId}`);
      }
      return await this.repository.updateRoomStatus(roomId, constant.DELETED);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoomService(roomRepository);
