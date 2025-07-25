// ----------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code
// EDIT THE CORRESPONDENT .ts FILE INSTEAD

// AUTO_TRANSPILE_ENABLED
import assert from 'assert';
import ccxt from '../../../ccxt.js';
function helperTestHandleMarketTypeAndParams() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
        'options': {
            'defaultType': 'valueFromOptions',
            'fetchX': {
                'defaultType': 'valueFromMethodOptions',
            },
        },
    });
    const initialParams = { 'defaultType': 'valueFromParam' };
    const market = exchange.safeMarket('TEST1/TEST2');
    market['type'] = 'spot';
    //
    // ########### test different variations ###########
    //
    // case #1, should prevail: param
    //
    const [marketType1, params1] = exchange.handleMarketTypeAndParams('fetchX', market, initialParams, 'valueDefault');
    assert('defaultType' in initialParams);
    assert(!('defaultType' in params1));
    assert(marketType1 === 'valueFromParam');
    //
    // case #2, should prevail: market.type
    //
    const [marketType2, params2] = exchange.handleMarketTypeAndParams('fetchX', market, {}, 'valueDefault');
    assert(marketType2 === 'spot');
    //
    // case #3, should prevail: valueDefault
    //
    const [marketType3, params3] = exchange.handleMarketTypeAndParams('fetchX', undefined, {}, 'valueDefault');
    assert(marketType3 === 'valueDefault');
    //
    // case #4, should prevail: method options
    //
    const [marketType4, params4] = exchange.handleMarketTypeAndParams('fetchX', undefined, {});
    assert(marketType4 === 'valueFromMethodOptions');
    //
    // case #5, should prevail: options
    //
    const [marketType5, params5] = exchange.handleMarketTypeAndParams('fetchY', undefined, {}, undefined);
    assert(marketType5 === 'valueFromOptions');
    //
    // case #6, should prevail: spot (because hardcoded in base)
    //
    exchange.options['defaultType'] = undefined;
    const [marketType6, params6] = exchange.handleMarketTypeAndParams('fetchY', undefined, {}, undefined);
    assert(marketType6 === 'spot');
    // fake assertion to avoid unused vars
    assert(params1 !== undefined || params2 !== undefined || params3 !== undefined || params4 !== undefined || params5 !== undefined || params6 !== undefined);
}
function helperTestHandleNetworkRequest() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
        'options': {
            'networks': {
                'XYZ': 'Xyz',
            }
        },
    });
    exchange.currencies = exchange.createSafeDictionary(); // todo: initialize in C# base files
    const currencyCode = 'ETH'; // todo: in future with complex cases
    // no-case
    const [request1, params1] = exchange.handleRequestNetwork({ 'network': 'XYZ' }, {}, 'chain_id', currencyCode, false);
    assert(!('network' in params1));
    assert('chain_id' in request1);
    assert(request1['chain_id'] === 'Xyz');
}
function testHandleMethods() {
    helperTestHandleMarketTypeAndParams();
    helperTestHandleNetworkRequest();
}
export default testHandleMethods;
