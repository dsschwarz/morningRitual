var mongoose = require('mongoose');
var Promise = require('promise');

var userSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: String
});
var User = mongoose.model('User', userSchema);

var UserService = function () {
    this.createUser = function (username, password, email) {
        var user = new User({
            username: username,
            password: password,
            email: email
        });
        return user.save();
    };

    /**
     * Validate a username and password
     * @param username
     * @param password
     * @return {boolean} True if username/pw is valid
     */
    this.validate = function (username, password) {
        return User.findOne({
            username: username,
            password: password
        }).exec().then(function (user) {
            return Promise.resolve(!!user);
        });
    };

    this.getUserByUsername = function (username) {
        return User.findOne({username: username })
            .select('-password')
            .exec();
    };

    this.getUserById = function (id) {
        return User.findById(id)
            .select('-password')
            .exec();
    };
    return this;
};

module.exports = UserService;