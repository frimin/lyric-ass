var ass = require('../lib/ass');

var availableStyleList = [
    'default',
    'subtitle'
];

var availableStyle = {};

for(var i = 0; i != availableStyleList.length; i++) {
    availableStyle[availableStyleList[i]] = true;
}

exports.createASSWithStyle = function(title, lyrics, options) {
    var styleName = options && options.style || 'default';
    var style = require('./style/' + styleName);

    var frameSize = options && options.frameSize || [1920, 1080];

    var frameSizeConfig = style.frameSizeConfig[frameSize.join(',')];

    if (!frameSizeConfig) {
        throw 'style \'' + styleName + '\' not support frame size \'' + frameSize.join(',') + '\''
    }

    var assGenerator = new ass.ASSGenerator({
        title: title || 'untitled',
        width: frameSize[0],
        height: frameSize[1],
    });

    options = options || {}
    options.fontName = options.fontName || 'Apple SD Gothic Neo'

    style.apply(assGenerator, frameSizeConfig, lyrics, options);

    return assGenerator;
}