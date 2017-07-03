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

    var assGenerator = style.createASSWithStyle(sub.baseinfo.Title || 'untitled', subtitlesContent, {
        screenSize: options.frameSize ? options.frameSize.match(/^(\d+),(\d+)$/).slice(1) : null,
    });

    var pathname = path.parse(filename);

    fs.writeFile(pathname.name + ' (Restyled)' + pathname.ext, assGenerator.getContent(), (err) => {
        if (err)
            common.exitWithError(err);
        process.exit(0)
    });
}

exports.init = function (state, program) {
    program
        .command('restyle <file>')
        .alias('r')
        .option('-e, --edit-code <edit>', 'enable edit codes, see \'edit codes\' section')
        .option('-E, --edit-mode', 'enable edit mode, visible the number in each lyrics lines')
        .option('--frame-size <size>', 'resize frame size', /^\d+,\d+$/, '1920,1080')
        .option('--max-duration <second>', 'maximum subtitles duration time', /^\d+\.?\d+$/, '6')
        .description('restyle a ASS file from exists ASS file')
        .action(function(filename, options){
            state.execCmd = true;
            state.globalOptions(options.parent);
            handler(filename, options);
        });
}