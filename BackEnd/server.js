require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const {
    client,
    userColl,
    userExpensesColl,
    groupColl,
    groupExpColl,
    individualTourColl,
    groupTourColl,
    recurringExpColl,
    savingGoalsColl
} = require('./Database/mongodb_db.js');
const {Decimal128, ObjectId} = require('mongodb');
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT;
const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');

// const router_track_expenses = require('./routers/track_expenses');
// const router_travel_expenses = require('./routers/travel_expenses');
// const router_recurring_expenses = require('./routers/recurring_expenses');
// const router_saving_goals = require('./routers/saving_goals');
// const router_reports = require('./routers/reports');

/*
 GET: Retrieve information.
 POST: Create a new resource.
 PUT: Updating an existing resource( complete update) or use for replace data
 PATCH: Update a specific field of a resource (partial update)
 DELETE: Remove a resource.
*/
/*
In my code,
GET: used to retrieve code
POST: Create new resource
PUT: used to delete specific part of data
Patch: used to update some part of existing data or add some data as small part in existing data 
Delete: Remove entire resource or big resource(like a expense profile from its list)
*/ 
const {sendMailGet,sendMailPost,sendMailPut} = require('./apiControllers/forgotPassword.js');

app.use(express.json()); //for parsing JSON
app.use(express.urlencoded({extended: true})); // for URL-encoded data
app.use(cors({origin:['https://spendingsmart.onrender.com','https://spendingsmart-bf0e0.web.app']}));
  

//forgetPassword
app.get('/forgotpassword',sendMailGet);
app.post("/forgotpassword",sendMailPost);
app.put("/forgotpassword",sendMailPut);

//Sign-in
app.get('/signin',async (req,res)=>{
    try {
        if(req.query.email_id == null || req.query.email_id == undefined || req.query.email_id.length ==0 || req.query.email_id == 'null'|| req.query.email_id == 'undefined'){
            res.json({notFound:true});
        }
        const result = await userColl.findOne({email:req.query.email_id},{projection:{ profile_image:1, password:1}});

        if(result){
            res.json({user_id:result._id, profile_image:result.profile_image, password:result.password});
        }else
            res.json({notFound:true});
        
    } catch (error) {
        res.send({failed:true});
        console.log(error);
    }
});


//user profile
app.get('/user',async function userGet(req,res){
    const userId = req.query.user_id;
    if (!userId || userId.trim() === '' || userId.toLowerCase() === 'null' || userId.toLowerCase() === 'undefined') {
        return res.json({ notFound: true });
    }

    try {
        const value = new ObjectId(userId);
        const result = await userColl.findOne({_id:value});

        if(result){
            return res.json(result);
        }else
          return res.json({notFound:true});
        
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
});

app.post('/user', async (req, res) => {
    try {
        // Function to hash the password securely
        const hashPassword = async (password) => {
            const saltRounds = 10; // Number of salt rounds
            return await bcrypt.hash(password, saltRounds);
        };

        // Validate required fields
        const { profileImg, name, age, emailID, password } = req.body;
        if (!name || !age || !emailID || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password securely
        const hashedPassword = await hashPassword(password);

        const data = {
            profile_image: profileImg,
            name: name,
            age: Number(age),
            email: emailID,
            password: hashedPassword,
            friendList: [],
            groups: [],
            tours: [],
            notifications: [],
            friendRequest_send: [],
            friendRequest_come: [],
            money_request: [],
            transactions: []
        };

        const result = await userColl.insertOne(data);

        if (result.insertedId) {
            return res.json({ created: true });
        } else {
            return res.json({ created: false });
        }
    } catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({ failed: true, error: error.message });
    }
});

app.put('/user', async(req,res)=>{
    const leaveGroup = req.body.leaveGroup == true;

    if(leaveGroup){
        try {
            const result = await userColl.updateOne(
                {_id: new ObjectId(req.body.user_id)},
                {
                    $pull:{
                        groups:{
                            group_id: new ObjectId(req.body.group_id)
                        }
                    }
                }
            )
            if(result && result.modifiedCount>0){
                return res.json({updated:true});
            }else{
                return res.json({updated:false});
            }
        } catch (error) {
            console.log(error);
            res.json({failed:true});
        }
    }else{
        try {
            let arr = [];
            req.body.notifArr.forEach((elm)=>{
                arr.push(new ObjectId(elm))
            });
    
            const result = await userColl.updateOne(
                {_id: new ObjectId(req.body.user_id)},
                {
                    $set:{
                        "notifications.$[element].status": "Read"
                    }
                },
                {
                    arrayFilters:[
                        {"element.notification_id":{$in:arr}}
                    ]
                }
            );
            
            if(result.modifiedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
    
        } catch (error) {
            console.log(error);
            res.json({failed:true});
        }
    }
});
app.patch('/user', async(req,res)=>{
    try {
        const result = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $set:{
                    name: req.body.name,
                    email: req.body.email,
                    age: parseInt(req.body.age),
                    password: req.body.password
                }
            }
        );
        if(result.modifiedCount>0){
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
});

app.patch('/user/profileImage', async(req,res)=>{
    try {
        const result = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $set:{
                    profile_image: req.body.profile_image
                }
            }
        );

        if(result.modifiedCount>0){
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/user/removeFriend', async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        const result1 = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $pull:{
                    friendList:{
                        user_id: new ObjectId(req.body.friend_id)
                    }
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        const result2 = await userColl.updateOne(
            {_id: new ObjectId(req.body.friend_id)},
            {
                $pull:{
                    friendList:{
                        user_id: new ObjectId(req.body.user_id)
                    }
                }
            },{session}
        );
        if(result2.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
});

app.patch('/user/sendMoneyRequest', async (req, res) => {
    const session = client.startSession(); // Start a MongoDB session

    try {
        session.startTransaction(); // Start a transaction

        for (const elm of req.body.splitDetails) { // Run sequentially
            await userColl.updateOne(
                { _id: new ObjectId(elm.user_id) },
                { 
                    $push: {
                        money_request: {
                            moneyRequest_id: new ObjectId(),
                            from: req.body.from,
                            moneyRequestor_id: new ObjectId(req.body.user_id),
                            moneyRequestor_profile_image: req.body.profile_image,
                            moneyRequestor_name: req.body.name,
                            expense_id: new ObjectId(req.body.expense_id),
                            expense_name: req.body.expName,
                            date: new Date(req.body.date),
                            expense_amount: new Decimal128(req.body.amount.$numberDecimal),
                            requested_amount: new Decimal128(elm.amount.$numberDecimal),
                            group_id: new ObjectId(req.body.group_id),
                            group_name: req.body.groupName
                        }
                    }
                },
                { session } // Attach session
            );
        }

        let result;
        if (req.body.from == "Group Travel") {
            result = await groupTourColl.updateOne(
                { _id: new ObjectId(req.body.group_id) },
                {
                    $set: { "expenses.$[element].isRequestedMoney": true }
                },
                {
                    arrayFilters: [{ "element.expense_id": new ObjectId(req.body.expense_id) }],
                    session
                }
            );
        } else {
            result = await groupExpColl.updateOne(
                { group_id: new ObjectId(req.body.group_id) },
                {
                    $set: { "expenses.$[element].isRequestedMoney": true }
                },
                {
                    arrayFilters: [{ "element.expense_id": new ObjectId(req.body.expense_id) }],
                    session
                }
            );
        }

        if (result.modifiedCount === 0) {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ failed: true });
        }

        await session.commitTransaction(); // Commit transaction
        await session.endSession();
        return res.json({ success: true });

    } catch (error) {
        await session.abortTransaction(); // Rollback if an error occurs
        await session.endSession();
        console.error(error);
        return res.json({ failed: true });
    }
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
});

app.post("/user/makePayment", async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        const currency = "INR";

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Valid amount is required" });
        }

        const options = {
            amount: Math.floor(amount * 100), // Convert to paisa
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Payment initiation failed" });
    }
});

