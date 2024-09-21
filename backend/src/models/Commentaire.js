const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
 
const commentaireSchema = new mongoose.Schema ({
    U_ID: { type: mongoose.Schema.Types.Number, ref: 'Users', required: true },
    T_ID: { type: mongoose.Schema.Types.Number, ref: 'Ticket', required: true },
    Date_Commentaire :{
        type: Date,
        default: Date.now 
    }   
});
commentaireSchema.plugin(AutoIncrement, { inc_field: 'ID_Com' });

module.exports = mongoose.model('Commentaire', commentaireSchema);