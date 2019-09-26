var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/wikidata', { useNewUrlParser: true }, function () {
  console.log('mongodb connected to wikidata!');
});

module.exports = mongoose;
