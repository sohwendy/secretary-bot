const axios = require('axios');
const cheerio = require('cheerio');

function constructUrl(ticker, market) {
  return `https://www.bloomberg.com/quote/${ticker}${ market ? `:${market}` : ''}`;
}

function transform(content) {
  const $ = cheerio.load(content);

  return {
    code: $('meta[itemprop=tickerSymbol]').attr('content'),
    price: $('meta[itemprop=price]').attr('content'),
    changeAmount: $('meta[itemprop=priceChange]').attr('content'),
    time: $('meta[itemprop=quoteTime]').attr('content')
  };
}

module.exports = {
  _constructUrl: constructUrl,
  _transform: transform,
  get: async(ticker, market, logger) => {
    try {
      const response = await axios.get(constructUrl(ticker, market), { transformResponse: transform });
      return response.data;
    } catch (e) {
      logger('Bloomberg Failed', e);
    }
    return '';
  }
};