// / Route to verify payment
app.post("/user/verifyPayment", async (req, res) => {
    const session = client.startSession();
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            moneyRequest_id,
            user_id,
            group_id,
            expense_id,
            expense_amount,
            expense_name,
            from
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            // Save transaction as "Fail" when payment details are missing
            const transaction_id = new ObjectId();
            await userColl.updateOne(
                { _id: new ObjectId(user_id) },
                {
                    $push: {
                        transactions: {
                            transaction_id,
                            payment_id: razorpay_payment_id || "N/A",
                            expense_id: new ObjectId(expense_id),
                            expense_name,
                            expense_amount: Decimal128.fromString(expense_amount.toString()),
                            payment_date: new Date(),
                            payment_status: "Fail",
                        }
                    }
                }
            );
            return res.status(400).json({ success: false, transaction_id: transaction_id.toString(), message: "Invalid payment details" });
        }

        // Generate Razorpay signature for verification
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        // Create transaction entry
        const transaction_id = new ObjectId();

        await session.startTransaction();

        const transactionResult = await userColl.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $push: {
                    transactions: {
                        transaction_id,
                        payment_id: razorpay_payment_id,
                        expense_id: new ObjectId(expense_id),
                        expense_name,
                        expense_amount: Decimal128.fromString(expense_amount.toString()),
                        payment_date: new Date(),
                        payment_status: generated_signature === razorpay_signature ? "Success" : "Fail",
                    }
                }
            },
            { session }
        );

        if (generated_signature === razorpay_signature) {
            // Payment successful: remove money request & update expense payment status
            const result1 = await userColl.updateOne(
                { _id: new ObjectId(user_id) },
                { $pull: { money_request: { moneyRequest_id: new ObjectId(moneyRequest_id) } } },
                { session }
            );
            let result2;

            if(from == "Group Expenses"){
                result2 = await groupExpColl.updateOne(
                    {
                        group_id: new ObjectId(group_id),
                        "expenses.expense_id": new ObjectId(expense_id)
                    },
                    {
                        $set: {
                            "expenses.$[expense].splitDetails.$[user].paymentStatus": "Paid"
                        }
                    },
                    {
                        arrayFilters: [
                            { "expense.expense_id": new ObjectId(expense_id) },
                            { "user.user_id": new ObjectId(user_id) }
                        ],
                        session
                    }
                );
            }else if(from == "Group Travel"){
                result2 = await groupTourColl.updateOne(
                    {
                        _id: new ObjectId(group_id),
                        "expenses.expense_id": new ObjectId(expense_id)
                    },
                    {
                        $set: {
                            "expenses.$[expense].splitDetails.$[user].paymentStatus": "Paid"
                        }
                    },
                    {
                        arrayFilters: [
                            { "expense.expense_id": new ObjectId(expense_id) },
                            { "user.user_id": new ObjectId(user_id) }
                        ],
                        session
                    }
                );
            }


            if (result1.modifiedCount > 0 && result2 && result2.modifiedCount > 0) {
                await session.commitTransaction();
                session.endSession();
                // **Now Check if Expense is Fully Paid**
                if(from == "Group Expenses"){
                    const result3 = await groupExpColl.findOne(
                        { group_id: new ObjectId(group_id), "expenses.expense_id": new ObjectId(expense_id) },
                        { projection: { "expenses.$": 1 } }
                    );
    
                    const expense = result3?.expenses?.[0];
                    if (!expense) {
                        return res.status(400).json({ success: false, message: "Expense not found" });
                    }
    
                    const allPaid = expense.splitDetails.every((elem) => elem.paymentStatus !== "Pending");
                    if (allPaid) {
                        const result4 = await groupExpColl.updateOne(
                            {
                                group_id: new ObjectId(group_id),
                                "expenses.expense_id": new ObjectId(expense_id)
                            },
                            {
                                $set: {
                                    "expenses.$.isSettled": {
                                        confirm: true,
                                        paymentMode: "Online"
                                    }
                                }
                            }
                        );
                    }
                }else if(from == "Group Travel"){
                    const result3 = await groupTourColl.findOne(
                        { _id: new ObjectId(group_id), "expenses.expense_id": new ObjectId(expense_id) },
                        { projection: { "expenses.$": 1 } }
                    );
    
                    const expense = result3?.expenses?.[0];
                    if (!expense) {
                        return res.status(400).json({ success: false, message: "Expense not found" });
                    }
    
                    const allPaid = expense.splitDetails.every((elem) => elem.paymentStatus !== "Pending");
                    if (allPaid) {
                        const result4 = await groupTourColl.updateOne(
                            {
                                _id: new ObjectId(group_id),
                                "expenses.expense_id": new ObjectId(expense_id)
                            },
                            {
                                $set: {
                                    "expenses.$.isSettled": {
                                        confirm: true,
                                        paymentMode: "Online"
                                    }
                                }
                            }
                        );
                    }
                }

                return res.json({ success: true, transaction_id: transaction_id.toString(), message: "Payment verified successfully" });
            } else {
                await session.abortTransaction();
                return res.status(400).json({ success: false, transaction_id: transaction_id.toString(), message: "Payment verification failed" });
            }
        } else {
            // Signature mismatch: mark payment as failed
            await session.abortTransaction();
            return res.status(400).json({ success: false, transaction_id: transaction_id.toString(), message: "Invalid payment signature" });
        }
    } catch (error) {
        await session.abortTransaction();
        // res.json({error});
        console.error("Payment verification error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        session.endSession();
    }
});


