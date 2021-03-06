//______________________________________________________

var CurrNames = [
		'btcusd', 'btceur', 'eurusd', 'xrpusd', 'xrpeur',
		'xrpbtc', 'ltcusd', 'ltceur', 'ltcbtc', 'ethusd',
		'etheur', 'ethbtc', 'bchusd', 'bcheur', 'bchbtc'
];
var Keys = ['high', 'last', 'bid', 'vwap', 'volume', 'low', 'ask', 'open'];
var Currencies; 
var JsonSocket;
const BaseUrl='https://www.bitstamp.net/api/v2/ticker/';
//const BaseUrl='https://www.google.com:81/';  // use to test timout

const RequestTimeout = 4000;
const IdCbx      = 'Cbx-';
const IdTr       = 'Tr-';
const IdTdName   = 'TdName-';
const IdTdTable  = 'TdTable-';
const IdTdKeyVal = 'TdTableVal-';
const IdTimeVal  = 'TimeVal-';
const IdCanvas   = 'Canvas-';
const IdKeyRadio = 'Key-';
const BufferSamples = 10;
const ClassChanged = 'val-changed';

var $checkBoxes;
var $outTable;
var $keysRadio;
var selectedKey;
//______________________________________________________
class Currency {
    //_________________
    constructor(name) {
      this.currName = name;
      this.httpReq = new XMLHttpRequest();
      this.Samples = [];
      this.lastSample = 0;
    }

    //_________________
    resetValues () { // reset to default CSS properties of JSON values
        var t = IdTdKeyVal+this.currName;
        Keys.forEach(function(key) {
            $('#'+t+key).removeClass(ClassChanged);
        });
    }
    //_________________
    printJson (json) { // dump JSON (into a Table)
        delete json.currName;
        var lastJson = this.Samples[this.lastSample];
        var lastJsonStr = JSON.stringify(lastJson); 
        var thisJsonStr = JSON.stringify(json);
        if ( lastJsonStr != thisJsonStr ) { 
            $('#'+IdTimeVal+this.currName).html(new Date(json.timestamp*1000).toUTCString());
            for (var i = 0; i < Keys.length; i++) {
                var key = Keys[i]; 
                var $n = $('#'+IdTdKeyVal+this.currName+key);
                $n.removeClass(ClassChanged);
                if (lastJson && json[key] != lastJson[key]) {
                    $n.addClass(ClassChanged);
                }
                $n.html(json[key]);
            }
            this.lastSample = (this.lastSample + 1) % BufferSamples;
            this.Samples[this.lastSample] = json;

            this.printGraph();
        }
    }
    //_________________
    getSamples(key) {  // retrieve data point to graph out
        var values = []; 
        var labels = [];
        for (var i=1; i<=BufferSamples; i++) {
            var json = this.Samples[(this.lastSample + i) % BufferSamples];
            var yVal = 0;
            if (json && json[key]) {
                yVal = json[key];
            }
            values[i-1] = yVal;
            labels[i-1]=i;
        }
        return {values: values, labels:labels};
    }
    //_________________
    printGraph() { // create the graph
        var points = this.getSamples(selectedKey);
        var chart = new Chart(IdCanvas+this.currName, {
            type: 'line',
            data: {
                labels: points.labels,
                datasets: [{
                    steppedLine: true,
                    data: points.values,
                    borderColor:'#ff6347',
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: selectedKey
                },
                legend: {
                    display: false
              }
            }
        });
    }
}

//______________________________________________________
function createCurrCheckBox (currName) {
    var nodeCbx = `<input type="checkbox" name="currency" id="${IdCbx}${currName}" value="${currName}">${currName}<br>`;
    var cbx = $(nodeCbx);
    cbx.appendTo($checkBoxes);
}
//______________________________________________________
function createKeyRadios () {
    Keys.forEach(function(key) {
        var nodeRadio = `<lable><input type="radio" name="keys" value="${key}"> ${key}</label><br>`;
        var rd = $(nodeRadio);
        rd.appendTo($keysRadio);
    });
    $('input:radio[name=keys]').on('change',function () {
        rd = $(this);
        if (rd.is(':checked')) { 
            selectedKey = rd.val();
            Currencies.forEach(function(curr) { // re-graph for selectedKey
                curr.printGraph();
            });
        }
    });
}
//______________________________________________________
function createCurrTblRow (currName) {
    var lineTbl  = `<tr id="${IdTr}${currName}"><td id="${IdTdName}${currName}">${currName}</td>`;
    lineTbl += `<td id="${IdTdTable}${currName}"></td><td><div class="g-container1"><div class="g-container2">`;
    lineTbl += `<canvas id="${IdCanvas}${currName}"></canvas></div></div></td></tr>`;
    var $tr = $(lineTbl);
    $tr.appendTo($outTable);
    createJsonTD(currName);
    $tr.hide();
}
//______________________________________________________
function createJsonTD (currName) {
    var timeHeader = `<p id="${IdTimeVal}${currName}">time:-</p>`;
    var table = '<table class="json-table"><tbody>';
    for (var i = 0; i < Keys.length; i++) {
         var key = Keys[i]; 
         table += `<tr><td class="td-key">${key}</td><td class="td-val" id="${IdTdKeyVal}${currName}${key}">-</td></tr>`;
    }
    table += '</tbody></table>';
    var node = $(timeHeader+table);
    var $jsonTD = $('#'+IdTdTable+currName);
    node.appendTo($jsonTD);
}
//______________________________________________________
function initAllNoneButtons () {
    $('button[name="control-btns"]').on('click',function () { 
        var mode = (this.value === 'All') ? false : true;
        $('input:checkbox[name=currency]').prop('checked', mode).click();
        });
}
//______________________________________________________
function initCurrenciesChBoxes () {
    $('input:checkbox[name=currency]').on('click',function () { 
        $row = $('#'+IdTr+this.value);
        if (this.checked) {
            Currencies.get(this.value).resetValues();
            Currencies.get(this.value).printGraph();
            $row.show();
        }
        else { $row.hide(); }
        });
}
//______________________________________________________
function initApp () {
    $checkBoxes = $('#check-boxes');
    $outTable = $('#output-table');
    $keysRadio = $('#keys-radio');
    $checkBoxes.empty();
    $outTable.empty();
    Currencies = new Map();
    Keys.sort();
    CurrNames.sort();
    CurrNames.forEach(function(currName) { // create checkBox & Table row for every Currency
        createCurrCheckBox (currName); 
        createCurrTblRow   (currName);
        cur = new Currency (currName);
        Currencies.set(currName, cur);
    });
    createKeyRadios();       
    initAllNoneButtons();    // attach an event listener to control check boxes
    initCurrenciesChBoxes(); // attach an event listener to currency check boxes
    initWebSocket();         // start retrieving data

    $('#'+IdCbx+'btcusd').click(); //start with btcusd 
    $('input:radio[name=keys][value=bid]').click(); // start with key:bid
}
//______________________________________________________
function initWebSocket () {
    JsonSocket = new WebSocket("ws://localhost:8080/crypto");

    JsonSocket.onopen = function (event) {
       console.log ("Connected on JSON internal WebSocket");
       JsonSocket.send(CurrNames.join(','));
    };

    JsonSocket.onmessage = function (event) {
        console.log ("Received:"+JSON.stringify(event.data));
        var json = JSON.parse(event.data);
        if (json && json.currName) {
            Currencies.get(json.currName).printJson (json);
        }
    };
}
//______________________________________________________
