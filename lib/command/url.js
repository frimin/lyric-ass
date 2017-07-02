var fs = require('fs');
var lyric_dl = require('lyric-dl');
var common = require('../common');
var subtitles = require('../subtitles');
var style = require('../style');

function handler(url, options) {
    try{
        var info = lyric_dl.getLoaderFromUrl(url);
    } catch (e) {
        common.exitWithError(e);
    }

    info.loader.download({ 
        id: info.id, 
        extract: true
    }, function (result) {
        if (result.err)
            common.exitWithError(result.err);

        var subtitlesContent = subtitles.lrcToSubtitlesArray(result.lrc, result.tlrc, {
            maxDurationTime: options.maxDuration,
            editMode: options.E || options.editMode,
        });

        var editCode = options.e || options.editCode;

        if (editCode)
            subtitlesContent = subtitles.applyEditCode(subtitlesContent, editCode);

        var assGenerator = style.createASSWithStyle(result.name, subtitlesContent);

        fs.writeFile(result.name + '.ass', assGenerator.getContent(), (err) => {
            if (err)
                common.exitWithError(err);
            process.exit(0)
        })
    })
}

exports.init = function (state, program) {
    program
        .command('url <url>') 
        .option('-e, --edit-code <edit>', 'enable edit codes, see \'edit codes\' section')
        .option('-E, --edit-mode', 'enable edit mode, visible the number in each lyrics lines')
        .option('--frame-size <size>', 'resize frame size, default for 1920,1080')
        .option('--max-duration <second>', 'set default lyric duration time')
        .description('generate ASS lyrics subtitle from url')
        .action(function(url, options){
            state.execCmd = true;
            state.globalOptions(options.parent);
            handler(url, options);
        });
}