app.get('/searchFriends',async(req,res)=>{
    try {
        const result = await userColl.find(
            {name:req.query.name},
            {
                projection:{name:1,profile_image:1,_id:1},
                collation: { locale: "en", strength: 2 }
            }
        ).toArray();

        if(result && result.length>0){
            res.json(result);
        }else
          res.json({notFound:true});
        
    } catch (error) {
        res.send({failed:true});
        console.log(error);
    }
});
app.put('/searchFriends',async(req,res)=>{
    const session = await client.startSession();
    session.startTransaction();

    try {
        const data = { // Data of person who get friend request 
            user_id: new ObjectId(req.body.reqGetterId),
            name: req.body.reqGetterName,
            profile_image: req.body.reqGetterProfileImg,
            // amount_to_take: new Decimal128('0'),
            // amount_to_pay: new Decimal128('0')
        };
        let result1, result2,result3;

        if (req.body.work === "accept") {
            result1 = await userColl.updateOne(
                { _id: new ObjectId(req.body.requester_id) },
                {
                    $push: { friendList: data },
                    $pull: { friendRequest_send:{user_id: new ObjectId(req.body.reqGetterId)}}
                },
                {session }
            );

            result2 = await userColl.updateOne(
                { _id: new ObjectId(req.body.reqGetterId) },
                {
                    $push: {
                        friendList: {
                            user_id: new ObjectId(req.body.requester_id),
                            profile_image: req.body.requesterProfileImg,
                            name: req.body.requesterName,
                            // amount_to_take: new Decimal128('0'),
                            // amount_to_pay: new Decimal128('0')
                        }
                    },
                    $pull: { friendRequest_come:{user_id: new ObjectId(req.body.requester_id)}}
                },
                {session }
            );
            result3 = await userColl.updateOne(
                {_id: new ObjectId(req.body.requester_id)},
                {
                    $push:{
                        notifications:{
                            notification_id: new ObjectId(),
                            type: "Friend_Request",
                            sender_id: new ObjectId(req.body.reqGetterId),
                            sender_profile_image: req.body.reqGetterProfileImg,
                            message: `${req.body.reqGetterName} is accepted your friend request`,
                            status: 'Unread',
                            date: new Date()
                        }
                    }
                },
                {session}
            );
        } else {
            result1 = await userColl.updateOne(
                { _id: new ObjectId(req.body.reqGetterId) }, // a person who get friend request
                {
                    $pull: {
                        friendRequest_come: { user_id: new ObjectId(req.body.requester_id) }
                    }
                },
                { session }
            );
            result2 = await userColl.updateOne(
                { _id: new ObjectId(req.body.requester_id) }, // a person who sent friend request
                {
                    $pull: {
                        friendRequest_send: { user_id: new ObjectId(req.body.reqGetterId) }
                    }
                },
                {
                    session
                }
            );
            result3 = await userColl.updateOne(
                {_id: new ObjectId(req.body.requester_id)},
                {
                    $push:{
                        notifications:{
                            notification_id: new ObjectId(),
                            type: "Friend_Request",
                            sender_id: new ObjectId(req.body.reqGetterId),
                            sender_profile_image: req.body.reqGetterProfileImg,
                            message: `${req.body.reqGetterName} is not accepted your friend request`,
                            status: 'Unread',
                            date: new Date()
                        }
                    }
                },
                {session}
            );
        }

        if (result1.modifiedCount > 0 && result2.modifiedCount > 0 
            && result3.modifiedCount>0
        ) {
            await session.commitTransaction();
            await session.endSession();
            return res.json({ updated: true });
        } else {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.json({failed:true});
    }
});
app.patch('/searchFriends', async (req, res) => {
    const session = await client.startSession();
    session.startTransaction();
    try {
        const data = {
            user_id: new ObjectId(req.body.user_id),
            profile_image: req.body.userProfImg, //image of person who send friend request
            name: req.body.name,
        };
        let result1, result2;

        if (req.body.work === "send") {
            result1 = await userColl.updateOne(
                { _id: new ObjectId(req.body.sender_id) },
                {
                    $push: { "friendRequest_come": data }
                },
                {session }
            );

            result2 = await userColl.updateOne(
                { _id: new ObjectId(req.body.user_id) },
                {
                    $push: {
                        "friendRequest_send": {
                            user_id: new ObjectId(req.body.sender_id),
                            profile_image: req.body.userProfImg,
                            name: req.body.sender_name,
                        }
                    }
                },
                {session }
            );
        } else {
            result1 = await userColl.updateOne(
                { _id: new ObjectId(req.body.sender_id) },
                {
                    $pull: {
                        "friendRequest_come": { user_id: new ObjectId(req.body.user_id) }
                    }
                },
                { session }
            );

            result2 = await userColl.updateOne(
                { _id: new ObjectId(req.body.user_id) },
                {
                    $pull: {
                        "friendRequest_send": { user_id: new ObjectId(req.body.sender_id) }
                    }
                },
                { session }
            );
        }

        if (result1.modifiedCount > 0 && result2.modifiedCount > 0) {
            await session.commitTransaction();
            await session.endSession();
            return res.json({ updated: true });
        } else {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        res.json({failed:true});
    }
});



//track my expenses
app.get('/trackMyExpenses',async(req,res)=>{
  // Trim any leading/trailing spaces from the query parameters
  const userId = req.query.user_id;
  
  try {
      const value = new ObjectId(userId);
      const result = await userExpensesColl.findOne({user_id:value});

      if(result){
            if(result.expenses_profiles.length> 0){
                return res.send(result.expenses_profiles);
            }
      }else
          return res.json({notFound:true});
      
  } catch (error) {
      console.log(error);
      return res.json({failed:true});
  }
});

//create trackmyexpenses profile
app.post('/trackMyExpenses', async (req, res) => {
    try {
        const value = new ObjectId(req.body.user_id);
        const result = await userExpensesColl.updateOne(
            {user_id: value},
            {
                $push:{
                    expenses_profiles:{
                        expenses_profileId : new ObjectId(),
                        profile_name:req.body.expenses_profile_name,
                        total_budget: Decimal128.fromString(req.body.total_budget),
                        expenses_period: req.body.expenses_period,
                        description: req.body.description,
                        start_date: new Date(req.body.start_date),
                        ...(req.body.end_date && {
                            end_date: new Date(req.body.end_date),
                        }),
                        expenses: [] 
                    }
                }
            }
            ,{upsert:true}
        );

        if(result.modifiedCount>0 || result.upsertedCount>0){
            return res.json({created:true});
        }else{
            return res.json({created:false});
        }

    } catch (error) {
        console.log(error);
        res.json({created:false});
    }
});

app.put('/trackMyExpenses',async(req, res)=>{
    try {
        const result = await userExpensesColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
            },{
                $pull:{
                    "expenses_profiles.$[profile].expenses":{
                       expense_id: new ObjectId(req.body.expense_id)
                    }
                }
            },
            {
                arrayFilters:[
                    {"profile.expenses_profileId": new ObjectId(req.body.expenses_profileId)},
                ]
            }
        );

        if(result.modifiedCount> 0){
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }

    } catch (error) {
        console.log(error);
        res.json({failed: true});
    }
});

app.patch('/trackMyExpenses',async(req,res)=>{
    try {
        // const amount = req.body.amount * req.body.quantity;
        const data = {
            expense_id: new ObjectId(),
            name: req.body.name,
            category: req.body.selectedCategory.category,
            subCategory: req.body.selectedCategory.subcategory||"Other",
            date: new Date(req.body.date),
            // quantity: req.body.quantity,
            amount: new Decimal128(req.body.amount.toString()),
            exp_description: req.body.description
        };

        const result = await userExpensesColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
                "expenses_profiles.expenses_profileId": new ObjectId(req.body.expenses_profileId)
            },
            {
                $push:{
                    "expenses_profiles.$[profile].expenses":data
                }
            },{
                arrayFilters: [
                    { "profile.expenses_profileId": new ObjectId(req.body.expenses_profileId) } // Filter the specific profile
                ]
            }
        );

        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else
            return res.json({updated: false});
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/trackMyExpenses/profileUpdate',async(req,res)=>{
    const {totalBudget, description, startDate,endDate, expProf_id, user_id} = req.body;
    // console.log(req.body);
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;
        // console.log(typeof totalBudget);

        const updateFields = {
            "expenses_profiles.$[element].total_budget": Decimal128.fromString(totalBudget),
            "expenses_profiles.$[element].description": description,
            "expenses_profiles.$[element].start_date": parsedStartDate,
        };

        if (parsedEndDate) {
            updateFields["expenses_profiles.$[element].end_date"] = parsedEndDate;
        }
        // console.log(document);
        const result = await userExpensesColl.updateOne(
            {user_id: new ObjectId(user_id)},
            {
                $set: updateFields
            },{
                arrayFilters:[{"element.expenses_profileId": new ObjectId(expProf_id)}]
            }
        );
        // console.log(result);
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        // return res.json({error});
        console.log(error);
        return res.json({failed: true});
    }
});


