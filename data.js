const path = require('path');
const fs = require('fs');

class Config {
    static createDir(targetDir){
        fs.mkdirSync(targetDir, { recursive: true });
    }
    static getUserHome(){
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    };
    static Save(appName, data){
        let configFolder = path.join(this.getUserHome(), '.config', appName, 'config.json');
        fs.writeFile(configFolder, JSON.stringify(data, null, 4), (err) => {
            if (err) throw err;
        });
    };
    static Exits(appName){
        let configFolder = path.join(this.getUserHome(), '.config', appName);
        let configFile = path.join(configFolder, 'config.json');
        let e = fs.existsSync(configFile);
        if(!e) this.createDir(configFolder);
        return e;
    }
    static Load(appName){
        let configFile = path.join(this.getUserHome(), '.config', appName, 'config.json');
        let rawData = fs.readFileSync(configFile);
        return JSON.parse(rawData);
    }
}

module.exports.Config = Config;
