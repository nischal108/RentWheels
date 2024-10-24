const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Service to add a new vehicle
exports.addVehicle = async (vehicleData, imagePath, ownerId) => {
    const { name, type, seater, transmission, pricePerDay, driverAvailable, available } = vehicleData;
    return await prisma.vehicle.create({
        data: {
          name,
          type,
          seater: parseInt(seater),
          transmission,
          available,
          pricePerDay: parseFloat(pricePerDay),
          driverAvailable: driverAvailable === 'true',
          image: imagePath, 
          owner: { connect: { id: ownerId } } 
        }
    });
};

exports.getVehicle = async (vehicleId) => {
    return await prisma.vehicle.findUnique({
        where: {
            id: vehicleId
        },
        include: {
            owner: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true  // Add only the necessary fields
                    // Ensure you do NOT select the password or other sensitive fields
                }
            },
            reviews:{
                select:{
                    id:true,
                    rating:true,
                    comment:true,
                    createdAt:true,
                    user:{
                        select:{
                            fullName:true
                        }
                    }
                }
            },
            availabilitySlots: true,
            bookings: {
                select: {
                    id: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                }
            }
        }
    });
}


exports.searchVehicles = async (query) => {
    return await prisma.vehicle.findMany({
        where: {
            
            availability: {
                some: {
                    day: query.day,
                    timeFrom: { lte: query.timeFrom },
                    timeTo: { gte: query.timeTo }
                }
            }
        },
        include: {
            owner: true,
            availability: true
        }
    });
};

// Service to update vehicle details
exports.updateVehicle = async (vehicleId, vehicleData) => {
    return await prisma.vehicle.update({
        where: {
            id: vehicleId
        },
        data: {
            make: vehicleData.make,
            model: vehicleData.model,
            seats: vehicleData.seats,
            transmission: vehicleData.transmission,
            vehicleType: vehicleData.vehicleType,
            availability: {
                deleteMany: {}, 
                create: vehicleData.availability 
            }
        }
    });
};

// Service to delete a vehicle
exports.deleteVehicle = async (vehicleId) => {
    return await prisma.vehicle.delete({
        where: {
            id: vehicleId
        }
    });
};


exports.updateVehicleAvailability = async (vehicleId) => {
    return await prisma.vehicle.update({
        where: {
            id: vehicleId
        },
        data: {
            availability: {
                updateMany: {
                    where: {
                        day: new Date().getDay()
                    },
                    data: {
                        available: false
                    }
                }
            }
        }
    });
};

//get all bookings of a vehicle 
exports.getVehicleWithBookings = async (vehicleId) => {
    return await prisma.vehicle.findUnique({
        where: {
            id: vehicleId
        },
        include: {
            bookings: true 
        }
    });
};

exports.getAvailableVehicles = async () => {
    try {
      // Fetch vehicles that are available (assuming 'available' is a boolean field)
      const availableVehicles = await prisma.vehicle.findMany({
        where: {
          available: true,  
        },
      });
      console.log(availableVehicles);
      
      
      return availableVehicles;
    } catch (error) {
      throw new Error('Error fetching available vehicles');
    }
  };
  