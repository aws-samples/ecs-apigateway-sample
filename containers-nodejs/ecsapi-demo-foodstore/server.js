// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT

'use strict';

// Require
const express = require('express')
const AWS = require('aws-sdk')

// Constants
const PORT = 8080
const DynamoDBTable = process.env.DynamoDBTable
const dynamodbDocumentClient = new AWS.DynamoDB.DocumentClient()
const app = express()

// Express app to ue JSON
app.use(express.json())

// PUT Route
app.put('/foodstore/foods/:foodId', (req, res, next) => {

    var foodId = req.params.foodId
    var elData = req.body

    if( 'foodId' in elData && elData.foodId != foodId ){
        return next({ status: 400, message: "foodId in path is different from foodId in payload" })
    }

    elData.foodId = foodId
    var params = {
        Item: elData, 
        TableName: DynamoDBTable
    }

    dynamodbDocumentClient.put(params, (err, data) => {
        if (err) next(err)
        else res.status(200).json( params.Item )
    })

})

// GET Route
app.get('/foodstore/foods/:foodId', (req, res, next) => {
    
    var foodId = req.params.foodId
    var params = {
        Key: { "foodId": foodId }, 
        TableName: DynamoDBTable
    }

    dynamodbDocumentClient.get(params, (err, data) => {
        if (err) next(err)
        else res.status(200).json( data.Item || {} )
    })

})

// Handle generic error 
app.use((err, req, res, next) => {
    console.log(err)
    res.status( err.status || err.statusCode|| 500 ).json({ message: err.message })
})

// Handle 404 error
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not found' })
})

// Express app to listen
app.listen( PORT, () => console.log(`Foodstore container listening on port ${PORT}!`) )