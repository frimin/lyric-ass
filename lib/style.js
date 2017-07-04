var ass = require('../lib/ass');

var availableStyleList = [
    'default'
];

var availableStyle = {};

for(var i = 0; i != availableStyleList.length; i++) {
    availableStyle[availableStyleList[i]] = true;
}

exports.createASSWithStyle = function(title, lyrics, options) {
    var styleName = options && options.style || 'default';
    var style = require('./style/' + styleName);

    var frameSize = options && options.frameSize || [1920, 1080];

    var assGenerator = new ass.ASSGenerator({
        title: title || 'untitled',
        width: frameSize[0],
        height: frameSize[1],
    });

    options = options || {}
    options.fontName = options.fontName || 'Apple SD Gothic Neo'

    style.apply(assGenerator, lyrics, options);

    return assGenerator;
}