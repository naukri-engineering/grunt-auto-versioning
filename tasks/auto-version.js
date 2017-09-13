/*
 * grunt-auto-versioning
 * developed by Naukri FED
 *
 * Copyright (c) 2017.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    require('grunt-config-merge')(grunt);
    require('./../components/mergeTasks')(grunt);
    grunt.registerMultiTask('create', "task to create new branch", function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            ftDir: '.',
            ext: '.json',
            ftName: 'fileTable',
            fileExts: ['.js', '.css', '.scss']
        });
        var ftDir = options.ftDir + '/' + options.ftName + options.ext;
        var files = this.files;
        grunt.config.set("rootDirArr", files[0].src);
        grunt.config.set("fileTblDir", ftDir);
        grunt.config.set("fileExts", options.fileExts);
        var branchName = grunt.option('bn') || '';
        var recreate=grunt.option('recreate')|| '';
        if (branchName == '') {
            if(recreate==''){
                grunt.log.writeln('you might forgot to enter branch name');
            }
            else{
                grunt.task.run('shell:createFileTable');
            }
            
        }
        else{
            grunt.task.run(['shell:doesBranchExist:' + branchName]);
        }

    });
    grunt.registerMultiTask('av', "task for version control", function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            ftDir: '.',
            ext: '.json',
            ftName: 'fileTable',
            blackListedFiles: ['Gruntfile.js', 'fileTable.json']
        });
        var ftDir = options.ftDir + '/' + options.ftName + options.ext;
        grunt.config.set("fileTblDir", ftDir);
        var files = this.files;
        grunt.config.set("rootDirArr", files[0].src);
        grunt.config.set("blackListedFiles", options.blackListedFiles);
        grunt.task.run('shell:autoVers');

    });
    grunt.registerMultiTask('merge', "task to merge a remote branch", function() {
        var branchName = grunt.option('bn') || '';
        var options = this.options({
            ftDir: '.',
            ext: '.json',
            ftName: 'fileTable'
        });
        var ftDir = options.ftDir + '/' + options.ftName + options.ext;
        grunt.config.set("fileTblDir", ftDir);
        var files = this.files;
        grunt.config.set("rootDirArr", files[0].src);
        if (branchName == '') {
            grunt.log.writeln('Ooops!!!,enter branch name to be merged with current branch');
        } else {
            grunt.task.run(['shell:getMergedFiles:' + branchName]);
        }

    });

};
