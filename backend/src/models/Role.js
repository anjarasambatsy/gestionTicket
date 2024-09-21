const mongoose = require ('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roleSchema = new mongoose.Schema({
    Titre: {
        type: String,
        enum: ['Utilisateur', 'Administrateur','Techinicien'],
        default: 'Administareur',
      },
}); 

roleSchema.plugin(AutoIncrement, { inc_field: 'R_ID' });

module.exports = mongoose.model('Role', roleSchema);