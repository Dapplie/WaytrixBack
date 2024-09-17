const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const mongoose = require('mongoose');
const WaytrixVideo = require('../models/Video'); 
const WaytrixSurvey = require('../models/Survey');
const WaytrixCar = require('../models/AddCarsValet');
const WaytrixUser = require('../models/Auth'); 
const WaytrixOrders = require('../models/Orders');

const get_survey_num_by_restoId = async (req, res) => {
    try {
        const { restoId } = req.body;
        console.log(req.body)
        if (!restoId) {
            return res.status(400).send({ message: 'restoId is required' });
        }

        const surveyCount = await WaytrixSurvey.countDocuments({ restoId });
        const carCount = await WaytrixCar.countDocuments({ restoId });

        const waiterCount = await WaytrixUser.countDocuments({ restoId, role: 'waiter' });
        const tableCount = await WaytrixUser.countDocuments({ restoId, role: 'table' });
        const valetCount = await WaytrixUser.countDocuments({ restoId, role: 'valet' });

        const user = await WaytrixUser.findOne({ _id: restoId });
        const spinCounts = user ? user.spinCounts : 0;

        const orders = await WaytrixOrders.aggregate([
            { $match: { restoId: restoId } },
            { $group: { _id: "$order", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        const mostFrequentlyRequestedOrder = orders.length > 0 ? orders[0]._id : null;

        res.send({
            surveyCount: surveyCount,
            carCount: carCount,
            waiterCount: waiterCount,
            tableCount: tableCount,
            valetCount: valetCount,
            spinCounts: spinCounts,
            mostFrequentlyRequestedOrder: mostFrequentlyRequestedOrder
        });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching counts and most frequently requested order', error });
    }
};



module.exports = { get_survey_num_by_restoId };
