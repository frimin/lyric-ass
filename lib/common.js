exports.exitWithError = function(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.error(err.message);
        } else {
            console.error(err);
        }
    } else {
        console.error(err);
    }
    
    process.exit(2);
}

exports.parseSize = function(str) {
    var m = str.match(/^(\d+),(\d+)$/);

    if (!m || m.length != 3)
        throw 'failed to parse :' + str;
    
    return m.slice(1);
}