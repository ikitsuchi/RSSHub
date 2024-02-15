// 导入必要的模组
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { max_page, search = null } = ctx.params;
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
            .map(async (item) => {
                item = $(item);
                const gridImg = item.find('div.gridImg');
                const xfd_link = gridImg.find('a.gridCol2').attr('href');

                const gridDetails = item.find('div.gridDetails');
                const album = gridDetails.find('a').eq(0);
                const artist = gridDetails.find('a').eq(1);

                const match = album.attr('href').match(/id=(\d+)/);
                const id = match ? match[1] : null;
                const info_link = `${baseUrl}/?p=page&type=1&id=${id}`;

                const formData = new FormData();
                formData.append('type', '1');
                formData.append('download_link', 'Download');
                formData.append('id', id);
                formData.append('source', '0');
                let download_link = fetch(baseUrl, {
                    method: 'POST',
                    body: formData,
                }).then((response) => {
                    if (response.url) {
                        return response.url;
                    }
                });
                download_link = await download_link;

                let desc = `<div align="center" style="padding: 8px"><p><img src="${baseUrl}/thumbs/${id}.jpg"></p>`;
                gridDetails.find('div').remove();
                desc += gridDetails.html();
                if (xfd_link) {
                    desc += `<a href=${xfd_link}> Play XFD </a><br>`;
                }
                desc += `<a href=${download_link}> Download </a>`;
                desc += '</div>';
                return {
                    title: album.text(),
                    link: info_link,
                    author: artist.text(),
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
