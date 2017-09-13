module.exports = function(grunt) {
    var path = require('path');//node js path object
    return function createFileDataObj(baseUniqueArr, filesInDir, forFileType, fileTblObj) {
        /*this function creates an object which contains all versions of files corresponding to them*/
        var temp= {},//a global temporary object
            len = baseUniqueArr.length,
            key,//key for the object
            index;
        for (var j = 0; j < len; j++) {
            index = baseUniqueArr[j].lastIndexOf('.');
            key = baseUniqueArr[j].substr(0, index);
            for (var i = 0; i < filesInDir.length; i++) {
                var fpath = filesInDir[i],
                    dirname = path.dirname(fpath),
                    extname = path.extname(fpath),
                    basename = path.basename(fpath, extname);
                if (baseUniqueArr[j] == filesInDir[i]) {
                    if (!temp[key]) {
                        temp[key] = [];
                    }
                    temp[key].push(0);
                } else {
                    if (filesInDir[i].match(key + '_v[1-9]+[0-9]*' + extname + '$')) {
                        var regex = new RegExp('_v[1-9]+[0-9]*' + extname + '$'),str = filesInDir[i].match(regex),beforeDot = str[0].split('.')[0],version = beforeDot.split('_v')[1];
                        if (!temp[key]) {
                            temp[key] = [];
                        }
                        temp[key].push(parseInt(version));
                    }


                }
            }
        }
/*for sorting of array value in ascending order*/
        for (var k in temp) {
            temp[k].sort(function(a, b) {
                return a - b;
            });
        }

        for (var d = 0; d < baseUniqueArr.length; d++) {
            var tempObj = {};//temporary object
            tempObj.fname = baseUniqueArr[d];
            tempObj.versionable = true;
            var indx = baseUniqueArr[d].lastIndexOf('.'),fArr = temp[baseUniqueArr[d].substr(0, indx)];
            if (fArr) {
                tempObj.latestVersion = fArr[fArr.length - 1];
            } else {
                tempObj.latestVersion = 0;
            }
            fileTblObj.files[forFileType].push(tempObj);
        }
    };
};
