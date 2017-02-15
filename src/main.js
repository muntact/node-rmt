import fs from 'fs';

import * as services from './service';
import $ from 'cheerio';

const mangaFox = {};
const MANGA_FOX = 'http://mangafox.me';

// A common reduce helper for functions which getLists.
const getSelectedListFromUrl = (url, cacheFile, selector) => {
	return services.get(url, cacheFile)
		.then((data) => {
			debugger;
			const list = {};
			data.find(selector)
				.each((index, element) => {
					const b = $(element);
					// if (index < 10) {
					// 	console.log('original', b.text());
					// 	console.log('fixed', mangaFox.fixTitle(b.text()));
					// }
					list[mangaFox.fixTitle(b.text())] = { id: b.attr('rel'), title: b.text() };
				});
			// abstract this to a cache seeding function.
			// fs.writeFileSync('/Users/murrayl/projects/github/node-mangafox/data/cache/db.json', JSON.stringify(list));
			return list;
		});
};

//Gets info about a manga
// DEPRECATED ?
mangaFox.getDetails = (sid, callback = () => {}) => {
	services.post(`${MANGA_FOX}/ajax/series.php`, { sid }, (data) => {
		try {
			data = JSON.parse(data);
		} catch(err){
			console.warn(err);
		};
		(callback)(data);
	});
}

//Gets all available manga titles
// mangaFox.getManga = (callback = () => {}) =>
// 	getSelectedListFromUrl(`${MANGA_FOX}/manga/`, callback, '.manga_list li a');
mangaFox.getManga = (callback = () => {}) =>
	getSelectedListFromUrl(`${MANGA_FOX}/manga/`, 'manga.html', '.manga_list li a')
		.then(callback);

//Get the number of pages in a chapter
mangaFox.getPages = (manga, ch) => {
	return services.get(`${MANGA_FOX}/manga/${mangaFox.fixTitle(manga)}/c${mangaFox.pad(ch,3)}/1.html`)
	 	.then((data) => (data.find('.l option').length - 2) / 2);
};

//Get the urls for page images
// TODO: review how this should be done.
mangaFox.getImages = (manga, ch) => {
	return mangaFox.getPages(manga, ch)
	 	.then((num) => {
			// const data = [];
			let numPageRequestsToBeReturned = num;

			const temp = (n) => {
				return services.get(`${MANGA_FOX}/manga/${mangaFox.fixTitle(manga)}/c${mangaFox.pad(ch, 3)}/${n}.html`)
					.then((d) => {
            // data[n-1] = d.find('#viewer img').attr('src');
						return Promise.resolve(d.find('#viewer img').attr('src'));
					});
			};

			const promises = [];


			for(var i = 1; i <= 5; i++){
				promises.push(temp(i));
        numPageRequestsToBeReturned--;
        console.log(promises);
			}
			Promise.all(promises)
				.then((data) => {
          debugger;
					console.log('le-fin', data);
				})
        .catch((data) => {
          console.log('le-fail', data);
        });
		});

};

//Gets the number of available chapters
mangaFox.getChapters = (manga, callback = () => {}) => {
	services.get(`${MANGA_FOX}/manga/${mangaFox.fixTitle(manga)}`, (data) => {
		callback($(d.find('.chlist .tips')[0]).text().replace(/\D/g,''));
	}, true);
};

//get the list of currently popular manga
mangaFox.getPopular = (callback = () => {}) =>
	getSelectedListFromUrl(MANGA_FOX, '#popular li div.nowrap a')
		.then(callback);

//get the list of latest manga
mangaFox.getLatest = (callback = () => {}) =>
	getSelectedListFromUrl(MANGA_FOX, '#new li div.nowrap a')
		.then(callback);

//makes all titles conform to the title conventions
mangaFox.fixTitle = (title) => {
	let t = title.replace(/[^a-zA-Z\d\s-]/g, '_')
		.replace(/\ /g, '_')
		.replace(/\-/g, '_').toLowerCase()
		.replace(/\___/g,'_')
		.replace(/\__/g,'_');

	if (t.substr(t.length-1) == '_'){
		t = t.substr(0, t.length-1);
	}

	if (t.substr(0, 1) == '_'){
		t = t.substr(1);
	}
	return t;
};

//pads single digit numbers to ther xxx equivalent
mangaFox.pad = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

export default mangaFox;
