var frameSizeConfig = {
    '1920,1080': {
        scale: false, // TODO
        size: [1920, 1080],
        fontSize: 35,
        transFontSize: 45,
        textPos: [150, 950],
        transTextMoveDown: 50,
    },
}

exports.frameSizeConfig = frameSizeConfig;

exports.apply = function(assGenerator, config, lyrics, options) {
    var originFontSize = assGenerator.toCurrentPos([0, config.fontSize], config.size)[1];
    var transFontSize = assGenerator.toCurrentPos([0, config.transFontSize], config.siz)[1];

    assGenerator.createStyle({
        name: 'origin',
        fontName: 'Apple SD Gothic Neo',
        fontSize: originFontSize,
        outlineColour: '&H80000000',
        backColour: '&H80000000',
        borderStyle: 3,
        outline: 5,
        shadow: 0,
    });

    assGenerator.createStyle({
        name: 'trans',
        fontName: 'STHeitiTC-Light',
        fontSize: transFontSize,
        outlineColour: '&H80000000',
        backColour: '&H80000000',
        borderStyle: 3,
        outline: 5,
        shadow: 0,
    });

    var textPos = assGenerator.toRelativePos(config.textPos, config.size)
    var translatePos = textPos.slice();
 
    textPos[1] = textPos[1] + assGenerator.toRelativePos([0, config.transTextMoveDown])[1];

    lyrics.forEach((v) => {
        // 10 pix per secend
        var moveStep = assGenerator.toRelativePos([3 * v.durationTime, 0], config.size)
        var fadTime = Math.max(v.durationTime * 100 / 5, 20);
        fadTime = Math.min(fadTime, 80);

        var textEffect = assGenerator.fadEffect(fadTime,fadTime) + assGenerator.moveEffect(
            textPos,
            [textPos[0] + moveStep[0] * 2, textPos[1]])

        var translateEffect = assGenerator.fadEffect(fadTime, fadTime) + assGenerator.moveEffect(
            translatePos,
            [translatePos[0] + moveStep[0] * 2, translatePos[1]])
            
        if (v.text) {
            assGenerator.createEvent({
                'start': v.time,
                'end': v.time + v.durationTime,
                'style': 'origin',
                'text':  textEffect + v.text,
            })
        }

        if (v.translate) {
            assGenerator.createEvent({
                'start': v.time,
                'end': v.time + v.durationTime,
                'style': 'trans',
                'text': translateEffect + v.translate,
            })
        }
    })
}