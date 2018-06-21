# NodeJS EDX course,  assignment 3

## Design
The script is a simple one file program which can be executed via command line like:
```
node migrate_data.js <batch-size>
```

### Data files and DB configuration
It reads in data from two JSON files.
The program expects JSON files being located in 'data' subfolder. The exact files names and relative path is declared in
the constants at the begining of the program. The target database and colelction names are also defined in constants at the begining of the program.

### Loading data
First, program reads data from JSON files in memory and stores data in two arrays.
The program checks if both arrays size matches. If not the program terminates with the error message.

### Preparing batch tasks
Next, the program splits the entire data set into batches and for each batch it adds a function with the data processing and populating logic into 'tasks' array, which is used to submit for execution to async library.

### Executing batch tasks
Finally, prepared batch tasks are submitted for parallel execution by calling 'async.parallel(...)'. Each batch task will iterate through the corresponding data records, merge missing address data into master data record and insert data to MongoDB collection.
When all tasks are completed a callback function will be executed where DB connection will be closed.

## Testing
I used MongoDB Compass, Mongo UI client, to check the number of the records populated into MongoDB collection, and inspect documents in DB to ensure the data were properly populated.
