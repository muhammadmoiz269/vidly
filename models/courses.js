const mongoose = require('mongoose')
const {customerSchema} = require('./customer')

// REFERENCING DOCUMENTS NORMALIZATION
const Course = new mongoose.model('course', new mongoose.Schema({
    name: {type: String, required: true,minLength:5, maxLength:50},
    quantity: {type: Number, required: true, min: 0, max: 255},
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    }
}))

// EMBEDDING DOCUMENTS DENORMALIZATION
// const Course = new mongoose.model('course', new mongoose.Schema({
//     name: {type: String, required: true,minLength:5, maxLength:50},
//     quantity: {type: Number, required: true, min: 0, max: 255},
//     createdBy:{
//         type: customerSchema,
//         required: true,
    
//     }
// }))

// Embedding Documents with array
// const Course = new mongoose.model('course', new mongoose.Schema({
//     name: {type: String, required: true,minLength:5, maxLength:50},
//     quantity: {type: Number, required: true, min: 0, max: 255},
//     createdBy: [customerSchema]
// }))


exports.Course = Course
