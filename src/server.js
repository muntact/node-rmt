import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { chapters, details, imageUrls, latest, pages, popular, mangaList } from './router';


const app = express();
const router = express.Router(); //eslint-disable-line


app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json()); // for parsing application/json

app.route('/chapters/:manga').get(chapters);
app.route('/details/:manga').get(details);
// return the URLs for images which we can then embed into the page
// Evenetually once we cache the images locally, we could use fs?
app.route('/imageUrls/:manga').get(imageUrls);
app.route('/latest').get(latest);
app.route('/pages/:manga').get(pages);
app.route('/popular').get(popular);
app.route('/mangaList').get(mangaList);


http.createServer(app).listen(3040, () => {
	console.log('manga interception server started'); //eslint-disable-line
});