app.delete('/trackMyExpenses',async(req,res)=>{
    try {
        if(req.body.length==1){
            const result = await userExpensesColl.deleteOne({user_id: new ObjectId(req.body.user_id)});

            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }else{
            const result = await userExpensesColl.updateOne(
                {user_id: new ObjectId(req.body.user_id)},
                {
                  $pull:{
                    expenses_profiles:{
                        expenses_profileId: new ObjectId(req.body.expenses_profileId)
                    }
                  }  
                }
            );
            if(result.modifiedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }
    } catch (error) {
        console.log(error);
        res.json({failed:true}); 
    }
});


//travel expenses
app.get('/travelExpenses',async(req,res)=>{
    const tour_id = req.query.tour_id;
    
    if(tour_id){
        try {
            if(req.query.tour_type === "Individual"){
                const result = await individualTourColl.findOne({_id: new ObjectId(req.query.tour_id)},{projection:{_id:0,expenses:1}});

                if(result === null || result.expenses.length===0){
                    return res.json({notFound:true});
                }else{
                    return res.send(result.expenses);
                }
            }else if(req.query.tour_type === "Group"){
                const result = await groupTourColl.findOne({_id: new ObjectId(req.query.tour_id)},{projection:{_id:0,expenses:1}});

                if(result === null || result.expenses.length===0){
                    return res.json({notFound:true});
                }else{
                    return res.send(result.expenses);
                }
            }else{
                return res.json({failed:true})
            }
        } catch (error) {
            console.log(error);
            res.json({failed: true});
        }
    }else{
        try {
            const arrData = JSON.parse(req.get('Array-Data'));
            const tourArr = arrData;
            const individualArr= [];
            const groupArr = [];

            tourArr.forEach((elm)=>{
                if(elm.type === 'Individual'){
                    individualArr.push(new ObjectId(elm.tour_id));
                }else if(elm.type === 'Group'){
                    groupArr.push(new ObjectId(elm.tour_id));
                }
            });
    
            const result1 = await individualTourColl.find({_id:{ $in: individualArr}}).toArray();
            const result2 = await groupTourColl.find({_id:{$in: groupArr}}).toArray();
    
            if(result1.length==0 && result2.length==0){
                return res.json({notFound:true});
            }else{
                res.json({
                    individualTourData: result1 || [],
                    groupTourData: result2 || [],
                });
            }
    
        } catch (error) {
            console.log(error);
            res.json({failed: true});
        }
    }
});

app.post('/travelExpenses',async(req,res)=>{
    if(!req.body.total_budget && !req.body.admin_id){
        return res.json({created: false});
    }
    if(!ObjectId.isValid(req.body.admin_id)){
        return res.json({created:false});
    }
    const session = client.startSession();
    session.startTransaction();
    // console.log(req.body);
    try {

        const totalBudget = Decimal128.fromString(req.body.total_budget);

        const admin_id = new ObjectId(req.body.admin_id);
        const data_individual = {
            admin_id: admin_id,
            name: req.body.tour_name,
            start_date: new Date(req.body.start_date),
            ...(req.body.end_date && {
                end_date: new Date(req.body.end_date),
            }),
            budget:totalBudget,
            locations: req.body.locations|| [],
            description:req.body.description|| '',
            type: req.body.track_for,
            expenses: []
        };

        let result;
        let groupMembersArr = [];

        // Insert into the respective collection
        if(req.body.track_for === 'Individual'){
            result = await individualTourColl.insertOne(data_individual,{session});
        }else if(req.body.track_for === 'Group'){
            if(req.body.group_members.length> 0){
                groupMembersArr.push({user_id: new ObjectId(req.body.admin_id), profile_image: req.body.profile_image, name: req.body.userName});
                req.body.group_members.forEach((elm)=>{
                    groupMembersArr.push({...elm, user_id: new ObjectId(elm.user_id)});
                });
            }
            const data_group = {
                ...data_individual,
                group_members: groupMembersArr
            }
            result = await groupTourColl.insertOne(data_group,{session});
        }else {
            return res.json({created:false});
        }
        
        if(!result.insertedId){
            await session.abortTransaction();
            await session.endSession();
            return res.json({created:false});
        }     

        const updateCreatorUser  = await userColl.updateOne({_id:admin_id},
            {$push:{tours:
                {
                    tour_id:result.insertedId,
                    type:req.body.track_for,
                    isAdmin:true
                }}
            },{session}
        );

        if(!updateCreatorUser.modifiedCount===0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({created:false})
        }
        // let updateOtherMember;

        if(req.body.track_for === 'Group' && req.body.group_members.length>0){
            let groupMem = []; //req.body.group_members contains other group memebers not admin 
            // const arr = groupMembersArr.filter((elm) => elm.user_id !== admin_id).map((elm) => elm.user_id);
            req.body.group_members.forEach((elm)=>{
                groupMem.push(new ObjectId(elm.user_id));
            });

            const updateOtherMember  = await userColl.updateMany(
                {_id:{$in:groupMem}},
                {$push:{tours:
                    {
                        tour_id:result.insertedId,
                        type:req.body.track_for,
                        isAdmin:false
                    }}
                },{session}
            );
            if(!updateOtherMember.modifiedCount){
                await session.abortTransaction();
                await session.endSession();
                return res.json({created:false})
            }
        }

        // Rollback: Delete the inserted document if user update fails
        // if (req.body.track_for === 'Individual') {
        //     await individualTourColl.deleteOne({ _id: result.insertedId });
        // } else if (req.body.track_for === 'Group') {
        //     await groupTourColl.deleteOne({ _id: result.insertedId });
        // }
        await session.commitTransaction();
        await session.endSession();
        res.json({ created: true });

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        // res.json({err:error});
        console.log(error);
        return res.json({failed:true});
    }
});

app.put('/travelExpenses',async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        if(req.body.tour_type === "Individual"){
            const result = await individualTourColl.updateOne(
                {_id: new ObjectId(req.body.tour_id)},
                {
                    $pull:{
                        expenses:{
                            expense_id: new ObjectId(req.body.expense_id)
                        }
                    }
                },
                {session}
            );

            if(result.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true});
        }else{
            const result = await groupTourColl.updateOne(
                {_id: new ObjectId(req.body.tour_id)},
                {
                    $pull:{
                        expenses:{
                            expense_id: new ObjectId(req.body.expense_id)
                        }
                    }
                },
                {session}
            );
            if(result.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            let arr = req.body.splitDetails.map((elm)=> new ObjectId(elm.user_id));
            const result2 = await userColl.find({_id: {$in:arr}},{ projection:{ money_request:1}}, {session}).toArray();
          
            if(!result2 || result2.length<arr.length){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
    
            let newArrIds=[];
            const userId = new ObjectId(req.body.user_id);
            const expenseId = new ObjectId(req.body.expense_id);
    
            for(let i=0;i<result2.length;i++){
                for(let j=0;j<result2[i].money_request.length;j++){
                    if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
                        newArrIds.push(result2[i]._id);
                        break;
                    }
                }
            }
    
            if(newArrIds.length>0){
                const result3 = await userColl.updateMany(
                    {_id:{$in:newArrIds}},
                    {
                        $pull:{
                            money_request:{
                                $and:[
                                    {expense_id: expenseId},
                                    {moneyRequestor_id: userId},
                                ]
                            }
                        }
                        
                    },{session}
                );

                if(result3.modifiedCount==0){
                    await session.abortTransaction();
                    await session.endSession();
                    return res.json({updated: false});
                }
            }
    
            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true});
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
});

