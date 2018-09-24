const axios = require('axios');
const cheerio = require('cheerio');
const Logger = require('../lib/log-helper');

function constructUrl() {
  return 'https://www.dbs.com.sg/personal/rates-online/foreign-currency-foreign-exchange.page';
}

function formatDate(dateHtml) {
  const dateArray = dateHtml.split(' ');
  return `${dateArray[2]} ${dateArray[6]}`;
}

function transform(content) {
  const currencyArray = this;
  const $ = cheerio.load(content);

  const dateHtml = $('.eff-note').first().html();
  const date = formatDate(dateHtml);

  const data = currencyArray.map(code => {
    return {
      ...code,
      sellPrice: $(`tr[name="${code.id}"] td[data-before-text="Selling TT/OD"]`).html(),
      buyTTPrice: $(`tr[name="${code.id}"] td[data-before-text="Buying TT"]`).html(),
      buyODPrice: $(`tr[name="${code.id}"] td[data-before-text="Buying OD"]`).html()
    };
  });

  return { date, data };
}

module.exports = {
  _constructUrl: constructUrl,
  _formatDate: formatDate,
  _transform: transform,
  get: async(currencyArray) => {
    try {
      const bindTranform = transform.bind(currencyArray);
      const response = await axios.get(constructUrl(), { transformResponse: bindTranform });
      return response.data;
    } catch (e) {
      Logger.log('DBS scraper Failed', e);
    }
    return '';
  }
};
