const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const mongoose = require('mongoose');
const WaytrixUser = require('../models/Auth'); 
const WaytrixVideo = require('../models/Video'); 
const WaytrixPartners = require('../models/Partners'); 
const WaytrixCars = require('../models/AddCarsValet')
const ContactUs = require('../models/ContactUs')
const WaytrixSurvey = require('../models/Survey')


const delete_resto = async (req, res) => {
  const { restoId } = req.body;

    try {
        // Update records where _id (ObjectId) matches restoId (String)
        await WaytrixUser.updateMany({ _id: restoId }, { $set: { deleted: true } });

        // Update records where restoId (String) matches restoId (String)
        await WaytrixUser.updateMany({ restoId: restoId }, { $set: { deleted: true } });

        res.status(200).send({ message: 'Records updated successfully.' });
    } catch (error) {
      console.log(error)
        res.status(500).send({ message: 'Error updating records.', error });
    }

   
}

const update_waiter_tableId_array = async (req, res) => {
  try {
    const { _id, tableId } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!Array.isArray(tableId) || !tableId.every(id => typeof id === 'string')) {
      return res.status(400).json({ message: 'tableId must be an array of strings' });
    }

    // Update the tableId array
    const updatedUser = await WaytrixUser.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id) },
      { $set: { tableId: tableId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User tableId updated successfully', updatedUser });
  } catch (error) {
    console.error(error); // Log the error to the console
    return res.status(500).json({ message: 'Server error', error: error.message || error });
  }
}



const getNumberOfWaitersByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required' });
    }

    // Count the number of waiters for the given restoId
    const waiterCount = await WaytrixUser.countDocuments({ role: 'waiter', restoId });

    res.json({ count: waiterCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const getNumberOfTablesByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required' });
    }

    // Count the number of waiters for the given restoId
    const waiterCount = await WaytrixUser.countDocuments({ role: 'table', restoId });

    res.json({ count: waiterCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getTablesByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required' });
    }

    // Find all users where role is 'table' and restoId matches
    const tables = await WaytrixUser.find({ role: 'table', restoId });

    if (tables.length === 0) {
      return res.status(404).json({ message: 'No tables found for the provided restoId' });
    }

    // Send the results as JSON
    res.json(tables);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: 'Server error', error });
  }
};
// Delete table by tableId
const deleteTable = async (req, res) => {
  const { tableId } = req.body;

  try {
    // Ensure tableId is provided
    if (!tableId) {
      return res.status(400).json({ message: 'tableId is required' });
    }

    // Find and delete the table with the provided tableId
    const result = await WaytrixUser.findOneAndDelete({ _id: tableId, role: 'table' });

    if (!result) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ message: 'Error deleting table', error });
  }
};
// Update table by ID
const updateTable = async (req, res) => {
  const { tableId, name, email, phone } = req.body;

  try {
    if (!tableId) {
      return res.status(400).json({ message: 'tableId is required' });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    const updatedTable = await WaytrixUser.findOneAndUpdate(
      { _id: tableId, role: 'table' },
      { $set: { name, email, phone } },
      { new: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json({ message: 'Table updated successfully', updatedTable });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ message: 'Error updating table', error });
  }
};

const getValetAccounts = async (req, res) => {
  const { restoId } = req.query; // Assuming restoId is passed as a query parameter

  try {
    // Filter valet accounts by restoId, role, and deleted status
    const valetAccounts = await WaytrixUser.find({
      restoId: restoId, // Match the provided restoId
      role: 'valet', // Ensure role is valet
      deleted: { $ne: true } // Exclude deleted accounts
    });

    if (!valetAccounts.length) {
      return res.status(404).json({ message: 'No valet accounts found for this restaurant' });
    }

    res.status(200).json(valetAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving valet accounts', error });
  }
};


// Delete a valet by their ID
const deleteValet = async (req, res) => {
  const { valetId } = req.body;

  try {
    if (!valetId) {
      return res.status(400).json({ message: 'valetId is required' });
    }

    // Find and delete the valet with the provided valetId
    const result = await WaytrixUser.findOneAndUpdate(
      { _id: valetId, role: 'valet' },
      { $set: { deleted: true } }, // Soft delete, mark as deleted
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Valet not found' });
    }

    res.status(200).json({ message: 'Valet deleted successfully', result });
  } catch (error) {
    console.error('Error deleting valet:', error);
    res.status(500).json({ message: 'Error deleting valet', error });
  }
};

// Update valet details by ID
const updateValet = async (req, res) => {
  const { valetId, name, email, phone } = req.body;

  try {
    if (!valetId) {
      return res.status(400).json({ message: 'valetId is required' });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    const updatedValet = await WaytrixUser.findOneAndUpdate(
      { _id: valetId, role: 'valet' },
      { $set: { name, email, phone } },
      { new: true }
    );

    if (!updatedValet) {
      return res.status(404).json({ message: 'Valet not found' });
    }

    res.status(200).json({ message: 'Valet updated successfully', updatedValet });
  } catch (error) {
    console.error('Error updating valet:', error);
    res.status(500).json({ message: 'Error updating valet', error });
  }
};

const getTotalVideoLengthByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required' });
    }

    // Calculate the total duration of all unique videoURLs for the given restoId
    const totalDuration = await WaytrixVideo.aggregate([
      { $match: { restoId: restoId } },  // Filter by restoId
      { $group: { _id: "$videoURL", duration: { $first: "$duration" } } }, // Group by unique videoURL
      { $group: { _id: null, totalDuration: { $sum: "$duration" } } } // Sum durations of unique videoURLs
    ]);

    if (!totalDuration.length) {
      return res.status(404).json({ message: 'No videos found for the provided restoId' });
    }

    res.status(200).json({ totalDuration: totalDuration[0].totalDuration });
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
};
const getAllVideosByRestoId = async (req, res) => {
  try {
    const { restoId } = req.query;  // Use req.query to get the query parameter

    // Check if restoId is provided
    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required' });
    }

    // Fetch all videos for the given restoId
    const videos = await WaytrixVideo.find({ restoId });

    if (!videos.length) {
      return res.status(404).json({ message: 'No videos found for the given restoId' });
    }

    // Send the videos in the response
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
const deleteVideoByTableId = async (req, res) => {
  const { videoId } = req.body; // Expect videoId in the request body

  try {
    // Delete the video with the given videoId
    const result = await WaytrixVideo.deleteOne({ _id: videoId });

    // Check if a document was deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No video found with the given videoId' });
    }

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateVideoOrder = async (req, res) => {
  const { videoId, newOrder } = req.body; // Expect videoId and newOrder in the request body

  try {
    // Find the video with the given videoId
    const video = await WaytrixVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Update the video's order
    video.order = newOrder;

    // Save the updated video
    await video.save();

    res.status(200).json({ message: 'Video order updated successfully', video });
  } catch (error) {
    console.error('Error updating video order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getWaitersByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required' });
    }

    // Search the WaytrixUser database for all records where role is 'waiter' and restoId matches the provided restoId
    const waiters = await WaytrixUser.find({ role: 'waiter', restoId });

    if (waiters.length === 0) {
      return res.status(404).json({ message: 'No waiters found for the provided restoId' });
    }

    // Send the results as JSON
    res.json(waiters);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: 'Server error', error });
  }
};
const deleteWaiter = async (req, res) => {
  const { waiterId } = req.body;

  try {
    if (!waiterId) {
      return res.status(400).json({ message: 'waiterId is required' });
    }

    // Find and delete the waiter with the provided waiterId
    const result = await WaytrixUser.findOneAndUpdate(
      { _id: waiterId, role: 'waiter' },
      { $set: { deleted: true } }, // Soft delete, mark as deleted
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Waiter not found' });
    }

    res.status(200).json({ message: 'Waiter deleted successfully', result });
  } catch (error) {
    console.error('Error deleting waiter:', error);
    res.status(500).json({ message: 'Error deleting waiter', error });
  }
};
const updateWaiter = async (req, res) => {
  const { waiterId, name, email, phone } = req.body;

  try {
    // Validate input
    if (!waiterId) {
      return res.status(400).json({ message: 'waiterId is required' });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    // Update the waiter's details
    const updatedWaiter = await WaytrixUser.findOneAndUpdate(
      { _id: waiterId, role: 'waiter' },
      { $set: { name, email, phone } },
      { new: true }
    );

    if (!updatedWaiter) {
      return res.status(404).json({ message: 'Waiter not found' });
    }

    res.status(200).json({ message: 'Waiter updated successfully', updatedWaiter });
  } catch (error) {
    console.error('Error updating waiter:', error);
    res.status(500).json({ message: 'Error updating waiter', error });
  }
};
const getTableNameByTableId = async (req, res) => {
  try {
    const { tableId } = req.body;

    // Ensure tableId is provided
    if (!tableId) {
      return res.status(400).json({ message: 'tableId is required' });
    }

    // Find the table with the provided tableId
    const table = await WaytrixUser.findOne({ _id: tableId, role: 'table' }, 'name');

    // Check if the table exists
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Return the table name
    res.status(200).json({ tableName: table.name });
  } catch (error) {
    console.error('Error retrieving table name:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get Partner Name by partnerId
const getPartnerNameByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.body;

    // Ensure partnerId is provided
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required' });
    }

    // Find the partner with the provided partnerId
    const partner = await WaytrixPartners.findOne({ _id: new mongoose.Types.ObjectId(partnerId) }, 'name');

    // Check if the partner exists
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Return the partner name
    res.status(200).json({ partnerName: partner.name });
  } catch (error) {
    console.error('Error retrieving partner name:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const addTablet = async (req, res) => {
  try {
    const { name, email, phone, password, restoId, role } = req.body;

    // Validate the required fields
    if (!name || !email || !phone || !password || !restoId || role !== 'table') {
      return res.status(400).json({ message: 'Missing required fields or invalid role' });
    }

    // Check if the tablet already exists for this restoId
    const existingTablet = await WaytrixUser.findOne({ email, restoId, role: 'table' });
    if (existingTablet) {
      return res.status(400).send('Tablet already exists for this restaurant');
    }

    // Generate a random 6-digit verification key
    const verificationKey = Math.floor(100000 + Math.random() * 900000);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new tablet user
    const newTablet = new WaytrixUser({
      name,    // Include the name field
      email,
      phone,   // Include the phone field
      password: hashedPassword,
      role: 'table',
      restoId,
      smsVerified: true,
      verified: true,
      verificationKey,
    });

    // Save the tablet user to the database
    await newTablet.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newTablet._id, role: newTablet.role }, 'your_jwt_secret', { expiresIn: '365d' });

    // Return the new tablet's token
    res.status(201).json({ token, message: 'Tablet added successfully' });
  } catch (error) {
    console.error('Error adding tablet:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getMaleCustomerCountByAgeGroup = async (req, res) => {
  try {
    // Fetch male customers that are not deleted
    const maleCustomers = await WaytrixUser.find({
      gender: 'male',
      deleted: { $ne: true }
    });

    // Initialize counters for each age group
    let ageGroupCounts = {
      "0-20": 0,
      "20-40": 0,
      "40+": 0
    };

    // Iterate through the customers to categorize by age
    maleCustomers.forEach(customer => {
      if (customer.age >= 0 && customer.age < 20) {
        ageGroupCounts["0-20"]++;
      } else if (customer.age >= 20 && customer.age < 40) {
        ageGroupCounts["20-40"]++;
      } else if (customer.age >= 40) {
        ageGroupCounts["40+"]++;
      }
    });

    // Prepare the final output in the required format
    const result = Object.keys(ageGroupCounts).map(ageGroup => ({
      ageGroup: ageGroup,
      count: ageGroupCounts[ageGroup]
    }));

    // Check if there are any counts available
    if (result.every(group => group.count === 0)) {
      return res.status(404).json({ message: 'No male customers found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching male customer count:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};



const getFemaleCustomerCountByAgeGroup = async (req, res) => {
  try {
    // Fetch male customers that are not deleted
    const femaleCustomers = await WaytrixUser.find({
      gender: 'female',
      deleted: { $ne: true }
    });

    // Initialize counters for each age group
    let ageGroupCounts = {
      "0-20": 0,
      "20-40": 0,
      "40+": 0
    };

    // Iterate through the customers to categorize by age
    femaleCustomers.forEach(customer => {
      if (customer.age >= 0 && customer.age < 20) {
        ageGroupCounts["0-20"]++;
      } else if (customer.age >= 20 && customer.age < 40) {
        ageGroupCounts["20-40"]++;
      } else if (customer.age >= 40) {
        ageGroupCounts["40+"]++;
      }
    });

    // Prepare the final output in the required format
    const result = Object.keys(ageGroupCounts).map(ageGroup => ({
      ageGroup: ageGroup,
      count: ageGroupCounts[ageGroup]
    }));

    // Check if there are any counts available
    if (result.every(group => group.count === 0)) {
      return res.status(404).json({ message: 'No female customers found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching female customer count:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const incrementTotalTimesSigned = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user by ID and increment totalTimesSigned by 1
    const updatedUser = await WaytrixUser.findOneAndUpdate(
      { _id: userId },
      { $inc: { totalTimesSigned: 1 } },
      { new: true }
    );

    // If user not found, return 404
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success with updated user data
    return res.status(200).json({
      message: 'totalTimesSigned incremented successfully',
      updatedUser,
    });
  } catch (error) {
    console.error('Error incrementing totalTimesSigned:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const getMaleCustomerCountByAgeGroupTotalSigned = async (req, res) => {
  try {
    // Fetch male customers that are not deleted
    const maleCustomers = await WaytrixUser.find({
      gender: 'male',
      deleted: { $ne: true }
    });

    // Initialize totals for each age group
    let ageGroupTotals = {
      "0-20": 0,
      "20-40": 0,
      "40+": 0
    };

    // Iterate through the customers to categorize by age and sum the totalTimesSigned
    maleCustomers.forEach(customer => {
      const totalTimesSigned = customer.totalTimesSigned || 0; // Default to 0 if not set
      if (customer.age >= 0 && customer.age < 20) {
        ageGroupTotals["0-20"] += totalTimesSigned;
      } else if (customer.age >= 20 && customer.age < 40) {
        ageGroupTotals["20-40"] += totalTimesSigned;
      } else if (customer.age >= 40) {
        ageGroupTotals["40+"] += totalTimesSigned;
      }
    });

    // Prepare the final output in the required format
    const result = Object.keys(ageGroupTotals).map(ageGroup => ({
      ageGroup: ageGroup,
      totalTimesSigned: ageGroupTotals[ageGroup]
    }));

    // Check if there are any totals available
    if (result.every(group => group.totalTimesSigned === 0)) {
      return res.status(404).json({ message: 'No male customers found or no totalTimesSigned data available' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching male customer totalTimesSigned:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getFemaleCustomerCountByAgeGroupTotalSigned = async (req, res) => {
  try {
    // Fetch female customers that are not deleted
    const femaleCustomers = await WaytrixUser.find({
      gender: 'female',
      deleted: { $ne: true }
    });

    // Initialize totals for each age group
    let ageGroupTotals = {
      "0-20": 0,
      "20-40": 0,
      "40+": 0
    };

    // Iterate through the customers to categorize by age and sum the totalTimesSigned
    femaleCustomers.forEach(customer => {
      const totalTimesSigned = customer.totalTimesSigned || 0; // Default to 0 if not set
      if (customer.age >= 0 && customer.age < 20) {
        ageGroupTotals["0-20"] += totalTimesSigned;
      } else if (customer.age >= 20 && customer.age < 40) {
        ageGroupTotals["20-40"] += totalTimesSigned;
      } else if (customer.age >= 40) {
        ageGroupTotals["40+"] += totalTimesSigned;
      }
    });

    // Prepare the final output in the required format
    const result = Object.keys(ageGroupTotals).map(ageGroup => ({
      ageGroup: ageGroup,
      totalTimesSigned: ageGroupTotals[ageGroup]
    }));

    // Check if there are any totals available
    if (result.every(group => group.totalTimesSigned === 0)) {
      return res.status(404).json({ message: 'No female customers found or no totalTimesSigned data available' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching female customer totalTimesSigned:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
const getRestoNameById = async (req, res) => {
    try {
      const { userId } = req.body;
  
      // Validate input
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }
  
      // Find the user by ObjectId
      const user = await WaytrixUser.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the name field
      res.status(200).json({ name: user.name });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  };

  const getMonthlyRestoCount = async (req, res) => {
    try {
      // Use aggregation to group by month and count the number of users
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'resto', // Filter for users with role 'resto'
            deleted: { $ne: true }, // Exclude deleted users
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly resto counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };


  const getMonthlyTableCount = async (req, res) => {
    try {
      // Use aggregation to group by month and count the number of users
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'table', // Filter for users with role 'table'
            deleted: { $ne: true }, // Exclude deleted users
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly table counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };

  
  const getMonthlyWaiterCount = async (req, res) => {
    try {
      // Use aggregation to group by month and count the number of users
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'waiter', // Filter for users with role 'waiter'
            deleted: { $ne: true }, // Exclude deleted users
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly waiter counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  const getMonthlyValetCount = async (req, res) => {
    try {
      // Use aggregation to group by month and count the number of users
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'valet', // Filter for users with role 'valet'
            deleted: { $ne: true }, // Exclude deleted users
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly valet counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };


  const getMonthlyCarCount = async (req, res) => {
    try {
      // Use aggregation to group by month and count the number of cars
      const result = await WaytrixCars.aggregate([
        {
          $match: {
            deleted: { $ne: true }, // Exclude deleted cars (you need to add a deleted field in your Car schema if applicable)
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of cars
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly car counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  


  const getMonthlyContactUsCount = async (req, res) => {
    try {
      // Use aggregation to group by month and count the number of cars
      const result = await ContactUs.aggregate([
        {
          $match: {
            deleted: { $ne: true }, // Exclude deleted cars (you need to add a deleted field in your Car schema if applicable)
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of contact us
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly contact us counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };


  const getMonthlyTableCount2 = async (req, res) => {
    try {
      const { restoId } = req.body; // Get restoId from the request body
  
      // Use aggregation to group by month and count the number of users for the given restoId
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'table', // Filter for users with role 'table'
            deleted: { $ne: true }, // Exclude deleted users
            restoId: restoId // Filter by requested restoId
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly table counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  


  const getMonthlySurveyCount2 = async (req, res) => {
    try {
      const { restoId } = req.body; // Get restoId from the request body
  
      // Use aggregation to group by month and count the number of users for the given restoId
      const result = await WaytrixSurvey.aggregate([
        {
          $match: {
            //role: 'table', // Filter for users with role 'table'
            deleted: { $ne: true }, // Exclude deleted users
            restoId: restoId // Filter by requested restoId
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly table counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  const getMonthlyCarCount2 = async (req, res) => {
    try {
      const { restoId } = req.body; // Get restoId from the request body

      // Use aggregation to group by month and count the number of cars
      const result = await WaytrixCars.aggregate([
        {
          $match: {
            deleted: { $ne: true }, // Exclude deleted cars (you need to add a deleted field in your Car schema if applicable)
            restoId: restoId // Filter by requested restoId
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of cars
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly car counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  const getMonthlyWaiterCount2 = async (req, res) => {
    try {
      const { restoId } = req.body; // Get restoId from the request body
  
      // Use aggregation to group by month and count the number of users for the given restoId
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'waiter', // Filter for users with role 'waiter'
            deleted: { $ne: true }, // Exclude deleted users
            restoId: restoId // Filter by requested restoId
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly table counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };


  const getMonthlyValetCount2 = async (req, res) => {
    try {
      const { restoId } = req.body; // Get restoId from the request body
  
      // Use aggregation to group by month and count the number of users for the given restoId
      const result = await WaytrixUser.aggregate([
        {
          $match: {
            role: 'valet', // Filter for users with role 'valet'
            deleted: { $ne: true }, // Exclude deleted users
            restoId: restoId // Filter by requested restoId
          }
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by month of the date field
            count: { $sum: 1 } // Count the number of documents
          }
        },
        {
          $project: {
            month: "$_id", // Project the month
            count: 1, // Include the count
            _id: 0 // Exclude the default _id
          }
        },
        {
          $sort: { month: 1 } // Sort by month
        }
      ]);
  
      // Create an array with the month names and fill it with counts
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthlyCounts = monthNames.map((month, index) => {
        const found = result.find(r => r.month === index + 1);
        return {
          month,
          count: found ? found.count : 0 // Use found count or 0 if not found
        };
      });
  
      res.status(200).json(monthlyCounts); // Send the monthly counts as response
    } catch (error) {
      console.error('Error fetching monthly table counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };


  const getTotalRushVideoLengthByRestoId = async (req, res) => {
    try {
      const { restoId } = req.body;

      if (!restoId) {
        return res.status(400).json({ message: 'restoId is required' });
      }
  
      const totalDuration = await WaytrixVideo.aggregate([
        { $match: { restoId: restoId, rushHour: true } }, // Match on restoId and rushHour
        { $group: { _id: "$videoURL", duration: { $first: "$duration" } } }, // Group by unique videoURL
        { $group: { _id: null, totalDuration: { $sum: "$duration" } } } // Sum durations of unique videoURLs
      ]);

      if (!totalDuration.length) {
        return res.status(404).json({ message: 'No videos found for the provided restoId with rushHour true' });
      }

      res.status(200).json({ totalDuration: totalDuration[0].totalDuration });
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Stack Trace:', error.stack);
      res.status(500).json({ message: 'Server error', error: error.message || error });
    }
  };
  
  















const GetTablesByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
        return res.status(400).json({ message: 'restoId is required' });
    }

    // Search the WaytrixUser database for all records where role is 'waiter' and restoId matches the provided restoId
    const waiters = await WaytrixUser.find({ role: 'table', restoId });

    if (waiters.length === 0) {
        return res.status(404).json({ message: 'No waiters found for the provided restoId' });
    }

    // Send the results as JSON
    res.json(waiters);
} catch (error) {
    // Handle any errors
    res.status(500).json({ message: 'Server error', error });
}
}
const GetWaytersByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
        return res.status(400).json({ message: 'restoId is required' });
    }

    // Search the WaytrixUser database for all records where role is 'waiter' and restoId matches the provided restoId
    const waiters = await WaytrixUser.find({ role: 'waiter', restoId });

    if (waiters.length === 0) {
        return res.status(404).json({ message: 'No waiters found for the provided restoId' });
    }

    // Send the results as JSON
    res.json(waiters);
} catch (error) {
    // Handle any errors
    res.status(500).json({ message: 'Server error', error });
}
}


const GetTableLocations = async (req, res) => {
  try {
    const tableLocations = await WaytrixUser.find({ role: 'table', ip: { $exists: true } });
    res.json(tableLocations);
  } catch (err) {
    console.error('Error fetching table locations:', err);
    res.status(500).json({ error: 'Failed to fetch table locations' });
  }
}


  const signupWaiter = async (req, res) => {
  try {
    const { name, email, phone, password, role, restoId, tableId } = req.body;
    // console.log(req.body);
    // Check if the user already exists
    const existingUser = await WaytrixUser.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Generate a random 6-digit verification key
    const verificationKey = Math.floor(100000 + Math.random() * 900000);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new WaytrixUser({
      restoId,
      tableId,
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      verified: true,
      verificationKey, // Store the verification key in the database
    });

    // Save the user to the database
    await newUser.save();

   

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, 'your_jwt_secret', { expiresIn: '365d' });
    
    // Send response with token
    res.status(201).send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};




const getRestoInfo = async (req, res) => {
  try {
    const { restoId } = req.body;

    if (!restoId) {
      return res.status(400).json({ message: 'restoId is required in req.body' });
    }

    const restoInfo = await WaytrixUser.findOne({ _id: restoId });

    if (!restoInfo) {
      return res.status(404).json({ message: 'Resto info not found' });
    }

    res.status(200).json(restoInfo);
  } catch (error) {
    console.error('Error retrieving resto info:', error);
    res.status(500).json({ message: 'Error retrieving resto info', error });
  }
}
// below tab true
const getTableAccounts = async (req, res) => {
  try {
    const tableAccounts = await WaytrixUser.aggregate([
      { $match: { role: 'table', deleted: { $ne: true } } },
      {
        $group: {
          _id: '$restoId',
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$doc' }
      }
    ]);
    res.status(200).json(tableAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving table accounts', error });
  }
};
const signupTableValet = async (req, res) => {
  try {
    const { name, email, phone, password, role, restoId } = req.body;

    // Check if the user already exists
    if (role =='valet'){
    const existingUser = await WaytrixUser.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
  }else if (role == 'table'){
    if (!email.includes('@')) {
      // console.log("includes @")
      return res.status(400).send('Invalid email format');
    }
      const existingTable = await WaytrixUser.findOne({ email });
      if (existingTable) {
        return res.status(400).send('Table already exists');
      }
    }

    // Generate a random 6-digit verification key
    const verificationKey = Math.floor(100000 + Math.random() * 900000);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new WaytrixUser({
      restoId,
      name,
      email,
      phone,
      password: hashedPassword,
      smsVerified:true,
      role,
      verified: true,
      verificationKey, // Store the verification key in the database
    });

    // Save the user to the database
    await newUser.save();

 

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, 'your_jwt_secret', { expiresIn: '365d' });
    
    // Send response with token
    res.status(201).send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

const updatePassword = async (req, res) => {
    try {
        const { email, password, forgotKey } = req.body;
        // console.log(req.body);
        // Find user by email (case insensitive)
        const user = await WaytrixUser.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Check if forgotKey is correct
        if (user.forgotKey !== forgotKey) {
          return res.status(400).json({ message: 'Invalid forgot key' });
        }
    
        // Encrypt the new password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Update user's password
        user.password = hashedPassword;
        await user.save();
    
        return res.status(200).json({ message: 'Password updated successfully' });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
}

const generateForgotKey = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Generate a 6-digit random number
      const forgotKey = Math.floor(100000 + Math.random() * 900000);
  
      // Update the user's forgotKey in the database
      await WaytrixUser.updateOne({ email: { $regex: new RegExp(email, 'i') } }, { forgotKey });
  
      // Create a nodemailer transporter
      let transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: 'pierreghoul@yahoo.com',
          pass: 'nsxmtrpmakdzduar'
        }
      });
  
      // Define the email options
      let mailOptions = {
        from: 'pierreghoul@yahoo.com',
        to: email,
        subject: 'Password Reset',
        html: `
        <div style="background-color: #000; color: #fff; padding: 20px; font-family: Arial, sans-serif;">
          <div style="border: 2px solid #fff; padding: 15px; margin-bottom: 20px;">
            <h1 style="text-align: center; color: #fff;">Password Reset</h1>
            <p style="font-size: 18px; color: #ccc;">Your password reset key is:</p>
            <p style="font-size: 24px; font-weight: bold; color: #fff; text-align: center;">${forgotKey}</p>
          </div>
          <div style="border: 1px solid #444; padding: 10px;">
            <p style="font-size: 14px; color: #888;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
            <p style="font-size: 14px; color: #888;">Thank you,</p>
            <p style="font-size: 14px; color: #888;">Waytrix Team</p>
          </div>
        </div>
        `
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Forgot key sent successfully' });
    } catch (error) {
      console.error('Error generating forgot key:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


  const verifyUser = async (req, res) => {
    try {
      const { email, verificationKey } = req.body;
  
      const user = await WaytrixUser.findOne({ email });
      console.log('User found:', user);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      if (verificationKey !== user.verificationKey) {
        return res.status(400).send('Invalid verification key');
      }
  
      user.smsVerified = true;
      user.verified = true;
      await user.save();
  
      res.status(200).send('User verified successfully');
    } catch (error) {
      console.error('Verification error:', error.stack);
      res.status(500).send('Internal server error');
    }
  };
  
  
  
  const signupResto = async (req, res) => {
    try {
      const { name, email, phone, password, role } = req.body;
  // console.log(req.body)
      // Check if the user already exists with the email
      const existingUserByEmail = await WaytrixUser.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).send('User already exists');
      }
  
      // Check if the user already exists with the phone number
      const existingUserByPhone = await WaytrixUser.findOne({ phone });
      if (existingUserByPhone) {
        return res.status(400).send('Phone number already exists');
      }
  
      // Generate a random 6-digit verification key
      const verificationKey = Math.floor(100000 + Math.random() * 900000);
      const SmsVerification = Math.floor(100000 + Math.random() * 900000);
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new WaytrixUser({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        verified: role === "resto" ? true : false,
        verificationKey, // Store the verification key in the database
        SmsVerification,
        smsVerified: role === "resto" ? true : false
      });
  
      // Save the user to the database
      await newUser.save();
  
      
  
      // Generate JWT token
      const token = jwt.sign({ userId: newUser._id, role: newUser.role }, 'your_jwt_secret', { expiresIn: '365d' });
      
      // Send response with token
      res.status(201).send({ token, _id: newUser._id });
    } catch (error) {
      // console.log(error);
      res.status(500).send('Internal server error');
    }
  }
  const signup = async (req, res) => {
    try {
      const { name, email, phone, password, role, gender, age } = req.body; // Include gender
  
      // Check if the user already exists with the email
      const existingUserByEmail = await WaytrixUser.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).send('User already exists');
      }
  
      // Check if the user already exists with the phone number
      const existingUserByPhone = await WaytrixUser.findOne({ phone });
      if (existingUserByPhone) {
        return res.status(400).send('Phone number already exists');
      }
  
      // Generate a random 6-digit email verification key
      const verificationKey = Math.floor(100000 + Math.random() * 900000);
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new WaytrixUser({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        gender,
        age,
        verified: role === "resto" ? true : false,
        verificationKey, // Store the email verification key in the database
        SmsVerification: null,  // Keep the field, but no SMS verification
        smsVerified: true,  // Automatically set to true
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Send verification key to the user's email using NodeMailer
      const transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: 'pierreghoul@yahoo.com', // Replace with your email
          pass: 'nsxmtrpmakdzduar', // Replace with your password
        },
      });
  
      const mailOptions = {
        from: 'pierreghoul@yahoo.com',
        to: email,
        subject: 'Verification Key for Signup',
        html: `
          <div style="background-color: #000000; color: #FFFFFF; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="border: 1px solid #FFFFFF; padding: 10px; text-align: center;">Verification Key for Signup</h1>
            <p style="border: 1px solid #FFFFFF; padding: 10px; text-align: center;">
              Your verification key is: <span style="font-weight: bold;">${verificationKey}</span>
            </p>
            <footer style="border: 1px solid #FFFFFF; padding: 10px; text-align: center;">
              <p>&copy; 2024 Waytrix. All rights reserved.</p>
            </footer>
          </div>
        `,
      };
  
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send('Failed to send verification email');
        }
      });
  
      // Generate JWT token (if still required)
      const token = jwt.sign({ userId: newUser._id, role: newUser.role }, 'your_jwt_secret', { expiresIn: '365d' });
  
      // Send response with token and user ID
      res.status(201).send({ token, _id: newUser._id });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  };
  
  
  

  const login = async (req, res) => {
    try {
      const { email, password, role, longitude, latitude, ip, deleteCheck } = req.body;
      console.log(req.body);
  
      // Find the user by email (case-insensitive)
      const user = await WaytrixUser.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  
      if (!user) {
        console.log("user not found");
        return res.status(400).send('User not found');
      }
  
      // Check if the user is deleted (skip if deleteCheck is provided)
      if (!deleteCheck && user.deleted) {
        console.log("user is deleted");
        return res.status(400).send('User account is deleted');
      }
  
      // Check if the role is correct
      if (user.role !== role) {
        console.log("invalid role");
        return res.status(400).send('Invalid role');
      }
  
      // Additional check for SMS verification if role is "customer"
      if (role === 'customer' && !user.smsVerified) {
        console.log("sms not verified");
        return res.status(400).send('SMS not verified');
      }
  
      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("invalid pass");
        return res.status(400).send('Invalid password');
      }
  
      // Update user record with longitude, latitude, and ip if provided
      if (longitude !== undefined && latitude !== undefined) {
        user.longitude = longitude;
        user.latitude = latitude;
      }
      if (ip !== undefined) {
        user.ip = ip;
      }
  
      console.log("success");
  
      // Save updated user record
      await user.save();
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '365d' });
  
      // Send response with token
      res.status(200).send({ token, _id: user._id });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  };
  

module.exports = { delete_resto,signup,GetWaytersByRestoId,GetTablesByRestoId,update_waiter_tableId_array, login,GetTableLocations,getRestoInfo, verifyUser, generateForgotKey,updatePassword,signupTableValet, getTableAccounts, signupWaiter, signupResto, getNumberOfWaitersByRestoId, getNumberOfTablesByRestoId, getTablesByRestoId, deleteTable, updateTable, getValetAccounts, deleteValet, updateValet, getTotalVideoLengthByRestoId, getAllVideosByRestoId, deleteVideoByTableId, updateVideoOrder, getWaitersByRestoId, deleteWaiter, updateWaiter, getTableNameByTableId, getPartnerNameByPartnerId, addTablet, getMaleCustomerCountByAgeGroup, getFemaleCustomerCountByAgeGroup, incrementTotalTimesSigned, getMaleCustomerCountByAgeGroupTotalSigned, getFemaleCustomerCountByAgeGroupTotalSigned, getRestoNameById, getMonthlyRestoCount, getMonthlyTableCount, getMonthlyWaiterCount, getMonthlyValetCount, getMonthlyCarCount, getMonthlyContactUsCount, getMonthlyTableCount2, getMonthlySurveyCount2, getMonthlyCarCount2, getMonthlyWaiterCount2, getMonthlyValetCount2, getTotalRushVideoLengthByRestoId };
