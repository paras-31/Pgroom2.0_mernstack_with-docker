#!/usr/bin/env node

/**
 * Test script to verify the admin panel property occupancy and revenue calculations
 * This script checks if the fixes for property card calculations are working correctly
 */

const { PrismaClient } = require('@prisma/client');
const PropertyService = require('./app/services/PropertyService');

async function testPropertyCalculations() {
  const prisma = new PrismaClient();
  const propertyService = new PropertyService();

  try {
    console.log('🔍 Testing Property Occupancy & Revenue Calculations...\n');

    // Test 1: Check if getAllPropertiesForAdmin returns correct calculations
    console.log('Test 1: Admin Properties with Tenant-Based Calculations');
    const adminPropertiesResult = await propertyService.getAllPropertiesForAdmin({
      body: { page: 1, limit: 10 }
    });

    if (adminPropertiesResult.data && adminPropertiesResult.data.length > 0) {
      const property = adminPropertiesResult.data[0];
      console.log(`✅ Property: ${property.name}`);
      console.log(`   - Total Rooms: ${property.totalRooms}`);
      console.log(`   - Occupied Rooms: ${property.occupiedRooms}`);
      console.log(`   - Monthly Revenue: ₹${property.monthlyRevenue}`);
      
      if (property.occupiedRooms > 0 || property.monthlyRevenue > 0) {
        console.log('✅ SUCCESS: Property calculations showing non-zero values!\n');
      } else {
        console.log('ℹ️  INFO: No occupied rooms or revenue (could be valid if no tenants assigned)\n');
      }
    } else {
      console.log('ℹ️  INFO: No properties found for testing\n');
    }

    // Test 2: Check property statistics
    console.log('Test 2: Property Statistics');
    const stats = await propertyService.getPropertyStatistics({});
    console.log(`✅ Statistics:`);
    console.log(`   - Total Properties: ${stats.totalProperties}`);
    console.log(`   - Active Properties: ${stats.activeProperties}`);
    console.log(`   - Total Rooms: ${stats.totalRooms}`);
    console.log(`   - Occupied Rooms: ${stats.occupiedRooms}`);
    console.log(`   - Monthly Revenue: ₹${stats.monthlyRevenue}`);

    if (stats.occupiedRooms > 0 || stats.monthlyRevenue > 0) {
      console.log('✅ SUCCESS: Statistics showing non-zero values where applicable!\n');
    } else {
      console.log('ℹ️  INFO: No occupied rooms in statistics (could be valid if no tenants assigned)\n');
    }

    // Test 3: Verify room status updates
    console.log('Test 3: Checking Room Status Logic');
    const roomsWithTenants = await prisma.rooms.findMany({
      where: {
        status: { not: "Deleted" }
      },
      include: {
        _count: {
          select: {
            Tenant: {
              where: { status: "Active" }
            }
          }
        }
      },
      take: 5
    });

    console.log('Sample room statuses:');
    roomsWithTenants.forEach(room => {
      const hasActiveTenants = room._count.Tenant > 0;
      const expectedStatus = hasActiveTenants ? "Occupied" : "Available";
      const statusMatch = room.status === expectedStatus;
      
      console.log(`   Room ${room.roomNo}: ${room.status} (${room._count.Tenant} tenants) ${statusMatch ? '✅' : '⚠️'}`);
    });

    console.log('\n🎉 Test completed! Check the output above to verify the fixes are working.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testPropertyCalculations();
}

module.exports = { testPropertyCalculations };
