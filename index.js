const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const cors = require('cors');

const app = express();

const { newMedicineListSchemaa } = require("./model/model");
require("./db/conn");

const PORT = process.env.PORT || 1111;
const filePath = process.env.FILE_PATH || path.join(__dirname, 'uploads');

// Middleware
// app.use(cors({ origin: 'http://localhost:4200' })); // Allow CORS for Angular
// List of allowed origins
const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://rikcapital.netlify.app',
];

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/files', express.static(filePath)); // Serve uploaded files if needed

// Multer configuration
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("File destination:", filePath);
            cb(null, filePath);
        },
        filename: (req, file, cb) => {
            cb(null, "file" + Date.now() + path.extname(file.originalname));
        },  
    }),
});

// POST /bulkAdded
app.post("/bulkAdded", upload.single('csvFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({
            success: false,
            msg: "CSV file not uploaded",
        });
    }

    const jsonArray = [];
    const result = [];
    const filePath = req.file.path;

    try {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                console.log("datasss",data)
                jsonArray.push(data);
            })
            .on('end', async () => {
                for (const el of jsonArray) {
                    try {
                        const updatedData = await newMedicineListSchemaa.findOneAndUpdate(
                            { Name: el.Name },
                            { $set: el },
                            { upsert: true, new: true }
                        );

                        result.push({
                            success: true,
                            message: `Successfully processed: ${el.Name}`,
                            data: updatedData,
                        });
                    } catch (error) {
                        result.push({
                            success: false,
                            message: `Error processing: ${el.Name}`,
                            error: error.message,
                        });
                    }
                }

                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });

                res.status(200).send({
                    success: result.every((r) => r.success),
                    result,
                    message: "Medicine data processed successfully.",
                });
            })
            .on('error', (error) => {
                console.error('CSV Parsing Error:', error);
                res.status(500).send({
                    success: false,
                    message: "Error parsing CSV file.",
                    error: error.message,
                });
            });
    } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).send({
            success: false,
            message: "An unexpected error occurred.",
            error: error.message,
        });
    }
});

// GET /bulkget
app.get('/bulkget', async (req, res) => {
    const query = {};

    if (req.query.Name) query.Name = { $regex: req.query.Name, $options: "i" };
    if (req.query.BSE_code) query.BSE_code = { $regex: req.query.BSE_code, $options: "i" };
    if (req.query.NSE_code) query.NSE_code = { $regex: req.query.NSE_code, $options: "i" };

    try {
        const getData = await newMedicineListSchemaa.find(query);
        if (getData.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Data Found Successfully",
                data: getData,
            });
        } else {
            res.status(404).send({
                success: false,
                msg: "No data found",
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            msg: "Error fetching data",
            error: error.message,
        });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Server start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
