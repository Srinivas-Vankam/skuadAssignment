const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Geodata = require('../models/employees');
const jsonData = require('./sample.json')

const geoRouter = express.Router();

geoRouter.use(bodyParser.json());

geoRouter.route('/')
.get((req,res,next) => {
    Geodata.collection.insertMany(jsonData, function(err,r) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:1});
    })
   
})
.post((req, res, next) => {
    let geo = req.body.input.geography[0]
    Geodata.aggregate(
        [
            { "$facet": {
                "consultant": [
                    { "$match" : { contractType: { $in: [ 'CONSULTANT_FIXED' ,'CONSULTANT_VARIABLE' ] } }},
                    { "$count": "consultant" },
                ],
                "employee": [
                    { "$match" : { contractType:'EMPLOYEE'} },
                    { "$count": "employee" }
                ],
                "consultantgeo": [
                    { "$match" : { contractType: { $in: [ 'CONSULTANT_FIXED' ,'CONSULTANT_VARIABLE' ] },geography:{ $in: req.body.input.geography}}},
                    { $group: { _id: '$geography', consultant: { $sum: 1 } } }
                ],
                "employeegeo": [
                    { "$match" : { contractType:'EMPLOYEE',geography:{ $in: req.body.input.geography}} },
                    { $group: { _id: '$geography', employee: { $sum: 1 } } }
                ]
            }},
            { "$project": {
                "consultant": { "$arrayElemAt": ["$consultant.consultant", 0] },
                "employee": { "$arrayElemAt": ["$employee.employee", 0] },
                "employeegeo": 1,
                "consultantgeo": 1
            }}
          ])
    .then((emp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(emp);
    }, (err) => next(err))
    .catch((err) => next(err));
})



module.exports = geoRouter;