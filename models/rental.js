const mongoose = require('mongoose')
const Joi = require('joi')

const rentalSchema= new mongoose.Schema({
    customer:{  
        type: new mongoose.Schema({
            name: {type: String, required: true,minLength:5, maxLength:50},
            phone: {type: String, required: true,minLength:5, maxLength:50},
            isGold: {type: Boolean, default: false}
        }),
        required: true
    },
    course:{
        type : new mongoose.Schema({
            name: {type: String, required: true,minLength:5, maxLength:50},
            quantity: {type: Number, required: true, min: 0, max: 255},
           
        }),
        required: true
    },
    dateOut: {type: Date, required: true, default: Date.now},
    dateReturned: {type: Date},
    rentalFee: {type: Number, min: 0}
})

const Rental = new mongoose.model('rental', rentalSchema)

function validateRental(rental){
    const schema={
        customerId: Joi.objectId().required(),
        courseId: Joi.objectId().required()
    }
    return Joi.validate(rental, schema)
}


exports.rentalSchema = rentalSchema
exports.Rental = Rental
exports.validateRental = validateRental

