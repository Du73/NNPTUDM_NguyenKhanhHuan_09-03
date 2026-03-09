var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler')


router.post('/register', async function (req, res, next) {
  try {
    let newUser = await userController.CreateAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.role || '69a4f929f8d941f2dd234b88'
    )
    res.send(newUser)
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post('/login', async function (req, res, next) {
  let { username, password } = req.body;
  let getUser = await userController.FindByUsername(username);
  if (!getUser) {
    res.status(404).send({
      message: "username khong ton tai hoac thong tin dang nhap sai"
    })
    return;
  }
  let result = bcrypt.compareSync(password, getUser.password);
  if (result) {
    let token = jwt.sign({
      id: getUser._id,
      exp: Date.now() + 3600 * 1000
    }, "HUTECH")
    res.send({ token: token, userId: getUser._id })
  } else {
    res.status(404).send({
      message: "username khong ton tai hoac thong tin dang nhap sai"
    })
  }
});

//localhost:3000
router.get('/me', checkLogin, async function (req, res, next) {
    let user = await userController.FindByID(req.userId);
    res.send(user)
});

// Change password endpoint
router.post('/change-password', checkLogin, async function (req, res, next) {
  try {
    let { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        message: "oldPassword va newPassword la bat buoc"
      })
    }

    if (oldPassword === newPassword) {
      return res.status(400).send({
        message: "mat khau moi phai khac mat khau cu"
      })
    }

    let result = await userController.changePassword(
      req.userId, 
      oldPassword, 
      newPassword
    );
    
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;


//mongodb