app.patch('/travelExpenses',async(req,res)=>{
    if(req.body.bool){
        const session = client.startSession();
        session.startTransaction();
        
        try {
            let memberIdArr = []
            const newSplitDetails = req.body.splitDetails.map((elm)=>{
                memberIdArr.push(new ObjectId(elm.user_id));
                return {...elm,user_id: new ObjectId(elm.user_id), paymentStatus:'Paid', amount: Decimal128.fromString(elm.amount.$numberDecimal)};
            });

            const result1 = await groupTourColl.updateOne(
                {_id: new ObjectId(req.body.tour_id)},
                {
                    $set:{
                        // "expenses.$[expense].isSettled": req.body.isSettled
                        "expenses.$[expense].isSettled": req.body.isSettled,
                        "expenses.$[expense].splitDetails": newSplitDetails
                    },
                    $unset:{
                        "expenses.$[expense].isRequestedMoney": ''
                    }
                },
                {
                    arrayFilters:[{
                        "expense.expense_id": new ObjectId(req.body.expense_id)
                    }], session
                }
            )

            if(result1.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false})
            }

            const result2 = await userColl.find({_id: {$in:memberIdArr}},{ projection:{ money_request:1}}, {session}).toArray();

            if (!result2 || result2.length < memberIdArr.length) {
                await session.abortTransaction();
                await session.endSession();
                return res.json({ updated: false });
            }
            

            let newArrIds=[];
            const userId = new ObjectId(req.body.user_id);
            const expenseId = new ObjectId(req.body.expense_id);

            for(let i=0;i<result2.length;i++){
                for(let j=0;j<result2[i].money_request.length;j++){
                    if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
                        newArrIds.push(result2[i]._id);
                        break;
                    }
                }
            }

            if(newArrIds.length>0){
                const result3 = await userColl.updateMany(
                    {_id:{$in:newArrIds}},
                    {
                        $pull:{
                            money_request:{
                                $and:[
                                    {expense_id: expenseId},
                                    {moneyRequestor_id: userId},
                                ]
                            }
                        }
                        
                    },{session}
                );

                if(result3.modifiedCount==0){
                    await session.abortTransaction();
                    await session.endSession();
                    return res.json({updated:false});
                }
            }

            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true})
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            // return res.json({error});
            console.log(error);
            return res.json({failed: true});
        }
    }else{
        try {
            if(req.body.tour_type === "Individual"){
                const data = {
                    expense_id: new ObjectId(),
                    name: req.body.name,
                    category:  req.body.category,
                    subCategory: req.body.subCategory,
                    date: new Date(req.body.date),
                    description: req.body.description,
                    amount: new Decimal128(req.body.amount),
                    paymentMode:  req.body.paymentMode,
                    ...(req.body.expense_location === "Other" ? {
                        expense_location: req.body.otherLocation}
                        :{
                            expense_location: req.body.expense_location,
                        }
                    )
                }
                const result = await individualTourColl.updateOne(
                    {_id: new ObjectId(req.body.tour_id)},
                    {
                        $push:{
                            expenses:data
                        }
                    }
                );

                if(result.modifiedCount>0){
                    return res.json({created:true});
                }else{
                    return res.json({created:false});
                }
            }else{
                let splitDetails = [];
                req.body.splitDetails.forEach((elem)=>{
                    splitDetails.push({...elem, user_id: new ObjectId(elem.user_id), amount: new Decimal128(elem.amount.toString()), paymentStatus:'Pending'});
                })
                // console.log(req.body);
                const data = {
                    expense_id: new ObjectId(),
                    name: req.body.name,
                    category:  req.body.category,
                    subCategory: req.body.subCategory,
                    date: new Date(req.body.date),
                    description: req.body.description,
                    amount: new Decimal128(req.body.amount.toString()),
                    paymentMode:  req.body.paymentMode,
                    ...(req.body.expense_location === "Other" ? {
                        expense_location: req.body.otherLocation}
                        :{
                            expense_location: req.body.expense_location,
                        }
                    ),
                    paidBy:{ user_id: new ObjectId(req.body.paidBy.user_id), name: req.body.paidBy.name},
                    splitType: req.body.splitType,
                    splitMethod: req.body.splitMethod,
                    splitDetails: splitDetails,
                    isSettled:{confirm:false, paymentMode:""}
                }

                const result = await groupTourColl.updateOne(
                    {_id: new ObjectId(req.body.tour_id)},
                    {
                        $push:{
                            expenses:data
                        }
                    }
                );
                if(result.modifiedCount>0){
                    return res.json({updated:true});
                }else{
                    return res.json({updated:false});
                }
            }
        } catch (error) {
            // res.send(error);
            // console.log(error);
            console.log(error);
            // return res.json({error:error});
            return res.json({failed:true});
        }
    }

});
app.patch('/travelExpenses/removeMember',async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        const result = await groupTourColl.updateOne(
            {_id: new ObjectId(req.body.tour_id)},
            {
                $pull:{
                    group_members:{
                        user_id: new ObjectId(req.body.member_id)
                    }
                }
            },{session}
        );
        if(result.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        const result1 = await userColl.updateOne(
            {_id: new ObjectId(req.body.member_id)},
            {
                $pull:{
                    tours:{
                        tour_id: new ObjectId(req.body.tour_id)
                    }
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/travelExpenses/addMember',async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        const result = await groupTourColl.updateOne(
            {_id: new ObjectId(req.body.tour_id)},
            {
                $push:{
                    group_members:{
                        user_id: new ObjectId(req.body.user_id),
                        profile_image: req.body.profile_image,
                        name: req.body.name
                    }
                }
            },{session}
        );
        if(result.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        const result1 = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $push:{
                    tours:{
                        tour_id: new ObjectId(req.body.tour_id),
                        type: 'Group',
                        isAdmin: false
                    }
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/travelExpenses/makeAdmin',async(req,res)=>{
    const session = client.startSession();
    try {
        session.startTransaction();
        const result1 = await groupTourColl.updateOne(
            {_id: new ObjectId(req.body.tour_id)},
            {
                $set:{
                    admin_id: new ObjectId(req.body.user_id)
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        const result2 = await userColl.updateOne(
            {_id: new ObjectId(req.body.prevAdmin_id)},
            {
                $set:{
                    "tours.$[tourId].isAdmin": false 
                }
            },
            {
                arrayFilters:[{
                    "tourId.tour_id": new ObjectId(req.body.tour_id)
                }],
                session
            }
        );
        if(result2.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        const result3 = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $set:{
                    "tours.$[tourId].isAdmin": true 
                }
            },
            {
                arrayFilters:[{
                    "tourId.tour_id": new ObjectId(req.body.tour_id)
                }],
                session
            }
        );

        if(result3.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/travelExpenses/profileUpdate',async(req,res)=>{
    const {totalBudget, description, startDate, locations,endDate, tour_id} = req.body;
    
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;
        // console.log(typeof totalBudget);

        const document = {
            budget: Decimal128.fromString(totalBudget),
            description: description,
            start_date: parsedStartDate,
            ...(parsedEndDate && { end_date: parsedEndDate }),
            locations: locations 
        };

        const result = await groupTourColl.updateOne(
            {_id: new ObjectId(tour_id)},
            {
                $set: document
            }
        );
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        console.log(error);
        return res.json({failed: true});
    }
});

app.delete('/travelExpenses',async(req,res)=>{
    try {
        if(req.body.tour_type === "Individual"){
            const result = await individualTourColl.deleteOne({_id: new ObjectId(req.body.tour_id)});
            
            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }else{
            const result = await groupTourColl.deleteOne({_id: new ObjectId(req.body.tour_id)});
            
            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
});

//group
app.get('/group',async(req,res)=>{
    if(req.query.group_id){
        try {
            const groupId = new ObjectId(req.query.group_id);
            const admin_id = new ObjectId(req.query.user_id);

            const result = await groupColl.findOne({_id:groupId, admin_id:admin_id});
    
            if(result!=null){
                return res.json({result});
            }else{
                return res.json({notFound:true});
            }
        } catch (error) {
            console.log(error);
            res.json({failed:true});
        }
    }else{
        try {
            const arrData = JSON.parse(req.get('Array-Data'));
            let newArr = [];
            for(let i=0;i<arrData.length;i++){
                newArr[i] = new ObjectId(arrData[i]);
            }
            const result = await groupColl.find(
                {_id:{$in:newArr}},
                {_id:0,name:1,start_date:1,total_budget:1,description:1}
            ).toArray();

            if(result.length>0){
                res.json({groups: result});
            }else{
                res.json({notFound:true});
            }
        } catch (error) {
            res.json({failed:true})
            console.log(error);
        }  
    }
});

app.post('/group',async(req,res)=>{
    try {
        if(!req.body.total_budget && !req.body.admin_id){
            return res.json({creator:false});
        }

        const totalBudget = Decimal128.fromString(req.body.total_budget);
        const admin_id = new ObjectId(req.body.admin_id);
        const arr = req.body.group_members; // this array also contain admin data
        let groupArr = [];
        let userIds = [];

        for(let i=0;i<arr.length;i++){
            groupArr[i] = {user_id: new ObjectId(arr[i].user_id),profile_image:arr[i].profile_image, name: arr[i].name};    
            if(arr[i].user_id != req.body.admin_id){ //we do not need to add admin data because we will se admin:true so admin data and 
                //set admin:false for others who are in userIds array
                userIds.push(new ObjectId(arr[i].user_id));
            }
        }

        const result = await groupColl.insertOne(
            {
                name: req.body.group_name,
                admin_id: admin_id,
                group_members: groupArr,
                start_date: new Date(req.body.start_date),
                ...(req.body.end_date && {end_date: new Date(req.body.end_date)}),
                // end_date: req.body.end_date?new Date(req.body.end_date):'',
                total_budget:totalBudget,
                description:req.body.description
            }
        );
        if(!result.insertedId){
            return res.json({created:false});
        }
        
        const result2 = await groupExpColl.insertOne(
            {
                group_id: new ObjectId(result.insertedId),
                expenses:[]
            },
        );

        if(!result2.insertedId){
            await groupColl.deleteOne({_id:result.insertedId});
            return res.json({created:false});
        }
        const result3 = await userColl.updateOne(
            {_id:admin_id},
            {
                $push:{groups:{group_id:result.insertedId,isAdmin:true,}}
            }
        );

        const result4 = await userColl.updateMany(
            {_id:{$in:userIds}},
            {
                $push:{groups:{group_id:result.insertedId,isAdmin:false}}
            }
        );

        if(result3.modifiedCount>0 && result4.modifiedCount>0){
            return res.json({created:true})
        }else{
            //inserting operation done but insertion operations fails then we do rollback for insertion opertion
            userIds.push(admin_id);
            await userColl.updateMany(
                {_id:{$in:userIds}},
                {
                    $pull:{groups:{group_id:result.insertedId}}
                }
            );
            await groupColl.deleteOne({_id:result.insertedId});
            await groupExpColl.deleteOne({_id:result2.insertedId});
            return res.json({created:false}); 
        }
    } catch (error) {
        res.json({failed:true})
        console.log(error);
        // res.json({error:error});
    }
});
app.patch('/group',async(req,res)=>{
    const deleteMember = req.body.deleteMember == true;
    const addMember = req.body.addMember == true;
    const makeAdmin = req.body.makeAdmin == true;
    const session = client.startSession();
    session.startTransaction();

    try {
        let result1, result2;
        if(deleteMember){
            result1 = await groupColl.updateOne(
                {_id: new ObjectId(req.body.group_id)},
                {
                    $pull:{
                        group_members:{
                            user_id: new ObjectId(req.body.member_id)
                        }
                    }
                },{session}
            );
            if(result1.modifiedCount===0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            result2 = await userColl.updateOne(
                {_id: new ObjectId(req.body.member_id)},
                {
                    $pull:{
                        groups:{group_id:new ObjectId(req.body.group_id)}
                    }
                },{session}
            )
            if(result2.modifiedCount===0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
        }else if(addMember){
            result1 = await groupColl.updateOne(
                {_id: new ObjectId(req.body.group_id)},
                {
                    $push:{
                        group_members:{
                            user_id: new ObjectId(req.body.member_id),
                            profile_image: req.body.profile_image,
                            name: req.body.name,
                        }
                    }
                },{session}
            );
            if(result1.modifiedCount===0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            
            result2 = await userColl.updateOne(
                {_id: new ObjectId(req.body.member_id)},
                {
                    $push:{
                        groups:{
                            group_id:new ObjectId(req.body.group_id),
                            isAdmin: false
                        }
                    }
                },{session}
            )
            if(result2.modifiedCount===0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
        }else if(makeAdmin){
            result1 = await groupColl.updateOne(
                {_id: new ObjectId(req.body.group_id)},
                {
                    $set:{
                        admin_id: new ObjectId(req.body.user_id)
                    }
                },{session}
            );
            if(result1.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            result2 = await userColl.updateOne(
                {_id: new ObjectId(req.body.prevAdmin_id)},
                {
                    $set:{
                        "groups.$[groupId].isAdmin": false 
                    }
                },
                {
                    arrayFilters:[{
                        "groupId.group_id": new ObjectId(req.body.group_id)
                    }],
                    session
                }
            );
            if(result2.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }

            const result3 = await userColl.updateOne(
                {_id: new ObjectId(req.body.user_id)},
                {
                    $set:{
                        "groups.$[groupId].isAdmin": true 
                    }
                },
                {
                    arrayFilters:[{
                        "groupId.group_id": new ObjectId(req.body.group_id)
                    }],
                    session
                }
            );

            if(result3.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
        }
        if(result1 && result2 && result1.modifiedCount>0 && result2.modifiedCount>0){
            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        res.json({failed:true});
    }    
});
app.delete('/group', async (req, res) => {
    const group_members = req.body.groupMembers;
    const session = client.startSession();
    session.startTransaction();

    try {
        let memberIdsArr = [];
        group_members.forEach((elm)=>{
            memberIdsArr.push(new ObjectId(elm.user_id));
        });

        const result = await groupColl.deleteOne(
            { _id: new ObjectId(req.body.group_id), admin_id: new ObjectId(req.body.user_id) },
            { session }
        );

        if (!result.deletedCount) {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ updated: false });
        }

        const result1 = await groupExpColl.deleteOne(
            { group_id: new ObjectId(req.body.group_id) },
            { session }
        );
        if (!result1.deletedCount) {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ updated: false });
        }
        const result2 = await userColl.updateMany(
            {_id:{$in:memberIdsArr}},
            {
                $pull:{
                    groups:{group_id:new ObjectId(req.body.group_id)}
                }
            },
            {session}
        );
        if(result2.modifiedCount ==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        await session.commitTransaction();
        await session.endSession();
        res.json({ updated: true });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        res.json({ failed: true });
    }
});



app.get('/groupExpenses',async(req,res)=>{
    try {
        const result = await groupExpColl.findOne({group_id: new ObjectId(req.query.group_id)},{_id:0,group_id:0});

        if(result.expenses.length>0){
            return res.json({expenses: result.expenses});
        }else{
            return res.json({notFound:true});
        }
    } catch (error) {
        console.log(error);
        res.json({failed:true});
    }
});
app.post('/groupExpenses',async(req,res)=>{
    try {
        const memeberData = req.body.splitDetails;

        for(let i = 0; i<memeberData.length;i++){
            // if(!memeberData[i].percentage){
                memeberData[i] = {
                    user_id: new ObjectId(memeberData[i].user_id),
                    name: memeberData[i].name, 
                    amount: new Decimal128(memeberData[i].amount.toString()),
                    paymentStatus: 'Pending'
                };
            // }
            // else{
            //     memeberData[i] = {
            //         user_id: new ObjectId(memeberData[i].user_id),
            //         name: memeberData[i].name, 
            //         amount: new Decimal128(memeberData[i].amount.toString()), 
            //         percentage: new Decimal128(memeberData[i].percentage.toString())
            //     };
            // }
        }

        const data = {
            expense_id: new ObjectId(), // Auto-generate expense_id
            name: req.body.name,
            category: req.body.category,
            subCategory: req.body.subCategory,
            description: req.body.description,
            amount: new Decimal128(req.body.amount.toString()),
            date: new Date(),
            paidBy: {
                user_id: new ObjectId(req.body.paidBy.user_id), 
                name: req.body.paidBy.name 
            },
            splitType: req.body.splitType,
            splitDetails: memeberData,
            isSettled: {confirm:false,paymentMode:''},
            isRequestedMoney:false
        }

        const result = await groupExpColl.updateOne(
            {group_id: new ObjectId(req.body.groupId)},
            {
                $push:{
                    expenses:data
                }
            }
        );

        if(result.modifiedCount>0){
            return res.json({created:true});
        }else{
            return res.json({created:false}); 
        }

    } catch (error) {
        res.json({failed:true})
        console.log(error);
    }
});
app.put('/groupExpenses', async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();
    try {
        const result1 = await groupExpColl.updateOne(
            {group_id: new ObjectId(req.body.groupId)},
            {
                $pull:{
                    expenses:
                        {
                            expense_id: new ObjectId(req.body.expense_id)
                        }
                }
            },{session}
        );

        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated: false});
        }
        let arr = req.body.splitDetails.map((elm)=> new ObjectId(elm.user_id));
        const result2 = await userColl.find({_id: {$in:arr}},{ projection:{ money_request:1}}, {session}).toArray();
      
        if(!result2 || result2.length<arr.length){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        let newArrIds=[];
        const userId = new ObjectId(req.body.user_id);
        const expenseId = new ObjectId(req.body.expense_id);

        for(let i=0;i<result2.length;i++){
            for(let j=0;j<result2[i].money_request.length;j++){
                if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
                    newArrIds.push(result2[i]._id);
                    break;
                }
            }
        }

        if(newArrIds.length>0){
            const result3 = await userColl.updateMany(
                {_id:{$in:newArrIds}},
                {
                    $pull:{
                        money_request:{
                            $and:[
                                {expense_id: expenseId},
                                {moneyRequestor_id: userId},
                            ]
                        }
                    }
                    
                },{session}
            );

            if(result3.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated: false});
            }
        }

        await session.commitTransaction();
        await session.endSession();
        return res.json({updated: true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/groupExpenses',async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();
    // console.log(req.body);
    try {
        let memberIdArr = []
        const newSplitDetails = req.body.splitDetails.map((elm)=>{
            memberIdArr.push(new ObjectId(elm.user_id));
            return {...elm,user_id: new ObjectId(elm.user_id), paymentStatus:'Paid', amount: Decimal128.fromString(elm.amount.$numberDecimal)};
        });
        const result1 = await groupExpColl.updateOne(
            {group_id: new ObjectId(req.body.groupId)},
            {
                $set:{
                    "expenses.$[expense].isSettled": {confirm: true, paymentMode: req.body.paymentMode},
                    "expenses.$[expense].splitDetails": newSplitDetails
                },
                $unset:{
                    "expenses.$[expense].isRequestedMoney": ''
                }
            },
            {
                arrayFilters:[{
                    "expense.expense_id": new ObjectId(req.body.expense_id)
                }],session
            }
        )
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        // const result2 = await userColl.findOne({_id: new ObjectId(req.body.user_id)},{ projection:{ money_request:1, _id:0}}, {session});
        const result2 = await userColl.find({_id: {$in:memberIdArr}},{ projection:{ money_request:1}}, {session}).toArray();

        if(!result2 || result2.length < memberIdArr.length){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        let newArrIds=[];
        const userId = new ObjectId(req.body.user_id);
        const expenseId = new ObjectId(req.body.expense_id);

        for(let i=0;i<result2.length;i++){
            for(let j=0;j<result2[i].money_request.length;j++){
                if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
                    newArrIds.push(result2[i]._id);
                    break;
                }
            }
        }

        if(newArrIds.length>0){
            const result3 = await userColl.updateMany(
                {_id:{$in:newArrIds}},
                {
                    $pull:{
                        money_request:{
                            $and:[
                                {expense_id: expenseId},
                                {moneyRequestor_id: userId},
                            ]
                        }
                    }
                    
                },{session}
            );

            if(result3.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
        }

        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        // res.send(error);
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed: true});
    }
});
app.patch('/groupExpenses/profileUpdate',async(req,res)=>{
    const {totalBudget, description, startDate,endDate, group_id} = req.body;
    
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;

        const document = {
            total_budget: Decimal128.fromString(totalBudget.toString()),
            description: description,
            start_date: parsedStartDate,
            ...(parsedEndDate && { end_date: parsedEndDate })
        };
        const result = await groupColl.updateOne(
            {_id: new ObjectId(group_id)},
            {
                $set: document
            }
        );
        
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        console.log(error);
        return res.json({failed: true});
    }
});

//recurring expenses
app.get('/recurringExpenses',async (req,res)=>{
  const userId = req.query.user_id;
  const profileId = req.query.profile_id;

  if(profileId !== undefined){
        try {
            const value = new ObjectId(userId);
            const result = await recurringExpColl.findOne(
                {
                  user_id: value,
                  "recurring_expenses_profiles.recurring_expenses_profileId": new ObjectId(profileId),
                },
                {
                  projection: {
                    _id: 0,
                    "recurring_expenses_profiles.$": 1, // Use `$` to project only the matched array element
                  },
                }
            );

            if(result && result.recurring_expenses_profiles.length > 0){
                return res.json({expenses: result.recurring_expenses_profiles[0].expenses});
            }else
                return res.json({notFound:true});
        } catch (error) {
            console.log(error);
            return res.json({failed:true});
        }
    }else{
        try {
            const value = new ObjectId(userId);
            const result = await recurringExpColl.findOne({user_id:value});
            
            if(result && result.recurring_expenses_profiles.length> 0){
                return res.send(result.recurring_expenses_profiles);
            }else
                return res.json({notFound:true});
            
        } catch (error) {
            console.log(error);
            return res.json({failed:true});
        }
    }
});
app.post('/recurringExpenses',async(req,res)=>{
    try {
        const value = new ObjectId(req.body.user_id);
        const result = await recurringExpColl.updateOne(
            {user_id: value},
            {
                $push:{
                    recurring_expenses_profiles:{
                        recurring_expenses_profileId : new ObjectId(),
                        profile_name:req.body.profile_name,
                        total_budget: Decimal128.fromString(req.body.total_budget),
                        expenses_period: req.body.expenses_period,
                        description: req.body.description,
                        start_date: new Date(req.body.start_date),
                            ...(req.body.end_date && {
                            end_date: new Date(req.body.end_date),
                        }),
                        expenses: [] 
                    }
                }
            }
            ,{upsert:true}
        );

        if(result.modifiedCount>0 || result.upsertedCount>0){
            return res.json({created:true});
        }else{
            return res.json({created:false});
        }

    } catch (error) {
        res.json({error});
        // console.log(error);
        // res.json({created:false});
    }
});
app.put('/recurringExpenses',async (req,res)=>{
    try {
        const result = await recurringExpColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
            },{
                $pull:{
                    "recurring_expenses_profiles.$[profile].expenses":{
                       expense_id: new ObjectId(req.body.expense_id)
                    }
                }
            },
            {
                arrayFilters:[
                    {"profile.recurring_expenses_profileId": new ObjectId(req.body.recurring_expenses_profileId)},
                ]
            }
        );

        if(result.modifiedCount> 0){
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }

    } catch (error) {
        // res.json({error: error});
        console.log(error);
        res.json({failed: true});
    }
});
app.patch('/recurringExpenses',async (req, res)=>{
    try {
        const amount = req.body.amount;
        const data = {
            expense_id: new ObjectId(),
            name: req.body.name,
            category: req.body.category,
            subCategory: req.body.subCategory||"Other",
            date: new Date(req.body.date),
            amount: new Decimal128(amount.toString()),
            exp_description: req.body.description
        };

        const result = await recurringExpColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
                "recurring_expenses_profiles.recurring_expenses_profileId": new ObjectId(req.body.recurring_expenses_profileId)
            },
            {
                $push:{
                    "recurring_expenses_profiles.$[profile].expenses":data
                }
            },{
                arrayFilters: [
                    { "profile.recurring_expenses_profileId": new ObjectId(req.body.recurring_expenses_profileId) } // Filter the specific profile
                ]
            }
        );

        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else
            return res.json({updated: false});
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
});
app.patch('/recurringExpenses/profileUpdate',async(req,res)=>{
    const {totalBudget, description, startDate,endDate, expProf_id, user_id} = req.body;
    // console.log(req.body);
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;
        // console.log(typeof totalBudget);

        const updateFields = {
            "recurring_expenses_profiles.$[element].total_budget": Decimal128.fromString(totalBudget),
            "recurring_expenses_profiles.$[element].description": description,
            "recurring_expenses_profiles.$[element].start_date": parsedStartDate,
        };

        if (parsedEndDate) {
            updateFields["recurring_expenses_profiles.$[element].end_date"] = parsedEndDate;
        }
        // console.log(document);
        const result = await recurringExpColl.updateOne(
            {user_id: new ObjectId(user_id)},
            {
                $set: updateFields
            },{
                arrayFilters:[{"element.recurring_expenses_profileId": new ObjectId(expProf_id)}]
            }
        );
        // console.log(result);
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        // return res.json({error});
        console.log(error);
        return res.json({failed: true});
    }
});

app.delete('/recurringExpenses',async(req,res)=>{
    try {
        if(req.body.length==1){
            const result = await recurringExpColl.deleteOne({user_id: new ObjectId(req.body.user_id)});

            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }else{
            const result = await recurringExpColl.updateOne(
                {user_id: new ObjectId(req.body.user_id)},
                {
                  $pull:{
                    recurring_expenses_profiles:{
                        recurring_expenses_profileId: new ObjectId(req.body.recurring_expenses_profileId)
                    }
                  }  
                }
            );
            if(result.modifiedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }
    } catch (error) {
        console.log(error);
        res.json({failed:true}); 
    }
});

//saving goals
app.get('/savingGoals',async (req,res)=>{
  const userId = req.query.user_id;
  const getTransList = req.query.getTransList === "true";
  const getAdjList = req.query.getAdjList === "true";
  const savingGoalProf = req.query.savingGoalProf;

  if(getTransList && savingGoalProf){
      try {
          const value = new ObjectId(userId);
          const result = await savingGoalsColl.findOne(
            {
                user_id: value,
                saving_goals_profiles: {
                    $elemMatch: { saving_goals_profileId: new ObjectId(savingGoalProf) }
                }
            },
            {
                projection: { "saving_goals_profiles.$": 1 }
            }
        ); 
        // console.log(result);
          
          if(result && result.saving_goals_profiles && result.saving_goals_profiles.length > 0){
            const transactions =  result.saving_goals_profiles[0].transactions;
            if(transactions.length>0){
                return res.send(transactions);
            }else{
              return res.json({empty:true});
            }
          }else
              return res.json({notFound:true});
          
      } catch (error) {
          console.log(error);
          return res.json({failed:true});
      }
  }else if(getAdjList && savingGoalProf){
        try {
            const value = new ObjectId(userId);
            const result = await savingGoalsColl.findOne(
            {
                user_id: value,
                saving_goals_profiles: {
                    $elemMatch: { saving_goals_profileId: new ObjectId(savingGoalProf) }
                }
            },
            {
                projection: { "saving_goals_profiles.$": 1 }
            }
        ); 
        // console.log(result);
            
            if(result && result.saving_goals_profiles && result.saving_goals_profiles.length > 0){
            const adjustments =  result.saving_goals_profiles[0].adjustments;
            if(adjustments.length>0){
                return res.send(adjustments);
            }else{
                return res.json({empty:true});
            }
            }else
                return res.json({notFound:true});
            
        } catch (error) {
            console.log(error);
            return res.json({failed:true});
        }
  }
  else{
      try {
          const value = new ObjectId(userId);
          const result = await savingGoalsColl.findOne({user_id:value});
          
          if(result && result.saving_goals_profiles.length> 0){
              return res.send(result.saving_goals_profiles);
          }else
              return res.json({notFound:true});
          
      } catch (error) {
          console.log(error);
          return res.json({failed:true});
      }
  }
});
app.post('/savingGoals',async (req,res)=>{
    try {
        const value = new ObjectId(req.body.user_id);

        const result = await savingGoalsColl.updateOne(
            {user_id: value},
            {
                $push:{
                    saving_goals_profiles:{
                        saving_goals_profileId : new ObjectId(),
                        profile_name:req.body.profile_name,
                        goal_amount: Decimal128.fromString(req.body.goal_amount),
                        start_date: new Date(req.body.start_date),
                        target_date: new Date(req.body.target_date),
                        priority: req.body.priority,
                        category: req.body.category,
                        subCategory: req.body.subCategory,
                        ...(req.body.regularly_contribution && {
                            regularly_contribution:{ amount: new Decimal128(req.body.regularly_contribution.amount), frequancy: req.body.regularly_contribution.frequancy }
                        }),
                        description: req.body.description,
                        transactions: [],
                        adjustments: [] 
                    }
                }
            }
            ,{upsert:true}
        );

        if(result.modifiedCount>0 || result.upsertedCount>0){
            return res.json({created:true});
        }else{
            return res.json({created:false});
        }

    } catch (error) {
        // res.json({error});
        console.log(error);
        res.json({created:false});
    }
});
app.put('/savingGoals',async(req,res)=>{
    try {
        const result = await savingGoalsColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
            },{
                $pull:{
                    "saving_goals_profiles.$[profile].transactions":{
                        transaction_id: new ObjectId(req.body.transaction_id)
                    }
                }
            },
            {
                arrayFilters:[
                    {"profile.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId)},
                ]
            }
        );

        if(result.modifiedCount> 0){
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }

    } catch (error) {
        // res.json({error: error});
        console.log(error);
        res.json({failed: true});
    }
});
app.patch('/savingGoals',async (req,res)=>{
  const boolVal = req.body.bool;

  if(boolVal === true){
      try {
          const amount = req.body.amount;
          const data = {
              transaction_id: new ObjectId(),
              date: new Date(req.body.date),
              amount: new Decimal128(amount.toString()),
              ...(req.body.source && {
                  source: req.body.source
              }),
              ...(req.body.description && {
                  description: req.body.description
              })
          };
  
          const result = await savingGoalsColl.updateOne(
              {
                  user_id: new ObjectId(req.body.user_id),
              },
              {
                  $push:{
                      "saving_goals_profiles.$[profile].transactions":data
                  }
              },{
                  arrayFilters: [
                      { "profile.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId) } // Filter the specific profile
                  ]
              }
          );
  
          if(result.modifiedCount>0){
              return res.json({updated: true});
          }else
              return res.json({updated: false});
      } catch (error) {
          console.log(error);
          return res.json({failed:true});
      }
  }else{
    try {
        const amount = req.body.amount;

        const data = {
            type:req.body.type,
            date: new Date(req.body.date),
            amount: new Decimal128(amount.toString()),
            ...(req.body.reason && {
                source: req.body.reason
            }),
        };

        const result = await savingGoalsColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
                "saving_goals_profiles.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId)
            },
            {
                $push:{
                    "saving_goals_profiles.$[profile].adjustments":data
                }
            },{
                arrayFilters: [
                    { "profile.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId) } // Filter the specific profile
                ]
            }
        );

        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else
            return res.json({updated: false});
    } catch (error) {
        // res.send(error);
        console.log(error);
        return res.json({failed:true});
    }
  }
});
app.patch('/savingGoals/profileUpdate',async(req,res)=>{
    const {priority,goalAmount, description, startDate, targetDate, expProf_id, user_id} = req.body;
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = targetDate ? moment(targetDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;

        const updateFields = {
            "saving_goals_profiles.$[element].goal_amount": Decimal128.fromString(goalAmount),
            "saving_goals_profiles.$[element].priority": priority,
            "saving_goals_profiles.$[element].description": description,
            "saving_goals_profiles.$[element].start_date": parsedStartDate,
        };

        if (parsedEndDate) {
            updateFields["saving_goals_profiles.$[element].target_date"] = parsedEndDate;
        }
        // console.log(document);
        const result = await savingGoalsColl.updateOne(
            {user_id: new ObjectId(user_id)},
            {
                $set: updateFields
            },{
                arrayFilters:[{"element.saving_goals_profileId": new ObjectId(expProf_id)}]
            }
        );
        // console.log(result);
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        // return res.json({error});
        console.log(error);
        return res.json({failed: true});
    }
});

app.delete('/savingGoals',async(req,res)=>{
    try {
        if(req.body.length==1){
            const result = await savingGoalsColl.deleteOne({user_id: new ObjectId(req.body.user_id)});
            
            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }else{
            const result = await savingGoalsColl.updateOne(
                {user_id: new ObjectId(req.body.user_id)},
                {
                  $pull:{
                    saving_goals_profiles:{
                        saving_goals_profileId: new ObjectId(req.body.saving_goals_profileId)
                    }
                  }  
                }
            );
            if(result.modifiedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }
    } catch (error) {
        console.log(error);
        res.json({failed:true}); 
    }
});

//reports
app.get('/reports',(req,res)=>{
 
});
app.post('/reports',(req,res)=>{

});
app.put('/reports',()=>{

});
app.patch('/reports',()=>{

});

//Profile & Setting
app.get('/profile-setting',(req,res)=>{
 
});
app.post('/profile-setting',(req,res)=>{

});
app.put('/profile-setting',()=>{

});
app.patch('/profile-setting',()=>{

});


// app.put('/',()=>{

// });
// app.patch('/',()=>{

// });

// app.listen(PORT,'192.168.1.3',()=>{
//     console.log('Server is running...');
// });
app.listen(PORT,()=>{
    console.log('Server is running...');
});
