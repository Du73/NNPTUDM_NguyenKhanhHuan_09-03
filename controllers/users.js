var express = require("express");
let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')

module.exports = {
    CreateAnUser: async function (username, password,
        email, role, fullName, avatarUrl, status
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status

        });
        await newItem.save();
        return newItem;
    },
    FindByID: async function (id) {
        return await userModel
            .findOne({
                _id: id,
                isDeleted: false 
            });
    },
    FindByUsername: async function (username) {
        return await userModel.findOne(
            {
                username: username,
                isDeleted: false
            }
        )
    },
    getAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false }).
            populate({ path: 'role', select: 'name' })
        return users;
    },
    changePassword: async function (userId, oldPassword, newPassword) {
        try {
            let user = await userModel.findById(userId);
            if (!user) {
                throw new Error("Không tìm thấy user");
            }
            
            // Kiểm tra mật khẩu cũ
            let isValidPassword = bcrypt.compareSync(oldPassword, user.password);
            if (!isValidPassword) {
                throw new Error("Mật khẩu cũ không chính xác");
            }
            
            // Hash mật khẩu mới
            user.password = newPassword;
            await user.save();
            
            return {
                message: "Đổi mật khẩu thành công",
                success: true
            };
        } catch (error) {
            throw error;
        }
    }
}
