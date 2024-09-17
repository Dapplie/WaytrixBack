const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const mongoose = require('mongoose');
const WaytrixVideo = require('../models/Video'); 
const WaytrixCar = require('../models/AddCarsValet');
const WaytrixUser = require('../models/Auth'); 
const WaytrixGame = require('../models/Points');

// get_total_contact_us_click
const get_total_contact_us_click_for_waytrix = async (req, res) => {
    try {
        // Find all documents where role is "resto"
        const users = await WaytrixUser.find({ role: 'resto' });
    
        // Calculate total ContactUsClick
        let totalClicks = 0;
        users.forEach(user => {
          if (user.ContactUsClick) {
            totalClicks += user.ContactUsClick;
          }
        });
    
        res.status(200).json({ totalContactUsClick: totalClicks });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
}
const add_contact_us_click = async (req, res) => {
    const { restoId, ContactUsClick } = req.body;
console.log(req.body)
    try {
      // Find the document matching restoId
      let user = await WaytrixUser.findOne({ _id: restoId });
  
      if (!user) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
  
      // Update ContactUsClick value
      if (user.ContactUsClick) {
        user.ContactUsClick += ContactUsClick;
      } else {
        user.ContactUsClick = ContactUsClick;
      }
  
      // Save updated user
      await user.save();
  
      res.status(200).json({ message: 'ContactUsClick updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
}
const total_customers_info_for_waytrix = async (req, res) => {
    try {
      const customers = await WaytrixUser.find({ role: 'customer' });
      res.send(customers);
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving data', error });
    }
  };
  

const total_cars_num_for_waytrix = async (req, res) => {
    try {
        const totalNumberOfCars = await WaytrixCar.countDocuments();
        res.send({ totalNumberOfCars });
    } catch (err) {
        console.error("Error fetching total number of cars:", err);
        res.status(500).send("Failed to fetch total number of cars");
    }
};
const total_waiter_num_for_waytrix = async (req, res) => {
    try {
      const count = await WaytrixUser.countDocuments({ role: 'waiter' });
      res.send({ totalWaiterNum: count });
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving data', error });
    }
  };
const total_Adds_num_for_waytrix = async (req, res) => {
    try {
        const uniqueIds = await WaytrixVideo.distinct('forLoopId', { forLoopId: { $type: 'objectId' } });
        const totalCount = uniqueIds.length;
        res.status(200).json({ totalNumOfAdds: totalCount });
      } catch (err) {
        console.error('Error in counting unique ids:', err);
        res.status(500).json({ error: 'Server error' });
      }
}
const total_resto_num_for_waytrix = async (req, res) => {
    try {
      const count = await WaytrixUser.countDocuments({ role: 'resto' });
      res.send({ totalRestoNum: count });
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving data', error });
    }
  };

  const total_table_num_for_waytrix = async (req, res) => {
    try {
      const count = await WaytrixUser.countDocuments({ role: 'table' });
      res.send({ totalTableNum: count });
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving data', error });
    }
  };
  const total_valet_num_for_waytrix = async (req, res) => {
    try {
      const count = await WaytrixUser.countDocuments({ role: 'valet' });
      res.send({ totalValetNum: count });
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving data', error });
    }
  };
  
  const total_tablet_num_for_waytrix = async (req, res) => {
    try {
      const count = await WaytrixUser.countDocuments({ role: { $in: ['table', 'valet'] } });
      res.send({ totalTabletsNum: count });
    } catch (error) {
      res.status(500).send({ message: 'Error retrieving data', error });
    }
  };

module.exports = { total_resto_num_for_waytrix, total_tablet_num_for_waytrix, total_valet_num_for_waytrix,add_contact_us_click,get_total_contact_us_click_for_waytrix, total_table_num_for_waytrix,total_customers_info_for_waytrix, total_Adds_num_for_waytrix,total_cars_num_for_waytrix, total_waiter_num_for_waytrix };
