require('babel-core/register')({
  presets: ['es2015'],
});

require('./main');

module.exports = {
  main: require('./main'),
  service: require('./service')
};

// service tests:
// var service = require('./service');
// service.get('http://mangafox.me/manga', console.log);

// Mangafox exposed API tests:
var Mangafox = require('./main').default;
console.log(Object.keys(Mangafox));
// var callback = () => {};
var callback = console.log;

// getDetails - doesn't work.

// getManga - calls CB with list.
// Mangafox.getManga(callback); // returns a huge index page.

// getPages - calls CB with list.
// Mangafox.getPages('onepunch_man', 1).then(callback); // returns 19.
//
// // getImages
Mangafox.getImages('onepunch_man', 1, callback);
//
// //getChapters
// Mangafox.getChapters('onepunch_man').then(callback);
//
// //getPopular
// Mangafox.getPopular(callback);
//
// //getLatest
// Mangafox.getLatest(callback);
