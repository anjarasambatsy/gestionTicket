const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ticketSchema = new mongoose.Schema({
  U_ID: { type: Number, ref: 'User',required: true },
  T_Code: { type: String, required: true },
  Titre: { type: String, required: true },
  Detail: { type: String, required: true },
  Date: { type: Date, default: Date.now },
  activation: { type: Boolean, default: true },
});
ticketSchema.plugin(AutoIncrement, { inc_field: 'T_ID' });
const Ticket = mongoose.model('Ticket', ticketSchema);


module.exports = Ticket;