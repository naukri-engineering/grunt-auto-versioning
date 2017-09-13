# Description
This is a grunt plugin and can automate the versioning of any file (be it .html/.css/.js/.scss/.php etc type)  and backs-up the current modified files. This has hard dependency on Git. So if you are using Git as your SCM tool, it is good to use to automate file versioning. It is very useful in case of static files (e.g .css/ .js /.scss) where files are versioned very frequently with every release, because it ensures a unique version of a modified file goes to the production environment which in turn ensures caching issues of those modified files on CDN servers will be minimized.

# Getting Started

Before you get start with grunt-auto-versioning, be sure to check the [Getting Started] guide of [Grunt]. Once you are well familiar with process, you may install this plugin with below mentioned command.

npm install grunt-auto-versioning --save-dev

After installation of the plugin, you need to write below line of code in your [GruntFile].

grunt.file.expand('./../node_modules/grunt-*/tasks').forEach(grunt.loadTasks);

OR

grunt.loadNpmTasks('grunt-auto-versioning');

Above lines of code will include the autoversioning plugin's tasks in your gruntfile.
This plugin completes with set of three tasks. Before we go ahead with the tasks, let's know how this plugin works:

# How Plugin works?
## Step1: 
While creating a branch from release or master branch of your Git repository, we create a filetable(a file database) where information reagrding the files are stored. e.g file's name, file's versionable attribute(true/false), file's latest version etc.

## Step2: 
Once you modify a file in your repository, it's state is tracked through Git and plugin gets it's version from the filetable(file database) and creates a new file with next version and reverts the current modified file.
## Step3: 
When merging your release branch to the current branch, it is ensured that our filetable(file database) is updated such that latest version of a conflicted file is updated into the filetable and it's versionable attribute is made true so that it can be versioned further after plugin's autoversioning job is run.And this way, only a unique version of a file goes to the live environment.

Now the tasks accompanied with the steps described above are as following:

# Create Task  [for step1]                    
this task is to be run while creating a branch from master or release branch of your project repository on Git.

Before running this task include following task code in the gruntfile. Description of the task parameters is given below.

create:{

    options:{
        fileExts:['.js','.css','.scss']
    },
    
    src:[
        'src/jass',
        'src/sass',
        'src/j',
        'src/c'
    ]
}

Description of the task parameters: 

#### options 
##### fileExts   
Type: Array

Default: ['.js','.css','.scss']     

Description: this is array of different file extension type which can be versioned

### src 
Type: Array

Default: []     

Description: this is array of different directories where auto versioning is to be implemented

Now run this task with the command 

grunt create --bn=YourBranchName

this command will basically create a branch specified by you along with a fileTable(file database, which keeps track of files, their latetest version, a flag that indicates whether the file can be versioned further or not). If you need to recreate your fileTable due to some reasons(like file database is not in sync with repository), you need to run below command:

grunt create --recreate=true


# Auto version Task [for step2]               
You directly need to go and make changes in a file without caring of it's backup. Once you are done with the changes,run the auto version task command which is given below.It will create the new versions of file which are modified and back-up the existing file as well.

Before running this task include following task code in the gruntfile. Description of the task parameters is given below.

av:{

    options:{
        blackListedFiles:['Gruntfile.js','fileTable.json']
    },
    
    src:[
        'src/jass',
        'src/sass',
        'src/j',
        'src/c'
    ]
}

Description of the task parameters: 

#### options 
##### blackListedFiles
Type: Array

Default: ['Gruntfile.js','fileTable.json']

Description: this is the array of files which must not version at all.

### src 
Type: Array

Default: []     

Description: this is array of different directories where auto versioning is to be implemented

Now run this task with the command 

grunt av

# Merge Task [for step3]                      
This task is to be run when merging release or master branch into your current branch.
Before running this task include following task code in the gruntfile. description of the task parameters is given below.

merge:{
 
    src:[
        'src/jass',
        'src/sass',
        'src/j',
        'src/c'
    ]
}

Description of the task parameters: 

### src 
Type: Array

Default: []     

Description: this is array of different directories where auto versioning is to be implemented. It has to be same that of the 'create' task.

Now run this task with the command 

grunt merge --bn=BranchNameToBeMerged

# Contributing

grunt-auto-versioning is open source. Help us by submitting merge requests, forking and playing around with the codebase :-)

# Contact Us

Get in touch with me to share suggestions, thoughts and queries at: engg@naukri.com

# License

Please see [LICENSE] for details.

   [Getting Started]: <http://gruntjs.com/getting-started>
   [Grunt]: <http://gruntjs.com/>
   [GruntFile]: <http://gruntjs.com/sample-gruntfile>
   [LICENSE]: <https://github.com/naukri-engineering/grunt-auto-versioning/blob/master/LICENSE>
