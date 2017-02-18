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
// service.get('http://rmt.me/manga', console.log);

// rmt exposed API tests:
// var rmt = require('./main').default;
// console.log(Object.keys(rmt));
// var callback = () => {};
// var callback = console.log;

// getDetails - doesn't work.
// rmt.getDetails('onepunch-man').then(callback); // returns a huge index page.

// getManga - calls CB with list.
// rmt.getManga(callback); // returns a huge index page.

// getPages - calls CB with list.
// rmt.getPages('onepunch-man', 0).then(callback); // returns 19.

// getImages
// rmt.getImages('onepunch-man', 0);

//getChapters
// rmt.getChapters('onepunch-man').then(callback);

//getPopular
// rmt.getPopular().then(callback);

// //getLatest
// rmt.getLatest().then(callback);
