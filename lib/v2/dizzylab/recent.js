// 导入必要的模组
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { max_num = 20 } = ctx.params;
    const baseUrl = 'https://dizzylab.net';

    const { data } = await got(`${baseUrl}/apis/getdiscs`, {
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            l: 0,
            r: max_num,
            sort: 'ad',
        },
    });

    const items = data.discs.map((item) => {
        let desc = `<div align="center" style="padding: 8px"><p><img src="${item.cover}" width=300em></p>`;
        desc += `<a href="${baseUrl}/d/${item.id}">${item.title}</a><br>`;
        desc += `<a href="/l/${item.label}">@${item.label}</a><br>`;
        desc += `<span>${item.tags.map((tag) => `<a href="/tags/?tag=${tag}">#${tag}</a>`).join(', ')}</span><br>`;
        desc += item.price > 0 ? `Price: ¥${item.price}` : 'Free';
        desc += '</div>';
        return {
            title: item.title,
            link: `${baseUrl}/d/${item.id}`,
            description: desc,
            author: item.label,
        };
    });

    ctx.state.data = {
        title: `Dizzylab - Recent`,
        description: 'We make something just for fun.',
        link: baseUrl,
        item: items,
    };
};
