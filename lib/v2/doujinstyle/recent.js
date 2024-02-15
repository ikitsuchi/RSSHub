// 导入必要的模组
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { max_page = 3, search = null } = ctx.params;
    const baseUrl = 'https://doujinstyle.com';

    let items = [];
    /* eslint-disable no-await-in-loop */
    for (let page = 0; page < max_page; page = page + 1) {
        const { data: response } = search === null ? await got(`${baseUrl}/?p=home&page=${page}`) : await got(`${baseUrl}/?p=search&source=1&type=blanket&result=${search}&page=${page}`);
        if (response === null) {
            break;
        }
        const $ = cheerio.load(response);
        items = $('span.gridBox')
            .toArray()
            .map((item) => {
                item = $(item);
                // const gridImg = item.find('div.gridImg');
                const gridDetails = item.find('div.gridDetails');
                const link = gridDetails.find('a').first();
                const match = link.attr('href').match(/id=(\d+)/);
                const id = match ? match[1] : null;
                let desc = `<p><img src="${baseUrl}/thumbs/${id}.jpg"></p>`;
                // desc += gridImg.first().first().first().html();
                desc += gridDetails.html();
                return {
                    title: link.text(),
                    link: `${baseUrl}/?p=page&type=1&id=${id}`,
                    author: gridDetails.eq(1).text(),
                    description: desc,
                };
            })
            .concat(items);
    }
    /* eslint-enable no-await-in-loop */

    ctx.state.data = {
        title: `DoujinStyle - Recent`,
        description: 'The Home of Doujin Music & Game Downloads',
        link: baseUrl,
        item: items,
    };
};
