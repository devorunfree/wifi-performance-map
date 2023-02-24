const mongoose = require("mongoose");


const dataSchema = new mongoose.Schema({
    time: { type: String, required: true },
    upload: { type: Number, required: true },
    download: { type: Number, required: true },
    ping: { type: Number, required: true },
    latitude: {type: Number, required: true },
    longitude:{type: Number, required: true },
    building: { type: String, required: true },
    __v: { type: Number }
});

const aggregatedSchema = new mongoose.Schema({
    time: { type: String, required: true },
    upload: { type: Number, required: true },
    download: { type: Number, required: true },
    ping: { type: Number, required: true },
    latitude: {type: Number, required: true },
    longitude:{type: Number, required: true },
    building: { type: String, required: true },
    __v: { type: Number }
});


const rawDataModel = mongoose.model("data", dataSchema);
const aggregatedDataModel = mongoose.model("aggregatedData", aggregatedSchema);

module.exports = {
    data: rawDataModel,
    aggregatedData: aggregatedDataModel
};
