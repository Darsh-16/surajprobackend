const mongoose = require("mongoose")

const newMedicineListSchemaa = new mongoose.Schema({

    Name: {
        type: String,
    },
    BSE_code: {
        type: String,
    },
    NSE_code: {
        type: String,
    },
    Industry: {
        type: String,
    },
    Current_Price: {
        type: String,
    },
    Market_Capitalization: {
        type: String,
    }

}, {
    timestamps: true
});
exports.newMedicineListSchemaa = mongoose.model('newmedicinelist', newMedicineListSchemaa);


