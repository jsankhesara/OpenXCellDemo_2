const Property = require('../../models/property.model');
var resHandlerService = require('../../services/resHandler.service');
var mongoose = require("mongoose");
var config = require('../../utils/config');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

exports.addProperty = async function (req, res) {
    try {
        let property = new Property({
            propertyName: req.body.propertyName,
            description: req.body.description,
            area: req.body.area,
            price: req.body.price,
            bed_room: req.body.bed_room,
            bath: req.body.bath,
            carpet_Area: req.body.bed_room
        });
        Property.create(property, async function (err, propertyData) {
            if (err) {
                resHandlerService.handleError(res, "Something went wrong while creating property");
                return;
            } else {
                if (req.files) {
                    const property_dir = path.join("public/property_image", req.body.propertyName);
                    if (!fs.existsSync(property_dir)) {
                        fs.mkdirSync(property_dir);
                    }
                    let query = { _id: propertyData._id };
                    req.files.forEach(async function (f) {
                        const pathToFile = path.join("public/property_image", f.filename)
                        const pathToNewDestination = path.join("public/property_image", req.body.propertyName, f.filename)

                        fs.copyFile(pathToFile, pathToNewDestination, function (err) {
                            if (err) {
                                resHandlerService.handleError(res, "File not copied !!!");
                                return;
                            } else {
                                sharp(req.files[0].path).resize(200, 200).toFile(`public/property_image/${req.body.propertyName}/` + 'Thumb_-' + req.files[0].filename,async (err, resizeImage) => {
                                    if (err) {
                                        resHandlerService.handleError(res, "Thumbnail image not created !!");
                                        return;
                                    } else {
                                        let imageObj = {
                                            imageName: f.filename,
                                            thumbnailImageName: 'Thumb_' + f.filename
                                        }
                                        const updateCommentData = { $push: { "property_images": imageObj } }
                                        await Property.updateOne(query, updateCommentData).exec();
                                        if (fs.existsSync(pathToFile)) {
                                            fs.unlinkSync(pathToFile);
                                        }
                                    }
                                })
                            }
                        })
                    })
                }
                resHandlerService.handleResult(res, propertyData, "Property added successfully");
            }
        });
    } catch (error) {
        console.error(error);
    }
}

exports.addFavourite = async function (req, res) {
    var this_property = await Property.findOne({ _id: req.body.property_id });
    if (!this_property) {
        resHandlerService.handleError(res, "Property not found !!");
        return;
    }
    let query = { _id: req.body.property_id };
    const updateProperty = { isFavourite: true };
    Property.updateOne(query, updateProperty, function (err, data) {
        if (err) {
            resHandlerService.handleError(res, "Something went wrong while updating property");
        } else {
            resHandlerService.handleResult(res, "", "Property added as favourite");
        }
    });
}

exports.getPropertyList = async function (req, res) {
    let searchText = new RegExp(req.body.searchText, 'i');
    let fetchProperty = await Property.aggregate([
        {
            "$match": {
                "$or": [
                    { "area": searchText },
                    { "price": req.body.searchText},
                    { "bed_room": req.body.searchText },
                    { "bath": req.body.searchText },
                ]
            },
        },
        { "$sort": { create_date: -1 } },
        { "$limit": req.body.limit ? req.body.limit : 5 },
        { "$skip": req.body.skip > 0 ? ((req.body.skip - 1) * req.body.limit) : 0 },
    ]);
    const finalArray = [];
    fetchProperty.map((element) => {
        if (element.property_images.length > 0) {
            element.property_images.map((ele) => {
                if (ele.imageName) {
                    ele.imageName = config.server_path + config.defaultImageUploadPath + "/" + element.propertyName + "/" + ele.imageName
                    ele.thumbnailImageName = config.server_path + config.defaultImageUploadPath + "/" + element.propertyName + "/" + ele.thumbnailImageName
                }
            })
            finalArray.push(element);
        } else {
            finalArray.push(element);
        }
    })
    resHandlerService.handleResult(res, finalArray, "Property list");
}