function printRecorders(cursor){

//cursor = db.collection.find();
while ( cursor.hasNext() ) {
   printjson( cursor.next() );
}

}

var db = new Mongo().getDB("tax");
let r = db.adminCommand('listDatabases')

//print('1 ---------------------');
//print(JSON.stringify(r));

//print('2 ---------------------');
//r = db.getCollectionNames()
//print(JSON.stringify(r));

//db.accounts.remove({});

print('3 ---------------------');
r = db.accounts.find({}).pretty();
printRecorders(r);



//print('4 ---------------------');
//r = db.txns.find({}).pretty();
//printRecorders(r);




//accounts
//issues
//report
//txns
 //db.issue.find({'name.first': 'John', age: {$gte: 44}}, {'name.first': 1, age: 1});
//
// db.issues.insert([
//   {
// status: 'Open', owner: 'Ravan',
// created: new Date('2016-08-15'), effort: 5, completionDate: undefined,
// title: 'Error in console when clicking Add',
// }, {
// status: 'Assigned', owner: 'Eddie',
// created: new Date('2016-08-16'), effort: 14, completionDate: new Date('2016-08-30'),
// title: 'Missing bottom border on panel',
// }, ]);
// db.issues.createIndex({ status: 1 });
// db.issues.createIndex({ owner: 1 });
// db.issues.createIndex({ created: 1 });
//
// db.employees.find({'name.first': 'John', age: {$gte: 44}}, {'name.first': 1, age: 1});
//
// db.employees.update({_id: ObjectId("57b1caea3475bb1784747ccb")}, {$set: {age: 44}})
// db.employees.remove({"_id" : ObjectId("57b1caea3475bb1784747ccb")})
//
//  db.employees.find().pretty()
// {
//         _id : ObjectId("57b1caea3475bb1784747ccb"),
//         name : {
//                 first : "John",
//                 last : "Doe",
// },
// age : 44 }
//
// db.employees.insert({name: {first: 'John', middle: 'H', last: 'Doe'},  age: 22});
