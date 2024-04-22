var mongoose = require('mongoose');
var blobSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  isDone: {type: Boolean, default: false},
  startDate: { type: Date, default: Date.now },
  finishDate: { type: Date, default: null },
  active: {type: Boolean, default: true},
  users: [String]
});
mongoose.model('Project', blobSchema);