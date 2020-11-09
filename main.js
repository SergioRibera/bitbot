const fs = require('fs');
const notifier = require('node-notifier');
const path = require('path');
const request = require('request');

const Client = require('coinbase').Client;
let client = new Client({ 'apiKey':'sbFIwcZOkLWVugdf', 'apiSecret': '78iBPRLVfds3lnGVF00aZNLlsnZ9ldY9', strictSSL: false });

const SysTray = require('systray').default;
const { Config } = require('./data');
const appName = 'bitbot';
const iconBase64 = new Buffer(fs.readFileSync('./src/icon.png')).toString('base64');

let userData = {
    myBtc: 0,
    myMoney: 100,
    minPriceToBuy: 20,
    minPriceToSell: 100,
    intervalMinutesComp: 5
}

if(!Config.Exits(appName))
    Config.Save(appName, userData);
else
    userData = Config.Load(appName);

const systray = new SysTray({
    menu: {
        // you should using .png icon in macOS/Linux, but .ico format in windows
        icon: iconBase64,
        title: "BitBot",
        tooltip: "BitBot",
        items: [
            {
                title: "",
                tooltip: "bb",
                enabled: true
            },
            {
                title: "",
                tooltip: "bb",
                enabled: true
            },

            {
                title: "",
                tooltip: "bb",
                enabled: true
            },
            {
                title: "",
                tooltip: "bb",
                enabled: true
            },
            {
                title: "Exit",
                tooltip: "bb",
                checked: false,
                enabled: true
            }
        ]
    },
    debug: false,
    copyDir: true,
});
systray.onClick(action => {
    if (action.seq_id === 2) {
        systray.kill();
    }
});

function notifyUpdate(msg){
    notifier.notify(
        {
            title: 'BitBot', message: 'Searching New Datas:\n\n\n' + msg,
            icon: path.join(__dirname, 'src/icon.png'),
            sound: true, wait: true
        }, (err, response, metadata) => { }
    );
}
function sysTrayChangeData(index, dat){
    systray.sendAction({
        type: 'update-item',
        item: {
            title: dat
        },
        seq_id: index,
    });
}

function getBTCPrice() {
    client.getSellPrice({'currencyPair': 'BTC-BOB'}, (err, obj) => {
        if (err) { return console.log(err);}
        let btcSell = obj.data.amount;
        sysTrayChangeData(2, 'Sell: ' + btcSell);
        // Get Buy Price
        client.getBuyPrice({'currencyPair':'BTC-BOB'}, (err, obj) => {
            if (err) { return console.log(err); }
            let btcBuy = obj.data.amount;
            sysTrayChangeData(3, 'Buy: ' + btcBuy);
            notifyUpdate(`Sell: ${btcSell}\nBuy: ${btcBuy}`);
            if(btcSell >= userData.minPriceToSell && userData.myBtc > 1){
                notifyUpdate('Selling BTC');
                userData.myBtc--;
                userData.myMoney += btcSell;
            }
            if(btcBuy <= userData.minPriceToBuy && userData.myMoney - btcBuy > 0){
                notifyUpdate('Buying BTC');
                userData.myBtc++;
                userData.myMoney -= btcBuy;
            }
            sysTrayChangeData(0, `BTC: ${userData.myBtc}`);
            sysTrayChangeData(1, `Money: ${userData.myMoney}`);
            Config.Save(appName, userData);
 
        });

    });
    /*request({ url: 'https://api.coinbase.com/v2/prices/BTC-BOB/sell', json: true }, (err, res, body) => {
        if (err) { return; }
        let btcSell = body['data']['amount'];
        sysTrayChangeData(2, 'Sell: ' + btcSell);
        request({ url: 'https://api.coinbase.com/v2/prices/BTC-BOB/buy', json: true }, (err, res, body) => {
            if (err) { return; }
            let btcBuy = body['data']['amount'];
            sysTrayChangeData(3, 'Buy: ' + btcBuy);
            notifyUpdate(`Sell: ${btcSell}\nBuy: ${btcBuy}`);
            if(btcSell >= userData.minPriceToSell && userData.myBtc > 1){
                console.log('Sell BitCoin');
                userData.myBtc--;
                userData.myMoney += btcSell;
            }
            if(btcBuy <= userData.minPriceToBuy && userData.myMoney - btcBuy > 0){
                console.log('Buy BitCoin');
                userData.myBtc++;
                userData.myMoney -= btcBuy;
            }
            sysTrayChangeData(0, `BTC: ${userData.myBtc}`);
            sysTrayChangeData(1, `Money: ${userData.myMoney}`);
            Config.Save(appName, userData);
        });
    });*/
}
setInterval(() => {
    getBTCPrice();
}, 1000 * 60 * userData.intervalMinutesComp);
getBTCPrice();
