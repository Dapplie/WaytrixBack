const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const mongoose = require('mongoose');
const WaytrixUser = require('../models/Auth'); 
const WaytrixVideo = require('../models/Video'); 


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

    // Calculate the total duration of all videos for the given restoId
    const totalDuration = await WaytrixVideo.aggregate([
      { $match: { restoId: restoId } },  // Ensure restoId is the correct field name
      { $group: { _id: null, totalDuration: { $sum: "$duration" } } }  // Ensure duration is a number
    ]);
    

    if (!totalDuration.length) {
      return res.status(404).json({ message: 'No videos found for the provided restoId' });
    }

    res.status(200).json({ totalDuration: totalDuration[0].totalDuration });
  } catch (error) {
    console.error('Error:', error.message);  // Log the error message
    console.error('Stack Trace:', error.stack);  // Log the stack trace
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
    if (email.includes('@')) {
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
        service: 'Gmail',
        auth: {
          user: 'dollarrami75@gmail.com',
          pass: 'tdco ogya momt kdee'
        }
      });
  
      // Define the email options
      let mailOptions = {
        from: 'dollarrami75@gmail.com',
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
  // console.log("uewhifuheiuf")
    try {
      const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
      const decodedToken = jwt.verify(token, 'your_jwt_secret'); // Verify and decode token
      const userId = decodedToken.userId; // Extract userId from decoded token
      // console.log(req.body)
  // console.log(userId)
      // Find user in the database by userId
      const user = await WaytrixUser.findOne({ _id: userId });
  
      if (!user) {
        // console.log("user not found")
        return res.status(404).send('User not found');
      }
      if (req.body.SmsVerification !== user.SmsVerification) {
        // console.log("wrong verif key")
        return res.status(400).send('Invalid verification key');
      }
      // Check if verification key matches
      if (req.body.verificationKey !== user.verificationKey) {
        // console.log("wrong verif key")
        return res.status(400).send('Invalid verification key');
      }
  
      // Update user's verified status to true
      user.smsVerified=true;
      user.verified = true;
      await user.save();
  
      res.status(200).send('User verified successfully');
    } catch (error) {
      console.error(error);
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
      const { name, email, phone, password, role, gender } = req.body; // Include gender
    
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
        gender, // Add gender to the user data
        verified: role === "resto" ? true : false,
        verificationKey, // Store the verification key in the database
        SmsVerification,
        smsVerified: role === "resto" ? true : false
      });
    
      // Save the user to the database
      await newUser.save();
    
      // Send verification key to the user's email using NodeMailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dollarrami75@gmail.com',
          pass: 'tdco ogya momt kdee',
        },
      });
    
      const mailOptions = {
        from: 'dollarrami75@gmail.com',
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
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).send('Failed to send verification email');
        }
      });
    
      // Send SMS verification using Twilio
      const accountSid = 'AC4944717e328b60d7e65888699b08bd63';
      const authToken = '16d9623e7735ae0c7c8e8f5791106a89';
      const client = require('twilio')(accountSid, authToken);
    
      client.messages
        .create({
          body: `this is your verification code for your waytrix account: ${SmsVerification}`,
          from: '+16508604551', // Twilio number
          to: `+${phone}` // User's phone number
        })
        .then(message => console.log(message.sid))
        .catch(err => {
          console.error('Error sending SMS:', err);
        });
    
      // Generate JWT token
      const token = jwt.sign({ userId: newUser._id, role: newUser.role }, 'your_jwt_secret', { expiresIn: '365d' });
      
      // Send response with token
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
  

module.exports = { delete_resto,signup,GetWaytersByRestoId,GetTablesByRestoId,update_waiter_tableId_array, login,GetTableLocations,getRestoInfo, verifyUser, generateForgotKey,updatePassword,signupTableValet, getTableAccounts, signupWaiter, signupResto, getNumberOfWaitersByRestoId, getNumberOfTablesByRestoId, getTablesByRestoId, deleteTable, updateTable, getValetAccounts, deleteValet, updateValet, getTotalVideoLengthByRestoId, getAllVideosByRestoId, deleteVideoByTableId, updateVideoOrder, getWaitersByRestoId, deleteWaiter, updateWaiter };
