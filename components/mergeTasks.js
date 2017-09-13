module.exports = function(grunt) {
    var fs = require('fs'),//node file system object
        path = require('path');
    var that = {};
    that.createFileArray = require('./../components/createFileArray')(grunt);
    that.createFileDataObj = require('./../components/createDataObject')(grunt);
    that.getModifiedFiles=require('./../components/getModifiedFiles')(grunt);
    that.getFileType=require('./../components/getFileType')(grunt);
    return grunt.mergeConfig({
        shell: {
            doesBranchExist: { //this task checks whether that branch exists or not, if yes warns with message
                command: function(branchName) {
                    grunt.config.set('branchName', branchName);
                    return 'git branch --list ' + branchName;
                },
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {

                        if (stdout != '') {
                            grunt.log.writeln("branch "+grunt.config.get('branchName')+" already exists");

                        } else {
                            grunt.log.writeln("creating branch "+grunt.config.get('branchName')+"...");
                            grunt.task.run('shell:createBranch:' + grunt.config.get('branchName'));
                        }
                        cb(); //callback method of shell plugin to return to the calling environment
                    }
                }
            },
            createBranch: {//task for creating a branch
                command: function(branchName) { //branchName is branch name which is get through command line
                    return 'git checkout -b ' + branchName;
                },
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        grunt.task.run('shell:createFileTable');
                        cb(); 
                    }
                }
            },
            recreateFileTable:{
                command: function(branchName) { //branchName is branch name which is get through command line
                    return 'grunt create --recreate=true';
                },
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        cb(); 
                    }
                }
            },
            createFileTable: {//task for creating file table

                command: '',
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        /*creation of file table object
                         *that will pe persisted to file system*/
                        var rootDirArr = grunt.config.get("rootDirArr"),ftStructure = {},_this = {};
                        for (var i = 0; i < rootDirArr.length; i++) {
                            ftStructure[rootDirArr[i]] = [];
                            _this['baseUniqueArr' + rootDirArr[i].replace('/', '')] = [];
                            _this['filesInDir' + rootDirArr[i].replace('/', '')] = [];
                        }
                        var fileTblObj = {
                            'files': ftStructure 
                        };//file table empty object
                        for (var i = 0; i < rootDirArr.length; i++) {
                            var baseUniqueArrName = 'baseUniqueArr' + rootDirArr[i].replace('/', ''),filesInDirName = 'filesInDir' + rootDirArr[i].replace('/', '');
                            grunt.file.recurse(rootDirArr[i], function(abspath, rootdir, subdir, filename) {
                                var fpath = abspath,dirname = path.dirname(fpath),extname = path.extname(fpath);
                                that.createFileArray(_this[baseUniqueArrName], _this[filesInDirName], filename, abspath, extname);
                            });
                            that.createFileDataObj(_this[baseUniqueArrName], _this[filesInDirName], rootDirArr[i], fileTblObj);
                        }
                        fs.createWriteStream(grunt.config.get("fileTblDir"));
                        grunt.file.write(grunt.config.get("fileTblDir"), JSON.stringify(fileTblObj));
                        cb();
                    }
                }
            },
            autoVersion: {
                // finds the modified files and implements auto versioning job on them
                command: 'git status | grep modified | cut -c 14-',
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        var rootDirArr = grunt.config.get("rootDirArr"),fileTable = grunt.file.readJSON(grunt.config.get("fileTblDir")),delFilesArr = grunt.config.get('delFiles'),blackListedArr = grunt.config.get('blackListedFiles'),arr = stdout.split('\n');
                        arr.pop();
                        arr=that.getModifiedFiles(arr,delFilesArr,blackListedArr);
                        for (var i = 0, len = arr.length; i < len; i++) {
                            var fpath = arr[i],dirname = path.dirname(fpath),extname = path.extname(fpath),fnameKey = '',regex = new RegExp('_v[1-9]+[0-9]*' + extname + '$'),matchVal = fpath.match(regex);
                            if (matchVal) {
                                fnameKey = fpath.replace(matchVal[0], '') + extname;
                            } else {
                                fnameKey = fpath;
                            }
                            /*to get fileType of the file*/
                            var latestVer = '',fileType = '',regex1 = '';//latestVer is latestversion of a file, regex1 is regex variable
                            fileType=that.getFileType(dirname,rootDirArr,fileType,regex1);
                            if (!fileType) {
                                continue;
                            }
                            /*to get lateset version of that file*/
                            for (var m = 0; m < fileTable.files[fileType].length; m++) {
                                if (fileTable.files[fileType][m].fname == fnameKey) {
                                    latestVer = fileTable.files[fileType][m].latestVersion;
                                    break;
                                }
                            }
                            /*to create new path of file*/
                            var fpathNew = '';
                            if (fnameKey == fpath) {
                                fpathNew = fpath.replace(extname, '') + '_v' + (parseInt(latestVer) + 1) + extname;
                            } else {
                                var repRegex = new RegExp('[1-9]+[0-9]*' + extname + '$');
                                fpathNew = fpath.replace(repRegex, '') + (parseInt(latestVer) + 1) + extname;
                            }
                            /*to check if versionable attribute is true, then only version*/
                            if (fileTable.files[fileType][m].versionable) {
                                grunt.file.copy(fpath, fpathNew);
                                fileTable.files[fileType][m].versionable = false;
                                fileTable.files[fileType][m].latestVersion = parseInt(latestVer) + 1;
                                grunt.file.write(grunt.config.get("fileTblDir"), JSON.stringify(fileTable));
                                grunt.task.run('shell:revertModified:' + fpath);
                            } else {
                                /*if versionable attribute is false and current version of file in filetable is greater than that of file in directory,then also version and copy and revert */
                                /*get the directory of file first then get the latest version from it*/
                                var recurseDir = fileType,tempObj = {};
                                tempObj[fnameKey] = [];
                                grunt.file.recurse(recurseDir, function(abspath, rootdir, subdir, filename) {
                                    //abspath
                                    var matchReg = new RegExp('_v[1-9]+[0-9]*' + extname + '$'),matchValue = abspath.match(matchReg);
                                    if (matchValue) {
                                        if((abspath.replace(matchValue[0],'')+extname)==fnameKey){
                                            tempObj[fnameKey].push(parseInt(matchValue[0].replace('_v','').replace(extname, '')));
                                        }
                                        
                                    } else {
                                        tempObj[fnameKey].push(0);
                                    }
                                });                              
                                /*sort the version array of that file in ascending order*/
                                tempObj[fnameKey].sort(function(a, b) {
                                    return a - b;
                                });
                                if (parseInt(latestVer) > tempObj[fnameKey].pop()) {
                                    var reg = new RegExp('_v[1-9]+[0-9]*' + extname + '$'); //reg is regex object
                                    fpathNew = fpathNew.replace(reg, '') + '_v' + (parseInt(latestVer)) + extname;
                                    grunt.file.copy(fpath, fpathNew);
                                    grunt.file.write(grunt.config.get("fileTblDir"), JSON.stringify(fileTable));
                                    grunt.task.run('shell:revertModified:' + fpath);
                                }
                            }
                        }
                        cb();
                    }
                }
            },
            revertModified: {/*task for reverting modified file*/
                command: function(fpath) {
                    return ['git reset HEAD ' + fpath, 'git checkout ' + fpath].join('&&');
                },
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        cb();
                    }
                }
            },
            autoVers: {/*to get list of deleted files*/
                command: 'git ls-files --deleted',
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        var arr = stdout.split('\n');
                        grunt.config.set('delFiles', arr);
                        grunt.task.run('shell:autoVersion');
                        cb();
                    }
                }
            },
            getMergedFiles: {/*to merge the branches and run merge task*/
                command: function(branchName) {
                    return 'git merge --no-commit --no-ff ' + branchName;
                },
                options: {
                    stdout: true,
                    callback: function(err, stdout, stderr, cb) {
                        grunt.task.run('shell:merge');
                        cb();
                    }
                }
            },
            merge: {/*to list out modified and new files after merge*/
                command: function() {
                    return 'git status --s | cut -c 4-';
                },
                options: {
                    stdout: false,
                    callback: function(err, stdout, stderr, cb) {
                        var mergeFileArray = stdout.split('\n');
                        mergeFileArray.splice(mergeFileArray.length - 1, 1);
                        var removeIndex = mergeFileArray.indexOf("Gruntfile.js");
                        if (removeIndex != -1) {
                            mergeFileArray.splice(removeIndex, 1);
                        }
                        var mergeFileArray = mergeFileArray.map(function(fname, index) {
                            var rootDirArr = grunt.config.get("rootDirArr"),array = fname.match(/_v(.*)\./),extension = fname.match(/[^.]*$/),dirname = path.dirname(fname),regex = '';
                            for (var i = 0; i < rootDirArr.length; i++) {
                                regex = new RegExp(rootDirArr[i]);
                                if (dirname.match(regex)) {
                                    extension = rootDirArr[i];
                                }
                            }
                            var toBeReplaced = array ? array[0] : '',version = array ? parseInt(array[1]) : 0;
                            return {
                                fname: fname.replace(toBeReplaced, '.'),
                                latestVersion: version,
                                extension: extension,
                                updated: false
                            };

                        });
                        var fileTable = grunt.file.readJSON('fileTable.json');
                        for (var i = 0; i < mergeFileArray.length; i++) {
                            var object = mergeFileArray[i];
                            var fileTypeArray = fileTable.files[object.extension];
                            if(!fileTypeArray) {
                                continue;
                            }
                            for (var j = 0; j < fileTypeArray.length; j++) {
                                if (fileTypeArray[j].fname == object.fname) {
                                    fileTypeArray[j].versionable = true;
                                    fileTypeArray[j].latestVersion = object.latestVersion;
                                    object.updated = true;
                                    break;
                                }
                            }
                            if (object.updated == false) {
                                fileTypeArray.push({
                                    fname: object.fname,
                                    latestVersion: object.latestVersion,
                                    versionable: true
                                });
                            }
                        }

                        fs.createWriteStream(grunt.config.get("fileTblDir"));
                        /*Persist the object in a file */
                        grunt.file.write(grunt.config.get("fileTblDir"), JSON.stringify(fileTable));
                        cb();
                    }
                }
            }

        }
    });
};
