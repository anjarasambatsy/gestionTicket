const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    R_ID: { type: mongoose.Schema.Types.Number, ref: 'Role', required: true },
    Name: { type: String, required: true },
    Email: { type: String, required: true, unique: true, maxlength: 50 },
    Password: { type: String,
              required: true,
              min: [6, "mot de passe doit etre au moins 6 caracteres"],
              max: 12, 
              maxlength: 100 }, // Augmenté à 100
});

userSchema.plugin(AutoIncrement, { inc_field: 'U_ID' });

module.exports = mongoose.model('User', userSchema);