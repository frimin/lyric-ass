exports.apply = function(assGenerator, lyrics, options) {
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
                'style': 'style_1',
                'text':  textEffect + v.text,
            })
        }

        if (v.translate) {
            assGenerator.createEvent({
                'start': v.time,
                'end': v.time + v.durationTime,
                'style': 'style_2',
                'text': translateEffect + v.translate,
            })
        }
    })
}