const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true, // Prevents duplicate accounts
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] 
    },
    password: {
        type: String, 
        required: [true, 'Please add a password'],
        minlength: 6 // Basic security
    },
    dateJoined: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', UserSchema);