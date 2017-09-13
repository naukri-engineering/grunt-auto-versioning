module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            srpCalls: {
                src: [
                    'src/jass/fileA.js',                  
                    'src/jass/fileB.js'
                    
                ],
                dest: 'src/j/fileAB.js',
                nonull: true
            }
        },
        create: {
            options: {
                fileExts: ['.js']
            },
            src: [
                'src/jass',
                'src/j'
            ]
        },
        av: {
            options: {
                blackListedFiles: ['Gruntfile.js', 'fileTable.json']
            },

            src: [
                'src/jass',
                'src/j'
            ]
        },
        merge: {
            src: [
                'src/jass',
                'src/j'
            ]
        }
    });
    grunt.file.expand('./node_modules/grunt-*/tasks').forEach(grunt.loadTasks);
};
