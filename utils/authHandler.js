let jwt = require('jsonwebtoken')
let userModel = require('../schemas/users')

module.exports = {
    checkLogin: function (req, res, next) {
        try {
            let authorizationToken = req.headers.authorization;
            if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
                res.status(403).send({
                    message: "ban chua dang nhap"
                })
                return;
            }
            let token = authorizationToken.split(' ')[1];
            let result = jwt.verify(token, 'HUTECH');
            if (result.exp > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send({
                    message: "ban chua dang nhap"
                })
            }
        } catch (error) {
            res.status(403).send({
                message: "ban chua dang nhap"
            })
            return;
        }
    },

    checkRoleAuthorization: function (allowedRoles) {
        return async function (req, res, next) {
            try {
                let authorizationToken = req.headers.authorization;
                if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
                    res.status(403).send({
                        message: "ban chua dang nhap"
                    })
                    return;
                }
                let token = authorizationToken.split(' ')[1];
                let result = jwt.verify(token, 'HUTECH');
                if (result.exp <= Date.now()) {
                    res.status(403).send({
                        message: "token het han"
                    })
                    return;
                }
                
                let user = await userModel.findById(result.id).populate('role');
                if (!user) {
                    res.status(403).send({
                        message: "khong tim thay user"
                    })
                    return;
                }

                let roleName = user.role?.name?.toLowerCase();
                if (!allowedRoles.map(r => r.toLowerCase()).includes(roleName)) {
                    res.status(403).send({
                        message: "ban khong co quyen truy cap"
                    })
                    return;
                }

                req.userId = result.id;
                req.userRole = roleName;
                next();
            } catch (error) {
                res.status(403).send({
                    message: "loi xac thuc: " + error.message
                })
                return;
            }
        }
    }
}