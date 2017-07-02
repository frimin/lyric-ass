var editcode = require('./editcode');

exports.lrcToSubtitlesArray = function (original, translate, options) {
    var subtitles = [];

    var maxDurationTime = options && parseFloat(options.maxDurationTime) || 6;
    var isEditMode = options && options.editMode || false;

    var tlrcMap = {};

    if (translate) {
        translate.forEach((v, k) => {
            tlrcMap[v[0]] = v[1]
        });
    }

    original.forEach((v, k) => {
        var m = v[0].match(/^(\d+):(\d+\.\d+)$/)
        if (!m || m.length != 3)
            throw 'failed to parse line: ' + k;

        subtitles.push({
            'rawIndex': k,
            'time': parseInt(m[1]) * 60 + parseFloat(m[2]), 
            'text': (isEditMode ? ('#' + (k + 1) + '/' + original.length + ' ') : '') + v[1],
            'translate': tlrcMap[v[0]],
        })
    });

    for (var i = 0; i != subtitles.length; i++) {
        var thisLine = subtitles[i]
        var lastLine = subtitles[i + 1]

        if (lastLine) {
            thisLine.durationTime = Math.min(lastLine.time - thisLine.time, maxDurationTime)
        } else {
            thisLine.durationTime = maxDurationTime
        }
    }

    return subtitles;
} 

exports.applyEditCode = function (subtitlesContent, code) {
    var subtitles = subtitlesContent;
    
    subtitles = editcode.applyCode(subtitles, code);

    for (var i = 0; i != subtitles.length; i++) {
        var thisLine = subtitles[i];
        var lastLine = subtitles[i + 1];

        if (lastLine) {
            thisLine.durationTime = Math.min(lastLine.time - thisLine.time, thisLine.durationTime);
            thisLine.durationTime = Math.max(thisLine.durationTime, 0);
        }
    }

    return subtitles;
} 