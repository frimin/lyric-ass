var ass = require('../lib/ass');
var common = require('./common')

var availableStyleList = [
    'default'
];

var availableStyle = {};

for(var i = 0; i != availableStyleList.length; i++) {
    availableStyle[availableStyleList[i]] = true;
}
 
exports.getStyle = function(styleName) {
    if (!availableStyle[styleName]) {
        throw 'invalid style name: ' + styleName;
    }
    return require('./style/' + styleName);
}

var ConfigReader = (function () {
    function ConfigReader(config, defaultConfig) {
        this._config = config;
        this._defaultConfig = defaultConfig;
    }

    ConfigReader.prototype.get = function(key, type) {
        var val = this._config[key];

        if (typeof val === 'undefined') {
            if (this._defaultConfig && typeof this._defaultConfig[key] !== 'undefined') {
                val = this._defaultConfig[key];
            } else {
                throw 'style property \'' + key+ '\' not exists';
            }
        }

        switch(type) {
            case 'integer':
                return parseInt(val);
            case 'vector':
                return common.parseSize(val);
            case 'string':
            default:
                return val.toString();
        }
    }
        
    return ConfigReader;
}());

function findConfig(size, totalConfig) {
    for(var i = 0; i != totalConfig.configs.length; i++) {
        if (totalConfig.configs[i].size == size) {
            return totalConfig.configs[i];
        }
    }
    return null;
}

exports.createASSWithStyle = function(title, lyrics, options) {
    var styleName = null;;
    var style = null;
    var totalConfig = null;

    if (options && options.style) {
        if (typeof options.style == 'string') {
            styleName = options.style;
            style = exports.getStyle(styleName);
            totalConfig = style.config;
        } else {
            styleName = options.style.name;
            style = exports.getStyle(styleName);
            totalConfig = options.style;
        }
    } else {
        styleName = 'default';
        style = exports.getStyle(styleName);
        totalConfig = style.config;
    }

    var frameSize = options && options.frameSize || [1920, 1080];

    var subConfig = findConfig(frameSize.join(','), totalConfig);
    var defaultConfig = findConfig(frameSize.join(','), style.config);

    if (!subConfig) {
        throw 'style \'' + styleName + '\' not support frame size \'' + frameSize.join(',') + '\''
    }

    var assGenerator = new ass.ASSGenerator({
        title: title || 'untitled',
        width: frameSize[0],
        height: frameSize[1],
    });

    options = options || {}

    style.apply(assGenerator, new ConfigReader(subConfig, defaultConfig), lyrics, options);

    return assGenerator;
}