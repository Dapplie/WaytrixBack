const express = require('express');
const { AddVideo, GetOneVideo, GetAllRestoAccounts, GetOneVideoPreview, getAllTablesByRestoId, get_one_for_loop_id_video_for_future_update, update_forLoopId_video_records, getTotalVideosForPartner } = require('../controllers/Video');
const { WaytrixAuth, TableAuth } = require('../middleware/Auth');

const VideoRouter = express.Router();

VideoRouter.post('/AddVideo',WaytrixAuth, AddVideo);
VideoRouter.get('/GetAllRestoAccounts',WaytrixAuth, GetAllRestoAccounts);
VideoRouter.post('/GetOneVideo',  GetOneVideo);
VideoRouter.post('/GetOneVideoPreview',WaytrixAuth, GetOneVideoPreview);
VideoRouter.post('/getAllTablesByRestoId', getAllTablesByRestoId);
// VIDEO EDITABLE BELOW
// get_one_forLoopId_of_videos_by_restoId
VideoRouter.post('/get_one_for_loop_id_video_for_future_update', get_one_for_loop_id_video_for_future_update);
VideoRouter.post('/update_forLoopId_video_records', update_forLoopId_video_records);
VideoRouter.post('/getTotalVideosForPartner', getTotalVideosForPartner);
module.exports = VideoRouter;
