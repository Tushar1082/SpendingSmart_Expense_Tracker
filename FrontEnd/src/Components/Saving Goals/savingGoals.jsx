import React,{useEffect, useState} from 'react';
import BodyNavbar from '../Homepage/Body/bodyNavbar';
import { showHideOldExpProfBar } from '../../services/actions/actions';
import {useDispatch, useSelector} from 'react-redux';
import Loader from '../Loader/loader';
import './savingGoals.css';

export default function SavingGoals() {
    const user_id = localStorage.getItem('Spending_Smart_User_id');
    const [someProfData,setSomeProfData] = useState();
    const [editProf, setEditProf] = useState(false);
    const [data,setData] = useState({
        user_id: user_id,
        profile_name:'',
        goal_amount: '',
        start_date:'',
        target_date:'',
        priority:'',
        category:'',
        subCategory:'',
        regularly_contribution:'', //(optional) {amount, frequency} object come here
        description:'',
        // remainder:true
    });
    const [showCreateSavGoalProfDialog, setShowCreateSavGoalProfDialog] = useState(false);
    const [showSavGoalProf, setshowSavGoalProf] = useState(null);
    const [selectSavGoalProf, setselectSavGoalProf] = useState();
    const [savGoalsPr, setsavGoalsPr] = useState([]);
    const [showTransList, setshowTransList] = useState(null);
    const [showAddTransDialog, setshowAddTransDialog] = useState(false);
    const [newTransactionData, setNewTransactionData] = useState({ //change name
        date:new Date(),
        amount: 0,
        source: '',
        description:''
    });
    const [savGoalTransList,setSavGoalTransList] = useState([]);
    const [showConfirmBox, setShowConfirmBox] = useState({bool:false,data:{name:'', value:''}}); 
    const [adjustment, setAdjustment] = useState({
        type: '',
        date: new Date(),
        amount: '',
        reason: ''
    });
    const [showAdj, setShowAdj] = useState(false);
    const [showAdjList, setShowAdjList] = useState(false);
    const [savGoalAdjList,setSavGoalAdjList] = useState([]);
    const [expandedExpense, setExpandedExpense] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const dispatch = useDispatch();
    const {showHideProfBar} = useSelector((state)=>state.user);

    const toggleExpense = (index) => {
        setExpandedExpense(expandedExpense === index ? null : index);
    };

    const categories = [
        {
          name: "Emergency Fund",
          subcategories: ["Medical", "Car Repair", "Home Repairs", "Job Loss", "Unexpected Expenses"]
        },
        {
          name: "Travel",
          subcategories: ["Vacation", "Weekend Trips", "Adventure Travel", "Staycations", "Flights"]
        },
        {
          name: "Education",
          subcategories: ["Tuition Fees", "Books and Supplies", "Online Courses", "Certifications", "Workshops"]
        },
        {
          name: "Retirement",
          subcategories: ["Pension Fund", "Investments", "Savings Accounts", "401(k)", "IRA"]
        },
        {
          name: "Home Purchase",
          subcategories: ["Down Payment", "Home Renovation", "Furniture", "Appliances", "Home Insurance"]
        },
        {
          name: "Personal Development",
          subcategories: ["Skill Improvement", "Workshops", "Conferences", "Books", "Coaching"]
        },
        {
          name: "Electronics",
          subcategories: ["Smartphone", "Laptop", "Tablet", "TV", "Headphones", "Smartwatch", "Gaming Console"]
        },
        {
          name: "Vehicles",
          subcategories: ["Car Down Payment", "Car Repairs", "Insurance", "Fuel", "Maintenance"]
        },
        {
          name: "Health and Fitness",
          subcategories: ["Gym Membership", "Healthy Food", "Supplements", "Yoga Classes", "Medical Treatments"]
        },
        {
          name: "Weddings and Events",
          subcategories: ["Wedding", "Anniversaries", "Birthday Parties", "Family Gatherings", "Honeymoon"]
        },
        {
          name: "Child's Future",
          subcategories: ["College Fund", "Extra-Curricular Activities", "Sports", "Tutoring", "Vacation"]
        },
        {
          name: "Charity and Donations",
          subcategories: ["Donating to Causes", "Helping Family/Friends", "Community Initiatives", "Fundraisers"]
        }
    ];
      
    
    function calTotalCurAm(){
        if(!selectSavGoalProf )
            return;
        
        let sum=0; 

        const arr = savGoalTransList;
        const adjArr = savGoalAdjList;

        for(let i =0; i<arr.length;i++){
            sum+= parseFloat(arr[i].amount.$numberDecimal);
        }

        for(let i=0; i<adjArr.length;i++){
            if(adjArr[i].type === 'deposit'){
                sum+= parseFloat(adjArr[i].amount.$numberDecimal);
            }else{
                sum-= parseFloat(adjArr[i].amount.$numberDecimal);
            }
        }

        return sum;
    }

    const isGoalAchievable = (goalAmount, recurringContribution, startDate, targetDate) => {
        // Parse dates
        const start = new Date(startDate);
        const target = new Date(targetDate);
    
        // Validate input
        if (isNaN(start) || isNaN(target)) {
            throw new Error("Invalid start or target date.");
        }
    
        if (start >= target) {
            return false;
            // throw new Error("Start date must be earlier than the target date.");
        }
    
        // Calculate the difference in time
        const timeDifferenceInMs = target - start;
    
        // Convert time difference to appropriate frequency
        const days = timeDifferenceInMs / (1000 * 60 * 60 * 24);
    
        // Calculate the total contributions based on frequency
        let totalContributions = 0;
        switch (recurringContribution.frequency) {
            case "Daily":
                totalContributions = (days * recurringContribution.amount);
                break;
            case "Weekly":
                totalContributions = (Math.floor(days / 7) * recurringContribution.amount);
                break;
            case "Monthly":
                totalContributions = (Math.floor(days / 30) * recurringContribution.amount);
                break;
            case "Yearly":
                totalContributions = (Math.floor(days / 365) * recurringContribution.amount);
                break;
            default:
                throw new Error("Invalid frequency for recurring contribution.");
        }
    
        // Check if the goal is achievable
        return totalContributions >= goalAmount;
    };
    
    async function createSavGoalProf(){ //create new expense profile
        if(!data.profile_name) return alert("Give Profile Name");
        else if(!data.goal_amount) return alert("Give Goal Amount");
        else if(!data.description) return alert("Give Description");
        else if(!data.start_date) return alert("Give Start Date");
        else if(!data.target_date) return alert("Give Target Date");
        else if(data.target_date<=data.start_date) return alert('Give correct target date');
        else if(!data.priority) return alert("Give Priority level(High, medium, low)");
        else if(!data.category) return alert("Give Category");
        else if(data.category !== "Other" && !data.subCategory) return alert("Give Sub Category");
        else if(data.regularly_contribution.amount && !data.regularly_contribution.frequency) return alert("Give amount for plan so you contribute regularly");
        else if(data.regularly_contribution.frequency && !data.regularly_contribution.amount) return alert("Give 'How often will you make this contribution?' ");

        if(data.regularly_contribution){
            const val = isGoalAchievable(data.goal_amount, data.regularly_contribution, data.start_date, data.target_date);
            if(!val){
                alert("Select more days according to your given regularly contribution");
                return;
            }            
        }

        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals`,{
                method:'POST',
                headers:{
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const finalResult = await result.json();
    
            if(finalResult.created){
                const res = await getSavingGoalsProfiles(savGoalsPr.length);
                // setShowCreateNewExpDiv(false);
                // setState(res);
                setShowCreateSavGoalProfDialog(false);
                setData({
                    user_id: user_id,
                    profile_name:'',
                    goal_amount: '',
                    start_date:'',
                    target_date:'',
                    priority:'',
                    category:'',
                    subCategory:'',
                    regularly_contribution:'', //(optional) {amount, frequency} object come here
                    description:'',
                    // remainder:true
                })
            }else{
                alert('expense profile not created');
            }
        } catch (error) {
            alert('failed to send data to backend');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
        }
    }

    async function handleDeleteSavGoalProf(exp_prfId){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals`,{
                method: 'DELETE',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({user_id,saving_goals_profileId:exp_prfId,length: savGoalsPr.length})
            });
            const finalResult = await result.json();
    
            if(finalResult.failed)
            {
                alert("Error From BackEnd");
                return;
            }
            
            if(finalResult.updated){
                getSavingGoalsProfiles();
                setshowTransList(null);
                // setState(res);
                // setShowDelExpProf(false);
            }else{
                alert('failed to delete expense from backend');
            }
        } catch (error) {
            console.log(error);
            alert("Failed to delete expense");
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }
    async function getSavingGoalsProfiles(idx=0){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals?user_id=${user_id}`,{
                method:'GET'
            })
            const finalResult = await result.json();
    
            if(finalResult.notFound){
                alert('saving goals profiles not exists');
                setshowSavGoalProf(false);
                // return false;
            }        
            else if(finalResult.failed){
                alert('failed to get saving goals profiles but error from here');
                // return false;   
                setshowSavGoalProf(false);
            }else{
                setselectSavGoalProf(finalResult[idx]);
                setsavGoalsPr(finalResult);
                setSavGoalTransList(finalResult[idx].transactions);
                setSavGoalAdjList(finalResult[idx].transactions);
                setshowSavGoalProf(true);
            }
            // return true;
        } catch (error) {
            alert('failed to get saving goals profiles');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }

    async function addNewTransaction(){
        if(!newTransactionData.date) return alert("Give Date");
        else if(!newTransactionData.amount) return alert("Give Amount");
        else{
            try {
                setShowLoading(true);
                const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals`,{
                    method: 'PATCH',
                    headers:{
                    'content-type': 'application/json'
                    },
                    body: JSON.stringify({...newTransactionData,user_id,saving_goals_profileId:selectSavGoalProf.saving_goals_profileId, bool:true})
                });

                const finalResult = await result.json();

                if(finalResult.failed)
                {
                    alert("Error From BackEnd");
                    return;
                }
                
                if(finalResult.updated){
                    getSavingProfTrans();
                    setshowAddTransDialog(false);
                    setshowTransList(true);
                    setNewTransactionData('');
                }else{
                    alert('failed to add new expense');
                }
            } catch (error) {
                console.log(error);
                alert('Failed to send new expense to backend');
            }finally{
                setTimeout(()=>{
                    setShowLoading(false);
                },1000);
        }
        }
    }

    async function handleTransDelete(transaction_id){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals`,{
                method: 'PUT',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({user_id,saving_goals_profileId:selectSavGoalProf.saving_goals_profileId,transaction_id})
            });
            const finalResult = await result.json();

            if(finalResult.failed)
            {
                alert("Error From BackEnd");
                return;
            }
            
            if(finalResult.updated){
                getSavingProfTrans();
            }else{
                alert('failed to delete expense from backend');
            }
        } catch (error) {
            console.log(error);
            alert("Failed to delete expense");
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }

    async function getSavingProfTrans(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals?user_id=${user_id}&&savingGoalProf=${selectSavGoalProf.saving_goals_profileId}&&getTransList=true`,{
                method:'GET',
                headers:{
                    'content-type':'application/json'
                }
            });
            const finalResult = await result.json();

            if(finalResult.failed){
                alert("error from backend");
                setshowTransList(false);
            }else if(finalResult.notFound){
                alert('fail to get transaction list');
                setshowTransList(false);
            }else if(finalResult.empty){
                setshowTransList(false);
            }
            else{
                setSavGoalTransList(finalResult);
                setshowTransList(true);
            }
        } catch (error) {
            alert('Error from here');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }

    async function submitAdjustmentData(){
        if(!adjustment.type) return alert("Select adjustment type");
        else if(!adjustment.date) return alert("Give date");
        else if(!adjustment.amount) return alert("Give amount");

        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals`,{
                method: 'PATCH',
                headers:{
                    'content-type' : 'application/json'
                },
                body: JSON.stringify({...adjustment, user_id, saving_goals_profileId:selectSavGoalProf.saving_goals_profileId})
            });
            const finalResult = await result.json();

            if(finalResult.updated){
                alert('success');
                // getSavingGoalsProfiles();
                getSavingProfAdj();
                setShowAdj(false);
                setAdjustment({
                    type: '',
                    date: new Date(),
                    amount: '',
                    reason: ''
                })
            }else if(!finalResult.updated){
                alert('fail');
            }else if(finalResult.failed){
                alert('fail from backend');
            }
        } catch (error) {
            alert('failed to do adjustment');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }
    async function getSavingProfAdj(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals?user_id=${user_id}&&savingGoalProf=${selectSavGoalProf.saving_goals_profileId}&&getAdjList=true`,{
                method:'GET',
                headers:{
                    'content-type':'application/json'
                }
            });
            const finalResult = await result.json();

            if(finalResult.failed){
                alert("error from backend");
                setShowAdjList(false)
            }else if(finalResult.notFound){
                alert('fail to get adjustment list');
                setShowAdjList(false);
            }else if(finalResult.empty){
                setShowAdjList(false);
            }
            else{
                // alert'
                setSavGoalAdjList(finalResult);
                setShowAdjList(true);
            }
        } catch (error) {
            alert('Error from here');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }
    async function handleProfChanges(){
        try {
            setShowLoading(true);
            const user_id = localStorage.getItem('Spending_Smart_User_id');
            const result = await fetch(`${import.meta.env.VITE_API_URL}/savingGoals/profileUpdate`,{
              method:'PATCH',
              headers:{
                'content-type': "application/json"
              },
              body: JSON.stringify({expProf_id: selectSavGoalProf.saving_goals_profileId,user_id, ...someProfData})
            });
            const finalRes = await result.json();
      
            if(!finalRes.updated){
              alert('failed! Try again later');
            }else if(finalRes.failed){
              alert('Error from backend! Try again later');
            }else{
              alert('Changes save successfully');
              window.location.reload();
            }
          } catch (error) {
            alert('FrontEnd Error! Try again later');
          }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
    }
    }

    function showHideOldProfBar(){
        dispatch(showHideOldExpProfBar(false));
    }
    
    function fun(){
        if(!selectSavGoalProf) return;
        // console.log(selectExpProf);
        setSomeProfData({
            goalAmount: selectSavGoalProf.goal_amount.$numberDecimal,
            description: selectSavGoalProf.description || 'empty',
            startDate: new Date(selectSavGoalProf.start_date).toLocaleDateString(),
            targetDate: new Date(selectSavGoalProf.target_date).toLocaleDateString(),
            priority: selectSavGoalProf.priority || 'Medium', // Default to 'Medium' if not set
        })
    }
    useEffect(()=>{
        if(selectSavGoalProf){
            if(selectSavGoalProf.transactions.length>0){
                setshowTransList(true);
                setSavGoalTransList(selectSavGoalProf.transactions);
            }else{
                setshowTransList(false);
                setSavGoalTransList([]);
            }

            if(selectSavGoalProf.adjustments.length>0){
                setShowAdjList(true);
                setSavGoalAdjList(selectSavGoalProf.adjustments);
            }else{
                setShowAdjList(false);
                setSavGoalAdjList([]);
            }
            fun();
        }
    },[selectSavGoalProf])

    useEffect(()=>{
        getSavingGoalsProfiles();
    },[])

    return (
        <div id='mainSavingGoals' style={{gridTemplateColumns:showSavGoalProf?'1fr 4fr':'1fr'}}>
            {/* Below part to create new saving goals profiles */}
            {showCreateSavGoalProfDialog && <div id='sGExpProfDiv'>
                <div style={{width:'200px', margin:'30px auto'}}>
                    <img src="./addProfile.png" alt="error" style={{width:'100%'}} />
                </div>
                <div style={{marginBottom:'10px'}}>
                    <span>Profile Name:</span>
                    <input type="text" placeholder='Profile Name(such as "Monthly Bills" or "Subscription Services")' 
                    onChange={(e)=>setData((prev)=>({...prev, profile_name:e.target.value}))}
                    />
                </div>
                <div>
                    <span>Goal Amount:</span>
                    <input type="number" placeholder='Goal Amount' onChange={(e)=>setData((prev)=>({...prev, goal_amount: e.target.value}))} />
                </div>
                <div id='contributionDiv'>
                    <p style={{fontWeight:'bold', marginTop:'10px'}}>Contribution Details(Optional): -</p>
                    <div style={{marginBottom:'10px'}}>
                        <h3>What is the amount you plan to contribute regularly?</h3>
                        <input type="number" placeholder='Amount' style={{marginTop:'10px'}} onChange={(e)=>setData((prev)=>({...prev, regularly_contribution:{amount:e.target.value, frequency: prev.regularly_contribution.frequency||''}}))} />
                    </div>

                    <div>
                        <h3 style={{marginBottom:'10px'}}>How often will you make this contribution</h3>
                        <label htmlFor="expPeriod_Daily">
                            <input 
                            type="radio" 
                            id="expPeriod_Daily" 
                            name="expenses_period" 
                            onClick={()=>setData((prev)=>({...prev, regularly_contribution:{amount:prev.regularly_contribution.amount||'', frequency:"Daily"}}))}
                            />
                            Daily
                        </label>
                        <label htmlFor="expPeriod_Weekly">
                            <input 
                            type="radio" 
                            id="expPeriod_Weekly" 
                            name="expenses_period" 
                            onClick={()=>setData((prev)=>({...prev, regularly_contribution:{amount:prev.regularly_contribution.amount||'', frequency:"Weekly"}}))}
                            />
                            Weekly
                        </label>
                        <label htmlFor="expPeriod_Monthly">
                            <input 
                            type="radio" 
                            id="expPeriod_Monthly" 
                            name="expenses_period" 
                            onClick={()=>setData((prev)=>({...prev, regularly_contribution:{amount:prev.regularly_contribution.amount||'', frequency:"Monthly"}}))}
                            />
                            Monthly
                        </label>
                        <label htmlFor="expPeriod_Yearly">
                            <input 
                            type="radio" 
                            id="expPeriod_Yearly" 
                            name="expenses_period" 
                            onClick={()=>setData((prev)=>({...prev, regularly_contribution:{amount:prev.regularly_contribution.amount||'', frequency:"Yearly"}}))}
                            />
                            Yearly
                        </label>
                    </div>
                </div>

                <div style={{marginTop:'10px',marginBottom:'10px'}}>
                    <span>Start Date:</span>
                    <input type="date" onChange={(e)=>setData((prev)=>({...prev, start_date:e.target.value}))} />
                </div>
                <div style={{marginBottom:'10px'}}>
                    <span>Target Date:</span>
                    <input type="date" onChange={(e)=>setData((prev)=>({...prev, target_date:e.target.value}))} />
                </div>
                
                <div style={{marginBottom:'10px'}}>
                    <span>Priority:</span>
                    <select name="" id="" onChange={(e)=>setData((prev)=>({...prev, priority: e.target.value}))}>
                        <option value="">Select Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                {/* Category and sub category */}
                <div style={{marginBottom:'10px'}}>
                    <div>
                        <label>
                            <span>Select Category:</span>
                            <select
                                value={data.category}
                                onChange={(e)=>setData((prev)=>({...prev, category:e.target.value}))}
                            >
                                <option value="">--Select Category--</option>
                                {categories.map((category, index) => (
                                <option key={index} value={category.name}>
                                    {category.name}
                                </option>
                                ))}
                                <option onChange={()=>setData((prev)=>({...prev, category:"Other"}))} >Other</option>
                            </select>
                        </label>
                    </div>

                    {data.category && data.category !== "Other" && (
                    <div>
                        <label>
                            Select Subcategory:
                            <select
                            value={data.subCategory}
                            onChange={(e)=>setData((prev)=>({...prev, subCategory:e.target.value}))}
                            >
                            <option value="">--Select Subcategory--</option>
                            {
                                categories
                                .find((cat) => cat.name === data.category)
                                ?.subcategories.map((subcat, index) => (
                                    <option key={index} value={subcat}>
                                    {subcat}
                                    </option>
                                ))
                            }
                            </select>
                        </label>
                    </div>
                    )}
                </div>

                {/* <div style={{display:'flex', alignItems:'center'}}>
                    <label htmlFor="remainder_RE" style={{cursor:'pointer'}}>
                        Remainder
                    </label>
                    <input type="checkbox" style={{cursor:'pointer'}} defaultChecked={true} id="remainder_RE" onChange={(e)=> setData((prev)=>({...prev,remainder:e.target.checked}))} />
                </div> */}
                <div>
                    <p style={{fontWeight:'bold', marginBottom:'5px'}}>Description: -</p>
                    <textarea name="" id="" placeholder='Description' onChange={(e)=>setData((prev)=>({...prev, description:e.target.value}))}></textarea>
                </div>
                <div style={{margin:'auto'}} id='SubmitBtn_SG'>
                    <button onClick={createSavGoalProf} style={{cursor:'pointer'}}>Submit</button>
                    <button onClick={()=>setShowCreateSavGoalProfDialog(false)}>Close</button>  
                </div>
            </div>}

            {/* old saving goals profile */}
            {showSavGoalProf && savGoalsPr.length>0 &&
            <div id='oldSavGoalProf' className={showHideProfBar?'showOldExpProfBar':''}>
                <div id='oldExpenseBody'>
                        <div id='all_expenese_profile'>
                        <div style={{margin:'1rem'}} id='allExpenseProfHeading'>
                            <h2>All Expense Profiles: -</h2>
                        </div>
                        {
                    savGoalsPr.map((elem,index)=>(
                        <div 
                        id='each_expense_profile'
                        onClick={()=>{setselectSavGoalProf(elem), setShowAdj(false)}} 
                        key={index} 
                        style={{
                            backgroundColor: selectSavGoalProf.saving_goals_profileId == elem.saving_goals_profileId?"#AFEFEF":"rgba(0, 0, 0, 0.8)",
                            color: selectSavGoalProf.saving_goals_profileId == elem.saving_goals_profileId?"black":"white",
                            boxShadow: selectSavGoalProf.saving_goals_profileId == elem.saving_goals_profileId?"-1px 1px 4px 1px #000000a1":""

                        }}
                        >
                            <h3 id='eachProfHeading' style={{marginBottom:'10px'}}>Profile Name: {elem.profile_name}</h3>
                            <div id='eachProfDetails'>
                                <div id='priorityDiv'>
                                        {elem.priority === "Low"&&<span id='prioritySpan' style={{backgroundColor:'yellowgreen', color:'white'}}>{elem.priority}</span>}
                                        {elem.priority === "Medium"&&<span id='prioritySpan' style={{backgroundColor:'yellow', color:'black'}}>{elem.priority}</span>}
                                        {elem.priority === "High"&&<span id='prioritySpan' style={{backgroundColor:'red', color:'white'}}>{elem.priority}</span>}
                                </div>
                                <p><strong>Goal Amount:</strong> {elem.goal_amount.$numberDecimal}</p>
                                <p><strong>Start Date:</strong> {new Date(elem.start_date).toLocaleDateString()}</p>
                                <p><strong>Target Date:</strong> {new Date(elem.target_date).toLocaleDateString()}</p>
                                <p><strong>Description:</strong> {elem.description||'empty'}</p>
                            </div>
                            <div id="deleteExpProfDiv">
                                <button 
                                onClick={()=>setShowConfirmBox({bool:true,data:{name:'expenseProfile',value:elem.saving_goals_profileId}})} 
                                style={{
                                    color: selectSavGoalProf.profile_name == elem.profile_name?"white":"black",
                                    backgroundColor: selectSavGoalProf.profile_name == elem.profile_name?"rgba(0, 0, 0, 0.8)":'white',
                                }}
                                >Delete</button>
                            </div>
                        </div>
                        ))
                        }
                        </div>
                        <div id='createNewSavGoalProfBtn'>
                            <button onClick={()=>setShowCreateSavGoalProfDialog(true)}>Create New Expense Profile</button>
                        </div>
                </div>
                <div id='leftToRightBtn' onClick={showHideOldProfBar}>
                    <img src="leftArrow.png" alt="error"  />
                </div>
            </div>
            }

            {/* image for empty saving goals profiles */}
            {showSavGoalProf !== null && !showSavGoalProf &&<div>
                <BodyNavbar/>
                <div id='emptyExpenseProfile'>
                    <img src="./empty.jpg" alt="error" />
                </div>
                <div id='new_expense_profile_div' style={{margin:'auto'}}>
                    <button onClick={()=>setShowCreateSavGoalProfDialog(true)}>Create New Expense Profile</button>
                </div>
            </div>}
            
            {/* Below show on display when transaction list of saving goals profile is empty */}
            { showTransList!==null && !showTransList &&
            <div>
                <BodyNavbar/>
                <div id='emptyExpenseListMain'>
                    <div id='emptyExpenseList'>
                        <img src="./emptyTransactions.jpg" alt="error" style={{width:"100%"}} />
                    </div>
                    <div id='addExpense'>
                        <button onClick={()=>setshowAddTransDialog(true)}>Add Money</button>
                    </div>
                </div>
            </div>
            }

            {/* Below code is used to add new transactions */}
            {showAddTransDialog && <div id='addTrans_SG'>
                <div id='closeBtnDiv' >
                    <img src="./cross.png" alt="error" onClick={()=>setshowAddTransDialog(false)} />
                </div>
                <div style={{width: "200px", margin: 'auto', marginBottom:'30px'}}>
                    <img style={{width: '100%'}} src="./addExpense.jpg" alt="error" />
                </div>
                <div style={{display:'flex', gap:'10px', margin:'10px'}}> 
                    <div style={{display:'grid', gap:'20px'}}>
                        <span>Date: </span>
                        <span>Amount:</span>
                        <span>Source (Optional): </span>
                        
                    </div>
                    <div style={{display:'grid', gap:'20px'}}>
                        <input type="date" onChange={(e)=>setNewTransactionData((prev)=>({...prev, date:e.target.value}))}/>
                        <input type="number" placeholder='Amount'
                            onChange={(e) => {
                                const value = Number(e.target.value); // Convert input to integer
                                setNewTransactionData((prev) => ({ ...prev, amount: parseFloat(value) }));
                            }}
                        />
                        <input type="text" placeholder='Source' onChange={(e)=>setNewTransactionData((prev)=>({...prev, source:e.target.value}))} />
                    </div>                  
                </div>
                <div style={{display:'grid', gap:'10px', margin:'0px 10px'}}>
                    <span>Description (Optional): </span>
                    <textarea type="text" placeholder='Description' onChange={(e)=>setNewTransactionData((prev)=>({...prev, description:e.target.value}))}/>
                </div>
                <div id='addExpense' style={{margin:'10px auto'}}>
                    <button onClick={addNewTransaction}>Add Money</button>
                </div>
            </div>}

            {/* show transaction list of selected saving goals profile */}
            {showSavGoalProf && showTransList && 
            <div id='main_expenses'>
                {/* Below show list of transactions of an saving goals profile*/}
                { showTransList && savGoalTransList.length>0 &&
                <>
                    <BodyNavbar/>

                    <div style={{marginTop:'20px'}}>
                        {/* <div id='expenseProfileDetail_TE'>
                            <h2>Profile Name: {selectSavGoalProf.profile_name}</h2>
                            <div>
                                <p><strong>Priority:</strong> 
                                    {selectSavGoalProf.priority === "Low"&&<span id='prioritySpan' style={{backgroundColor:'yellowgreen', color:'white'}}>{selectSavGoalProf.priority}</span>}
                                    {selectSavGoalProf.priority === "Medium"&&<span id='prioritySpan' style={{backgroundColor:'yellow', color:'black'}}>{selectSavGoalProf.priority}</span>}
                                    {selectSavGoalProf.priority === "High"&&<span id='prioritySpan' style={{backgroundColor:'red', color:'white'}}>{selectSavGoalProf.priority}</span>}
                                </p>
                                <p><strong>Goal Amount:</strong> {selectSavGoalProf.goal_amount.$numberDecimal}</p>
                                <p><strong>Current Saving:</strong>  ₹{calTotalCurAm()}</p>
                                <p><strong>Description:</strong> {selectSavGoalProf.description}</p>
                                <p><strong>Regularly Contribution:</strong> ₹{selectSavGoalProf.regularly_contribution.amount.$numberDecimal}</p>
                            </div>
                        </div> */}
                    { someProfData && <div id='expenseProfileDetail_TE' style={{marginTop:'unset', position:'relative'}}>
                        <div id="editProfile_TE" style={{width:'7%'}} onClick={()=>setEditProf(!editProf)}>
                        <img src="edit.png" alt="error" />
                        </div>
                        <h2>Profile Name: {selectSavGoalProf.profile_name}</h2>
                        <div id="profDivInputs_TE">
                        <div>
                            <h3><strong>Priority:</strong></h3>
                            {editProf ? (
                                <select 
                                    value={someProfData.priority} 
                                    onChange={(e) => setSomeProfData((prev) => ({ ...prev, priority: e.target.value }))}
                                    style={{
                                        backgroundColor: someProfData.priority === "Low" ? "yellowgreen" 
                                                        : someProfData.priority === "Medium" ? "yellow" 
                                                        : "red",
                                        color: someProfData.priority === "Medium" ? "black" : "white",
                                        padding: "5px",
                                        borderRadius: "5px",
                                        border: "none"
                                    }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            ) : (
                                <span 
                                    id="prioritySpan" 
                                    style={{
                                        backgroundColor: someProfData.priority === "Low" ? "yellowgreen" 
                                                        : someProfData.priority === "Medium" ? "yellow" 
                                                        : "red",
                                        color: someProfData.priority === "Medium" ? "black" : "white",
                                        padding: "5px",
                                        borderRadius: "5px"
                                    }}
                                >
                                    {someProfData.priority}
                                </span>
                            )}
                        </div>
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                            <div style={{display:'grid', gap:'20px', whiteSpace:'nowrap'}}>
                                <p><strong>Goal Amount:</strong></p>
                                <p><strong>Current Amount:</strong></p>
                                <p><strong>Start Date:</strong> </p>
                                <p><strong>Target Date:</strong> </p>
                            </div>
                            <div style={{display:'grid', gap:'20px'}}>
                                <input type="text" onChange={(e)=>setSomeProfData((prev)=>({...prev, goalAmount:e.target.value}))} value={0||someProfData.goalAmount} disabled={!editProf?true:false} />
                                <p>₹{calTotalCurAm().toFixed(2)}</p>
                                <input type="text" value={someProfData.startDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, startDate:e.target.value}))} disabled={!editProf?true:false} />
                                <input type="text" value={someProfData.targetDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, targetDate:e.target.value}))} disabled={!editProf?true:false} />
                            </div>
                        </div>
                            <div>
                                <p><strong>Description:</strong></p>
                                <textarea name="" id="profDescription_T" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false}/>
                            </div>
                            { editProf && 
                            <div>
                                <button id="profChangesBtn_TE" onClick={handleProfChanges}>Save Changes</button>
                            </div>}
                        </div>
                    </div>}
                        <div className="expenses-container">
                                {savGoalTransList.map((expense, expenseIndex) => (
                                    <div className="expense-card" id='expCard_GE'  key={expenseIndex}>
                                        <div>
                                            <div style={{display:'flex', gap:'15px'}} >
                                                <div
                                                    className="expense-header"
                                                    onClick={() => toggleExpense(expenseIndex)}
                                                >
                                                    <h3>{new Date(expense.date).toLocaleDateString()}</h3>
                                                    <span>{expandedExpense === expenseIndex ? "-" : "+"}</span>
                                                </div>
                                                <div style={{display:'flex', gap:'20px', alignItems:'center', marginRight:'20px', cursor:'pointer'}} onClick={()=>setShowConfirmBox({bool:true, data: {name:'expense',value:expense.transaction_id}})}>
                                                    <img src="./delete.png" alt="error" style={{width:'45px'}}  />
                                                </div>
                                            </div>
                                            {expandedExpense === expenseIndex && (
                                                <div className="expense-details">
                                                    <table className="details-table">
                                                    <tbody>
                                                        <tr>
                                                            <th>Field</th>
                                                            <th>Details</th>
                                                        </tr>
                                                        <tr>
                                                            <td>Amount:</td>
                                                            <td>₹{expense.amount.$numberDecimal}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Source:</td>
                                                            <td>{expense.source|| "empty"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Description:</td>
                                                            <td>{expense.description|| "empty"}</td>
                                                        </tr>
                                                    </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ))}

                                <div id='addExpense'>
                                    <button onClick={()=>(setshowAddTransDialog(true))}>Add Money</button>
                                    {showAdjList===false && <button onClick={()=>setShowAdj(!showAdj)} style={{backgroundColor:'#4285F4', marginLeft:'10px'}}>Add adjustment</button>}
                                    <button onClick={()=>setShowAdjList(!showAdjList)} style={{backgroundColor:'rgb(173, 6, 36)', marginLeft:'10px'}}>{!showAdjList?"show":'hide'} Adjustment</button>
                                </div>
                        </div>
                    </div>
                </>
                }

                {/* Below code show list of adjustment */}
                {showAdjList && savGoalAdjList.length>0 &&<div id='expenseDiv'>
                    <table>
                        <thead>
                            <tr>
                                <th style={{width:'5%'}}>S.No.</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                            savGoalAdjList.map((elm,idx)=>(
                                <tr key={idx}>
                                    <td style={{textAlign:'center'}}>{idx+1}.</td>
                                    <td>{elm.type}</td>
                                    <td>{new Date(elm.date).toLocaleDateString()}</td>
                                    <td>{elm.amount.$numberDecimal}</td>
                                    <td>{elm.reason || 'empty'}</td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                    
                    <div style={{width:'fit-content', margin:'auto', marginTop:'10px'}}>
                        <button id='adjBtn'  onClick={()=>setShowAdj(true)} >Add Adjustments</button>
                    </div>
                </div>}
            </div>
            }

            {/* Belew code use to ask again user that 'are you sure' to delete transaction or saving goals profile */}
            {showConfirmBox.bool && <div id='delExpProfDiv_TME'>
                            <div>
                                <h3 style={{textAlign: 'center'}}>Are you sure?</h3>
                            </div>
                            <div id='delExpProfDiv_TME_BTNDIV'>
                                <button onClick={()=>
                                    {
                                        if(showConfirmBox.data.name === "expenseProfile"){
                                            handleDeleteSavGoalProf(showConfirmBox.data.value);
                                            setShowConfirmBox({bool:false, data:{name:'',value:''}});
                                        }else if(showConfirmBox.data.name === "expense"){
                                            handleTransDelete(showConfirmBox.data.value);
                                            setShowConfirmBox({bool:false, data:{name:'',value:''}});
                                        }
                                    }
                                }>Yes</button>
                                <button onClick={()=> setShowConfirmBox({bool:false, data:{name:'',value:''}})}>No</button>
                            </div>
            </div>}
            
            {/* Below code is used to take adjustments from user */}
            {showAdj && <div id='addTrans_SG' style={{display:'grid', gap:'10px'}}>
                    <div id='closeBtnDiv'>
                        <img src="./cross.png" alt="error" onClick={()=>setShowAdj(false)} />
                    </div>
                    <div style={{width:'300px', margin:'auto', marginBottom:'10px'}}>
                        <img src="./addAdjustment.png" style={{width:'100%'}} alt="error" />
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', margin:'10px'}}>
                        <div style={{display:'grid', gap:'20px'}}>
                            <span>Type:</span>
                            <span>Date:</span>
                            <span>Amount:</span>
                            <span>Reason (optional):</span>
                        </div>
                        <div style={{display:'grid', gap:'20px'}}>
                            <select 
                            value={adjustment.type} 
                            style={{border:'none', boxShadow:'0px 0px 3px 2px lightgrey', padding:'5px 10px', borderRadius:'10px', outline:'none'}} 
                            onChange={(e) => setAdjustment((prev)=>({...prev,type:e.target.value}))}>
                                <option value="">Select Type</option>
                                <option value="deposit">Deposit</option>
                                <option value="withdrawal">Withdrawal</option>
                            </select>
                            <input
                            type="date"
                            value={adjustment.date}
                            min={new Date().toISOString().split("T")[0]} 
                            onChange={(e) => setAdjustment((prev)=>({...prev,date:e.target.value}))}
                            />
                            <input
                            type="number"
                            placeholder='Amount'
                            value={adjustment.amount}
                            onChange={(e) => setAdjustment((prev)=>({...prev,amount:e.target.value}))}
                            />
                            <input
                            type="text"
                            placeholder='Reason'
                            value={adjustment.reason}
                            onChange={(e) => setAdjustment((prev)=>({...prev,reason:e.target.value}))}
                            />
                        </div>
                    </div>
                    
                    <div id='addExpense' style={{margin:'10px auto'}}>
                      <button onClick={submitAdjustmentData} style={{fontSize:'medium'}} >Add Adjustment</button>
                    </div>
            </div>}
            {showLoading?<Loader/>:null}
        </div>
    )
}
