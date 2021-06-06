const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        data: Buffer,
        contentType: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "client"
    }
});

userSchema.pre("save", function (next) {
    const user = this
  
    if (this.isModified("password") || this.isNew) {
      bcrypt.genSalt(10, function (saltError, salt) {
        if (saltError) {
          return next(saltError)
        } else {
          bcrypt.hash(user.password, salt, function(hashError, hash) {
            if (hashError) {
              return next(hashError)
            }
  
            user.password = hash
            next()
          })
        }
      })
    } else {
      return next()
    }
  })


module.exports = new mongoose.model('User', userSchema);