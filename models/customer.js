const mongoose = require('mongoose')
const Joi = require('joi')


// FOR REFERENCING DOCUMENTS NORMALIZATION
// const Customer = new mongoose.model('customer', new mongoose.Schema({
//     name: {type: String, required: true,minLength:5, maxLength:50},
//     phone: {type: String, required: true,minLength:5, maxLength:50},
//     isGold: {type: Boolean, default: false}

// }))

// FOR EMBEDDING DOCUMENTS DENORMALIZATION
const customerSchema = new mongoose.Schema({
    name: {type: String, required: true,minLength:5, maxLength:50},
    phone: {type: String, required: true,minLength:5, maxLength:50},
    isGold: {type: Boolean, default: false}
})

const Customer = new mongoose.model('customer', customerSchema)


function validateCustomer(customer){
    const schema={
        name: Joi.string().min(3).required(),
        phone: Joi.string().min(3).required(),
        isGold: Joi.boolean()
    }
    return Joi.validate(customer, schema)
}

exports.Customer = Customer
exports.customerSchema = customerSchema
exports.validate = validateCustomer