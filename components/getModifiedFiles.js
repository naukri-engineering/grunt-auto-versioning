module.exports = function(grunt) { /*this function excludes the blacklisted and deletd files from modified files*/
    return function(arr, delFilesArr, blackListedArr) {
        for (var i = blackListedArr.length - 1; i >= 0; i--) {
            delFilesArr.push(blackListedArr[i]);
        }
        for (var d = 0; d < delFilesArr.length; d++) {
            var ind = arr.indexOf(delFilesArr[d]);
            ind != -1 ? arr.splice(ind, 1) : '';
        }
        return arr;
    };
};