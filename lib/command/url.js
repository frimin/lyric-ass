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

        var frameSize = null;

        if (options.frameSize) {
            frameSize = common.parseFrameSize(options.frameSize);
            if (!frameSize)
                common.exitWithError('invalid frame size: ' + options.frameSize);
        }

        var editCode = options.e || options.editCode;

        if (editCode) {
            try
            {
                subtitlesContent = subtitles.applyEditCode(subtitlesContent, editCode);
            } catch (e) {
                common.exitWithError(e);
            }
        }

        var assGenerator = style.createASSWithStyle(result.name, subtitlesContent, {
            frameSize: options.frameSize ? options.frameSize.match(/^(\d+),(\d+)$/).slice(1) : null
        });

        var wstream = null;

        if (options.print) {
            wstream = process.stdout;
        } else {
            wstream = fs.createWriteStream(result.name + '.ass');
        }

        wstream.write(assGenerator.getContent(), (err) => {
            if (err)
                common.exitWithError(err);
            process.exit(0)
        });
    })
}

exports.init = function (app, program) {
    app.editcodeHelp(program
        .command('url <url>') 
        .option('-e, --edit-code <edit>', 'enable edit codes, see \'editcode\' section')
        .option('-E, --edit-mode', 'enable edit mode, visible the number in each lyrics lines')
        .option('--print', 'ASS file content write to stdout')
        .option('--frame-size <size>', 'resize frame size', /^\d+,\d+$/)
        .option('--max-duration <second>', 'maximum subtitles duration time', /^\d+\.?\d+$/, '6')
        .description('generate ASS lyrics subtitle from url')
        .action(function(url, options){
            app.execCmd = true;
            app.globalOptions(options.parent);
            handler(url, options);
        }));
}