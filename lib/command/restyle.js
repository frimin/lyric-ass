var fs = require('fs');
var subtitles = require('../subtitles');
var common = require('../common');
var style = require('../style');
var path = require('path');

function handler(filename, options) {
    var fileContent = fs.readFileSync(filename, { encoding: 'utf8' });

    var sub = new subtitles.ASSSubtitlesParser(fileContent, {
        editMode: options.E || options.editMode,
    });

    var subtitlesContent = sub.subtitles;

    var editCode = options.e || options.editCode;

    if (editCode)
        subtitlesContent = subtitles.applyEditCode(subtitlesContent, editCode);

    var frameSize = null;

    if (options.frameSize) {
        frameSize = common.parseFrameSize(options.frameSize);
        if (!frameSize)
            common.exitWithError('invalid frame size: ' + options.frameSize);
    } else {
        try {
            frameSize = [ parseInt(sub.baseinfo.PlayResX || 1920), parseInt(sub.baseinfo.PlayResY || 1080) ];
        } catch(e) {
            common.exitWithError('invalid frame size from ASS file');
        }
    }

    var assGenerator = style.createASSWithStyle(sub.baseinfo.Title || 'untitled', subtitlesContent, {
        frameSize: frameSize,
    });

    var wstream = null;

    if (options.print) {
        wstream = process.stdout;
    } else {
        var pathname = path.parse(filename);
        wstream = fs.createWriteStream(pathname.name + ' (Restyled)' + pathname.ext);
    }

    wstream.write(assGenerator.getContent(), (err) => {
        if (err)
            common.exitWithError(err);
        process.exit(0)
    });
}

exports.init = function (app, program) {
    app.editcodeHelp(program
        .command('restyle <file>')
        .alias('r')
        .option('-e, --edit-code <edit>', 'enable edit codes, see \'editcode\' section')
        .option('-E, --edit-mode', 'enable edit mode, visible the number in each lyrics lines')
        .option('--print', 'ASS file content write to stdout')
        .option('--frame-size <size>', 'resize frame size')
        .option('--max-duration <second>', 'maximum subtitles duration time', /^\d+\.?\d+$/, '6')
        .description('generate ASS file from exists ASS file')
        .action(function(filename, options){
            app.execCmd = true;
            app.globalOptions(options.parent);
            handler(filename, options);
        }));
}