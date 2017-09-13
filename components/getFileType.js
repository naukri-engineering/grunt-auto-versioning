module.exports = function(grunt) { /*this function gets the file type of files*/
    return function(dirname,rootDirArr,fileType,regex) {
        for (var i = 0; i < rootDirArr.length; i++) {
            //regex = new RegExp(rootDirArr[i]);
            regex = rootDirArr[i];
            if (dirname==regex) {
                fileType = rootDirArr[i];
                break;
            }
        }
        return fileType;
    };
};