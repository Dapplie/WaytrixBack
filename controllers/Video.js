
const WaytrixVideo = require('../models/Video'); 
const WaytrixUser = require('../models/Auth'); 
const mongoose = require('mongoose');
const update_forLoopId_video_records = async (req, res) => {
  const { forLoopId, videoURL, maxTimes, order, uploadDate } = req.body;

  try {
    // Assuming WaytrixVideo is your MongoDB model/schema
    const updatedRecords = await WaytrixVideo.updateMany(
      { forLoopId: new mongoose.Types.ObjectId(forLoopId) }, // Correct usage with 'new'
      { $set: { videoURL, maxTimes, order, uploadDate } } // Update fields
    );

    res.status(200).json({ message: 'Records updated successfully', updatedRecords });
  } catch (error) {
    console.error('Error updating records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
const get_one_for_loop_id_video_for_future_update = async (req, res) => {
  const { restoId } = req.body;

  try {
    // Fetch records where restoId matches the given restoId
    const records = await WaytrixVideo.find({ restoId });

    // Create a map to track unique forLoopId
    const uniqueForLoopIds = new Map();

    // Iterate over the records and add only one record per unique forLoopId
    for (const record of records) {
      if (!uniqueForLoopIds.has(record.forLoopId.toString())) {
        uniqueForLoopIds.set(record.forLoopId.toString(), record);
      }
    }

    // Extract the unique records from the map
    const uniqueRecords = Array.from(uniqueForLoopIds.values());

    res.send(uniqueRecords);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while fetching the records.' });
  }
};

const getAllTablesByRestoId = async (req, res) => {
  try {
    const { restoId } = req.body;
    const tables = await WaytrixUser.findOne({ role: 'table', restoId });
    res.status(200).json(tables);
} catch (error) {
    res.status(500).json({ message: 'Error retrieving tables', error });
}
}
const GetOneVideoPreview = async (req, res) => {
  try {
    const { tableId } = req.body;

    // Find the record where tableId matches and has the lowest order number
    const video = await WaytrixVideo.findOne({ tableId }).sort({ order: 1 });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    

    // Send only the videoURL in the response
    res.status(200).json({ videoURL: video.videoURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const GetAllRestoAccounts = async (req, res) => {
  try {
    const restoAccounts = await WaytrixUser.find({ role: 'resto', deleted: { $ne: true } });
    res.status(200).json(restoAccounts);
} catch (error) {
    res.status(500).json({ message: error.message });
}
}
// const GetOneVideo = async (req, res) => {
//   try {
//     const { tableId } = req.body;

//     // Find all videos for the given tableId and sort by order
//     const videos = await WaytrixVideo.find({ tableId }).sort({ order: 1 });

//     if (videos.length === 0) {
//       return res.status(404).json({ message: 'No videos found for the given tableId' });
//     }

//     // Find the last played video order for the tableId
//     const user = await WaytrixVideo.findOne({ tableId }).select('lastPlayedOrder');
//     let lastPlayedOrder = user ? user.lastPlayedOrder : -1;

//     // Determine the next video to play
//     const nextVideo = videos.find(v => v.order > lastPlayedOrder) || videos[0];

//     // Update the last played order to the current video's order
//     await WaytrixVideo.updateOne(
//       { tableId },
//       { $set: { lastPlayedOrder: nextVideo.order } }
//     );

//     // Send the videoURL in the response
//     res.status(200).json({ videoURL: nextVideo.videoURL });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

const GetOneVideo = async (req, res) => {
  try {
    const { tableId } = req.body;

    // Find all videos for the given tableId and sort by order
    const videos = await WaytrixVideo.find({ tableId }).sort({ order: 1 });

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No videos found for the given tableId' });
    }

    // Get the current time
    const currentTime = new Date();
    const currentHour = currentTime.getHours(); // Get the current hour (0-23)
    console.log(currentHour);

    // Filter videos based on rushHour flag and the time of day
    const filteredVideos = videos.filter((video) => {
      if (video.rushHour) {
        // Show rush hour videos only between 9 AM and 7 PM
        return currentHour >= 9 && currentHour < 19;
      } else {
        // Show non-rush hour videos only between 7 PM and 11 PM
        return currentHour >= 19 && currentHour < 23;
      }
    });

    if (filteredVideos.length === 0) {
      return res.status(404).json({ message: 'No videos to display at this time' });
    }

    // Find the last played video order for the tableId
    const user = await WaytrixVideo.findOne({ tableId }).select('lastPlayedOrder');
    let lastPlayedOrder = user ? user.lastPlayedOrder : -1;

    // Determine the next video to play from filtered videos
    const nextVideo = filteredVideos.find(v => v.order > lastPlayedOrder) || filteredVideos[0];

    // Update the last played order to the current video's order
    await WaytrixVideo.updateOne(
      { tableId },
      { $set: { lastPlayedOrder: nextVideo.order } }
    );

    // Send the videoURL in the response
    res.status(200).json({ videoURL: nextVideo.videoURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};







const AddVideo = async (req, res) => {
  try {
    const { videoURL, restoId, partnerId, uploadDate, duration, rushHour = false } = req.body; // Default rushHour to false

    // Validate duration
    if (typeof duration !== 'number') {
      return res.status(400).json({ message: 'Invalid duration' });
    }

    // Generate a unique forLoopId
    const forLoopId = new mongoose.Types.ObjectId();

    // Find the highest order value for the given restoId
    const maxOrderVideo = await WaytrixVideo.findOne({ restoId }).sort({ order: -1 }).select('order');
    const newOrder = maxOrderVideo ? maxOrderVideo.order + 1 : 1; // Increment the highest order or start from 1 if no videos exist

    // Find WaytrixUser where role is 'table' and restoId matches
    const tables = await WaytrixUser.find({ role: 'table', restoId });

    // Create a new record for each tableId found
    for (const table of tables) {
      const newVideo = new WaytrixVideo({
        videoURL,
        restoId,
        tableId: table._id,
        order: newOrder, // Use the incremented order
        forLoopId,
        partnerId,
        uploadDate,
        duration, // Save the duration
        rushHour // Use the provided rushHour value or default to false
      });
      await newVideo.save();
    }

    res.status(200).json({ message: 'Videos added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};







const getTotalVideosForPartner = async (req, res) => {
  try {
    const { partnerId } = req.body;

    // Check if partnerId is provided
    if (!partnerId) {
      return res.status(400).send({ error: 'partnerId is required' });
    }

    // Find all videos associated with the given partnerId
    const totalVideos = await WaytrixVideo.countDocuments({ partnerId });

    // Return the total number of videos
    res.send({ totalVideos });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).send({ error: 'An error occurred while fetching the total number of videos.' });
  }
};







module.exports = {AddVideo, GetOneVideo,get_one_for_loop_id_video_for_future_update,GetOneVideoPreview,update_forLoopId_video_records, GetAllRestoAccounts, getAllTablesByRestoId, getTotalVideosForPartner}