var fs = require('fs');
var style = require('../style');
var common = require('../common')

function handler(app, stylename, options) {
    stylename = stylename || 'default';

    var s = null;

    try {
        s = style.getStyle(stylename);
        var filename = stylename + '.json';
        fs.writeFileSync(filename,JSON.stringify(s.config, null, '    ') );
        console.log('\'' + filename + '\' has been created');
    } catch (e) {
        app.exitWithError(e);
    }

    app.exitWithOK();
}

exports.init = function (app, program) {
    program
        .command('style-config [stylename]')
        .alias('c')
        .description('generate a config file for custom style')
        .action(function(filename, options){
            app.execCmd = true;
            app.globalOptions(options.parent);
            handler(app, filename, options);
        });
}