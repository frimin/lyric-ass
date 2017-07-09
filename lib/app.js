#!/usr/bin/env node
'use strict'

var common = require('../lib/common');
var program = require('commander');

function main(argv, options) {
    var app = {};

    app.exitWithOK = (options && options.exitWithOK) || common.exitWithOK;
    app.exitWithError = (options && options.exitWithError) || common.exitWithError;
    app.log = (options && options.print) || console.log;
    app.error = (options && options.error) || console.error;
    app.stdin = (options && options.stdin) || process.stdin;
    app.stdout = (options && options.stdout) || process.stdout;
    app.stderr = (options && options.stderr) || process.stderr;

    app.editcodeHelp = function(program) {
        program.on('--help', function(){
            console.log("  Editcode:\n\
    Usage: <range|list><command>[arg1[,arg2[,...]]]\n\
    \n\
    range: <startindex>:<endindex>\n\
    list: <index>,<index>[,...]\n\
    \n\
    'r'<regexp>,[newstring]    replace lyrics content to newstring (optional)\n\
    'd'                         delete lyrics\n\
    '>'<sec>                    move the lyrics to back <sec> second(s)\n\
    '<'<sec>                    move the lyrics to front <sec> second(s)\n\
    '+'<sec>                    add lyrics duration time <sec> second(s)\n\
    '-'<sec>                    reduce lyrics duration time <sec> second(s)\n\
    \n\
    Example:\n\
    \n\
    '1:-1>1;-1d' : move all the lyrics backwards 1 second and delete the last one\n\
    '1:-1r\((.*)\),$1' : replace all lyrics and insert submatch #1 to remove parentheses\n\
    \n\
    Not allowed use ';' and ',' in editcode arguments.\n\
");
    });
    }

    app.globalOptions = function (options) { }

    require('../lib/command/url').init(app, program);
    require('../lib/command/restyle').init(app, program);
    require('../lib/command/style-config').init(app, program);

    program.parse(argv);

    if (typeof app.execCmd === 'undefined') {
        common.exitWithError('no command given, use "--help" or "<cmd> --help" option to get usage information.');
    }
}

module.exports = main;