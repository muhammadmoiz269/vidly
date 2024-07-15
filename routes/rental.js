const express = require('express')
const router = express.Router()
// const Fawn = require('fawn')
const mongoose = require('mongoose')
const {Rental, validateRental} = require("../models/rental")
const { Course } = require('../models/courses')
const { Customer } = require('../models/customer')


// Fawn.init(mongoose)
router.get('/', async(req, res) => {

    const rentals = await Rental.find().sort('-dateOut')
    res.send(rentals)
})


router.post('/', async(req, res) => {

    const {error} =  validateRental(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const foundCustomer = await Customer.findById(req.body.customerId)
    if(!foundCustomer) return res.status(400).send('Invalid Customer')

    const course = await Course.findById(req.body.courseId)
    if(!course) return res.status(400).send('Invalid Course')

    if(course.quantity === 0) return res.status(400).send('Course not in stock')

    const rental = new Rental({
        customer: {
            _id: foundCustomer._id,
            name: foundCustomer.name,
            phone: foundCustomer.phone
        },
        course: {
            _id: course._id,
            name: course.name,
            quantity: course.quantity
        }
       

    })

    // USING TRANSACTIONS

    // try {
    //     new Fawn.Task().save('rentals', rental).update('courses', {_id: course._id}, {
    //         $inc: {quantity: -1}
    //     }).run()
    
        
    // } catch (error) {

    //     console.log(error.message)
        
    // }
    
    // SIMPLE WAY
    const result = await rental.save() 
    course.quantity--
    await course.save()

    res.status(200).send(result)
})

module.exports = router
