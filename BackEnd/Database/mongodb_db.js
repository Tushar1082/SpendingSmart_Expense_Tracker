const {MongoClient} = require('mongodb');
const url = `mongodb+srv://tusharsharma1082:Tushar@cluster0.gma7i.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;
// const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);
const userColl = client.db('Expenses_Tracker').collection('user');
const userExpensesColl = client.db('Expenses_Tracker').collection('userExpenses');
const groupColl = client.db('Expenses_Tracker').collection('group');
const groupExpColl = client.db('Expenses_Tracker').collection('groupExpenses');
const individualTourColl = client.db('Expenses_Tracker').collection('individualTour');
const groupTourColl = client.db('Expenses_Tracker').collection('groupTour');
const recurringExpColl = client.db('Expenses_Tracker').collection('recurringExpenses');
const savingGoalsColl = client.db('Expenses_Tracker').collection('savingGoals');



async function main(){   
    try {
        await client.connect();
        console.log('Successfully Connected to MongoDB!');
    } catch (error) {
        client.close();
        console.log(error);
    }
}

main();

module.exports = {
    client,
    userColl,
    userExpensesColl,
    groupColl,
    groupExpColl,
    individualTourColl,
    groupTourColl,
    recurringExpColl,
    savingGoalsColl
}
;