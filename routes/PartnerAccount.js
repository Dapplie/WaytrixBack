const express = require('express');
const { WaytrixAuth } = require('../middleware/Auth');
const { partner_get_resto_account, get_total_video_num, get_partners,  get_all_restaurants_for_a_specific_partner, num_of_videos_in_each_resto_per_day, num_of_vouchers_collected_resto_specific } = require('../controllers/PartnerAccount');
const { PartnerAuth } = require('../middleware/PartnerAuthMiddleware');

const PartnerAccountRouter = express.Router();
// num_of_vouchers_collected_resto_specific
PartnerAccountRouter.get('/partner_get_resto_account',WaytrixAuth, partner_get_resto_account);
PartnerAccountRouter.post('/get_total_video_num',PartnerAuth, get_total_video_num);
PartnerAccountRouter.get('/get_partners',WaytrixAuth, get_partners);
PartnerAccountRouter.post('/get_all_restaurants_for_a_specific_partner',PartnerAuth, get_all_restaurants_for_a_specific_partner);
PartnerAccountRouter.post('/num_of_videos_in_each_resto_per_day', num_of_videos_in_each_resto_per_day);
PartnerAccountRouter.post('/num_of_vouchers_collected_resto_specific', num_of_vouchers_collected_resto_specific);




module.exports = PartnerAccountRouter;
