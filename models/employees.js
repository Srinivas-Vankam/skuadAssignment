const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var geoSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    geography: {
        type: Array,
        required: true
    },
    contractType: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
var Geodata = mongoose.model('geodata', geoSchema);

module.exports = Geodata;