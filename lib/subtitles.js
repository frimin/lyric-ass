var editcode = require('./editcode');
var assParser = require('ass-parser');

function mergeDuplicateLyrics(lyrics) {
    var newLyrics = [];
    var preLine = null;
    var index = 0

    for(var i = 0; i != lyrics.length; i++) {
        var l = lyrics[i];
        if (preLine && preLine.text == l.text) {
            preLine.durationTime = (l.time - preLine.time) + l.durationTime;
            continue;
        }
        l.rawIndex = ++index;
        newLyrics.push(l);
        preLine = l;
    }

    return newLyrics;
}

function addLyricsIndex(lyrics) {
    for (var i = 0; i != lyrics.length; i++) {
        lyrics[i].text = ('#' + (i + 1) + '/' + lyrics.length + ' ') + lyrics[i].text;
    }

    return lyrics;
}

exports.lrcToSubtitlesArray = function (original, translate, options) {
    var subtitles = [];

    var maxDurationTime = options && parseFloat(options.maxDurationTime) || 6;
    var isEditMode = options && options.editMode || false;
    var isMergeDuplicate = options && options.mergeDuplicate || false;

    var tlrcMap = {};

    if (translate) {
        translate.forEach((v, k) => {
            tlrcMap[v[0]] = v[1]
        });
    }

    original.forEach((v, k) => {
        var m = v[0].match(/^(\d+):(\d+\.\d+)$/);

        if (!m || m.length != 3)
            throw 'failed to parse line: ' + k;

        subtitles.push({
            rawIndex: k,
            time: parseInt(m[1]) * 60 + parseFloat(m[2]), 
            text: v[1],
            translate: tlrcMap[v[0]],
        })
    });

    for (var i = 0; i != subtitles.length; i++) {
        var thisLine = subtitles[i];
        var lastLine = subtitles[i + 1];

        if (lastLine) {
            thisLine.durationTime = Math.min(lastLine.time - thisLine.time, maxDurationTime);
        } else {
            thisLine.durationTime = maxDurationTime;
        }
    }

    if (isMergeDuplicate)
        subtitles = mergeDuplicateLyrics(subtitles);

    if (isEditMode)
        subtitles = addLyricsIndex(subtitles);

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

function parseTime(str) {
    var m = str.match(/^(\d+):(\d+):(\d+\.?\d+?)$/);
    return parseFloat(m[1]) * 3600 + parseFloat(m[2]) * 60 + parseFloat(m[3]);
}

var ASSSubtitlesParser = (function () {
    function ASSSubtitlesParser(content, options) {
        var isEditMode = options && options.editMode || false;
        var isMergeDuplicate = options && options.mergeDuplicate || false;

        var ass = assParser(content);

        this.baseinfo = {};
        this.subtitles = [];
        
        // each section
        for(var i = 0; i != ass.length; i++) {
            var section = ass[i];
            switch (section.section) {
                case 'Script Info': {
                    for(var j = 0; j != section.body.length; j++) {
                        var e = section.body[j];
                        this.baseinfo[e.key] = e.value;
                    }
                    
                    break;
                }
                case 'Events': {
                    var rawIndex = 0;

                    for(var j = 0; j != section.body.length; j++) {
                        var e = section.body[j];

                        if (e.key != 'Dialogue')
                            continue;

                        var text = e.value.Text
                            .replace(/{.*}/,'')
                            .replace(/#\d+\/\d+ /,'');

                        var translate = null;

                        // next line exists and same time info, it's the translate
                        if (section.body[j + 1] 
                            && (section.body[j + 1].value.Start == e.value.Start)
                            && (section.body[j + 1].value.End == e.value.End)) {
                            translate = section.body[j + 1].value.Text.replace(/{.*}/,'');
                            j++; // skip next line
                        }

                        var startTime = parseTime(e.value.Start);
                        var endTime = parseTime(e.value.End);

                        this.subtitles.push({
                            rawIndex: ++rawIndex,
                            time: startTime, 
                            durationTime: endTime - startTime,
                            text: text,
                            translate: translate,
                        })
                    }
                    break;
                }
                default:
                    break;
            }
        }

        if (isMergeDuplicate)
            this.subtitles = mergeDuplicateLyrics(this.subtitles);

        if (isEditMode)
            this.subtitles = addLyricsIndex(this.subtitles);
    }

    return ASSSubtitlesParser;
}());


exports.ASSSubtitlesParser = ASSSubtitlesParser;
