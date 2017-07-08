var fs = require('fs');
var subtitles = require('../subtitles');
var common = require('../common');
var style = require('../style');
var path = require('path');

function handler(app, filename, styleConfigFile, options) {
    var fileContent = fs.readFileSync(filename, { encoding: 'utf8' });

    var sub = new subtitles.ASSSubtitlesParser(fileContent, {
        editMode: options.E || options.editMode,
        mergeDuplicate: options.mergeDuplicate,
    });

    var subtitlesContent = sub.subtitles;

    var editCode = options.e || options.editCode;

    if (editCode)
        subtitlesContent = subtitles.applyEditCode(subtitlesContent, editCode);

    var frameSize = null;

    if (options.frameSize) {
        frameSize = common.parseSize(options.frameSize);
        if (!frameSize)
            app.exitWithError('invalid frame size: ' + options.frameSize);
    } else {
        try {
            frameSize = [ parseInt(sub.baseinfo.PlayResX || 1920), parseInt(sub.baseinfo.PlayResY || 1080) ];
        } catch(e) {
            app.exitWithError('invalid frame size from ASS file');
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

        assGenerator = style.createASSWithStyle(sub.baseinfo.Title || 'untitled', subtitlesContent, {
            frameSize: frameSize,
            style: styleConfig ? styleConfig : options.style,
        });
    } catch (e) {
        app.exitWithError(e);
    }
   
    var wstream = null;

    if (options.print) {
        wstream = process.stdout;
    } else {
        var pathname = path.parse(filename);
        wstream = fs.createWriteStream(pathname.name + ' (Restyled)' + pathname.ext);
    }

    wstream.write(assGenerator.getContent(), (err) => {
        if (err)
            app.exitWithError(err);
        app.exitWithOK();
    });
}

exports.init = function (app, program) {
    app.editcodeHelp(program
        .command('restyle <file> [styleConfigFile]')
        .alias('r')
        .option('-e, --edit-code <edit>', 'enable edit codes, see \'editcode\' section')
        .option('-E, --edit-mode', 'enable edit mode, visible the number in each lyrics lines')
        .option('--print', 'ASS file content write to stdout')
        .option('--style <stylename>', 'specify ASS style name')
        .option('--frame-size <size>', 'resize frame size')
        .option('--merge-duplicate', 'merge duplicate lyrics')
        .option('--max-duration <second>', 'maximum subtitles du ration time', /^\d+\.?\d+$/, '6')
        .description('generate ASS file from exists ASS file')
        .action(function(filename, styleConfigFile, options){
            app.execCmd = true;
            app.globalOptions(options.parent);
            handler(app, filename, styleConfigFile, options);
        }));
}