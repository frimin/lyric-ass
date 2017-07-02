exports.init = function (state, program) {
    program
        .command('recreate <url>')
        .alias('r')
        .description('create a ASS file from exists ASS file')
        .action(function(args, options){
            state.execCmd = true;
            state.globalOptions(options.parent);
        });
}