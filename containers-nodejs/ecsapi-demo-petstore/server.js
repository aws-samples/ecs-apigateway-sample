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
app.put('/petstore/pets/:petId', (req, res, next) => {

    var petId = req.params.petId
    var elData = req.body

    if( 'petId' in elData && elData.petId != petId ){
        return next({ status: 400, message: "petId in path is different from petId in payload" })
    }

    elData.petId = petId
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
app.get('/petstore/pets/:petId', (req, res, next) => {
    
    var petId = req.params.petId
    var params = {
        Key: { "petId": petId }, 
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
app.listen( PORT, () => console.log(`Petstore container listening on port ${PORT}!`) )