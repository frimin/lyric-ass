var program = require('commander');
var app = require('../lib/app');
var subtitles = require('../lib/subtitles');

var CommandCase = (function () {
    function CommandCase(name, app, argv, checkCallback) {
        this._name = name;
        this._app = app;
        this._argv = argv;
        this._checkCallback = checkCallback;
    }
    
    CommandCase.prototype.test = function(callback) {
        console.log('\n\ntest case: \'' + this.name + '\' ' + this._argv.join(' '));

        var argv = process.argv.slice(0, 2).concat(this._argv);

        this._app(argv, {
            exitWithOK: function() {
                callback(null);
            },
            exitWithError: function(err) {
                callback(err);
            }
        });
    }

    return CommandCase;
}());

var FunctionCase = (function () {
    function FunctionCase(name, func, args, checkCallback) {
        this.name = name;
        this._f = func;
        this._args = args || [];
        this._checkCallback = checkCallback;
    }

    FunctionCase.prototype.test = function(callback) {
        console.log('\n\ntest case: \'' + this.name + '\'');

        var ret = null;

        try {
            ret = this._f(...this._args);
        } catch (e) {
            console.error(e);
            callback(e);
            return;
        }

        if (this._checkCallback) {
            var check = this._checkCallback(ret);
            callback(!check);
            return;
        }

        return callback(null);
    }
        
    return FunctionCase;
}());

var Test = (function () {
    function Test(app) {
        this._app = app;
        this._event = {};
        this._case = [];
        this.succeed = 0;
        this.failed = 0;
    }

    Test.prototype.on = function(event, f) {
        this._event[event] = f;
    }

    Test.prototype.commandCase = function(name, argv, callback) {
        this._case.push(new CommandCase(name, this._app, argv));
    }

    Test.prototype.functionCase = function(name, func, args, callback) {
        this._case.push(new FunctionCase(name, func, args, callback));
    }

    Test.prototype.start = function(callback) {
        var self = this;
        var next = null;

        next = function(n) {
            var _case = self._case[n];

            if (!_case) {
                setTimeout(callback, 0);
                return;
            }

            _case.test(function(err) {
                if (err)  {
                    console.error('test faild: ' + _case.name);
                    self.failed++ 
                } else { 
                    self.succeed++;
                }

                setTimeout(next, 0, n + 1)
            });
        }

        next(0);
    }
        
    return Test;
}());

var test = new Test(app);

// test.commandCase('download', [ "url", "http://music.163.com/#/m/song?id=1234567", "--print" ]);

var lyrics = [
    ['00:00.00', 'test'],
    ['00:01.00', 'test'],
    ['00:02.00', 'test'],
];

var tlyrics = [
    ['00:00.00', 'test2'],
    ['00:01.00', 'test2'],
    ['00:02.00', 'test2'],
];

test.functionCase('basic to subtitles', subtitles.lrcToSubtitlesArray, [ lyrics ], function (result) {
    return result[0].time == 0;
});

test.functionCase('basic convert to subtitles with translate', subtitles.lrcToSubtitlesArray, [ lyrics, tlyrics ], function (result) {
    return (result[0].time == 0) && (result[0].text === 'test') && (result[0].translate === 'test2');
});

test.functionCase('time move left', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    return subtitles.applyEditCode(list, '1:-1<0.5');
}, [ lyrics ], function (result) {
    return (result[0].time == 0) && (result[1].time == 0.5);
});

test.functionCase('time move right', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    return subtitles.applyEditCode(list, '1:-1>0.5');
}, [ lyrics ], function (result) {
    return (result[0].time == 0.5) && (result[1].time == 1.5);
});

test.functionCase('cut time', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    return subtitles.applyEditCode(list, '1:-1-0.5');
}, [ lyrics, tlyrics ], function (result) {
    return (result[0].durationTime == 0.5) && (result[1].durationTime == 0.5);
});

test.functionCase('add time', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    return subtitles.applyEditCode(list, '1:-1+0.5');
}, [ lyrics, tlyrics ], function (result) {
    return (result[0].durationTime == 1) && (result[1].durationTime == 1) && (result[result.length - 1].durationTime == 6.5);
});

test.functionCase('delete all', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    return subtitles.applyEditCode(list, '1:-1d');
}, [ lyrics, tlyrics ], function (result) {
    return result.length == 0;
});

test.functionCase('delete frist', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    return subtitles.applyEditCode(list, '1d');
}, [ lyrics, tlyrics ], function (result) {
    return result.length == (lyrics.length - 1);
});

test.functionCase('replace char \'s\' to \'*\'', function(lyrics, tlyrics) {
    var list = subtitles.lrcToSubtitlesArray(lyrics, tlyrics);
    list = subtitles.applyEditCode(list, '1:-1rs,*');
    return list;
}, [ lyrics, tlyrics ], function (result) {
    for (var i = 0; i != 2; i++) {
        if (result[i].text != 'te*t')
            return false;
        if (result[i].translate != 'te*t2')
            return false;
    }
    return true;
});

test.functionCase('merge duplicate lyrics', subtitles.lrcToSubtitlesArray, [ lyrics, tlyrics, { mergeDuplicate: true } ], function (result) {
    return result.length == 1;
});

test.start(function() {
    console.log('\n\n' + test.succeed + ' succeed, ' + test.failed + ' failed')
    process.exit(test.failed != 0 ? 1 : 0);
});

