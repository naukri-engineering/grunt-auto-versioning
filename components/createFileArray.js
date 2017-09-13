module.exports = function(grunt) {/*this function creates a file array for a directory*/
    return function(tempUniqFileDir, tempFileDir, fileName, fileAbsPath, extname) {
        var regex = new RegExp('_v[1-9]+[0-9]*' + extname + '$');
        var fileExts = grunt.config.get("fileExts");
        if (fileExts.indexOf(extname) !== -1) {
            if (!fileName.match(regex)) {
                if (tempUniqFileDir.indexOf(fileAbsPath) === -1) {
                    tempUniqFileDir.push(fileAbsPath);
                    tempFileDir.push(fileAbsPath);
                }
            } else {
                tempFileDir.push(fileAbsPath);
            }
        }

    };
};
