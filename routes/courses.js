const express = require('express')
const router = express.Router()

const {Customer} = require("../models/customer")
const {Course} = require('../models/courses')

router.post('/', async(req, res) => {

    // const {error} =  validate(req.body)
    // if(error) return res.status(400).send(error.details[0].message)

    // FOR REFERENCING DOCUMENTS NORMALIZATION
    const course = new Course({
        name: req.body.name,
        quantity: req.body.quantity,
        createdBy: req.body.customerId,

    })

    const result = await course.save()    
    res.status(200).send(result)
})

router.get('/', async(req, res) => {

    // here we are using association for getting data from multiple collections
    // const result = await Course.find().populate('createdBy', 'name phone -_id').select('name createdBy')  

    // get all courses
    const result = await Course.find()
    res.status(200).send(result)
})

                                // FOR DENORMALIZATION
async function createCourse(name, quantity, customer){

    const course = new Course({
        name: name,
        quantity: quantity,
        createdBy: customer
    })
    const result = await course.save()    
    console.log(result)
}

// async function updateCustomer(courseId){
    
//         const course = await Course.findById(courseId)
//         course.createdBy.name = 'Jon Smith'
//         course.save()
    
// }


                        // Create Course with array as a sub document
// async function createCourse(name, customers){

//     const course = new Course({
//         name: name,
//         createdBy: customers
//     })
//     const result = await course.save()    
//     console.log(result)
// }

// async function addCustomer(courseId, customer){

//     const course = await Course.findById(courseId)
//     course.createdBy.push(customer)
//     course.save()
//     console.log(course)

// }

// async function removeCustomer(courseId, customerId){

//     // remove method isnot working
//     const course = await Course.findById(courseId)
//     const customer = course.createdBy.id(customerId)
//     customer.remove()
//     course.save()
//     console.log(course)
// }


                            // FOR DENORMALIZATION
// createCourse('Full Stack Course', 3, new Customer({name: 'Muhammad Ahsan', phone: '12345'}))
// updateCustomer('647c448091916c70a0603c39')

                    // FOR EMBEDDING DOCUMENTS WITH ARRAY
// createCourse('Node Course', [
//     new Customer({name: 'Mosh Hamedani', phone: '12346'}),
//     new Customer({name: 'John Smith', phone: '12347'}),
//     new Customer({name: 'Mary Smith', phone: '12348'})
// ])

// addCustomer('647c674aca3b9da3d4121640', new Customer({name: 'Muhammad Moiz', phone: '12345'}))
// removeCustomer('647c674aca3b9da3d4121640','647c674aca3b9da3d412163f')
module.exports = router
