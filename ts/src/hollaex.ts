
//  ---------------------------------------------------------------------------

import Exchange from './abstract/hollaex.js';
import { BadRequest, AuthenticationError, NetworkError, ArgumentsRequired, OrderNotFound, InsufficientFunds, InvalidNonce, OrderImmediatelyFillable } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Currency, Dict, Dictionary, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, int, DepositAddress, OrderBooks } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class hollaex
 * @augments Exchange
 */
export default class hollaex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'hollaex',
            'name': 'HollaEx',
            'countries': [ 'KR' ],
            // 4 requests per second => 1000ms / 4 = 250 ms between requests
            'rateLimit': 250,
            'version': 'v2',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': 'emulated',
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg',
                'test': {
                    'rest': 'https://api.sandbox.hollaex.com',
                },
                'api': {
                    'rest': 'https://api.hollaex.com',
                },
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
                'referral': 'https://pro.hollaex.com/signup?affiliation_code=QSWA6G',
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': {
                        'health': 1,
                        'constants': 1,
                        'kit': 1,
                        'tiers': 1,
                        'ticker': 1,
                        'tickers': 1,
                        'orderbook': 1,
                        'orderbooks': 1,
                        'trades': 1,
                        'chart': 1,
                        'charts': 1,
                        'minicharts': 1,
                        'oracle/prices': 1,
                        'quick-trade': 1,
                        // TradingView
                        'udf/config': 1,
                        'udf/history': 1,
                        'udf/symbols': 1,
                    },
                },
                'private': {
                    'get': {
                        'user': 1,
                        'user/balance': 1,
                        'user/deposits': 1,
                        'user/withdrawals': 1,
                        'user/withdrawal/fee': 1,
                        'user/trades': 1,
                        'orders': 1,
                        'order': 1,
                    },
                    'post': {
                        'user/withdrawal': 1,
                        'order': 1,
                    },
                    'delete': {
                        'order/all': 1,
                        'order': 1,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false, // todo
                        'takeProfitPrice': false, // todo
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'untilDays': 100000, // todo implement
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000, // todo
                        'untilDays': 100000, // todo
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000, // todo
                        'daysBackCanceled': 1, // todo
                        'untilDays': 100000, // todo
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000, // todo: no limit in request
                    },
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
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'exceptions': {
                'broad': {
                    'API request is expired': InvalidNonce,
                    'Invalid token': AuthenticationError,
                    'Order not found': OrderNotFound,
                    'Insufficient balance': InsufficientFunds,
                    'Error 1001 - Order rejected. Order could not be submitted as this order was set to a post only order.': OrderImmediatelyFillable,
                },
                'exact': {
                    '400': BadRequest,
                    '403': AuthenticationError,
                    '404': BadRequest,
                    '405': BadRequest,
                    '410': BadRequest,
                    '429': BadRequest,
                    '500': NetworkError,
                    '503': NetworkError,
                },
            },
            'options': {
                // how many seconds before the authenticated request expires
                'api-expires': this.parseToInt (this.timeout / 1000),
                'networks': {
                    'BTC': 'btc',
                    'ETH': 'eth',
                    'ERC20': 'eth',
                    'TRX': 'trx',
                    'TRC20': 'trx',
                    'XRP': 'xrp',
                    'XLM': 'xlm',
                    'BNB': 'bnb',
                    'MATIC': 'matic',
                },
                'networksById': {
                    'eth': 'ERC20',
                    'ETH': 'ERC20',
                    'ERC20': 'ERC20',
                    'trx': 'TRC20',
                    'TRX': 'TRC20',
                    'TRC20': 'TRC20',
                },
            },
        });
    }

    /**
     * @method
     * @name hollaex#fetchMarkets
     * @description retrieves data on all markets for hollaex
     * @see https://apidocs.hollaex.com/#constants
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetConstants (params);
        //
        //     {
        //         "coins": {
        //             "xmr": {
        //                 "id": 7,
        //                 "fullname": "Monero",
        //                 "symbol": "xmr",
        //                 "active": true,
        //                 "allow_deposit": true,
        //                 "allow_withdrawal": true,
        //                 "withdrawal_fee": 0.02,
        //                 "min": 0.001,
        //                 "max": 100000,
        //                 "increment_unit": 0.001,
        //                 "deposit_limits": { '1': 0, '2': 0, '3': 0, '4': 0, "5": 0, "6": 0 },
        //                 "withdrawal_limits": { '1': 10, '2': 15, '3': 100, '4': 100, '5': 200, '6': 300, '7': 350, '8': 400, "9": 500, "10": -1 },
        //                 "created_at": "2019-12-09T07:14:02.720Z",
        //                 "updated_at": "2020-01-16T12:12:53.162Z"
        //             },
        //             // ...
        //         },
        //         "pairs": {
        //             "btc-usdt": {
        //                 "id": 2,
        //                 "name": "btc-usdt",
        //                 "pair_base": "btc",
        //                 "pair_2": "usdt",
        //                 "taker_fees": { '1': 0.3, '2': 0.25, '3': 0.2, '4': 0.18, '5': 0.1, '6': 0.09, '7': 0.08, '8': 0.06, "9": 0.04, "10": 0 },
        //                 "maker_fees": { '1': 0.1, '2': 0.08, '3': 0.05, '4': 0.03, '5': 0, '6': 0, '7': 0, '8': 0, "9": 0, "10": 0 },
        //                 "min_size": 0.0001,
        //                 "max_size": 1000,
        //                 "min_price": 100,
        //                 "max_price": 100000,
        //                 "increment_size": 0.0001,
        //                 "increment_price": 0.05,
        //                 "active": true,
        //                 "created_at": "2019-12-09T07:15:54.537Z",
        //                 "updated_at": "2019-12-09T07:15:54.537Z"
        //             },
        //         },
        //         "config": { tiers: 10 },
        //         "status": true
        //     }
        //
        const pairs = this.safeValue (response, 'pairs', {});
        const keys = Object.keys (pairs);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = pairs[key];
            const baseId = this.safeString (market, 'pair_base');
            const quoteId = this.safeString (market, 'pair_2');
            const base = this.commonCurrencyCode (baseId.toUpperCase ());
            const quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            result.push ({
                'id': this.safeString (market, 'name'),
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeValue (market, 'active'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'increment_size'),
                    'price': this.safeNumber (market, 'increment_price'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_size'),
                        'max': this.safeNumber (market, 'max_size'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': this.parse8601 (this.safeString (market, 'created_at')),
                'info': market,
            });
        }
        return result;
    }

    /**
     * @method
     * @name hollaex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://apidocs.hollaex.com/#constants
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetConstants (params);
        //
        //    {
        //        "coins": {
        //            "usdt": {
        //                "id": "6",
        //                "fullname": "USD Tether",
        //                "symbol": "usdt",
        //                "active": true,
        //                "verified": true,
        //                "allow_deposit": true,
        //                "allow_withdrawal": true,
        //                "withdrawal_fee": "20",
        //                "min": "1",
        //                "max": "10000000",
        //                "increment_unit": "0.0001",
        //                "logo": "https://hollaex-resources.s3.ap-southeast-1.amazonaws.com/icons/usdt.svg",
        //                "code": "usdt",
        //                "is_public": true,
        //                "meta": {
        //                    "color": "#27a17a",
        //                    "website": "https://tether.to",
        //                    "explorer": "https://blockchair.com/tether",
        //                    "decimal_points": "6"
        //                },
        //                "estimated_price": "1",
        //                "description": "<p>Tether (USDT) is a stablecoin pegged 1:1 to the US dollar. It is a digital currency that aims to maintain its value while allowing for fast and secure transfer of funds. It was the first stablecoin, and is the most widely used due stablecoin due to its stability and low volatility compared to other cryptocurrencies. It was launched in 2014 by Tether Limited.</p>",
        //                "type": "blockchain",
        //                "network": "eth,trx,bnb,matic",
        //                "standard": "",
        //                "issuer": "HollaEx",
        //                "withdrawal_fees": {
        //                    "bnb": {
        //                        "value": "0.8",
        //                        "active": true,
        //                        "symbol": "usdt"
        //                    },
        //                    "eth": {
        //                        "value": "1.5",
        //                        "active": true,
        //                        "symbol": "usdt"
        //                    },
        //                    "trx": {
        //                        "value": "4",
        //                        "active": true,
        //                        "symbol": "usdt"
        //                    },
        //                    "matic": {
        //                        "value": "0.3",
        //                        "active": true,
        //                        "symbol": "usdt"
        //                    }
        //                },
        //                "display_name": null,
        //                "deposit_fees": null,
        //                "is_risky": false,
        //                "market_cap": "144568098696.29",
        //                "category": "stable",
        //                "created_at": "2019-08-09T10:45:43.367Z",
        //                "updated_at": "2025-03-25T17:12:37.970Z",
        //                "created_by": "168",
        //                "owner_id": "1"
        //            },
        //         },
        //         "network":"https://api.hollaex.network"
        //     }
        //
        const coins = this.safeDict (response, 'coins', {});
        const keys = Object.keys (coins);
        const result: Dict = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = coins[key];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const withdrawalLimits = this.safeList (currency, 'withdrawal_limits', []);
            const rawType = this.safeString (currency, 'type');
            const type = (rawType === 'blockchain') ? 'crypto' : 'other';
            const rawNetworks = this.safeDict (currency, 'withdrawal_fees', {});
            const networks = {};
            const networkIds = Object.keys (rawNetworks);
            for (let j = 0; j < networkIds.length; j++) {
                const networkId = networkIds[j];
                const networkEntry = this.safeDict (rawNetworks, networkId);
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'active': this.safeBool (networkEntry, 'active'),
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': this.safeNumber (networkEntry, 'value'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'info': networkEntry,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'numericId': this.safeInteger (currency, 'id'),
                'code': code,
                'info': currency,
                'name': this.safeString (currency, 'fullname'),
                'active': this.safeBool (currency, 'active'),
                'deposit': this.safeBool (currency, 'allow_deposit'),
                'withdraw': this.safeBool (currency, 'allow_withdrawal'),
                'fee': this.safeNumber (currency, 'withdrawal_fee'),
                'precision': this.safeNumber (currency, 'increment_unit'),
                'limits': {
                    'amount': {
                        'min': this.safeNumber (currency, 'min'),
                        'max': this.safeNumber (currency, 'max'),
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': this.safeValue (withdrawalLimits, 0),
                    },
                },
                'networks': networks,
                'type': type,
            });
        }
        return result;
    }

    /**
     * @method
     * @name hollaex#fetchOrderBooks
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @see https://apidocs.hollaex.com/#orderbooks
     * @param {string[]|undefined} symbols not used by hollaex fetchOrderBooks ()
     * @param {int} [limit] not used by hollaex fetchOrderBooks ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
     */
    async fetchOrderBooks (symbols: Strings = undefined, limit: Int = undefined, params = {}): Promise<OrderBooks> {
        await this.loadMarkets ();
        const response = await this.publicGetOrderbooks (params);
        const result: Dict = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const orderbook = response[marketId];
            const symbol = this.safeSymbol (marketId, undefined, '-');
            const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
            result[symbol] = this.parseOrderBook (response[marketId], symbol, timestamp);
        }
        return result as Dictionary<OrderBook>;
    }

    /**
     * @method
     * @name hollaex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.hollaex.com/#orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "btc-usdt": {
        //             "bids": [
        //                 [ 8836.4, 1.022 ],
        //                 [ 8800, 0.0668 ],
        //                 [ 8797.75, 0.2398 ],
        //             ],
        //             "asks": [
        //                 [ 8839.35, 1.5334 ],
        //                 [ 8852.6, 0.0579 ],
        //                 [ 8860.45, 0.1815 ],
        //             ],
        //             "timestamp": "2020-03-03T02:27:25.147Z"
        //         },
        //         "eth-usdt": {},
        //         // ...
        //     }
        //
        const orderbook = this.safeValue (response, market['id']);
        const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
        return this.parseOrderBook (orderbook, market['symbol'], timestamp);
    }

    /**
     * @method
     * @name hollaex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.hollaex.com/#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "open": 8615.55,
        //         "close": 8841.05,
        //         "high": 8921.1,
        //         "low": 8607,
        //         "last": 8841.05,
        //         "volume": 20.2802,
        //         "timestamp": "2020-03-03T03:11:18.964Z"
        //     }
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name hollaex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.hollaex.com/#tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetTickers (params);
        //
        //     {
        //         "bch-usdt": {
        //             "time": "2020-03-02T04:29:45.011Z",
        //             "open": 341.65,
        //             "close":337.9,
        //             "high":341.65,
        //             "low":337.3,
        //             "last":337.9,
        //             "volume":0.054,
        //             "symbol":"bch-usdt"
        //         },
        //         // ...
        //     }
        //
        return this.parseTickers (response, symbols);
    }

    parseTickers (tickers, symbols: Strings = undefined, params = {}): Tickers {
        const result: Dict = {};
        const keys = Object.keys (tickers);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const ticker = tickers[key];
            const marketId = this.safeString (ticker, 'symbol', key);
            const market = this.safeMarket (marketId, undefined, '-');
            const symbol = market['symbol'];
            result[symbol] = this.extend (this.parseTicker (ticker, market), params);
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // fetchTicker
        //
        //     {
        //         "open": 8615.55,
        //         "close": 8841.05,
        //         "high": 8921.1,
        //         "low": 8607,
        //         "last": 8841.05,
        //         "volume": 20.2802,
        //         "timestamp": "2020-03-03T03:11:18.964Z",
        //     }
        //
        // fetchTickers
        //
        //     {
        //         "time": "2020-03-02T04:29:45.011Z",
        //         "open": 341.65,
        //         "close": 337.9,
        //         "high": 341.65,
        //         "low": 337.3,
        //         "last": 337.9,
        //         "volume": 0.054,
        //         "symbol": "bch-usdt"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString2 (ticker, 'time', 'timestamp'));
        const close = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': this.safeString (ticker, 'last', close),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
        }, market);
    }

    /**
     * @method
     * @name hollaex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.hollaex.com/#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "btc-usdt": [
        //             {
        //                 "size": 0.5,
        //                 "price": 8830,
        //                 "side": "buy",
        //                 "timestamp": "2020-03-03T04:44:33.034Z"
        //             },
        //             // ...
        //         ]
        //     }
        //
        const trades = this.safeList (response, market['id'], []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     {
        //         "size": 0.5,
        //         "price": 8830,
        //         "side": "buy",
        //         "timestamp": "2020-03-03T04:44:33.034Z"
        //     }
        //
        // fetchMyTrades (private)
        //  {
        //      "side":"sell",
        //      "symbol":"doge-usdt",
        //      "size":70,
        //      "price":0.147411,
        //      "timestamp":"2022-01-26T17:53:34.650Z",
        //      "order_id":"cba78ecb-4187-4da2-9d2f-c259aa693b5a",
        //      "fee":0.01031877,
        //      "fee_coin":"usdt"
        //  }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const datetime = this.safeString (trade, 'timestamp');
        const timestamp = this.parse8601 (datetime);
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const feeCostString = this.safeString (trade, 'fee');
        const feeCoin = this.safeString (trade, 'fee_coin');
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': this.safeCurrencyCode (feeCoin),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name hollaex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://apidocs.hollaex.com/#tiers
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.publicGetTiers (params);
        //
        //     {
        //         "1": {
        //             "id": "1",
        //             "name": "Silver",
        //             "icon": '',
        //             "description": "Your crypto journey starts here! Make your first deposit to start trading, and verify your account to level up!",
        //             "deposit_limit": "0",
        //             "withdrawal_limit": "1000",
        //             "fees": {
        //                 "maker": {
        //                     'eth-btc': "0.1",
        //                     'ada-usdt': "0.1",
        //                     ...
        //                 },
        //                 "taker": {
        //                     'eth-btc': "0.1",
        //                     'ada-usdt': "0.1",
        //                     ...
        //                 }
        //             },
        //             "note": "<ul>\n<li>Login and verify email</li>\n</ul>\n",
        //             "created_at": "2021-03-22T03:51:39.129Z",
        //             "updated_at": "2021-11-01T02:51:56.214Z"
        //         },
        //         ...
        //     }
        //
        const firstTier = this.safeValue (response, '1', {});
        const fees = this.safeValue (firstTier, 'fees', {});
        const makerFees = this.safeValue (fees, 'maker', {});
        const takerFees = this.safeValue (fees, 'taker', {});
        const result: Dict = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const makerString = this.safeString (makerFees, market['id']);
            const takerString = this.safeString (takerFees, market['id']);
            result[symbol] = {
                'info': fees,
                'symbol': symbol,
                'maker': this.parseNumber (Precise.stringDiv (makerString, '100')),
                'taker': this.parseNumber (Precise.stringDiv (takerString, '100')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    /**
     * @method
     * @name hollaex#fetchOHLCV
     * @description hollaex has large gaps between candles, so it's recommended to specify since
     * @see https://apidocs.hollaex.com/#chart
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        let paginate = false;
        const maxLimit = 500;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate', paginate);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        let until = this.safeInteger (params, 'until');
        const timeDelta = this.parseTimeframe (timeframe) * maxLimit * 1000;
        let start = since;
        const now = this.milliseconds ();
        if (until === undefined && start === undefined) {
            until = now;
            start = until - timeDelta;
        } else if (until === undefined) {
            until = now; // the exchange has not a lot of trades, so if we count until by limit and limit is small, it may return empty result
        } else if (start === undefined) {
            start = until - timeDelta;
        }
        request['from'] = this.parseToInt (start / 1000); // convert to seconds
        request['to'] = this.parseToInt (until / 1000); // convert to seconds
        params = this.omit (params, 'until');
        const response = await this.publicGetChart (this.extend (request, params));
        //
        //     [
        //         {
        //             "time":"2020-03-02T20:00:00.000Z",
        //             "close":8872.1,
        //             "high":8872.1,
        //             "low":8858.6,
        //             "open":8858.6,
        //             "symbol":"btc-usdt",
        //             "volume":1.2922
        //         },
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "time":"2020-03-02T20:00:00.000Z",
        //         "close":8872.1,
        //         "high":8872.1,
        //         "low":8858.6,
        //         "open":8858.6,
        //         "symbol":"btc-usdt",
        //         "volume":1.2922
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    parseBalance (response): Balances {
        const timestamp = this.parse8601 (this.safeString (response, 'updated_at'));
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyIds = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (response, currencyId + '_available');
            account['total'] = this.safeString (response, currencyId + '_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name hollaex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.hollaex.com/#get-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalance (params);
        //
        //     {
        //         "updated_at": "2020-03-02T22:27:38.428Z",
        //         "btc_balance": 0,
        //         "btc_pending": 0,
        //         "btc_available": 0,
        //         "eth_balance": 0,
        //         "eth_pending": 0,
        //         "eth_available": 0,
        //         // ...
        //     }
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name hollaex#fetchOpenOrder
     * @description fetch an open order by it's id
     * @see https://apidocs.hollaex.com/#get-order
     * @param {string} id order id
     * @param {string} symbol not used by hollaex fetchOpenOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "id": "string",
        //         "side": "sell",
        //         "symbol": "xht-usdt",
        //         "size": 0.1,
        //         "filled": 0,
        //         "stop": null,
        //         "fee": 0,
        //         "fee_coin": "usdt",
        //         "type": "limit",
        //         "price": 1.09,
        //         "status": "new",
        //         "created_by": 116,
        //         "created_at": "2021-02-17T02:32:38.910Z",
        //         "updated_at": "2021-02-17T02:32:38.910Z",
        //         "User": {
        //             "id": 116,
        //             "email": "fight@club.com",
        //             "username": "narrator",
        //             "exchange_id": 176
        //         }
        //     }
        //
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name hollaex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.hollaex.com/#get-all-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const request: Dict = {
            'open': true,
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name hollaex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://apidocs.hollaex.com/#get-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const request: Dict = {
            'open': false,
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name hollaex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://apidocs.hollaex.com/#get-order
     * @param {string} id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //             {
        //                 "id": "string",
        //                 "side": "sell",
        //                 "symbol": "xht-usdt",
        //                 "size": 0.1,
        //                 "filled": 0,
        //                 "stop": null,
        //                 "fee": 0,
        //                 "fee_coin": "usdt",
        //                 "type": "limit",
        //                 "price": 1.09,
        //                 "status": "new",
        //                 "created_by": 116,
        //                 "created_at": "2021-02-17T02:32:38.910Z",
        //                 "updated_at": "2021-02-17T02:32:38.910Z",
        //                 "User": {
        //                     "id": 116,
        //                     "email": "fight@club.com",
        //                     "username": "narrator",
        //                     "exchange_id": 176
        //                 }
        //             }
        const order = response;
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order id ' + id);
        }
        return this.parseOrder (order);
    }

    /**
     * @method
     * @name hollaex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://apidocs.hollaex.com/#get-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {
            // 'symbol': market['id'],
            // 'side': 'buy', // 'sell'
            // 'status': 'new', // 'filled', 'pfilled', 'canceled'
            // 'open': true,
            // 'limit': limit, // default 50, max 100
            // 'page': 1,
            // 'order_by': 'created_at', // id, ...
            // 'order': 'asc', // 'desc'
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (this.milliseconds ()),
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": "string",
        //                 "side": "sell",
        //                 "symbol": "xht-usdt",
        //                 "size": 0.1,
        //                 "filled": 0,
        //                 "stop": null,
        //                 "fee": 0,
        //                 "fee_coin": "usdt",
        //                 "type": "limit",
        //                 "price": 1.09,
        //                 "status": "new",
        //                 "created_by": 116,
        //                 "created_at": "2021-02-17T02:32:38.910Z",
        //                 "updated_at": "2021-02-17T02:32:38.910Z",
        //                 "User": {
        //                     "id": 116,
        //                     "email": "fight@club.com",
        //                     "username": "narrator",
        //                     "exchange_id": 176
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'new': 'open',
            'pfilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, fetchOpenOrder, fetchOpenOrders
        //
        //     {
        //          "id":"10644b7e-3c90-4ba9-bc3b-188f3a4e9cfd",
        //          "created_by":140093,
        //          "exchange_id":22,
        //          "side":"buy",
        //          "symbol":"doge-usdt",
        //          "type":"limit",
        //          "price":0.05,
        //          "size":10,
        //          "stop":null,
        //          "filled":0,
        //          "status":"canceled",
        //          "fee":0,
        //          "fee_coin":"doge",
        //          "meta": {                 // optional field only returned for postOnly orders
        //              "post_only":true
        //          },
        //          "fee_structure": {
        //              "maker":0.1,
        //              "taker":0.1
        //          },
        //          "created_at":"2022-05-31T08:14:14.747Z",
        //          "updated_at":"2022-05-31T08:14:23.727Z"
        //      }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'filled');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const meta = this.safeValue (order, 'meta', {});
        const postOnly = this.safeBool (meta, 'post_only', false);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'triggerPrice': this.safeString (order, 'stop'),
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }

    /**
     * @method
     * @name hollaex#createOrder
     * @description create a trade order
     * @see https://apidocs.hollaex.com/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
            'type': type,
            // 'stop': parseFloat (this.priceToPrecision (symbol, stopPrice)),
            // 'meta': {}, // other options such as post_only
        };
        const triggerPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stop' ]);
        const meta = this.safeValue (params, 'meta', {});
        const exchangeSpecificParam = this.safeBool (meta, 'post_only', false);
        const isMarketOrder = type === 'market';
        const postOnly = this.isPostOnly (isMarketOrder, exchangeSpecificParam, params);
        if (!isMarketOrder) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (triggerPrice !== undefined) {
            request['stop'] = this.priceToPrecision (symbol, triggerPrice);
        }
        if (postOnly) {
            request['meta'] = { 'post_only': true };
        }
        params = this.omit (params, [ 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stop' ]);
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "fee": 0,
        //         "meta": {},
        //         "symbol": "xht-usdt",
        //         "side": "sell",
        //         "size": 0.1,
        //         "type": "limit",
        //         "price": 1,
        //         "fee_structure": {
        //             "maker": 0.2,
        //             "taker": 0.2
        //         },
        //         "fee_coin": "usdt",
        //         "id": "string",
        //         "created_by": 116,
        //         "filled": 0,
        //         "status": "new",
        //         "updated_at": "2021-02-17T03:03:19.231Z",
        //         "created_at": "2021-02-17T03:03:19.231Z",
        //         "stop": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name hollaex#cancelOrder
     * @description cancels an open order
     * @see https://apidocs.hollaex.com/#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         "title": "string",
        //         "symbol": "xht-usdt",
        //         "side": "sell",
        //         "size": 1,
        //         "type": "limit",
        //         "price": 0.1,
        //         "id": "string",
        //         "created_by": 34,
        //         "filled": 0
        //     }
        //
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name hollaex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://apidocs.hollaex.com/#cancel-all-orders
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        market = this.market (symbol);
        request['symbol'] = market['id'];
        const response = await this.privateDeleteOrderAll (this.extend (request, params));
        //
        //     [
        //         {
        //             "title": "string",
        //             "symbol": "xht-usdt",
        //             "side": "sell",
        //             "size": 1,
        //             "type": "limit",
        //             "price": 0.1,
        //             "id": "string",
        //             "created_by": 34,
        //             "filled": 0
        //         }
        //     ]
        //
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name hollaex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://apidocs.hollaex.com/#get-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            // 'symbol': market['id'],
            // 'limit': 50, // default 50, max 100
            // 'page': 1, // page of data to retrieve
            // 'order_by': 'timestamp', // field to order data
            // 'order': 'asc', // asc or desc
            // 'start_date': 123, // starting date of queried data
            // 'end_date': 321, // ending date of queried data
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        const response = await this.privateGetUserTrades (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "side": "buy",
        //                 "symbol": "eth-usdt",
        //                 "size": 0.086,
        //                 "price": 226.19,
        //                 "timestamp": "2020-03-03T08:03:55.459Z",
        //                 "fee": 0.1
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        //
        //     {
        //         "currency":"usdt",
        //         "address":"TECLD9XBH31XpyykdHU3uEAeUK7E6Lrmik",
        //         "network":"trx",
        //         "standard":null,
        //         "is_valid":true,
        //         "created_at":"2021-05-12T02:43:05.446Z"
        //     }
        //
        let address = this.safeString (depositAddress, 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split (':');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        this.checkAddress (address);
        const currencyId = this.safeString (depositAddress, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const network = this.safeString (depositAddress, 'network');
        return {
            'info': depositAddress,
            'currency': currency['code'],
            'network': network,
            'address': address,
            'tag': tag,
        } as DepositAddress;
    }

    /**
     * @method
     * @name hollaex#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies and chain types
     * @see https://apidocs.hollaex.com/#get-user
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddresses (codes: Strings = undefined, params = {}): Promise<DepositAddress[]> {
        await this.loadMarkets ();
        const network = this.safeString (params, 'network');
        params = this.omit (params, 'network');
        const response = await this.privateGetUser (params);
        //
        //     {
        //         "id":620,
        //         "email":"igor.kroitor@gmail.com",
        //         "full_name":"",
        //         "gender":false,
        //         "nationality":"",
        //         "dob":null,
        //         "phone_number":"",
        //         "address":{"city":"","address":"","country":"","postal_code":""},
        //         "id_data":{"note":"","type":"","number":"","status":0,"issued_date":"","expiration_date":""},
        //         "bank_account":[],
        //         "crypto_wallet":{},
        //         "verification_level":1,
        //         "email_verified":true,
        //         "otp_enabled":true,
        //         "activated":true,
        //         "username":"igor.kroitor",
        //         "affiliation_code":"QSWA6G",
        //         "settings":{
        //             "chat":{"set_username":false},
        //             "risk":{"popup_warning":false,"order_portfolio_percentage":20},
        //             "audio":{"public_trade":false,"order_completed":true,"order_partially_completed":true},
        //             "language":"en",
        //             "interface":{"theme":"white","order_book_levels":10},
        //             "notification":{"popup_order_completed":true,"popup_order_confirmation":true,"popup_order_partially_filled":true}
        //         },
        //         "affiliation_rate":0,
        //         "network_id":10620,
        //         "discount":0,
        //         "created_at":"2021-03-24T02:37:57.379Z",
        //         "updated_at":"2021-03-24T02:37:57.379Z",
        //         "balance":{
        //             "btc_balance":0,
        //             "btc_available":0,
        //             "eth_balance":0.000914,
        //             "eth_available":0.000914,
        //             "updated_at":"2020-03-04T04:03:27.174Z
        //         "},
        //         "wallet":[
        //             {"currency":"usdt","address":"TECLD9XBH31XpyykdHU3uEAeUK7E6Lrmik","network":"trx","standard":null,"is_valid":true,"created_at":"2021-05-12T02:43:05.446Z"},
        //             {"currency":"xrp","address":"rGcSzmuRx8qngPRnrvpCKkP9V4njeCPGCv:286741597","network":"xrp","standard":null,"is_valid":true,"created_at":"2021-05-12T02:49:01.273Z"}
        //         ]
        //     }
        //
        const wallet = this.safeValue (response, 'wallet', []);
        const addresses = (network === undefined) ? wallet : this.filterBy (wallet, 'network', network);
        return this.parseDepositAddresses (addresses, codes) as DepositAddress[];
    }

    /**
     * @method
     * @name hollaex#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://apidocs.hollaex.com/#get-deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {
            // 'currency': currency['id'],
            // 'limit': 50, // default 50, max 100
            // 'page': 1, // page of data to retrieve
            // 'order_by': 'timestamp', // field to order data
            // 'order': 'asc', // asc or desc
            // 'start_date': 123, // starting date of queried data
            // 'end_date': 321, // ending date of queried data
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        const response = await this.privateGetUserDeposits (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": 539,
        //                 "amount": 20,
        //                 "fee": 0,
        //                 "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //                 "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //                 "status": true,
        //                 "dismissed": false,
        //                 "rejected": false,
        //                 "description": "",
        //                 "type": "deposit",
        //                 "currency": "usdt",
        //                 "created_at": "2020-03-03T07:56:36.198Z",
        //                 "updated_at": "2020-03-03T08:00:05.674Z",
        //                 "user_id": 620
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    /**
     * @method
     * @name hollaex#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://apidocs.hollaex.com/#get-withdrawals
     * @param {string} id withdrawal id
     * @param {string} code unified currency code of the currency withdrawn, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawal (id: string, code: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'transaction_id': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetUserWithdrawals (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": 539,
        //                 "amount": 20,
        //                 "fee": 0,
        //                 "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //                 "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //                 "status": true,
        //                 "dismissed": false,
        //                 "rejected": false,
        //                 "description": "",
        //                 "type": "withdrawal",
        //                 "currency": "usdt",
        //                 "created_at": "2020-03-03T07:56:36.198Z",
        //                 "updated_at": "2020-03-03T08:00:05.674Z",
        //                 "user_id": 620
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const transaction = this.safeDict (data, 0, {});
        return this.parseTransaction (transaction, currency);
    }

    /**
     * @method
     * @name hollaex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://apidocs.hollaex.com/#get-withdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {
            // 'currency': currency['id'],
            // 'limit': 50, // default 50, max 100
            // 'page': 1, // page of data to retrieve
            // 'order_by': 'timestamp', // field to order data
            // 'order': 'asc', // asc or desc
            // 'start_date': 123, // starting date of queried data
            // 'end_date': 321, // ending date of queried data
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        if (since !== undefined) {
            request['start_date'] = this.iso8601 (since);
        }
        const response = await this.privateGetUserWithdrawals (this.extend (request, params));
        //
        //     {
        //         "count": 1,
        //         "data": [
        //             {
        //                 "id": 539,
        //                 "amount": 20,
        //                 "fee": 0,
        //                 "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //                 "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //                 "status": true,
        //                 "dismissed": false,
        //                 "rejected": false,
        //                 "description": "",
        //                 "type": "withdrawal",
        //                 "currency": "usdt",
        //                 "created_at": "2020-03-03T07:56:36.198Z",
        //                 "updated_at": "2020-03-03T08:00:05.674Z",
        //                 "user_id": 620
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchWithdrawals, fetchDeposits
        //
        //     {
        //         "id": 539,
        //         "amount": 20,
        //         "fee": 0,
        //         "address": "0x5c0cc98270d7089408fcbcc8e2131287f5be2306",
        //         "transaction_id": "0xd4006327a5ec2c41adbdcf566eaaba6597c3d45906abe78ea1a4a022647c2e28",
        //         "status": true,
        //         "dismissed": false,
        //         "rejected": false,
        //         "description": "",
        //         "type": "withdrawal",
        //         "currency": "usdt",
        //         "created_at": "2020-03-03T07:56:36.198Z",
        //         "updated_at": "2020-03-03T08:00:05.674Z",
        //         "user_id": 620
        //     }
        //
        // withdraw
        //
        //     {
        //         "message": "Withdrawal request is in the queue and will be processed.",
        //         "transaction_id": "1d1683c3-576a-4d53-8ff5-27c93fd9758a",
        //         "amount": 1,
        //         "currency": "xht",
        //         "fee": 0,
        //         "fee_coin": "xht"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'transaction_id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const type = this.safeString (transaction, 'type');
        const amount = this.safeNumber (transaction, 'amount');
        let address = this.safeString (transaction, 'address');
        let addressTo = undefined;
        const addressFrom = undefined;
        let tag = undefined;
        let tagTo = undefined;
        const tagFrom = undefined;
        if (address !== undefined) {
            const parts = address.split (':');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
            addressTo = address;
            tagTo = tag;
        }
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        let status = this.safeValue (transaction, 'status');
        const dismissed = this.safeValue (transaction, 'dismissed');
        const rejected = this.safeValue (transaction, 'rejected');
        if (status) {
            status = 'ok';
        } else if (dismissed) {
            status = 'canceled';
        } else if (rejected) {
            status = 'failed';
        } else {
            status = 'pending';
        }
        const feeCurrencyId = this.safeString (transaction, 'fee_coin');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId, currency);
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrencyCode,
                'cost': feeCost,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tagTo,
            'type': type,
            'amount': amount,
            'currency': currency['code'],
            'status': status,
            'updated': updated,
            'comment': this.safeString (transaction, 'message'),
            'internal': undefined,
            'fee': fee,
        } as Transaction;
    }

    /**
     * @method
     * @name hollaex#withdraw
     * @description make a withdrawal
     * @see https://apidocs.hollaex.com/#withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += ':' + tag;
        }
        const network = this.safeString (params, 'network');
        if (network === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a network parameter');
        }
        params = this.omit (params, 'network');
        const request: Dict = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
            'network': this.networkCodeToId (network, code),
        };
        const response = await this.privatePostUserWithdrawal (this.extend (request, params));
        //
        //     {
        //         "message": "Withdrawal request is in the queue and will be processed.",
        //         "transaction_id": "1d1683c3-576a-4d53-8ff5-27c93fd9758a",
        //         "amount": 1,
        //         "currency": "xht",
        //         "fee": 0,
        //         "fee_coin": "xht"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseDepositWithdrawFee (fee, currency: Currency = undefined) {
        //
        //    "bch":{
        //        "id":4,
        //        "fullname":"Bitcoin Cash",
        //        "symbol":"bch",
        //        "active":true,
        //        "verified":true,
        //        "allow_deposit":true,
        //        "allow_withdrawal":true,
        //        "withdrawal_fee":0.0001,
        //        "min":0.001,
        //        "max":100000,
        //        "increment_unit":0.001,
        //        "logo":"https://bitholla.s3.ap-northeast-2.amazonaws.com/icon/BCH-hollaex-asset-01.svg",
        //        "code":"bch",
        //        "is_public":true,
        //        "meta":{},
        //        "estimated_price":null,
        //        "description":null,
        //        "type":"blockchain",
        //        "network":null,
        //        "standard":null,
        //        "issuer":"HollaEx",
        //        "withdrawal_fees":null,
        //        "created_at":"2019-08-09T10:45:43.367Z",
        //        "updated_at":"2021-12-13T03:08:32.372Z",
        //        "created_by":1,
        //        "owner_id":1
        //    }
        //
        const result: Dict = {
            'info': fee,
            'withdraw': {
                'fee': undefined,
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
        const allowWithdrawal = this.safeValue (fee, 'allow_withdrawal');
        if (allowWithdrawal) {
            result['withdraw'] = { 'fee': this.safeNumber (fee, 'withdrawal_fee'), 'percentage': false };
        }
        const withdrawalFees = this.safeValue (fee, 'withdrawal_fees');
        if (withdrawalFees !== undefined) {
            const keys = Object.keys (withdrawalFees);
            const keysLength = keys.length;
            for (let i = 0; i < keysLength; i++) {
                const key = keys[i];
                const value = withdrawalFees[key];
                const currencyId = this.safeString (value, 'symbol');
                const currencyCode = this.safeCurrencyCode (currencyId);
                const networkCode = this.networkIdToCode (key, currencyCode);
                const networkCodeUpper = networkCode.toUpperCase (); // default to the upper case network code
                const withdrawalFee = this.safeNumber (value, 'value');
                result['networks'][networkCodeUpper] = {
                    'deposit': undefined,
                    'withdraw': withdrawalFee,
                };
            }
        }
        return result;
    }

    /**
     * @method
     * @name hollaex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://apidocs.hollaex.com/#constants
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        const response = await this.publicGetConstants (params);
        //
        //     {
        //         "coins":{
        //             "bch":{
        //                 "id":4,
        //                 "fullname":"Bitcoin Cash",
        //                 "symbol":"bch",
        //                 "active":true,
        //                 "verified":true,
        //                 "allow_deposit":true,
        //                 "allow_withdrawal":true,
        //                 "withdrawal_fee":0.0001,
        //                 "min":0.001,
        //                 "max":100000,
        //                 "increment_unit":0.001,
        //                 "logo":"https://bitholla.s3.ap-northeast-2.amazonaws.com/icon/BCH-hollaex-asset-01.svg",
        //                 "code":"bch",
        //                 "is_public":true,
        //                 "meta":{},
        //                 "estimated_price":null,
        //                 "description":null,
        //                 "type":"blockchain",
        //                 "network":null,
        //                 "standard":null,
        //                 "issuer":"HollaEx",
        //                 "withdrawal_fees":null,
        //                 "created_at":"2019-08-09T10:45:43.367Z",
        //                 "updated_at":"2021-12-13T03:08:32.372Z",
        //                 "created_by":1,
        //                 "owner_id":1
        //             },
        //         },
        //         "network":"https://api.hollaex.network"
        //     }
        //
        const coins = this.safeDict (response, 'coins', {});
        return this.parseDepositWithdrawFees (coins, codes, 'symbol');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        path = '/' + this.version + '/' + this.implodeParams (path, params);
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length) {
                path += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api']['rest'] + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const defaultExpires = this.safeInteger2 (this.options, 'api-expires', 'expires', this.parseToInt (this.timeout / 1000));
            const expires = this.sum (this.seconds (), defaultExpires);
            const expiresString = expires.toString ();
            let auth = method + path + expiresString;
            headers = {
                'api-key': this.apiKey,
                'api-expires': expiresString,
            };
            if (method === 'POST') {
                headers['Content-type'] = 'application/json';
                if (Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                }
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            headers['api-signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // { "message": "Invalid token" }
        if (response === undefined) {
            return undefined;
        }
        if ((code >= 400) && (code <= 503)) {
            //
            //  { "message": "Invalid token" }
            //
            // different errors return the same code eg
            //
            //  { "message":"Error 1001 - Order rejected. Order could not be submitted as this order was set to a post only order." }
            //
            //  { "message":"Error 1001 - POST ONLY order can not be of type market" }
            //
            const feedback = this.id + ' ' + body;
            const message = this.safeString (response, 'message');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            const status = code.toString ();
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
        }
        return undefined;
    }
}
