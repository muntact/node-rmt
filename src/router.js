import rmt from './main';

const respBody = (req, res, next) => (data) => {
  res.status(200).json(data);
  next();
}

function popular(req, res, next) {
  const cb = respBody(req, res, next);
  rmt.getPopular()
    .then(cb);
};

function latest(req, res, next) {
  const cb = respBody(req, res, next);
  rmt.getLatest()
    .then(cb);
};

function details(req, res, next) {
  const cb = respBody(req, res, next);
  const manga = req.params.manga;
  rmt.getDetails(manga)
    .then(cb);
};

function pages(req, res, next) {
  const cb = respBody(req, res, next);
  const manga = req.params.manga;
  const chapterNumber = req.query.ch;
  rmt.getPages(manga, chapterNumber)
    .then(cb);
};

function chapters(req, res, next) {
  const cb = respBody(req, res, next);
  const manga = req.params.manga;
  rmt.getChapters(manga)
    .then(cb);
};

function imageUrls(req, res, next) {
  const cb = respBody(req, res, next);
  const manga = req.params.manga;
  const chapterNumber = req.query.ch;
  rmt.getImageUrls(manga, chapterNumber)
    .then(cb);
};

export {
  chapters,
  details,
  imageUrls,
  latest,
  pages,
  popular,
};
