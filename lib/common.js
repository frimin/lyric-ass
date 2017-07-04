exports.exitWithError = function(err) {
    console.error(err);
    process.exit(2);
}

exports.parseFrameSize = function(str) {
    var m = str.match(/^(\d+),(\d+)$/);

    if (!m || m.length != 3)
        return null;
    
    return m.slice(1);
}