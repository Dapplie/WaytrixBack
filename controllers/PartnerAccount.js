
const WaytrixVideo = require('../models/Video'); 
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const WaytrixUser = require('../models/Auth'); 
const WaytrixPartners = require('../models/Partners');
const num_of_vouchers_collected_resto_specific = async (req, res) => {
    try {
        const { restoId } = req.body;

        if (!restoId) {
            return res.status(400).send({ error: 'restoId is required' });
        }

        const waytrixUser = await WaytrixUser.findOne({ _id: restoId }, 'voucherNum');

        if (!waytrixUser) {
            return res.status(404).send({ error: 'WaytrixUser not found' });
        }

        res.send({ WinnedVouchers: waytrixUser.voucherNum });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching the voucher number' });
    }
}
// get all restaurant for a specific partner
const num_of_videos_in_each_resto_per_day = async (req, res) => {
    try {
        const { restoId, partnerId } = req.body;
    
        // Find all WaytrixVideo records matching restoId and partnerId
        const videos = await WaytrixVideo.find({ restoId, partnerId });
    
        // Extract maxTimes from the records and calculate the total
        const totalMaxTimes = videos.reduce((total, video) => total + video.maxTimes, 0);
    
        // Send the total as the response
        res.send({ totalMaxTimes });
      } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).send({ error: 'An error occurred while calculating the total max times.' });
      }
}
const get_all_restaurants_for_a_specific_partner = async (req, res) => {
    try {
        const { partnerId } = req.body;
    
        // Find the partner with the given partnerId
        const partner = await WaytrixPartners.findOne({ _id: new mongoose.Types.ObjectId(partnerId) });
    
        if (!partner) {
          return res.status(404).send({ message: 'Partner not found' });
        }
    
        // Extract restoIdArray from the found partner
        const { restoIdArray } = partner;
    
        // Initialize an array to hold restaurant records
        const restaurantRecords = [];
    
        // Iterate over each restoId in restoIdArray
        for (const restoId of restoIdArray) {
          const restaurant = await WaytrixUser.findOne({ _id: new mongoose.Types.ObjectId(restoId) });
    
          if (restaurant) {
            restaurantRecords.push(restaurant);
          }
        }
    
        // Send the found restaurant records as the response
        res.send(restaurantRecords);
      } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
      }
  };
const get_total_video_num = async (req, res) => {
    const { _id } = req.body;
console.log(req.body)
    try {
        // Find the document in WaytrixPartners with matching _id
        const partner = await WaytrixPartners.findOne({ _id });

        if (!partner) {
            return res.status(404).send('Partner not found');
        }

        // Extract _ids from restoIdArray of the found partner
        const restoIds = partner.restoIdArray.map(id => id.toString());

        // Find maxTimes for each restoId in WaytrixVideo and calculate their total
        let totalMaxTimes = 0;
        let totalContactUsClicks = 0;
        
        for (const restoId of restoIds) {
            // Find videos with unique forLoopId for the current restoId and partnerId
            const videos = await WaytrixVideo.aggregate([
                { $match: { restoId, partnerId: _id } },
                { $sort: { forLoopId: 1, maxTimes: -1 } },
                {
                    $group: {
                        _id: "$forLoopId",
                        maxTimes: { $first: "$maxTimes" }
                    }
                }
            ]);

            // Sum up the maxTimes
            for (const video of videos) {
                totalMaxTimes += video.maxTimes;
            }

            // Fetch the WaytrixUser for each restoId where role is equal to 'resto'
            const users = await WaytrixUser.find({ _id: new mongoose.Types.ObjectId(restoId), role: 'resto' });

            // Sum up the ContactUsClick values
            for (const user of users) {
                if (user.ContactUsClick && Number.isInteger(user.ContactUsClick)) {
                    totalContactUsClicks += user.ContactUsClick;
                }
            }
        }

        // Send back the total maxTimes and totalContactUsClicks
        res.send({ TotalVideoNum: totalMaxTimes, totalContactUsClicks });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}
const get_partners = async (req, res) => {
    try {
        const partners = await WaytrixPartners.find({}, '_id name');
        res.send(partners);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching partners', error });
      }
}
const partner_get_resto_account = async (req, res) => {
    try {
        const users = await WaytrixUser.find({ role: 'resto', deleted: { $ne: true } }, 'name _id');
        res.json(users);
    } catch (error) {
        console.error('Error fetching restaurant accounts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const partner_login = async (req, res) => {
    const { phone, password } = req.body;
console.log(req.body)
    try {
        // Find the partner in the database by phone number
        const partner = await WaytrixPartners.findOne({ phone });

        // If partner not found, return an error
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, partner.password);
        
        // If the password does not match, return an error
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Extract the role and _id from the database
        const { role, _id } = partner;

        // Generate a JWT token
        const token = jwt.sign({ role, _id }, 'your_jwt_secret', { expiresIn: '1y' });

        // Send the token in the response
        res.json({ token, _id });

    } catch (error) {
        // Handle any errors that occur
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
}

const edit_partner = async (req, res) => {
    try {
      const { partnerId, name, phone, description, restoIdArray } = req.body;
  
      // Check if partnerId is provided
      if (!partnerId) {
        return res.status(400).json({ message: 'Partner ID is required.' });
      }
  
      // Update the partner's details
      const updatedPartner = await WaytrixPartners.findByIdAndUpdate(
        partnerId,
        {
          ...(name && { name }), // Update only if provided
          ...(phone && { phone }),
          ...(description && { description }),
          ...(restoIdArray && { restoIdArray }),
        },
        { new: true } // Return the updated document
      );
  
      // If the partner was not found
      if (!updatedPartner) {
        return res.status(404).json({ message: 'Partner not found.' });
      }
  
      res.status(200).json({ message: 'Partner updated successfully.', updatedPartner });
    } catch (error) {
      console.error('Error updating partner:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  };
  


module.exports = {partner_login,num_of_vouchers_collected_resto_specific, partner_get_resto_account,num_of_videos_in_each_resto_per_day, get_total_video_num, get_partners, get_all_restaurants_for_a_specific_partner, edit_partner}