// DataBase Connection
const mongoose = require("mongoose")
mongoose.set("strictQuery", true)
// mongoose.connect("mongodb://127.0.0.1:27017/bulkmedicine", {
    mongoose.connect("mongodb+srv://rikcapital:rikcapital@rikcapital.eb7pg.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connection successfully"))
    .catch((err) => console.log("Connection Unseccessfully"))