module.exports = (router) => {
    router.get('/:max_num?', require('./recent'));
};
