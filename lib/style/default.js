exports.apply = function(assGenerator, lyrics, options) {
    assGenerator.createStyle({
        name: 'origin',
        fontName: options.fontName,
        fontSize: 40,
    });

    assGenerator.createStyle({
        name: 'trans',
        fontName: options.fontName,
        fontSize: 50,
    });

    var textPos = assGenerator.toRelativePos([150, 928], [1920, 1080])
    var translatePos = assGenerator.toRelativePos([150, 980], [1920, 1080])
    var moveStep = assGenerator.toRelativePos([10, 0], [1920, 1080])

    var textEffect = assGenerator.fadEffect(80,80) + assGenerator.moveEffect(
        [textPos[0] - moveStep[0], textPos[1]],
        [textPos[0] + moveStep[0] * 2, textPos[1]])

    var translateEffect = assGenerator.fadEffect(80,80) + assGenerator.moveEffect(
        translatePos,
        [translatePos[0] + moveStep[0] * 2, translatePos[1]])

    lyrics.forEach((v) => {
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