//var reg = /^([\d,:-]+)([^\d])(.*)/
var reg = /^([\d,:-]+)(\+|-|r|d|<|>)(.*)$/

function parseExtendargs(extendargs) {
    if (!extendargs) {
        return []
    }
    return extendargs.split(',')
}

function parseTarget(target) {
    if (target.indexOf(':') != -1) {
        var content = target.split(':')

        if (content.length != 2 || content[0] === '' || content[1] === '') {
            throw `invalid index range: ${target}`
        }

        return { type: 'range', content: content }
    } else {
        var content = target.split(',')

        if (content.length == 0) {
            throw `invalid index list: ${target}`
        }

        return { type: 'index', content: content }
    }
}

function parseCode(code) {
    var cmds = []

    var lines = code.split(';')
    
    lines.forEach((line) => {
        var m = line.slice().match(reg)

        if (!m) {
            throw `invalid code "${line}"`
        }
        
        cmds.push({
            target: parseTarget(m[1]),
            command: m[2],
            args: parseExtendargs(m[3]),
            raw: line,
        })
    })

    return cmds
}

function checkArgs(args, count, types) {
    if (Array.isArray(count)) {
        if (args.length < count[0])
            throw 'minimum count ' + count[0] +' but given ' + args.length + ' argument(s)'
        if (args.length > count[1])
            throw 'maximum count ' + count[0] +' but given ' + args.length + ' argument(s)'
    } else {
        if (count != null && args.length != count) {
            throw `need count ${count}, but given ${args.length} argument(s)`
        }
    }

    var ret = []

    args.forEach((v, k) => {
        var needType = types ? types[k] : null

        switch (needType) {
            case 'number': {
                var _v = parseFloat(v);

                if (Number.isNaN(_v)) {
                    throw 'bad argument #' + k + ', failed convert to a number';
                }

                ret.push(_v);
                break;
            }
            case 'regexp': {
                var reg = new RegExp(v, 'g');
                ret.push(reg);
                break;
            }
            default:
                ret.push(v);
                break;
        }
    })

    return ret
}

function numberToIndex(length, n) {
    n = parseInt(n)

    if (n == 0) {
        throw `invalid index number ${n}`
    }

    if (n < 0) {
        n = Math.max(length - Math.abs(n), 0)
    } else {
        n -= 1
    }

    return n
}

function getLyricsFromTarget(lyrics, target) {
    var ret = []

    switch(target.type) 
    {
        case 'range':
            var begin = numberToIndex(lyrics.length, target.content[0])
            var end = numberToIndex(lyrics.length, target.content[1])

            if (begin > end) {
                break
            }

            for(var i = begin; i <= end; i++) {
                if (lyrics[i]) {
                    ret.push(lyrics[i])
                } else {
                    break
                }
            }

            break
        case 'index':
            target.content.forEach((v) => {
                var line = lyrics[numberToIndex(lyrics.length, v)]
                if (line) {
                    ret.push(line)
                }
            })
            break
        default:
            break
    }

    return ret
}

function applyCode(lyrics, codeString) {
    if (!codeString) {
        return lyrics
    }

    var cmds = parseCode(codeString)

    cmds.forEach((cmd, index) => {
        var target

        try
        {
            target = getLyricsFromTarget(lyrics, cmd.target)
        } catch (e) {
            throw `${e} in code: (#${index+1}) '${cmd.raw}'`
        }

        try
        {
            switch (cmd.command) {
                case 'r':
                    var args = checkArgs(cmd.args, [1, 2], ['regexp', 'string'])

                    var newstr = args[1] || '';

                    target.forEach((lyric) => {
                        lyric.text = lyric.text.replace(args[0], newstr);
                        if (lyric.translate)
                            lyric.translate = lyric.translate.replace(args[0], newstr);
                    })
                    break
                case 'd':
                    var args = checkArgs(cmd.args, 0, null)

                    target.forEach((lyric) => {
                        lyric._del_mark = true
                    })
                    break
                case '>':
                    var args = checkArgs(cmd.args, 1, ['number'])

                    target.forEach((lyric) => {
                        lyric.time = lyric.time + args[0]
                    })
                    break
                case '<':
                    var args = checkArgs(cmd.args, 1, ['number'])

                    target.forEach((lyric) => {
                        lyric.time = lyric.time - args[0]
                    })
                    break
                case '+':
                    var args = checkArgs(cmd.args, 1, ['number'])

                    target.forEach((lyric) => {
                        lyric.durationTime = lyric.durationTime + args[0]
                    })
                    break
                case '-':
                    var args = checkArgs(cmd.args, 1, ['number'])

                    target.forEach((lyric) => {
                        lyric.durationTime = lyric.durationTime - args[0]
                    })
                    break
                default:
                    throw `unknown type '${cmd.command}'`
            }
        } catch (e) {
            throw `${e}: (#${index+1})'${cmd.raw}'`
        }
    })

    var newLyrics = []

    lyrics.forEach((lyric) => {
        if (!lyric._del_mark) {
            lyric.time = Math.max(lyric.time, 0)
            lyric.durationTime = Math.max(lyric.durationTime, 0)
            newLyrics.push(lyric)
        }
    })

    newLyrics.sort((a, b) => {
        return a.time - b.time
    })

    return newLyrics
}

exports.parseCode = parseCode

exports.applyCode = applyCode;