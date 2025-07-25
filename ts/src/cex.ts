
//  ---------------------------------------------------------------------------

import Exchange from './abstract/cex.js';
import { ExchangeError, ArgumentsRequired, NullResponse, PermissionDenied, InsufficientFunds, BadRequest, AuthenticationError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Currency, Currencies, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, TradingFeeInterface, int, Account, Balances, LedgerEntry, Transaction, TransferEntry, DepositAddress } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class cex
 * @augments Exchange
 */
export default class cex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU' ],
            'rateLimit': 300, // 200 req/min
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false, // has, but not through api
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrder': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositsWithdrawals': true,
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
                'fetchLedger': true,
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
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrderBook': true,
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
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchVolatilityHistory': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': {
                    'public': 'https://trade.cex.io/api/spot/rest-public',
                    'private': 'https://trade.cex.io/api/spot/rest',
                },
                'www': 'https://cex.io',
                'doc': 'https://trade.cex.io/docs/',
                'fees': [
                    'https://cex.io/fee-schedule',
                    'https://cex.io/limits-commissions',
                ],
                'referral': 'https://cex.io/r/0/up105393824/0/',
            },
            'api': {
                'public': {
                    'get': {},
                    'post': {
                        'get_server_time': 1,
                        'get_pairs_info': 1,
                        'get_currencies_info': 1,
                        'get_processing_info': 10,
                        'get_ticker': 1,
                        'get_trade_history': 1,
                        'get_order_book': 1,
                        'get_candles': 1,
                    },
                },
                'private': {
                    'get': {},
                    'post': {
                        'get_my_current_fee': 5,
                        'get_fee_strategy': 1,
                        'get_my_volume': 5,
                        'do_create_account': 1,
                        'get_my_account_status_v3': 5,
                        'get_my_wallet_balance': 5,
                        'get_my_orders': 5,
                        'do_my_new_order': 1,
                        'do_cancel_my_order': 1,
                        'do_cancel_all_orders': 5,
                        'get_order_book': 1,
                        'get_candles': 1,
                        'get_trade_history': 1,
                        'get_my_transaction_history': 1,
                        'get_my_funding_history': 5,
                        'do_my_internal_transfer': 1,
                        'get_processing_info': 10,
                        'get_deposit_address': 5,
                        'do_deposit_funds_from_wallet': 1,
                        'do_withdrawal_funds_to_wallet': 1,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false, // todo
                        'takeProfitPrice': false, // todo
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': false, // todo check
                            'GTD': true,
                        },
                        'hedged': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true, // todo check
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': undefined,
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'daysBackCanceled': 1,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
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
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                    'You have negative balance on following accounts': InsufficientFunds,
                    'Mandatory parameter side should be one of BUY,SELL': BadRequest,
                    'API orders from Main account are not allowed': BadRequest,
                    'check failed': BadRequest,
                    'Insufficient funds': InsufficientFunds,
                    'Get deposit address for main account is not allowed': PermissionDenied,
                    'Market Trigger orders are not allowed': BadRequest, // for some reason, triggerPrice does not work for market orders
                    'key not passed or incorrect': AuthenticationError,
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '1d': '1d',
            },
            'options': {
                'networks': {
                    'BTC': 'bitcoin',
                    'ERC20': 'ERC20',
                    'BSC20': 'binancesmartchain',
                    'DOGE': 'dogecoin',
                    'ALGO': 'algorand',
                    'XLM': 'stellar',
                    'ATOM': 'cosmos',
                    'LTC': 'litecoin',
                    'XRP': 'ripple',
                    'FTM': 'fantom',
                    'MINA': 'mina',
                    'THETA': 'theta',
                    'XTZ': 'tezos',
                    'TIA': 'celestia',
                    'CRONOS': 'cronos', // CRC20
                    'MATIC': 'polygon',
                    'TON': 'ton',
                    'TRC20': 'tron',
                    'SOLANA': 'solana',
                    'SGB': 'songbird',
                    'DYDX': 'dydx',
                    'DASH': 'dash',
                    'ZIL': 'zilliqa',
                    'EOS': 'eos',
                    'AVALANCHEC': 'avalanche',
                    'ETHPOW': 'ethereumpow',
                    'NEAR': 'near',
                    'ARB': 'arbitrum',
                    'DOT': 'polkadot',
                    'OPT': 'optimism',
                    'INJ': 'injective',
                    'ADA': 'cardano',
                    'ONT': 'ontology',
                    'ICP': 'icp',
                    'KAVA': 'kava',
                    'KSM': 'kusama',
                    'SEI': 'sei',
                    // 'OSM': 'osmosis',
                    'NEO': 'neo',
                    'NEO3': 'neo3',
                    // 'TERRAOLD': 'terra', // tbd
                    // 'TERRA': 'terra2', // tbd
                    // 'EVER': 'everscale', // tbd
                    'XDC': 'xdc',
                },
            },
        });
    }

    /**
     * @method
     * @name cex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://trade.cex.io/docs/#rest-public-api-calls-currencies-info
     * @param {dict} [params] extra parameters specific to the exchange API endpoint
     * @returns {dict} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const promises = [];
        promises.push (this.publicPostGetCurrenciesInfo (params));
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "currency": "ZAP",
        //                "fiat": false,
        //                "precision": "8",
        //                "walletPrecision": "6",
        //                "walletDeposit": true,
        //                "walletWithdrawal": true
        //            },
        //            ...
        //
        promises.push (this.publicPostGetProcessingInfo (params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "ADA": {
        //                "name": "Cardano",
        //                "blockchains": {
        //                    "cardano": {
        //                        "type": "coin",
        //                        "deposit": "enabled",
        //                        "minDeposit": "1",
        //                        "withdrawal": "enabled",
        //                        "minWithdrawal": "5",
        //                        "withdrawalFee": "1",
        //                        "withdrawalFeePercent": "0",
        //                        "depositConfirmations": "15"
        //                    }
        //                }
        //            },
        //            ...
        //
        const responses = await Promise.all (promises);
        const dataCurrencies = this.safeList (responses[0], 'data', []);
        const dataNetworks = this.safeDict (responses[1], 'data', {});
        const currenciesIndexed = this.indexBy (dataCurrencies, 'currency');
        const data = this.deepExtend (currenciesIndexed, dataNetworks);
        return this.parseCurrencies (this.toArray (data));
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'currency');
        const code = this.safeCurrencyCode (id);
        const type = this.safeBool (rawCurrency, 'fiat') ? 'fiat' : 'crypto';
        const currencyPrecision = this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'precision')));
        const networks: Dict = {};
        const rawNetworks = this.safeDict (rawCurrency, 'blockchains', {});
        const keys = Object.keys (rawNetworks);
        for (let j = 0; j < keys.length; j++) {
            const networkId = keys[j];
            const rawNetwork = rawNetworks[networkId];
            const networkCode = this.networkIdToCode (networkId);
            const deposit = this.safeString (rawNetwork, 'deposit') === 'enabled';
            const withdraw = this.safeString (rawNetwork, 'withdrawal') === 'enabled';
            networks[networkCode] = {
                'id': networkId,
                'network': networkCode,
                'margin': undefined,
                'deposit': deposit,
                'withdraw': withdraw,
                'active': undefined,
                'fee': this.safeNumber (rawNetwork, 'withdrawalFee'),
                'precision': currencyPrecision,
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (rawNetwork, 'minDeposit'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (rawNetwork, 'minWithdrawal'),
                        'max': undefined,
                    },
                },
                'info': rawNetwork,
            };
        }
        return this.safeCurrencyStructure ({
            'id': id,
            'code': code,
            'name': undefined,
            'type': type,
            'active': undefined,
            'deposit': this.safeBool (rawCurrency, 'walletDeposit'),
            'withdraw': this.safeBool (rawCurrency, 'walletWithdrawal'),
            'fee': undefined,
            'precision': currencyPrecision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'networks': networks,
            'info': rawCurrency,
        });
    }

    /**
     * @method
     * @name cex#fetchMarkets
     * @description retrieves data on all markets for ace
     * @see https://trade.cex.io/docs/#rest-public-api-calls-pairs-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicPostGetPairsInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "base": "AI",
        //                "quote": "USD",
        //                "baseMin": "30",
        //                "baseMax": "2516000",
        //                "baseLotSize": "0.000001",
        //                "quoteMin": "10",
        //                "quoteMax": "1000000",
        //                "quoteLotSize": "0.01000000",
        //                "basePrecision": "6",
        //                "quotePrecision": "8",
        //                "pricePrecision": "4",
        //                "minPrice": "0.0377",
        //                "maxPrice": "19.5000"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const baseId = this.safeString (market, 'base');
        const base = this.safeCurrencyCode (baseId);
        const quoteId = this.safeString (market, 'quote');
        const quote = this.safeCurrencyCode (quoteId);
        const id = base + '-' + quote; // not actual id, but for this exchange we can use this abbreviation, because e.g. tickers have hyphen in between
        const symbol = base + '/' + quote;
        return this.safeMarketStructure ({
            'id': id,
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
                    'min': this.safeNumber (market, 'baseMin'),
                    'max': this.safeNumber (market, 'baseMax'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'quoteMin'),
                    'max': this.safeNumber (market, 'quoteMax'),
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': this.safeString (market, 'baseLotSize'),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                // 'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteLotSize'))), // buggy, doesn't reflect their documentation
                'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
            },
            'active': undefined,
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name cex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicPostGetServerTime (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "timestamp": "1728472063472",
        //            "ISODate": "2024-10-09T11:07:43.472Z"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return timestamp;
    }

    /**
     * @method
     * @name cex#fetchTicker
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://trade.cex.io/docs/#rest-public-api-calls-ticker
     * @param {string} symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const response = await this.fetchTickers ([ symbol ], params);
        return this.safeDict (response, symbol, {}) as Ticker;
    }

    /**
     * @method
     * @name cex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://trade.cex.io/docs/#rest-public-api-calls-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            request['pairs'] = this.marketIds (symbols);
        }
        const response = await this.publicPostGetTicker (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "AI-USD": {
        //                "bestBid": "0.3917",
        //                "bestAsk": "0.3949",
        //                "bestBidChange": "0.0035",
        //                "bestBidChangePercentage": "0.90",
        //                "bestAskChange": "0.0038",
        //                "bestAskChangePercentage": "0.97",
        //                "low": "0.3787",
        //                "high": "0.3925",
        //                "volume30d": "2945.722277",
        //                "lastTradeDateISO": "2024-10-11T06:18:42.077Z",
        //                "volume": "120.736000",
        //                "quoteVolume": "46.65654070",
        //                "lastTradeVolume": "67.914000",
        //                "volumeUSD": "46.65",
        //                "last": "0.3949",
        //                "lastTradePrice": "0.3925",
        //                "priceChange": "0.0038",
        //                "priceChangePercentage": "0.97"
        //            },
        //            ...
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'id');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last'), // last indicative price per api docs (difference also seen here: https://github.com/ccxt/ccxt/actions/runs/14593899575/job/40935513901?pr=25767#step:11:456 )
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'priceChange'),
            'percentage': this.safeNumber (ticker, 'priceChangePercentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name cex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://trade.cex.io/docs/#rest-public-api-calls-trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['fromDateISO'] = this.iso8601 (since);
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['toDateISO'] = this.iso8601 (until);
        }
        if (limit !== undefined) {
            request['pageSize'] = Math.min (limit, 10000); // has a bug, still returns more trades
        }
        const response = await this.publicPostGetTradeHistory (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "pageSize": "10",
        //            "trades": [
        //                {
        //                    "tradeId": "1728630559823-0",
        //                    "dateISO": "2024-10-11T07:09:19.823Z",
        //                    "side": "SELL",
        //                    "price": "60879.5",
        //                    "amount": "0.00165962"
        //                },
        //                ... followed by older trades
        //
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public fetchTrades
        //
        //                {
        //                    "tradeId": "1728630559823-0",
        //                    "dateISO": "2024-10-11T07:09:19.823Z",
        //                    "side": "SELL",
        //                    "price": "60879.5",
        //                    "amount": "0.00165962"
        //                },
        //
        const dateStr = this.safeString (trade, 'dateISO');
        const timestamp = this.parse8601 (dateStr);
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name cex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://trade.cex.io/docs/#rest-public-api-calls-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicPostGetOrderBook (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "timestamp": "1728636922648",
        //            "currency1": "BTC",
        //            "currency2": "USDT",
        //            "bids": [
        //                [
        //                    "60694.1",
        //                    "13.12849761"
        //                ],
        //                [
        //                    "60694.0",
        //                    "0.71829244"
        //                ],
        //                ...
        //
        const orderBook = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (orderBook, 'timestamp');
        return this.parseOrderBook (orderBook, market['symbol'], timestamp);
    }

    /**
     * @method
     * @name cex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://trade.cex.io/docs/#rest-public-api-calls-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        let dataType = undefined;
        [ dataType, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'dataType');
        if (dataType === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a parameter "dataType" to be either "bestBid" or "bestAsk"');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
            'resolution': this.timeframes[timeframe],
            'dataType': dataType,
        };
        if (since !== undefined) {
            request['fromISO'] = this.iso8601 (since);
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['toISO'] = this.iso8601 (until);
        } else if (since === undefined) {
            // exchange still requires that we provide one of them
            request['toISO'] = this.iso8601 (this.milliseconds ());
        }
        if (since !== undefined && until !== undefined && limit !== undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV does not support fetching candles with both a limit and since/until');
        } else if ((since !== undefined || until !== undefined) && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a limit parameter when fetching candles with since or until');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicPostGetCandles (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "timestamp": "1728643320000",
        //                "open": "61061",
        //                "high": "61095.1",
        //                "low": "61048.5",
        //                "close": "61087.8",
        //                "volume": "0",
        //                "resolution": "1m",
        //                "isClosed": true,
        //                "timestampISO": "2024-10-11T10:42:00.000Z"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name cex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://trade.cex.io/docs/#rest-public-api-calls-candles
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.privatePostGetMyCurrentFee (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "tradingFee": {
        //                "AI-USD": {
        //                    "percent": "0.25"
        //                },
        //                ...
        //
        const data = this.safeDict (response, 'data', {});
        const fees = this.safeDict (data, 'tradingFee', {});
        return this.parseTradingFees (fees, true);
    }

    parseTradingFees (response, useKeyAsId = false): TradingFees {
        const result: Dict = {};
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let market = undefined;
            if (useKeyAsId) {
                market = this.safeMarket (key);
            }
            const parsed = this.parseTradingFee (response[key], market);
            result[parsed['symbol']] = parsed;
        }
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            if (!(symbol in result)) {
                const market = this.market (symbol);
                result[symbol] = this.parseTradingFee (response, market);
            }
        }
        return result;
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        return {
            'info': fee,
            'symbol': this.safeString (market, 'symbol'),
            'maker': this.safeNumber (fee, 'percent'),
            'taker': this.safeNumber (fee, 'percent'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        await this.loadMarkets ();
        const response = await this.privatePostGetMyAccountStatusV3 (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "convertedCurrency": "USD",
        //            "balancesPerAccounts": {
        //                "": {
        //                    "AI": {
        //                        "balance": "0.000000",
        //                        "balanceOnHold": "0.000000"
        //                    },
        //                    "USDT": {
        //                        "balance": "0.00000000",
        //                        "balanceOnHold": "0.00000000"
        //                    }
        //                }
        //            }
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        const balances = this.safeDict (data, 'balancesPerAccounts', {});
        const arrays = this.toArray (balances);
        return this.parseAccounts (arrays, params);
    }

    parseAccount (account: Dict): Account {
        return {
            'id': undefined,
            'type': undefined,
            'code': undefined,
            'info': account,
        };
    }

    /**
     * @method
     * @name cex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://trade.cex.io/docs/#rest-private-api-calls-account-status-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.method] 'privatePostGetMyWalletBalance' or 'privatePostGetMyAccountStatusV3'
     * @param {object} [params.account]  in case 'privatePostGetMyAccountStatusV3' is chosen, this can specify the account name (default is empty string)
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        let accountName = undefined;
        [ accountName, params ] = this.handleParamString (params, 'account', ''); // default is empty string
        let method = undefined;
        [ method, params ] = this.handleParamString (params, 'method', 'privatePostGetMyWalletBalance');
        let accountBalance = undefined;
        if (method === 'privatePostGetMyAccountStatusV3') {
            const response = await this.privatePostGetMyAccountStatusV3 (params);
            //
            //    {
            //        "ok": "ok",
            //        "data": {
            //            "convertedCurrency": "USD",
            //            "balancesPerAccounts": {
            //                "": {
            //                    "AI": {
            //                        "balance": "0.000000",
            //                        "balanceOnHold": "0.000000"
            //                    },
            //                    ....
            //
            const data = this.safeDict (response, 'data', {});
            const balances = this.safeDict (data, 'balancesPerAccounts', {});
            accountBalance = this.safeDict (balances, accountName, {});
        } else {
            const response = await this.privatePostGetMyWalletBalance (params);
            //
            //    {
            //        "ok": "ok",
            //        "data": {
            //            "AI": {
            //                "balance": "25.606429"
            //            },
            //            "USDT": {
            //                "balance": "7.935449"
            //            },
            //            ...
            //
            accountBalance = this.safeDict (response, 'data', {});
        }
        return this.parseBalance (accountBalance);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const balance = this.safeDict (response, key, {});
            const code = this.safeCurrencyCode (key);
            const account: Dict = {
                'used': this.safeString (balance, 'balanceOnHold'),
                'total': this.safeString (balance, 'balance'),
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name cex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://trade.cex.io/docs/#rest-private-api-calls-orders
     * @param {string} status order status to fetch for
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatus (status: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        const isClosedOrders = (status === 'closed');
        if (isClosedOrders) {
            request['archived'] = true;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['serverCreateTimestampFrom'] = since;
        } else if (isClosedOrders) {
            // exchange requires a `since` parameter for closed orders, so set default to allowed 365
            request['serverCreateTimestampFrom'] = this.milliseconds () - 364 * 24 * 60 * 60 * 1000;
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['serverCreateTimestampTo'] = until;
        }
        const response = await this.privatePostGetMyOrders (this.extend (request, params));
        //
        // if called without `pair`
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "orderId": "1313003",
        //                "clientOrderId": "037F0AFEB93A",
        //                "clientId": "up421412345",
        //                "accountId": null,
        //                "status": "FILLED",
        //                "statusIsFinal": true,
        //                "currency1": "AI",
        //                "currency2": "USDT",
        //                "side": "BUY",
        //                "orderType": "Market",
        //                "timeInForce": "IOC",
        //                "comment": null,
        //                "rejectCode": null,
        //                "rejectReason": null,
        //                "initialOnHoldAmountCcy1": null,
        //                "initialOnHoldAmountCcy2": "10.23456700",
        //                "executedAmountCcy1": "25.606429",
        //                "executedAmountCcy2": "10.20904439",
        //                "requestedAmountCcy1": null,
        //                "requestedAmountCcy2": "10.20904439",
        //                "originalAmountCcy2": "10.23456700",
        //                "feeAmount": "0.02552261",
        //                "feeCurrency": "USDT",
        //                "price": null,
        //                "averagePrice": "0.3986",
        //                "clientCreateTimestamp": "1728474625320",
        //                "serverCreateTimestamp": "1728474624956",
        //                "lastUpdateTimestamp": "1728474628015",
        //                "expireTime": null,
        //                "effectiveTime": null
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name cex#fetchClosedOrders
     * @see https://trade.cex.io/docs/#rest-private-api-calls-orders
     * @description fetches information on multiple canceled orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    /**
     * @method
     * @name cex#fetchOpenOrders
     * @see https://trade.cex.io/docs/#rest-private-api-calls-orders
     * @description fetches information on multiple canceled orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    /**
     * @method
     * @name cex#fetchOpenOrder
     * @description fetches information on an open order made by the user
     * @see https://trade.cex.io/docs/#rest-private-api-calls-orders
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': parseInt (id),
        };
        const result = await this.fetchOpenOrders (symbol, undefined, undefined, this.extend (request, params));
        return result[0];
    }

    /**
     * @method
     * @name cex#fetchClosedOrder
     * @description fetches information on an closed order made by the user
     * @see https://trade.cex.io/docs/#rest-private-api-calls-orders
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': parseInt (id),
        };
        const result = await this.fetchClosedOrders (symbol, undefined, undefined, this.extend (request, params));
        return result[0];
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'PENDING_NEW': 'open',
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'EXPIRED': 'expired',
            'REJECTED': 'rejected',
            'PENDING_CANCEL': 'canceling',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //                "orderId": "1313003",
        //                "clientOrderId": "037F0AFEB93A",
        //                "clientId": "up421412345",
        //                "accountId": null,
        //                "status": "FILLED",
        //                "statusIsFinal": true,
        //                "currency1": "AI",
        //                "currency2": "USDT",
        //                "side": "BUY",
        //                "orderType": "Market",
        //                "timeInForce": "IOC",
        //                "comment": null,
        //                "rejectCode": null,
        //                "rejectReason": null,
        //                "initialOnHoldAmountCcy1": null,
        //                "initialOnHoldAmountCcy2": "10.23456700",
        //                "executedAmountCcy1": "25.606429",
        //                "executedAmountCcy2": "10.20904439",
        //                "requestedAmountCcy1": null,
        //                "requestedAmountCcy2": "10.20904439",
        //                "originalAmountCcy2": "10.23456700",
        //                "feeAmount": "0.02552261",
        //                "feeCurrency": "USDT",
        //                "price": null,
        //                "averagePrice": "0.3986",
        //                "clientCreateTimestamp": "1728474625320",
        //                "serverCreateTimestamp": "1728474624956",
        //                "lastUpdateTimestamp": "1728474628015",
        //                "expireTime": null,
        //                "effectiveTime": null
        //
        const currency1 = this.safeString (order, 'currency1');
        const currency2 = this.safeString (order, 'currency2');
        let marketId = undefined;
        if (currency1 !== undefined && currency2 !== undefined) {
            marketId = currency1 + '-' + currency2;
        }
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const fee = {};
        const feeAmount = this.safeNumber (order, 'feeAmount');
        if (feeAmount !== undefined) {
            const currencyId = this.safeString (order, 'feeCurrency');
            const feeCode = this.safeCurrencyCode (currencyId);
            fee['currency'] = feeCode;
            fee['cost'] = feeAmount;
        }
        const timestamp = this.safeInteger (order, 'serverCreateTimestamp');
        const requestedBase = this.safeNumber (order, 'requestedAmountCcy1');
        const executedBase = this.safeNumber (order, 'executedAmountCcy1');
        // const requestedQuote = this.safeNumber (order, 'requestedAmountCcy2');
        const executedQuote = this.safeNumber (order, 'executedAmountCcy2');
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (order, 'lastUpdateTimestamp'),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeStringLower (order, 'orderType'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeNumber (order, 'price'),
            'triggerPrice': this.safeNumber (order, 'stopPrice'),
            'amount': requestedBase,
            'cost': executedQuote,
            'average': this.safeNumber (order, 'averagePrice'),
            'filled': executedBase,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    /**
     * @method
     * @name cex#createOrder
     * @description create a trade order
     * @see https://trade.cex.io/docs/#rest-private-api-calls-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] account-id to use (default is empty string)
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        let accountId = undefined;
        [ accountId, params ] = this.handleOptionAndParams (params, 'createOrder', 'accountId');
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() : API trading is now allowed from main account, set params["accountId"] or .options["createOrder"]["accountId"] to the name of your sub-account');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'clientOrderId': this.uuid (),
            'currency1': market['baseId'],
            'currency2': market['quoteId'],
            'accountId': accountId,
            'orderType': this.capitalize (type.toLowerCase ()),
            'side': side.toUpperCase (),
            'timestamp': this.milliseconds (),
            'amountCcy1': this.amountToPrecision (symbol, amount),
        };
        let timeInForce = undefined;
        [ timeInForce, params ] = this.handleOptionAndParams (params, 'createOrder', 'timeInForce', 'GTC');
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['timeInForce'] = timeInForce;
        }
        let triggerPrice = undefined;
        [ triggerPrice, params ] = this.handleParamString (params, 'triggerPrice');
        if (triggerPrice !== undefined) {
            request['type'] = 'Stop Limit';
            request['stopPrice'] = triggerPrice;
        }
        const response = await this.privatePostDoMyNewOrder (this.extend (request, params));
        //
        // on success
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "messageType": "executionReport",
        //            "clientId": "up132245425",
        //            "orderId": "1318485",
        //            "clientOrderId": "b5b6cd40-154c-4c1c-bd51-4a442f3d50b9",
        //            "accountId": "sub1",
        //            "status": "FILLED",
        //            "currency1": "LTC",
        //            "currency2": "USDT",
        //            "side": "BUY",
        //            "executedAmountCcy1": "0.23000000",
        //            "executedAmountCcy2": "15.09030000",
        //            "requestedAmountCcy1": "0.23000000",
        //            "requestedAmountCcy2": null,
        //            "orderType": "Market",
        //            "timeInForce": null,
        //            "comment": null,
        //            "executionType": "Trade",
        //            "executionId": "1726747124624_101_41116",
        //            "transactTime": "2024-10-15T15:08:12.794Z",
        //            "expireTime": null,
        //            "effectiveTime": null,
        //            "averagePrice": "65.61",
        //            "lastQuantity": "0.23000000",
        //            "lastAmountCcy1": "0.23000000",
        //            "lastAmountCcy2": "15.09030000",
        //            "lastPrice": "65.61",
        //            "feeAmount": "0.03772575",
        //            "feeCurrency": "USDT",
        //            "clientCreateTimestamp": "1729004892014",
        //            "serverCreateTimestamp": "1729004891628",
        //            "lastUpdateTimestamp": "1729004892786"
        //        }
        //    }
        //
        // on failure, there are extra fields
        //
        //             "status": "REJECTED",
        //             "requestedAmountCcy1": null,
        //             "orderRejectReason": "{\\" code \\ ":405,\\" reason \\ ":\\" Either AmountCcy1(OrderQty)or AmountCcy2(CashOrderQty)should be specified for market order not both \\ "}",
        //             "rejectCode": 405,
        //             "rejectReason": "Either AmountCcy1 (OrderQty) or AmountCcy2 (CashOrderQty) should be specified for market order not both",
        //
        const data = this.safeDict (response, 'data');
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name cex#cancelOrder
     * @description cancels an open order
     * @see https://trade.cex.io/docs/#rest-private-api-calls-cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': parseInt (id),
            'cancelRequestId': 'c_' + (this.milliseconds ()).toString (),
            'timestamp': this.milliseconds (),
        };
        const response = await this.privatePostDoCancelMyOrder (this.extend (request, params));
        //
        //      {"ok":"ok","data":{}}
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data);
    }

    /**
     * @method
     * @name cex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://trade.cex.io/docs/#rest-private-api-calls-cancel-all-orders
     * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostDoCancelAllOrders (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "clientOrderIds": [
        //                "3AF77B67109F"
        //            ]
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        const ids = this.safeList (data, 'clientOrderIds', []);
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            orders.push ({ 'clientOrderId': id });
        }
        return this.parseOrders (orders);
    }

    /**
     * @method
     * @name cex#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://trade.cex.io/docs/#rest-private-api-calls-transaction-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let currency = undefined;
        const request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['dateFrom'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['dateTo'] = until;
        }
        const response = await this.privatePostGetMyTransactionHistory (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "transactionId": "30367722",
        //                "timestamp": "2024-10-14T14:08:49.987Z",
        //                "accountId": "",
        //                "type": "withdraw",
        //                "amount": "-12.39060600",
        //                "details": "Withdraw fundingId=1235039 clientId=up421412345 walletTxId=76337154166",
        //                "currency": "USDT"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        let amount = this.safeString (item, 'amount');
        let direction = undefined;
        if (Precise.stringLe (amount, '0')) {
            direction = 'out';
            amount = Precise.stringMul ('-1', amount);
        } else {
            direction = 'in';
        }
        const currencyId = this.safeString (item, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestampString = this.safeString (item, 'timestamp');
        const timestamp = this.parse8601 (timestampString);
        const type = this.safeString (item, 'type');
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'transactionId'),
            'direction': direction,
            'account': this.safeString (item, 'accountId', ''),
            'referenceAccount': undefined,
            'referenceId': undefined,
            'type': this.parseLedgerEntryType (type),
            'currency': code,
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (type) {
        const ledgerType: Dict = {
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
            'commission': 'fee',
        };
        return this.safeString (ledgerType, type, type);
    }

    /**
     * @method
     * @name cex#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://trade.cex.io/docs/#rest-private-api-calls-funding-history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (since !== undefined) {
            request['dateFrom'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['dateTo'] = until;
        }
        const response = await this.privatePostGetMyFundingHistory (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "clientId": "up421412345",
        //                "accountId": "",
        //                "currency": "USDT",
        //                "direction": "withdraw",
        //                "amount": "12.39060600",
        //                "commissionAmount": "0.00000000",
        //                "status": "approved",
        //                "updatedAt": "2024-10-14T14:08:50.013Z",
        //                "txId": "30367718",
        //                "details": {}
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        const currencyId = this.safeString (transaction, 'currency');
        const direction = this.safeString (transaction, 'direction');
        const type = (direction === 'withdraw') ? 'withdrawal' : 'deposit';
        const code = this.safeCurrencyCode (currencyId, currency);
        const updatedAt = this.safeString (transaction, 'updatedAt');
        const timestamp = this.parse8601 (updatedAt);
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'txId'),
            'txid': undefined,
            'type': type,
            'currency': code,
            'network': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': this.safeNumber (transaction, 'commissionAmount'),
            },
            'internal': undefined,
        };
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'rejected': 'rejected',
            'pending': 'pending',
            'approved': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name cex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://trade.cex.io/docs/#rest-private-api-calls-internal-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'SPOT', 'FUND', or 'CONTRACT'
     * @param {string} toAccount 'SPOT', 'FUND', or 'CONTRACT'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        let transfer = undefined;
        if (toAccount !== '' && fromAccount !== '') {
            transfer = await this.transferBetweenSubAccounts (code, amount, fromAccount, toAccount, params);
        } else {
            transfer = await this.transferBetweenMainAndSubAccount (code, amount, fromAccount, toAccount, params);
        }
        const fillResponseFromRequest = this.handleOption ('transfer', 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
        }
        return transfer;
    }

    async transferBetweenMainAndSubAccount (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const fromMain = (fromAccount === '');
        const targetAccount = fromMain ? toAccount : fromAccount;
        const guid = this.safeString (params, 'guid', this.uuid ());
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'accountId': targetAccount,
            'clientTxId': guid,
        };
        let response = undefined;
        if (fromMain) {
            response = await this.privatePostDoDepositFundsFromWallet (this.extend (request, params));
        } else {
            response = await this.privatePostDoWithdrawalFundsToWallet (this.extend (request, params));
        }
        // both endpoints return the same structure, the only difference is that
        // the "accountId" is filled with the "subAccount"
        //
        //     {
        //         "ok": "ok",
        //         "data": {
        //             "accountId": "sub1",
        //             "clientTxId": "27ba8284-67cf-4386-9ec7-80b3871abd45",
        //             "currency": "USDT",
        //             "status": "approved"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTransfer (data, currency);
    }

    async transferBetweenSubAccounts (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'fromAccountId': fromAccount,
            'toAccountId': toAccount,
        };
        const response = await this.privatePostDoMyInternalTransfer (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "transactionId": "30225415"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTransfer (data, currency);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transferBetweenSubAccounts
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "transactionId": "30225415"
        //        }
        //    }
        //
        // transfer between main/sub
        //
        //     {
        //         "ok": "ok",
        //         "data": {
        //             "accountId": "sub1",
        //             "clientTxId": "27ba8284-67cf-4386-9ec7-80b3871abd45",
        //             "currency": "USDT",
        //             "status": "approved"
        //         }
        //     }
        //
        const currencyId = this.safeString (transfer, 'currency');
        const currencyCode = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transfer,
            'id': this.safeString2 (transfer, 'transactionId', 'clientTxId'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': currencyCode,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': this.parseTransactionStatus (this.safeString (transfer, 'status')),
        };
    }

    /**
     * @method
     * @name cex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://trade.cex.io/docs/#rest-private-api-calls-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] account-id (default to empty string) to refer to (at this moment, only sub-accounts allowed by exchange)
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        let accountId = undefined;
        [ accountId, params ] = this.handleOptionAndParams (params, 'createOrder', 'accountId');
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress() : main account is not allowed to fetch deposit address from api, set params["accountId"] or .options["createOrder"]["accountId"] to the name of your sub-account');
        }
        await this.loadMarkets ();
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        const currency = this.currency (code);
        const request: Dict = {
            'accountId': accountId,
            'currency': currency['id'], // documentation is wrong about this param
            'blockchain': this.networkCodeToId (networkCode),
        };
        const response = await this.privatePostGetDepositAddress (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "address": "TCr..................1AE",
        //            "accountId": "sub1",
        //            "currency": "USDT",
        //            "blockchain": "tron"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        const address = this.safeString (depositAddress, 'address');
        const currencyId = this.safeString (depositAddress, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        this.checkAddress (address);
        return {
            'info': depositAddress,
            'currency': currency['code'],
            'network': this.networkIdToCode (this.safeString (depositAddress, 'blockchain')),
            'address': address,
            'tag': undefined,
        } as DepositAddress;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        } else {
            this.checkRequiredCredentials ();
            const seconds = this.seconds ().toString ();
            body = this.json (query);
            const auth = path + seconds + body;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'X-AGGR-KEY': this.apiKey,
                'X-AGGR-TIMESTAMP': seconds,
                'X-AGGR-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // in some cases, like from createOrder, exchange returns nested escaped JSON string:
        //      {"ok":"ok","data":{"messageType":"executionReport", "orderRejectReason":"{\"code\":405}"} }
        // and because of `.parseJson` bug, we need extra fix
        if (response === undefined) {
            if (body === undefined) {
                throw new NullResponse (this.id + ' returned empty response');
            } else if (body[0] === '{') {
                const fixed = this.fixStringifiedJsonMembers (body);
                response = this.parseJson (fixed);
            } else {
                throw new NullResponse (this.id + ' returned unparsed response: ' + body);
            }
        }
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback);
        }
        // check errors in order-engine (the responses are not standard, so we parse here)
        if (url.indexOf ('do_my_new_order') >= 0) {
            const data = this.safeDict (response, 'data', {});
            const rejectReason = this.safeString (data, 'rejectReason');
            if (rejectReason !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], rejectReason, rejectReason);
                throw new ExchangeError (this.id + ' createOrder() ' + rejectReason);
            }
        }
        return undefined;
    }
}
