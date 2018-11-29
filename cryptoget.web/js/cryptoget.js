//______________________________________________________

var CurrNames = [
		'btcusd', 'btceur', 'eurusd', 'xrpusd', 'xrpeur',
		'xrpbtc', 'ltcusd', 'ltceur', 'ltcbtc', 'ethusd',
		'etheur', 'ethbtc', 'bchusd', 'bcheur', 'bchbtc'
];
var Keys = ['high', 'last', 'bid', 'vwap', 'volume', 'low', 'ask', 'open'];
var Currencies; 
const BaseUrl='https://www.bitstamp.net/api/v2/ticker/';

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

   //_________________
    error (err) {
        console.log(err);
    }
}
//______________________________________________________
function getCurrency (cur) {
    var httpReq = new XMLHttpRequest();
    var url = BaseUrl+cur;
    httpReq.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        processJSON (cur,httpReq.responseText);
      }
    };
    httpReq.open("GET", url, false);
    httpReq.send();
  }

//______________________________________________________
function createCurrCheckBox (currName) {
    var nodeCbx = `<input type="checkbox" name="currency" id="${IdCbx}${currName}" value="${currName}">${currName}<br>`;
    var cbx = $(nodeCbx);
    cbx.appendTo($checkBoxes);
}

//______________________________________________________
function initApp () {
    Currencies = new Map();
    Keys.sort();
    CurrNames.sort();
    CurrNames.forEach(function(currName) { 
        cur = new Currency (currName);
        Currencies.set(currName, cur);
    });
}
//______________________________________________________
