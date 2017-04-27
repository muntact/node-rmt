import fs from 'fs';

import $ from 'cheerio';
import R from 'ramda';

import * as services from './service';

const rmt = {};
const RMT = 'http://www.readmanga.today/';


// A common reduce helper for functions which getLists.
const getSelectedListFromUrl = (url, cacheFile, selector, eachFunction) => {
	return services.get(url, cacheFile)
		.then((data) => {
			const list = {};
			console.log(data.find(selector).length);
			data.find(selector).each(eachFunction(list));
			return list;
		});
};

//Gets info about a manga - description
rmt.getDetails = (id) => {
	console.log('called get details for id:', id);
	// HOF wrapper for what to do when each is called on the result of the cheerio DOM selector.
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		console.log(b);
		list['description'] = b.text();
	};
	return getSelectedListFromUrl(`${RMT}/${id}`, undefined, '.movie-detail', eachFunction);
}

//Gets all available manga titles
// works but is seriously slow as its 27 requests - probably best to cache this once...
rmt.getManga = () => {
	// manga-list / a -z
	const aZ = Array(26).fill(1).map((v, i) => String.fromCharCode(97 + i));
	const listChars = [''].concat(aZ);
	// HOF wrapper for what to do when each is called on the result of the cheerio DOM selector.
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		list[b.attr('href').replace(RMT, '')] = b.text();
	};

	// Array of Promises.
	// const listPromises = listChars.map((list) =>
	const listPromises = [getSelectedListFromUrl(`${RMT}/manga-list/`, undefined, '.style-list a', eachFunction)];

	return Promise.all(listPromises)
		.then((mangaLists) => {
			return R.flatten(mangaLists);
		});
}

//Get the number of pages in a chapter
rmt.getPages = (manga, ch) => {
	// Change the wrapper function to not be an each caller?
	const eachFunction = (list) => (index, element) => {
		const text = $(element).text();
		if (!Number.isNaN(parseInt(text, 10))) list[text] = text;
	};
	return getSelectedListFromUrl(`${RMT}/${manga}/${ch}`, undefined, '.footer p a', eachFunction)
		.then((list) => Object.keys(list).length);
};

//Get the urls for page images
// TODO: review how this should be done.
rmt.getImages = (manga, ch) => {
	// view-source:http://www.readmanga.today/yamada-kun-to-7-nin-no-majo/40/all-pages

	// ... get the urls:
	// Change the wrapper function to not be an each caller?
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		list[b.attr('src').replace(RMT, '')] = index;
		console.log(b.toString())
	};
	return getSelectedListFromUrl(`${RMT}/${manga}/${ch}/all-pages`, undefined, '.content-list img', eachFunction)
		.then((list) => Object.keys(list).map((key, index) => {
			console.log(key, index);
			// TODO: fix this ... looks like i might as well use the request lib.
			services.get2(key, `${__dirname}/opm/${manga}-${ch}-${index+1}.jpg`);
		}));
};

// get image urls.
rmt.getImageUrls = (manga, ch) => {
	// view-source:http://www.readmanga.today/yamada-kun-to-7-nin-no-majo/40/all-pages

	// ... get the urls:
	// Change the wrapper function to not be an each caller?
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		list[index] = b.attr('src');
	};
	return getSelectedListFromUrl(`${RMT}/${manga}/${ch}/all-pages`, undefined, '.img-responsive-2', eachFunction);
};

//Gets the number of available chapters
rmt.getChapters = (manga) => {
	// HOF wrapper for what to do when each is called on the result of the cheerio DOM selector.
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		list[b.attr('href').replace(RMT, '').replace(manga, '')] = b.attr('href');
	};
	return getSelectedListFromUrl(`${RMT}/${manga}`, undefined, '.chp_lst li a', eachFunction);
};

//get the list of currently popular manga

rmt.getPopular = () => {
	// HOF wrapper for what to do when each is called on the result of the cheerio DOM selector.
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		list[b.attr('href').replace(RMT, '')] = b.text();
	};
	return getSelectedListFromUrl(`${RMT}/hot-manga`, undefined, '.content-list h2 a', eachFunction);
};

//get the list of latest manga
// could probably augment this to return the chapters as well.
rmt.getLatest = () => {
	// HOF wrapper for what to do when each is called on the result of the cheerio DOM selector.
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		list[b.attr('href').replace(RMT, '')] = b.text();
	};
	return getSelectedListFromUrl(`${RMT}/latest-releases`, undefined, '.content-list dt a', eachFunction);
};

//makes all titles conform to the title conventions
rmt.fixTitle = (title) => {
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
rmt.pad = (n, width, z) => {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

// TODO: move this to somewhere else.
// Actually not for the rmt site :/
rmt.lightNovels = (ch) => {
	// HOF wrapper for what to do when each is called on the result of the cheerio DOM selector.
	const eachFunction = (list) => (index, element) => {
		const b = $(element);
		if (b.attr('itemprop') === 'articleBody') {
			//	debugger;
			b.find('p').each((index,element) => {
				if ($(element).text() !== 'Previous Chapter' && $(element).text() !== 'Previous Chapter' ) {
					list.push($(element).text());
					}
			});
		}
	};
	// return getSelectedListFromUrl(`http://www.wuxiaworld.com/btth-index/btth-chapter-${ch}/`, undefined, '.articleBody ', eachFunction);
	return services.get(`http://www.wuxiaworld.com/btth-index/btth-chapter-${ch}/`, undefined)
		.then((data) => {
			console.log(`Chapter ${ch} finished`);
			const list = [`Chapter ${ch} finished`];
			data.find('div').each(eachFunction(list));
			return list.join(' ');
		});

};

export default rmt;
