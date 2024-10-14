
const WaytrixContactUs = require('../models/ContactUs'); 

const WaytrixPartners = require('../models/Partners');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// const WaytrixUser = require('../models/Auth'); 
const WaytrixSurvey = require('../models/Survey');

const jwt = require('jsonwebtoken');
const WaytrixGame = require('../models/Points');
const WaytrixVouchers = require('../models/Vouchers');
const WaytrixUser = require('../models/Auth'); 

const client = require('twilio')('AC4944717e328b60d7e65888699b08bd63', '16d9623e7735ae0c7c8e8f5791106a89');
// const { ObjectId } = require('mongodb');
const AddPoints = async (req, res) => {
    try {
        const { points, restoId } = req.body;
        console.log(req.body);
        if (!points) {
            return res.status(400).json({ message: 'Points are required' });
        }

        const token = req.headers.authorization;
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const customerId = decoded.userId;
        console.log(customerId);

        let waytrixGame = await WaytrixGame.findOne({ customerId });

        const currentTime = new Date();

        if (waytrixGame) {
            const lastTimeSpinned = new Date(waytrixGame.lastTimeSpinned);
            const timeDifference = (currentTime - lastTimeSpinned) / (1000 * 60 * 60); // Difference in hours

            if (timeDifference < 24) {
                return res.status(403).json({ message: 'You can only spin once every 24 hours' });
            }

            waytrixGame.points += points;
            waytrixGame.lastTimeSpinned = currentTime;
        } else {
            waytrixGame = new WaytrixGame({ customerId, points, restoId, lastTimeSpinned: currentTime });
        }

        await waytrixGame.save();

        // Search the WaytrixUser database for the restoId and increment spinCounts
        await WaytrixUser.findByIdAndUpdate(restoId, { $inc: { spinCounts: 1 } });

        res.status(200).json({ message: 'Points added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}
const UserRedeemInfo = async (req, res) => {
    const { customerId, redeemName, redeemEmail } = req.body; // Update to redeemEmail
    console.log(req.body);
    
    try {
        // Ensure ObjectId is imported
        const { ObjectId } = require('mongodb');

        // Find the user by customerId
        const user = await WaytrixUser.findOne({ _id: new ObjectId(customerId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a 6-digit redeem key
        const redeemKey = Math.floor(100000 + Math.random() * 900000).toString();

        // Update or add redeem information
        user.redeemName = redeemName;
        user.redeemEmail = redeemEmail; // Store email
        user.redeemKey = redeemKey;

        await user.save();

        // Send email with redeemKey using Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'yahoo',
            auth: {
                user: 'pierreghoul@yahoo.com', // Your email
                pass: 'nsxmtrpmakdzduar' // Your email password
            }
        });

        const mailOptions = {
            from: 'pierreghoul@yahoo.com',
            to: redeemEmail, // Use redeemEmail from request
            subject: 'Your Redeem Key',
            text: `Your redeem key is ${redeemKey}, please save it for later use`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).json({ message: 'Redeem information updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// beloww
const Redeem = async (req, res) => {
    const { _id, customerId, redeemKey, restoId } = req.body;
    console.log(req.body);
    try {
        // Search for the voucher
        const voucher = await WaytrixVouchers.findOne({ _id, active: true });
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found or not active' });
        }

        // Log voucher email
        console.log('Voucher Email:', voucher.email);

        // Search for the customer's points
        const customer = await WaytrixGame.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Search for customer's email
        const user = await WaytrixUser.findOne({ _id: customerId });
        console.log(user);
        if (redeemKey != user.redeemKey) {
            return res.status(404).json({ message: 'User not authorized, wrong redeem key' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log customer email
        console.log('Customer Email:', user.email);
        console.log('pointsssssssssss: ', customer.points);
        // Check if the customer has enough points to redeem the voucher
        if (customer.points < voucher.pointsCost) {
            return res.status(400).json({ message: 'Insufficient points to redeem voucher' });
        }

        // Update customer's points
        customer.points -= voucher.pointsCost;
        await customer.save();

        // Decrement quantity of voucher
        voucher.Quantity -= 1;
        if (voucher.Quantity === 0) {
            voucher.active = false;
        }
        await voucher.save();

        // Update voucherNum for the restaurant
        const restoUser = await WaytrixUser.findOne({ _id: restoId });
        if (restoUser) {
            if (restoUser.voucherNum === undefined) {
                restoUser.voucherNum = 1;
            } else {
                restoUser.voucherNum += 1;
            }
            await restoUser.save();
        } else {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Send professional emails
        const transporter = nodemailer.createTransport({
            service: 'yahoo',
            auth: {
                user: 'pierreghoul@yahoo.com',
                pass: 'nsxmtrpmakdzduar'
            }
        });

        const mailOptions = {
            from: 'pierreghoul@yahoo.com',
            to: [voucher.email, user.email, 'superadmin@gmail.com'],
            subject: 'Voucher Redeemed Successfully',
            html: `
        <div style="background-color: #000; color: #fff; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fff;">
            <div style="border-bottom: 2px solid #fff; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="color: #fff;">Voucher Redeemed Successfully</h1>
            </div>
            <p style="color: #fff;">Dear <strong>${user.name}</strong>,</p>
            <p style="color: #ccc;">Congratulations! You have successfully redeemed your voucher for <strong>${voucher.name}</strong>.</p>
            <p style="color: #fff;">Voucher owner email: <strong>${voucher.email}</strong></p>
            <div style="border-top: 2px solid #fff; padding-top: 10px; margin-top: 20px;">
                <p style="color: #fff;">For any inquiries, please contact us at <strong>waytrix@gmail.com</strong>.</p>
                <p style="color: #ccc;">Winner contact info:</p>
                <p style="color: #fff;">Email: <strong>${user.email}</strong></p>
                <p style="color: #fff;">Phone: <strong>${user.phone}</strong></p>
            </div>
            <div style="margin-top: 30px;">
                <p style="color: #ccc;">Best regards,</p>
                <p style="color: #fff;"><strong>Waytrix</strong></p>
            </div>
        </div>
    `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).json({ message: 'Voucher redeemed successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



const GetAllVouchers = async (req, res) => {
    console.log(req.body)
    try {
        const { restoId } = req.body;
        const vouchers = await WaytrixVouchers.find({ restoIdArray: restoId, active: true });
        
        console.log(vouchers);
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch active vouchers', error: error.message });
    }
};

const AddVoucher = async (req, res) => {
    const { name, description, image, pointsCost, Quantity, email, restoIdArray } = req.body;
    
    try {
        const newVoucher = new WaytrixVouchers({
            name,
            description,
            image,
            pointsCost,
            Quantity,
            email,
            restoIdArray,
            active:true
        });

        await newVoucher.save();

        res.status(201).json({ message: 'Voucher added successfully', voucher: newVoucher });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add voucher', error: error.message });
    }
};


const getTotalPoints = async (req, res) => {
    const { customerId } = req.body;

    if (!customerId) {
        return res.status(400).json({ error: 'customerId is required' });
    }

    try {
        const points = await WaytrixGame.find({ customerId }).select('points');
        res.status(200).json(points);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching points' });
    }
}


const AddSurvey = async (req, res) => {
    const { foodQuality, serviceQuality, staffFriendliness, valueForMoney, restaurantCleanliness, restaurantDesign, wayTrixService, additionalComments, name, phone, tableId } = req.body;

    // Check if all required fields are present
    if (!foodQuality || !serviceQuality || !staffFriendliness || !valueForMoney || !restaurantCleanliness || !restaurantDesign || !wayTrixService || !additionalComments || !name || !phone || !tableId) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number
    if (isNaN(phone)) {
        return res.status(400).json({ message: 'Phone number must be a number' });
    }

    try {
        // Search WaytrixUser for tableId
        const user = await WaytrixUser.findOne({ _id: tableId });

        // Check if user found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract restoId from user
        const restoId = user.restoId;

        // Create a new survey instance
        const survey = new WaytrixSurvey({
            foodQuality,
            serviceQuality,
            staffFriendliness,
            valueForMoney,
            restaurantCleanliness,
            restaurantDesign,
            wayTrixService,
            additionalComments,
            name,
            phone,
            restoId,
        });

        // Save the survey to the database
        await survey.save();

        // Respond with success message
        res.status(201).json({ message: 'Survey added successfully' });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to add survey' });
    }
};

const GetAllSurveys = async (req, res) => {
    try {
        // Extract restoId from req.body
        const { restoId } = req.body;

        // Find surveys with matching restoId in the database
        const surveys = await WaytrixSurvey.find({ restoId });

        // Respond with the surveys array
        res.status(200).json(surveys);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve surveys' });
    }
};
const DeletePartner = async (req, res) => {
    const { _id } = req.body;
   

    try {
        const partner = await WaytrixPartners.findOne({ _id });
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        await WaytrixPartners.deleteOne({ _id });
        res.status(200).json({ message: 'Partner deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete partner' });
    }
};
const GetAllPartners = async (req, res) => {
    try {
        const partners = await WaytrixPartners.find();
        res.status(200).json(partners);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch partners' });
    }
};
const AddPartner = async (req, res) => {
    const { logo, name, phone, description, password, role,restoIdArray } = req.body;
    console.log("hferuifhiuerguiergihiiiiiiiiiiiiiiiiiiii")
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPartner = new WaytrixPartners({
            role,
            logo,
            name,
            phone,
            description,
            restoIdArray,
            password: hashedPassword
        });
        await newPartner.save();
        res.status(201).json({ message: 'Partner added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add partner' });
    }
}

const GetContactUs = async (req, res) => {
    const { restoId } = req.body;
  try {
    const contacts = await WaytrixContactUs.find({ restoId: restoId });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const ContactUs = async (req, res) => {
    const { Name, Phone, Text, tableId } = req.body;

    if (!Name || !Phone || !Text || !tableId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Search for the user with the provided tableId
        const user = await WaytrixUser.findOne({ _id: tableId });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const { restoId } = user;

        const newContact = new WaytrixContactUs({
            Name,
            Phone,
            Text,
            restoId
        });

        await newContact.save();
        res.status(201).json({ message: 'Contact information saved successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving contact information.', error });
    }
}

module.exports = {ContactUs,GetContactUs,UserRedeemInfo,AddPartner,GetAllPartners,Redeem,AddPoints,GetAllVouchers, DeletePartner, AddSurvey, GetAllSurveys, getTotalPoints, AddVoucher}