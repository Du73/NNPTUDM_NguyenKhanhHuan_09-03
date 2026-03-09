var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let { ConvertTitleToSlug } = require('../utils/titleHandler')
let { getMaxID } = require('../utils/IdHandler')
let { checkRoleAuthorization } = require('../utils/authHandler')

// GET all products - no login required
router.get('/', async function (req, res, next) {
  let products = await productModel.find({});
  res.send(products)
});

// GET product by ID - no login required
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productModel.find({ _id: req.params.id });
    if (result.length > 0) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "id not found"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "id not found"
    })
  }
});

// POST create product - Mod & Admin
router.post('/', checkRoleAuthorization(['admin', 'mod']), async function (req, res, next) {
  try {
    let newItem = new productModel({
      title: req.body.title,
      slug: ConvertTitleToSlug(req.body.title),
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    })
    await newItem.save()
    res.send(newItem);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})

// PUT update product - Mod & Admin
router.put('/:id', checkRoleAuthorization(['admin', 'mod']), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(
      id, req.body, {
      new: true
    }
    )
    res.send(updatedItem)
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})

// DELETE product - Admin only
router.delete('/:id', checkRoleAuthorization(['admin']), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await productModel.findByIdAndUpdate(
      id, {
      isDeleted: true
    }, {
      new: true
    }
    )
    res.send(updatedItem)
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
})

module.exports = router;
