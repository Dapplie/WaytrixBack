
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
    const { customerId, redeemName } = req.body;

    try {
        const { ObjectId } = require('mongodb');

        // Find the user by customerId
        const user = await WaytrixUser.findOne({ _id: new ObjectId(customerId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Automatically use the customer's email
        const redeemEmail = user.email;

        // Generate a 6-digit redeem key (optional, for internal use only)
        const redeemKey = Math.floor(100000 + Math.random() * 900000).toString();

        // Update redeem information
        user.redeemName = redeemName;
        user.redeemKey = redeemKey; // Optional field

        await user.save();

        // Send email with confirmation (if needed, customize text)
        const transporter = nodemailer.createTransport({
            service: 'yahoo',
            auth: {
                user: 'pierreghoul@yahoo.com',
                pass: 'nsxmtrpmakdzduar'
            }
        });

        const mailOptions = {
            from: 'pierreghoul@yahoo.com',
            to: redeemEmail,
            subject: 'Redemption Successful',
            text: `Hello ${user.name}, you can now redeem vouchers using your Waytrix account.`
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

const Redeem = async (req, res) => {
    const { _id, customerId, restoId } = req.body;

    try {
        // Search for the voucher
        const voucher = await WaytrixVouchers.findOne({ _id, active: true });
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found or not active' });
        }

        // Fetch customer and user details
        const customer = await WaytrixGame.findOne({ customerId });
        const user = await WaytrixUser.findOne({ _id: customerId });

        if (!customer || !user) {
            return res.status(404).json({ message: 'Customer or user not found' });
        }

        // Check if the customer has enough points
        if (customer.points < voucher.pointsCost) {
            return res.status(400).json({ message: 'Insufficient points to redeem voucher' });
        }

        // Deduct points and update customer details
        customer.points -= voucher.pointsCost;
        await customer.save();

        // Reduce voucher quantity
        voucher.Quantity -= 1;
        if (voucher.Quantity === 0) {
            voucher.active = false;
        }
        await voucher.save();

        // Update restaurant's voucher count
        const restoUser = await WaytrixUser.findOne({ _id: restoId });
        if (restoUser) {
            restoUser.voucherNum = (restoUser.voucherNum || 0) + 1;
            await restoUser.save();
        } else {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Send notification emails
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
                <div style="background-color: #000; color: #fff; padding: 20px; border: 1px solid #fff;">
                    <h1 style="color: #fff;">Voucher Redeemed Successfully</h1>
                    <p>Dear ${user.name},</p>
                    <p>Congratulations! You have successfully redeemed the voucher for <strong>${voucher.name}</strong>.</p>
                    <p>Voucher owner's email: ${voucher.email}</p>
                    <p>Your contact information:</p>
                    <p>Email: ${user.email}</p>
                    <p>Phone: ${user.phone}</p>
                    <p>Thank you for using Waytrix!</p>
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
};






const getCustomerSpinDate = async (req, res) => {
    const { customerId } = req.body;

    // Check if customerId is provided
    if (!customerId) {
        return res.status(400).json({ error: 'customerId is required' });
    }

    try {
        // Fetch customer's name from WaytrixUser model
        const user = await WaytrixUser.findById(customerId).select('name');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch lastTimeSpinned from WaytrixGame model
        const pointsData = await WaytrixGame.findOne({ customerId }).select('lastTimeSpinned');

        // Check if pointsData exists
        if (!pointsData) {
            // No WaytrixGame object exists for this customerId, return name with lastTimeSpinned = 1
            return res.status(200).json({
                name: user.name,
                lastTimeSpinned: "1"
            });
        }

        // Check if lastTimeSpinned is at least 24 hours old
        const currentTime = new Date();
        const lastSpinnedTime = new Date(pointsData.lastTimeSpinned);
        const hoursDifference = (currentTime - lastSpinnedTime) / (1000 * 60 * 60);

        res.status(200).json({
            name: user.name,
            lastTimeSpinned: hoursDifference >= 24 ? "1" : "0"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
};

const getPartnersByRestoId = async (req, res) => {
    const { restoId } = req.body;

    // Validate that restoId is provided
    if (!restoId) {
        return res.status(400).json({ error: 'restoId is required' });
    }

    try {
        // Fetch partners with the given restoId in their restoIdArray
        const partners = await WaytrixPartners.find({ restoIdArray: restoId });

        // If no partners are found, return a message indicating no matches
        if (!partners.length) {
            return res.status(404).json({ message: 'No partners found with the provided restoId' });
        }

        // Return the matching partners
        res.status(200).json(partners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching partners' });
    }
};







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

        // Save the new contact message
        const newContact = new WaytrixContactUs({
            Name,
            Phone,
            Text,
            restoId
        });

        await newContact.save();

        // Retrieve the restaurant email using restoId
        const restoUser = await WaytrixUser.findOne({ _id: restoId });

        if (!restoUser) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        const restaurantEmail = restoUser.email; // Get the restaurant's email

        // Send email notification to the restaurant's email
        const transporter = nodemailer.createTransport({
            service: 'yahoo',
            auth: {
                user: 'pierreghoul@yahoo.com',  // Replace with your email
                pass: 'nsxmtrpmakdzduar'        // Replace with your email password
            }
        });

        const mailOptions = {
            from: 'pierreghoul@yahoo.com',
            to: restaurantEmail,  // Send to the restaurant's email
            subject: 'New Contact Us Submission',
            html: `
            <h3>New Contact Us Submission</h3>
            <p><strong>Name:</strong> ${Name}</p>
            <p><strong>Phone:</strong> ${Phone}</p>
            <p><strong>Message:</strong> ${Text}</p>
            <p><strong>Restaurant ID:</strong> ${restoId}</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
                return res.status(500).json({ message: 'Error sending email.' });
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(201).json({ message: 'Contact information saved and email sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving contact information.', error });
    }
};

module.exports = {ContactUs,GetContactUs,UserRedeemInfo,AddPartner,GetAllPartners,Redeem,AddPoints,GetAllVouchers, DeletePartner, AddSurvey, GetAllSurveys, getTotalPoints, AddVoucher, getCustomerSpinDate, getPartnersByRestoId}