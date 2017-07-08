var fs = require('fs');
var lyric_dl = require('lyric-dl');
var common = require('../common');
var subtitles = require('../subtitles');
var style = require('../style');

function handler(app, url, styleConfigFile, options) {
    try{
        var info = lyric_dl.getLoaderFromUrl(url);
    } catch (e) {
        app.exitWithError(e);
    }

    info.loader.download({ 
        id: info.id, 
        extract: true
    }, function (result) {
        if (result.err)
            app.exitWithError(result.err);

        var subtitlesContent = subtitles.lrcToSubtitlesArray(result.lrc, result.tlrc, {
            maxDurationTime: options.maxDuration,
            editMode: options.E || options.editMode,
            mergeDuplicate: options.mergeDuplicate,
        });

        var frameSize = null;

        if (options.frameSize) {
            frameSize = common.parseSize(options.frameSize);
            if (!frameSize)
                app.exitWithError('invalid frame size: ' + options.frameSize);
        }

        var editCode = options.e || options.editCode;

        if (editCode) {
            try
            {
                subtitlesContent = subtitles.applyEditCode(subtitlesContent, editCode);
            } catch (e) {
                app.exitWithError(e);
            }
        }

        var assGenerator = null;
        
        try
        {
            var styleConfig = null;

            if (styleConfigFile) {
                styleConfig = fs.readFileSync(styleConfigFile);
                styleConfig = JSON.parse(styleConfig);
            }
            
            assGenerator = style.createASSWithStyle(result.name, subtitlesContent, {
                frameSize: options.frameSize ? options.frameSize.match(/^(\d+),(\d+)$/).slice(1) : null,
                style: styleConfig ? styleConfig : options.style,
            });
        } catch (e) {
            app.exitWithError(e);
        }
        
        var wstream = null;

        if (options.print) {
            wstream = process.stdout;
        } else {
            wstream = fs.createWriteStream(result.name + '.ass');
        }

        wstream.write(assGenerator.getContent(), (err) => {
            if (err)
                app.exitWithError(err);
            app.exitWithOK();
        });
    })
}

exports.init = function (app, program) {
    app.editcodeHelp(program
        .command('url <url> [styleConfigFile]') 
        .option('-e, --edit-code <edit>', 'enable edit codes, see \'editcode\' section')
        .option('-E, --edit-mode', 'enable edit mode, visible the number in each lyrics lines')
        .option('--print', 'ASS file content write to stdout')
        .option('--frame-size <size>', 'resize frame size')
        .option('--merge-duplicate', 'merge duplicate lyrics')
        .option('--max-duration <second>', 'maximum subtitles duration time', /^\d+\.?\d+$/, '6')
        .description('generate ASS lyrics subtitle from url')
        .action(function(url, styleConfigFile, options){
            app.execCmd = true;
            app.globalOptions(options.parent);
            handler(app, url, styleConfigFile, options);
        }));
}