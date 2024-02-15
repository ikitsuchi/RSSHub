module.exports = (router) => {
    router.get('/:max_page/:search?', require('./recent'));
};
