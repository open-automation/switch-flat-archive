// Is invoked each time a new job arrives in one of the input folders for the flow element.
// The newly arrived job is passed as the second parameter.
function jobArrived( s : Switch, job : Job )
{
	// Declare some stuff
	var jobPath = job.getPath();
	var logLevel = 2;

	// Ensure is a folder
	if(job.isFile()){
		job.fail("Input job must be a folder, not a file.");
	}

	// Determine directory seperator
    var getDirectorySeperator = function(){
        var directorySeperator;
        if(s.isMac()){
            directorySeperator = '/';
        } else {
            directorySeperator = '\\'
        }

        return directorySeperator;
    };

	var archiveJob = function(filename, tempArchive){
            // Archive
            var password = '';
            var compress = true;
            var removeExisting = false;

            var archiveSuccess = s.archive(filename, tempArchive, password, compress, removeExisting);

            s.log(logLevel, "Added to archive: " + filename);

            return archiveSuccess;
        };

	// Look for files in the Folder
	var jobDir = new Dir(jobPath);
	var entries = jobDir.entryList("*", Dir.Files, Dir.Name);
    if(entries.length > 0){
        s.log(logLevel, "Files found: "+entries.length);
    }

	// Create a temp archive
	var tempArchive = s.createPathWithName( job.getNameProper() + ".zip", false );
	s.log(logLevel, "tempArchive: "+tempArchive);

    // Insert each file found
    for (var i=0; i < entries.length; i++) {

        var fn = entries[i];
        s.log(logLevel, "Picking up: "+fn);

		// Archive
		var archiveResult = archiveJob(jobDir.filePath(fn), tempArchive);

		s.log(logLevel, "archiveResult: "+archiveResult);

		if(archiveResult != true){
			job.fail("Failed to archive.");
		}
	}

	job.sendToSingle(tempArchive);
}
	
