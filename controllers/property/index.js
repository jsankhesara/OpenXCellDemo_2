'use strict';

const express = require('express');
const controller = require('../property/property.controller');
const { upload } = require('../../utils/multer');

const router = express.Router();

router.post('/addProperty',upload.array('image'),controller.addProperty);
router.post('/addFavourite',controller.addFavourite);
router.post('/getPropertyList',controller.getPropertyList);

module.exports = router;