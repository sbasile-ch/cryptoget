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

const RequestTimeout = 4000;

//______________________________________________________
class Currency {
    //_________________
    constructor(name) {
      this.currName = name;
      this.httpReq = new XMLHttpRequest();
    }
    //_________________
    manageTimeout(mode) {
        var thisObj = this;
        switch (mode) {
            case 0: clearTimeout(this.reqTimeout); 
                    break;
            case 1:  this.reqTimeout = setTimeout(function () {
                                                    thisObj.httpReq.abort();
                                                    thisObj.error(`Request timeout after ${RequestTimeout} ms`)
                                                    },
                                                    RequestTimeout);
                    break;
        }
    }
    //_________________
    manageResponse () {
        var h = this.httpReq;
        if (h.readyState == 4 && h.status == 200) {
            this.manageTimeout(0); //clear
            processJSON (this.currName, h.responseText);
        }
    }
    //_________________
    getCurrency () {
        var thisObj = this;
        var url = BaseUrl+this.currName;
        this.httpReq.onreadystatechange = function () {
            if (this.readyState == 4) {
                thisObj.manageTimeout(0); //clear
                if (this.status == 200) {
                    processJSON (thisObj.currName, this.responseText);
                } else {
                    thisObj.error(`error on Request "${url}: [${this.status}][${this.statusText}]`);
                }
            }
        }
        this.httpReq.open("GET", url, true);
        this.httpReq.send();
        this.manageTimeout(1); //set
    }
    _________________
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
    $outTable.empty();
    Currencies = new Map();
    Keys.sort();
    CurrNames.sort();
    CurrNames.forEach(function(currName) { // create checkBox & Table row for every Currency
        cur = new Currency (currName);
        Currencies.set(currName, cur);
    });
    initWebSocket();         // start retrieving data
}
//______________________________________________________
function getCurrency2 (cur) {
    var url = BaseUrl+cur;
    fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        //mode: "cors", // no-cors, cors, *same-origin
        cache: "no-store", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        //headers: { 
        //    "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        //    "Access-Control-Allow-Origin": "*"
        //    'Access-Control-Allow-Headers': 'POST, GET, PUT, DELETE, OPTIONS, HEAD, authorization'
        //},
        //redirect: "follow", // manual, *follow, error
        //referrer: "no-referrer", // no-referrer, *client
        //body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => {
        if(response.ok) {
            //return response.json();
            return response;
          } else {
            throw new Error(`Server answered ${response.status} to ${url}`);
          }
    })
    .then(response=> {
      var str = JSON.stringify(response.json());
      console.log(str);
      alert (str);
    }).catch(error => {
        console.log(error);
      });
}
//______________________________________________________
function processJSON (name, json) {
    console.log(name+':'+JSON.stringify(json));
}
//______________________________________________________
