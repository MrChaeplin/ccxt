
//  ---------------------------------------------------------------------------

import Exchange from './abstract/btcbox.js';
import { ExchangeError, InsufficientFunds, InvalidOrder, AuthenticationError, PermissionDenied, InvalidNonce, OrderNotFound, DDoSProtection } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, int } from './base/types.js';
import { md5 } from './static_dependencies/noble-hashes/md5.js';

//  ---------------------------------------------------------------------------

/**
 * @class btcbox
 * @augments Exchange
 */
export default class btcbox extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'btcbox',
            'name': 'BtcBox',
            'countries': [ 'JP' ],
            'rateLimit': 1000,
            'version': 'v1',
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/1e2cb499-8d0f-4f8f-9464-3c015cfbc76b',
                'api': {
                    'rest': 'https://www.btcbox.co.jp/api',
                },
                'www': 'https://www.btcbox.co.jp/',
                'doc': 'https://blog.btcbox.jp/en/archives/8762',
                'fees': 'https://support.btcbox.co.jp/hc/en-us/articles/360001235694-Fees-introduction',
            },
            'api': {
                'public': {
                    'get': [
                        'depth',
                        'orders',
                        'ticker',
                        'tickers',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'trade_add',
                        'trade_cancel',
                        'trade_list',
                        'trade_view',
                        'wallet',
                    ],
                },
                'webApi': {
                    'get': [
                        'ajax/coin/coinInfo',
                    ],
                },
            },
            'options': {
                'fetchMarkets': {
                    'webApiEnable': true, // fetches from WEB
                    'webApiRetries': 3,
                },
                'amountPrecision': '0.0001', // exchange has only few pairs and all of them
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': undefined,
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '104': AuthenticationError,
                '105': PermissionDenied,
                '106': InvalidNonce,
                '107': InvalidOrder, // price should be an integer
                '200': InsufficientFunds,
                '201': InvalidOrder, // amount too small
                '202': InvalidOrder, // price should be [0 : 1000000]
                '203': OrderNotFound,
                '401': OrderNotFound, // cancel canceled, closed or non-existent order
                '402': DDoSProtection,
            },
        });
    }

    /**
     * @method
     * @name btcbox#fetchMarkets
     * @description retrieves data on all markets for ace
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const promise1 = this.publicGetTickers ();
        const promise2 = this.fetchWebEndpoint ('fetchMarkets', 'webApiGetAjaxCoinCoinInfo', true);
        const [ response1, response2 ] = await Promise.all ([ promise1, promise2 ]);
        //
        const result2Data = this.safeDict (response2, 'data', {});
        const marketIds = Object.keys (response1);
        const markets = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const symbolParts = marketId.split ('_');
            const baseCurr = this.safeString (symbolParts, 0);
            const quote = this.safeString (symbolParts, 1);
            const quoteId = quote.toLowerCase ();
            const id = baseCurr.toLowerCase ();
            const res = response1[marketId];
            const symbol = baseCurr + '/' + quote;
            const fee = (id === 'BTC') ? this.parseNumber ('0.0005') : this.parseNumber ('0.0010');
            const details = this.safeDict (result2Data, id, {});
            const tradeDetails = this.safeDict (details, 'trade', {});
            markets.push (this.safeMarketStructure ({
                'id': id,
                'uppercaseId': undefined,
                'symbol': symbol,
                'base': baseCurr,
                'baseId': id,
                'quote': quote,
                'quoteId': quoteId,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'taker': fee,
                'maker': fee,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'precision': {
                    'price': this.parseNumber (this.parsePrecision (this.safeString (tradeDetails, 'pricedecimal'))),
                    'amount': undefined,
                },
                'active': this.safeString (tradeDetails, 'enable') === '1',
                'created': undefined,
                'info': res,
            }));
        }
        return markets;
    }

    parseMarket (market: Dict): Market {
        const baseId = this.safeString (market, 'base');
        const base = this.safeCurrencyCode (baseId);
        const quoteId = this.safeString (market, 'quote');
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        return {
            'id': this.safeString (market, 'symbol'),
            'uppercaseId': undefined,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': undefined,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'minLimitBaseAmount'),
                    'max': this.safeNumber (market, 'maxLimitBaseAmount'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
            },
            'active': undefined,
            'created': undefined,
            'info': market,
        };
    }

    parseBalance (response): Balances {
        const result: Dict = { 'info': response };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const free = currencyId + '_balance';
            if (free in response) {
                const account = this.account ();
                const used = currencyId + '_lock';
                account['free'] = this.safeString (response, free);
                account['used'] = this.safeString (response, used);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name btcbox#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://blog.btcbox.jp/en/archives/8762#toc13
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name btcbox#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://blog.btcbox.jp/en/archives/8762#toc6
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol']);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name btcbox#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://blog.btcbox.jp/en/archives/8762#toc5
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name btcbox#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //      {
        //          "date":"0",
        //          "price":3,
        //          "amount":0.1,
        //          "tid":"1",
        //          "type":"buy"
        //      }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        market = this.safeMarket (undefined, market);
        const id = this.safeString (trade, 'tid');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name btcbox#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://blog.btcbox.jp/en/archives/8762#toc7
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetOrders (this.extend (request, params));
        //
        //     [
        //          {
        //              "date":"0",
        //              "price":3,
        //              "amount":0.1,
        //              "tid":"1",
        //              "type":"buy"
        //          },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name btcbox#createOrder
     * @description create a trade order
     * @see https://blog.btcbox.jp/en/archives/8762#toc18
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'amount': amount,
            'price': price,
            'type': side,
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeAdd (this.extend (request, params));
        //
        //     {
        //         "result":true,
        //         "id":"11"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name btcbox#cancelOrder
     * @description cancels an open order
     * @see https://blog.btcbox.jp/en/archives/8762#toc17
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        // a special case for btcbox – default symbol is BTC/JPY
        if (symbol === undefined) {
            symbol = 'BTC/JPY';
        }
        const market = this.market (symbol);
        const request: Dict = {
            'id': id,
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeCancel (this.extend (request, params));
        //
        //     {"result":true, "id":"11"}
        //
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            // TODO: complete list
            'part': 'open', // partially or not at all executed
            'all': 'closed', // fully executed
            'cancelled': 'canceled',
            'closed': 'closed', // never encountered, seems to be bug in the doc
            'no': 'closed', // not clarified in the docs...
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "id":11,
        //         "datetime":"2014-10-21 10:47:20",
        //         "type":"sell",
        //         "price":42000,
        //         "amount_original":1.2,
        //         "amount_outstanding":1.2,
        //         "status":"closed",
        //         "trades":[] // no clarification of trade value structure of order endpoint
        //     }
        //
        const id = this.safeString (order, 'id');
        const datetimeString = this.safeString (order, 'datetime');
        let timestamp = undefined;
        if (datetimeString !== undefined) {
            timestamp = this.parse8601 (order['datetime'] + '+09:00'); // Tokyo time
        }
        const amount = this.safeString (order, 'amount_original');
        const remaining = this.safeString (order, 'amount_outstanding');
        const price = this.safeString (order, 'price');
        // status is set by fetchOrder method only
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        // fetchOrders do not return status, use heuristic
        if (status === undefined) {
            if (Precise.stringEquals (remaining, '0')) {
                status = 'closed';
            }
        }
        const trades = undefined; // todo: this.parseTrades (order['trades']);
        market = this.safeMarket (undefined, market);
        const side = this.safeString (order, 'type');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'side': side,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': status,
            'symbol': market['symbol'],
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'trades': trades,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }

    /**
     * @method
     * @name btcbox#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://blog.btcbox.jp/en/archives/8762#toc16
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        // a special case for btcbox – default symbol is BTC/JPY
        if (symbol === undefined) {
            symbol = 'BTC/JPY';
        }
        const market = this.market (symbol);
        const request = this.extend ({
            'id': id,
            'coin': market['baseId'],
        }, params);
        const response = await this.privatePostTradeView (this.extend (request, params));
        //
        //      {
        //          "id":11,
        //          "datetime":"2014-10-21 10:47:20",
        //          "type":"sell",
        //          "price":42000,
        //          "amount_original":1.2,
        //          "amount_outstanding":1.2,
        //          "status":"closed",
        //          "trades":[]
        //      }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrdersByType (type, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        // a special case for btcbox – default symbol is BTC/JPY
        const market = this.market (symbol);
        const request: Dict = {
            'type': type, // 'open' or 'all'
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeList (this.extend (request, params));
        //
        // [
        //      {
        //          "id":"7",
        //          "datetime":"2014-10-20 13:27:38",
        //          "type":"buy",
        //          "price":42750,
        //          "amount_original":0.235,
        //          "amount_outstanding":0.235
        //      },
        // ]
        //
        const orders = this.parseOrders (response, market, since, limit);
        // status (open/closed/canceled) is undefined
        // btcbox does not return status, but we know it's 'open' as we queried for open orders
        if (type === 'open') {
            for (let i = 0; i < orders.length; i++) {
                orders[i]['status'] = 'open';
            }
        }
        return orders;
    }

    /**
     * @method
     * @name btcbox#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://blog.btcbox.jp/en/archives/8762#toc15
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrdersByType ('all', symbol, since, limit, params);
    }

    /**
     * @method
     * @name btcbox#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://blog.btcbox.jp/en/archives/8762#toc15
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrdersByType ('open', symbol, since, limit, params);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'webApi') {
            url = this.urls['www'] + '/' + path;
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, params);
            const request = this.urlencode (query);
            const secret = this.hash (this.encode (this.secret), md5);
            query['signature'] = this.hmac (this.encode (request), this.encode (secret), sha256);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // resort to defaultErrorHandler
        }
        // typical error response: {"result":false,"code":"401"}
        if (httpCode >= 400) {
            return undefined; // resort to defaultErrorHandler
        }
        const result = this.safeValue (response, 'result');
        if (result === undefined || result === true) {
            return undefined; // either public API (no error codes expected) or success
        }
        const code = this.safeValue (response, 'code');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions, code, feedback);
        throw new ExchangeError (feedback); // unknown message
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}) {
        let response = await this.fetch2 (path, api, method, params, headers, body, config);
        if (typeof response === 'string') {
            // sometimes the exchange returns whitespace prepended to json
            response = this.strip (response);
            if (!this.isJsonEncodedObject (response)) {
                throw new ExchangeError (this.id + ' ' + response);
            }
            response = JSON.parse (response);
        }
        return response;
    }
}
