var defaultConfig = {
    name: 'default',
    version: 1,
    configs: [
        {
            size: '1920,1080',
            fontSize: 30,
            fontName: 'Apple SD Gothic Neo',
            transFontSize: 40,
            transFontName: 'STHeitiTC-Light',
            textPos: '150,930',
            transTextMoveDown: 50,
            outlineColour: '&H80000000',
            backColour: '&H80000000',
            outline: 8,
        }
    ],
}

exports.config = defaultConfig;

exports.apply = function(assGenerator, config, lyrics, options) {
    assGenerator.createStyle({
        name: 'origin',
        fontName: config.get('fontName'),
        fontSize: config.get('fontSize'),
        outlineColour: config.get('outlineColour'),
        backColour: config.get('backColour'),
        borderStyle: 3,
        outline: config.get('outline'),
        shadow: 0,
    });

    assGenerator.createStyle({
        name: 'trans',
        fontName: config.get('transFontName'),
        fontSize: config.get('transFontSize'),
        outlineColour: config.get('outlineColour'),
        backColour: config.get('backColour'),
        borderStyle: 3,
        outline: config.get('outline'),
        shadow: 0,
    });

    var textPos = assGenerator.toRelativePos(config.get('textPos', 'vector'));
    var translatePos = textPos.slice();
 
    textPos[1] = textPos[1] +  assGenerator.toRelativePos([0, config.get('transTextMoveDown', 'integer')])[1];

    lyrics.forEach((v) => {
        // per secend
        var pixelMove = Math.min(4 * v.durationTime, 40);
        var moveStep = assGenerator.toRelativePos([pixelMove, 0], config.get('size', 'vector'));
        var fadTime = Math.max(v.durationTime * 100 / 5, 20);
        fadTime = Math.min(fadTime, 80);

        var textEffect = assGenerator.fadEffect(fadTime,fadTime) + assGenerator.moveEffect(
            textPos,
            [textPos[0] + moveStep[0], textPos[1]]);

        var translateEffect = assGenerator.fadEffect(fadTime, fadTime) + assGenerator.moveEffect(
            translatePos,
            [translatePos[0] + moveStep[0], translatePos[1]]);
            
        if ((v.text === v.translate) || (v.text && !v.translate)) {
            assGenerator.createEvent({
                'start': v.time,
                'end': v.time + v.durationTime,
                'style': 'trans',
                'text': translateEffect + v.text,
            });
        } else if (v.text && v.translate) {
            assGenerator.createEvent({
                'start': v.time,
                'end': v.time + v.durationTime,
                'style': 'origin',
                'text':  textEffect + v.text,
            });

            assGenerator.createEvent({
                'start': v.time,
                'end': v.time + v.durationTime,
                'style': 'trans',
                'text': translateEffect + v.translate,
            });
        } else {
            throw 'invalid lyrics line'
        }
    })
}