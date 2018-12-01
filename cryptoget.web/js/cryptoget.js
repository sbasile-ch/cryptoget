//______________________________________________________

var CurrNames = [
		'btcusd', 'btceur', 'eurusd', 'xrpusd', 'xrpeur',
		'xrpbtc', 'ltcusd', 'ltceur', 'ltcbtc', 'ethusd',
		'etheur', 'ethbtc', 'bchusd', 'bcheur', 'bchbtc'
];
var Keys = ['high', 'last', 'bid', 'vwap', 'volume', 'low', 'ask', 'open'];
var Currencies; 
const BaseUrl='https://www.bitstamp.net/api/v2/ticker/';
//const BaseUrl='https://www.google.com:81/';  // use to test timout

const pusher = new Pusher('de504dc5763aeef9ff52'); // websocket key
const wsChannel = 'live_trades_';
const wsEvent   = 'trade';
const RequestTimeout = 4000;

//______________________________________________________
class Currency {
    //_________________
    constructor(name) {
      this.currName = name;
      this.httpReq = new XMLHttpRequest();
      this.wsChannel = pusher.subscribe(wsChannel + name);
      this.wsChannel.bind('trade', function (data) {
          processJSON(name, data);
        });
    }
    //_________________
    // manageTimeout(mode) {
    //     var thisObj = this;
    //     switch (mode) {
    //         case 0: clearTimeout(this.reqTimeout); 
    //                 break;
    //         case 1:  this.reqTimeout = setTimeout(function () {
    //                                                 thisObj.httpReq.abort();
    //                                                 thisObj.error(`Request timeout after ${RequestTimeout} ms`)
    //                                                 },
    //                                                 RequestTimeout);
    //                 break;
    //     }
    // }
    //_________________
    // manageResponse () {
    //     var h = this.httpReq;
    //     if (h.readyState == 4 && h.status == 200) {
    //         this.manageTimeout(0); //clear
    //         processJSON (this.currName, h.responseText);
    //     }
    // }
    //_________________
    // getCurrency () {
    //     var thisObj = this;
    //     var url = BaseUrl+this.currName;
    //     this.httpReq.onreadystatechange = function () {
    //         if (this.readyState == 4) {
    //             thisObj.manageTimeout(0); //clear
    //             if (this.status == 200) {
    //                 processJSON (thisObj.currName, this.responseText);
    //             } else {
    //                 thisObj.error(`error on Request "${url}: [${this.status}][${this.statusText}]`);
    //             }
    //         }
    //     }
    //     this.httpReq.open("GET", url, true);
    //     this.httpReq.send();
    //     this.manageTimeout(1); //set
    // }

    //_________________
    error (err) {
        console.log(err);
    }
}
//______________________________________________________
// function getCurrency (cur) {
//     var httpReq = new XMLHttpRequest();
//     var url = BaseUrl+cur;
//     httpReq.onreadystatechange = function() {
//       if (this.readyState == 4 && this.status == 200) {
//         processJSON (cur,httpReq.responseText);
//       }
//     };
//     httpReq.open("GET", url, false);
//     httpReq.send();
//   }

//______________________________________________________
function initApp () {
    $checkBoxes.empty();
    $outTable.empty();
    Currencies = new Map();
    Keys.sort();
    CurrNames.sort();
    CurrNames.forEach(function(currName) { 
        cur = new Currency (currName);
        Currencies.set(currName, cur);
    });
    initAllNoneButtons();    // attach an event listener to control check boxes
    initCurrenciesChBoxes(); // attach an event listener to currency check boxes

    $('#'+IdCbx+'btcusd').click(); //start with btcusd 
}
//______________________________________________________


// var placeholder = document.getElementById('trades_placeholder'),
// pusher = new Pusher('de504dc5763aeef9ff52'),
// tradesChannel = pusher.subscribe('live_trades_eurusd'),
// child = null,
// i = 0;

// tradesChannel.bind('trade', function (data) {
// if (i === 0) {
//     placeholder.innerHTML = '';
// }
// child = document.createElement('div');
// child.innerHTML = '(' + data.timestamp + ') ' + data.id + ': ' + data.amount + ' BTC @ ' + data.price + ' USD ' + data.type;
// placeholder.appendChild(child);
// i++;
// });


//______________________________________________________
function processJSON (name, json) {
    console.log(name+':'+JSON.stringify(json));
}

//______________________________________________________
