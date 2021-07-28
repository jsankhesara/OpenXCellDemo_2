const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autopopulate = require('mongoose-autopopulate');

var schemaOptions = {
    toCourseObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: { createdAt: 'create_date', updatedAt: 'last_updated' }
};

var PropertySchema = new Schema({
    propertyName: { type: String, default: " " },
    description: { type: String, default: " " },
    area: { type: String, default: " " },
    price: { type: Number, default: 0 },
    bed_room: { type: Number, default: 0 },
    bath: { type: Number, default: 0 },
    carpet_Area: { type: String, default: " " },
    property_images: { type: Array, default: [] },
    view_count: { type: Number, default: 0 },
    isFavourite: { type: Boolean, default: false },
}, schemaOptions);

PropertySchema.plugin(autopopulate);
PropertySchema.pre('save', function (next) { this.last_updated = new Date(); if (!this.isNew) { return next(); } next(); });

module.exports = mongoose.model('Property', PropertySchema);