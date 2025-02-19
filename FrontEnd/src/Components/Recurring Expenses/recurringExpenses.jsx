import React,{useEffect, useState} from 'react';
import BodyNavbar from '../Homepage/Body/bodyNavbar';
import Loader from '../Loader/loader';
import { showHideOldExpProfBar } from '../../services/actions/actions';
import {useDispatch, useSelector} from 'react-redux';
import './recurringExpenses.css';

import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registering necessary components with Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default function RecurringExpenses() {
    const user_id = localStorage.getItem('Spending_Smart_User_id');
    const [someProfData,setSomeProfData] = useState();
    const [editProf, setEditProf] = useState(false);
    const [data,setData] = useState({
        user_id: user_id,
        profile_name:'',
        total_budget: '',
        expenses_period: '',
        description:'',
        start_date:'',
    });
    const [createExpProf, setcreateExpProf] = useState(false);
    const [showExpProf, setshowExpProf] = useState(null);
    const [selectExpProf, setSelectExpProf] = useState();
    const [expPr, setExpPr] = useState([]);
    const [showAddExpDialog, setShowAddExpDialog] = useState(false);
    const [showExpList, setShowExpList] = useState(null);
    const [newExpenseData, setNewExpenseData] = useState({
        name:'',
        category:'',
        subCategory:'',
        date:new Date(),
        amount: 0,
        description: ''
    });
    const [expData, setExpData] = useState([]); //expense list of selected profile
    const [showConfirmBox, setShowConfirmBox] = useState({bool:false,data:{name:'', value:''}}); 
  const [expandedExpense, setExpandedExpense] = useState(null);
        const [showLoading, setShowLoading] = useState(false);    
    const toggleExpense = (index) => {
        setExpandedExpense(expandedExpense === index ? null : index);
    };
    const categories = [
        {
          name: "Housing",
          subcategories: ["Rent/Mortgage", "Property Taxes", "Home Maintenance"]
        },
        {
          name: "Utilities",
          subcategories: ["Electricity", "Water", "Gas", "Internet", "Cable/TV", "Phone"]
        },
        {
          name: "Transportation",
          subcategories: ["Fuel", "Public Transport Pass", "Vehicle Loan EMI", "Vehicle Maintenance/Insurance"]
        },
        {
          name: "Food & Groceries",
          subcategories: ["Groceries", "Dining Out", "Meal Subscriptions"]
        },
        {
          name: "Healthcare",
          subcategories: ["Health Insurance", "Medications", "Routine Checkups"]
        },
        {
          name: "Education",
          subcategories: ["Tuition Fees", "Online Courses", "Books & Supplies"]
        },
        {
          name: "Personal Care",
          subcategories: ["Gym Membership", "Salon Services", "Skin Care"]
        },
        {
          name: "Entertainment",
          subcategories: ["Streaming Subscriptions", "Gaming Subscriptions", "Magazine/Newspaper Subscriptions"]
        },
        {
          name: "Savings & Investments",
          subcategories: ["Retirement Contributions", "Emergency Fund", "Investment Plans"]
        },
        {
          name: "Insurance",
          subcategories: ["Life Insurance", "Vehicle Insurance", "Home Insurance"]
        },
        {
          name: "Childcare",
          subcategories: ["Daycare Fees", "School Fees", "Extracurricular Activities"]
        },
        {
          name: "Pets",
          subcategories: ["Pet Food", "Vet Bills", "Grooming"]
        },
        {
          name: "Debt Repayments",
          subcategories: ["Credit Card Payments", "Personal Loan EMI", "Student Loan"]
        },
        {
          name: "Subscriptions & Memberships",
          subcategories: ["Gym", "Clubs", "Software Subscriptions"]
        },
        {
          name: "Miscellaneous",
          subcategories: ["Charitable Donations", "Gift Purchases", "Other Recurring Expenses"]
        }
      ]
    
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysis, setAnalysis] = useState([]);
    const [barChartData, setBarChartData] = useState();
    const [subBarChartData, setSubBarChartData] = useState();
    const [pieChartData, setPieChartData] = useState();
    const [categoryAna,setCategoryAna] = useState([]);
    const [subCategoryAna,setSubCategoryAna] = useState([]);
    const {showHideProfBar} = useSelector((state)=>state.user);
    const dispatch = useDispatch();

      
    function handleBarPieChart(data, budget) {
        if (data.length === 0) return;
    
        // Handle Bar Chart for Categories
        let categoryArr = [];
        let subCategoryArr = [];
    
        data.forEach((elem) => {
          // Handle category array
          let categoryIndex = categoryArr.findIndex(item => item.name === elem.category);
          if (categoryIndex === -1) {
            categoryArr.push({ name: elem.category, amount: parseFloat(elem.amount.$numberDecimal) });
          } else {
            categoryArr[categoryIndex].amount += parseFloat(elem.amount.$numberDecimal);
          }
        
          // Handle subCategory array
          let subCategoryIndex = subCategoryArr.findIndex(item => item.name === elem.subCategory);
          if (subCategoryIndex === -1) {
            subCategoryArr.push({ name: elem.subCategory, amount: parseFloat(elem.amount.$numberDecimal) });
          } else {
            subCategoryArr[subCategoryIndex].amount += parseFloat(elem.amount.$numberDecimal);
          }
        });
        
        setCategoryAna(categoryArr);
        setSubCategoryAna(subCategoryArr);
    
        const categoryBarChart = {
          labels: categoryArr.map(exp => exp.name),
          datasets: [
            {
              label: "Expenses by Category",
              data: categoryArr.map(exp => exp.amount), // Extracting expense amounts
              backgroundColor: ["#FF5733", "#33FF57", "#3357FF"], // Colors for each category
              borderColor: ["#FF5733", "#33FF57", "#3357FF"],
              borderWidth: 1,
            },
          ],
        };
        setBarChartData(categoryBarChart);
      
        // Handle Bar Chart for Subcategories (if applicable)
        let subcategoryBarChart;
        subcategoryBarChart = {
          labels: subCategoryArr.map(exp => exp.name), // Extracting subcategory names
          datasets: [
            {
              label: "Expenses by Subcategory",
              data: subCategoryArr.map(exp => exp.amount), // Extracting subcategory totals
              backgroundColor: ["#FFBD33", "#FF5733", "#33FF57"], // Colors for each subcategory
              borderColor: ["#FFBD33", "#FF5733", "#33FF57"],
              borderWidth: 1,
            },
          ],
        };
    
        setSubBarChartData(subcategoryBarChart);
      
        // Handle Pie Chart
        const totalSpent = data.reduce((acc, exp) => acc + parseFloat(exp.amount.$numberDecimal), 0);
        const remainingBudget = parseFloat(budget.$numberDecimal || 0) - totalSpent;
      
        const pieChart = {
          labels: ["Total Spent", "Remaining Budget"],
          datasets: [
            {
              label: "Budget Distribution",
              data: [totalSpent, remainingBudget],
              backgroundColor: ["#FF5733", "#33FF57"], // Colors for each section
              hoverOffset: 4,
            },
          ],
        };
        
        const pieChartOptions = {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Budget vs Total Spent",
            },
            datalabels: {
              color: "#0",
              formatter: (value, context) => {
                const total = context.dataset.data.reduce((acc, cur) => acc + cur, 0);
                const percentage = parseFloat((value / total) * 100).toFixed(2); // Calculate percentage
                return `${value} (${percentage}%)`; // Show value and percentage
              },
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
        };
      
        setPieChartData({ data: pieChart, options: pieChartOptions });
    }
    function calTotalCurAm(){
        if(!selectExpProf)
            return;
        
        let sum=0; 
        const arr = selectExpProf.expenses;

        for(let i =0; i<arr.length;i++){
            sum+= parseFloat(arr[i].amount.$numberDecimal);
        }

        return sum;
    }

    async function createRecExpProf(){ //create new expense profile
        if(!data.profile_name) return alert("Give Expense Profile Name");
        else if(!data.total_budget) return alert("Give Total budget");
        else if(!data.expenses_period) return alert("Give Expense Period");
        else if(!data.start_date) return alert("Give Start Date");
        else if(!data.description) return alert("Give Description");
            
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses`,{
                method:'POST',
                headers:{
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const finalResult = await result.json();
    
            if(finalResult.created){
                const res = await getExpenesProfile(expPr.length);
                // setShowCreateNewExpDiv(false);
                // setState(res);
                setcreateExpProf(false);
            }else{
                alert('expense profile not created');
            }
        } catch (error) {
            alert('failed to send data to backend');
            console.log(error);
        } finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
        }
    }

    async function getExpenesProfile(idx=0){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses?user_id=${user_id}`,{
                method:'GET'
            })
            const finalResult = await result.json();
    
            if(finalResult.notFound){
                alert('expenses not exists');
                setshowExpProf(false);
                setShowExpList(null);
                // return false;
            }        
            else if(finalResult.failed){
                alert('failed to get expenses profiles but error from here');
                // return false;   
                setshowExpProf(false);
            }else{
                setSelectExpProf(finalResult[idx]);
                setExpPr(finalResult);
                setshowExpProf(true);
                
                if(finalResult[idx].expenses.length>0){
                    setShowExpList(true);
                    setExpData(finalResult[idx].expenses);
                }else{
                    setShowExpList(false);
                }
            }
            // return true;
        } catch (error) {
            alert('failed to get expenses profiles');
            console.log(error);
        } finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
        }
    }

    async function handleDeleteExpProf(exp_prfId){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses`,{
                method: 'DELETE',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({user_id,recurring_expenses_profileId:exp_prfId,length: expPr.length})
            });
            const finalResult = await result.json();
    
            if(finalResult.failed)
            {
                alert("Error From BackEnd");
                return;
            }
            
            if(finalResult.updated){
                getExpenesProfile();
                // setState(res);
                // setShowDelExpProf(false);
            }else{
                alert('failed to delete expense from backend');
            }
        } catch (error) {
            console.log(error);
            alert("Failed to delete expense");
        } finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
        }
    }

    async function addNewExpense(){
        if(!newExpenseData.name) return alert("Give Name of New Expense");
        else if(!newExpenseData.category) return alert("Select category");
        else if(newExpenseData.category !== "Other" && !newExpenseData.subCategory) return alert("Select sub-category");
        else if(!newExpenseData.amount) return alert("Give Amount");
        else if(!newExpenseData.description) return alert("Give Some Description");
        else{
            try {
                setShowLoading(true);
                const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses`,{
                    method: 'PATCH',
                    headers:{
                    'content-type': 'application/json'
                    },
                    body: JSON.stringify({...newExpenseData,user_id,recurring_expenses_profileId:selectExpProf.recurring_expenses_profileId})
                });

                const finalResult = await result.json();

                if(finalResult.failed)
                {
                    alert("Error From BackEnd");
                    return;
                }
                
                if(finalResult.updated){
                    setShowAddExpDialog(false);
                    setShowExpList(true);
                    getExpenes();
                }else{
                    alert('failed to add new expense');
                }
            } catch (error) {
                console.log(error);
                alert('Failed to send new expense to backend');
            } finally{
                setTimeout(()=>{
                    setShowLoading(false);
                },1000);
            }
        }
    }

    async function handleExpDelete(expense_id){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses`,{
                method: 'PUT',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({user_id,recurring_expenses_profileId:selectExpProf.recurring_expenses_profileId,expense_id})
            });
            const finalResult = await result.json();

            if(finalResult.failed)
            {
                alert("Error From BackEnd");
                return;
            }
            
            if(finalResult.updated){
                getExpenes();
            }else{
                alert('failed to delete expense from backend');
            }
        } catch (error) {
            console.log(error);
            alert("Failed to delete expense");
        } finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
        }
    }

    async function getExpenes(){
        if(!selectExpProf){
            return;
        }
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses?user_id=${user_id}&&profile_id=${selectExpProf.recurring_expenses_profileId}`,{
                method:'GET',
                headers:{
                    'content-type':'applications/json'
                }
            });
            const finalResult = await result.json();
            // console.log(finalResult);
            
            if(finalResult.notFound){
                alert('expenses not found');
                setShowExpList(false);
            }else if(finalResult.failed){
                alert('failed to get expenses and error from backend');
                setShowExpList(false);
            }else{
                setExpData(finalResult.expenses);
                setShowExpList(true);
                handleBarPieChart(finalResult.expenses, selectExpProf.total_budget);
            }
        } catch (error) {
            alert('failed to get expenses and error from here');
            console.log(error);
        } finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
        }
    }

    async function handleProfChanges(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/recurringExpenses/profileUpdate`,{
              method:'PATCH',
              headers:{
                'content-type': "application/json"
              },
              body: JSON.stringify({expProf_id: selectExpProf.recurring_expenses_profileId,user_id, ...someProfData})
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
          } finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000);
            }
    }
    function showHideOldProfBar(){
        dispatch(showHideOldExpProfBar(false));
    }
    function fun(){
        if(!selectExpProf) return;
        
        setSomeProfData({
            totalBudget: selectExpProf.total_budget.$numberDecimal,
            description: selectExpProf.description || 'empty',
            startDate: new Date(selectExpProf.start_date).toLocaleDateString(),
            ...(selectExpProf.end_date && {endDate: new Date(selectExpProf.end_date).toLocaleDateString()}),
        })
    }
    useEffect(()=>{
        if(selectExpProf){
            setExpData(selectExpProf.expenses);
            if(selectExpProf.expenses.length>0){
                setShowExpList(true);
            }else{
                setShowExpList(false);
            }
            fun();
        }
    },[selectExpProf])

    useEffect(()=>{
        getExpenesProfile();
    },[])

    useEffect(()=>{
        if(showAnalysis && expData){
            handleBarPieChart(expData, selectExpProf.total_budget);
        }
    }, [showAnalysis])
    

    return (
        <div id='main_recExpDiv'>
            {/* Below part to create new recurring expense profiles */}
            {/* recExpProfDiv */}
            {createExpProf && <div id='createNewExpDiv_TME'> 
                <div onClick={()=>setcreateExpProf(false)} id='closeBtnDiv'>
                    <img src="./cross.png" alt="error" />    
                </div>
                <div style={{width:'200px', margin:'auto'}}>
                    <img src="./addProfile.png" alt="error" style={{width:'100%'}} />
                </div>
                <div style={{width:'100%', display:'flex', alignItems:'center'}}>
                    <span style={{marginRight:'5px'}}>Name: </span>
                    <input type="text" style={{width:'100%'}} placeholder='Profile Name(such as "Monthly Bills" or "Subscription Services")' 
                    onChange={(e)=>setData((prev)=>({...prev, profile_name:e.target.value}))}
                    />
                </div>
                <div>
                    <span style={{marginRight:'5px'}}>Total Budget: </span>
                    <input type="number" placeholder='Total Budget' onChange={(e)=>setData((prev)=>({...prev, total_budget: e.target.value}))} />
                </div>
                <div style={{display:'grid', gap:'10px', fontWeight:'bold'}}>
                    <h3>Track for which option?</h3>
                    <label htmlFor="expPeriod_Monthly">
                        <input 
                        type="radio" 
                        id="expPeriod_Monthly" 
                        name="expenses_period" 
                        value="Monthly" 
                        onClick={() => setData((prev) => ({ ...prev, expenses_period: "Monthly"}))} 
                        style={{marginRight:'10px'}}
                        />
                        Monthly
                    </label>
                    <label htmlFor="expPeriod_Yearly">
                        <input 
                        type="radio" 
                        id="expPeriod_Yearly" 
                        name="expenses_period" 
                        value="Yearly" 
                        onClick={() => setData((prev) => ({ ...prev, expenses_period: "Yearly"}))} 
                        style={{marginRight:'10px'}}
                        />
                        Yearly
                    </label>
                </div>

                <div>
                    <span style={{marginRight:'10px'}}>Start Date:</span>
                    <input type="date" onChange={(e)=>setData((prev)=>({...prev, start_date:e.target.value}))} />
                </div>
                <div>
                    <span style={{marginRight:'10px'}}>End Date(Optional):</span>
                    <input type="date" onChange={(e)=>setData((prev)=>({...prev, end_date:e.target.value}))} />
                </div>
                {/* <div id='remainderREC'>
                    <label htmlFor="remainder_RE">
                        Remainder
                    </label>
                    <input type="checkbox" defaultChecked={true} id="remainder_RE" onChange={(e)=> setData((prev)=>({...prev,remainder:e.target.checked}))} />
                </div> */}
                <div id='descriptionDiv_TE'>
                    <span>Description: </span>
                    <textarea name="" id="" placeholder='Description' onChange={(e)=>setData((prev)=>({...prev, description:e.target.value}))}></textarea>
                </div>
                <div style={{margin:'auto'}}>
                    <button onClick={createRecExpProf} style={{cursor:'pointer'}}>Submit</button>
                </div>
            </div>}

            {/* old recurring expenses profile */}
            {showExpProf && expPr.length>0 &&
            <div id='main_oldExpenses' className={showHideProfBar?'showOldExpProfBar':''}> 
                <div id='oldExpenseBody'>
                    <div id='all_expenese_profile'>
                        <div style={{margin:'1rem'}} id='allExpenseProfHeading'>
                                <h2>All Expense Profiles: -</h2>
                        </div>
                        {expPr.map((elem,index)=>(
                            <div 
                            id='each_expense_profile' 
                                onClick={()=>setSelectExpProf(elem)} key={index} 
                                style={{
                                    backgroundColor: selectExpProf.recurring_expenses_profileId == elem.recurring_expenses_profileId?"#AFEFEF":"rgba(0, 0, 0, 0.8)",
                                    color: selectExpProf.recurring_expenses_profileId == elem.recurring_expenses_profileId?"black":"white",
                                    boxShadow: selectExpProf.recurring_expenses_profileId == elem.recurring_expenses_profileId?"-1px 1px 4px 1px #000000a1":""
                                }} 
                                >
                                <h3 id='eachProfHeading'>Profile Name: {elem.profile_name}</h3>
                                <div id='eachProfDetails'>
                                    <p> <strong>Total budget:</strong> {elem.total_budget.$numberDecimal}</p>
                                    <p> <strong>Expense Period:</strong> {elem.expenses_period}</p>
                                    <p><strong>Start date:</strong> {new Date(elem.start_date).toLocaleDateString()}</p>
                                    { elem.end_date && <p><strong>End date:</strong> {new Date(elem.end_date).toLocaleDateString()}</p>}
                                    <p><strong>Description:</strong> {elem.description||'empty'}</p>
                                </div>
                                <div id="deleteExpProfDiv">
                                    <button 
                                        style={{
                                            color: selectExpProf.recurring_expenses_profileId == elem.recurring_expenses_profileId?"white":"black",
                                            backgroundColor: selectExpProf.recurring_expenses_profileId == elem.recurring_expenses_profileId?"rgba(0, 0, 0, 0.8)":'white',
                                        }}
                                        onClick={()=>setShowConfirmBox({bool:true,data:{name:'expenseProfile',value:elem.recurring_expenses_profileId}})}
                                    >Delete</button>
                                </div>
                            </div>
                            ))
                        }
                    </div>
                    <div id='new_expense_profile_div'>
                        <button onClick={()=>setcreateExpProf(true)}>Create New Expense Profile</button>
                    </div>
                </div>
                <div id='leftToRightBtn' onClick={showHideOldProfBar}>
                    <img src="leftArrow.png" alt="error" />
                </div>
            </div>
            }

            {/* image for empty recurring expenses profiles */}
            {showExpProf!== null && showExpProf === false &&<div>
                <BodyNavbar/>
                <div id='emptyExpenseProfile'>
                    <img src="./empty.jpg" alt="error" />
                </div>
                <div id='new_expense_profile_div' style={{margin:'auto'}}>
                    <button onClick={()=>setcreateExpProf(true)}>Create New Expense Profile</button>
                </div>
            </div>}

            {/* Below show on display when expense list of expense profile is empty */}
            { showExpList!== null && !showExpList && 
                <div>
                    <BodyNavbar/>
                    <div id='emptyExpenseListMain'>
                        <div id='emptyExpenseList'>
                            <img src="./emptyExpenses.jpg" alt="error" />
                        </div>
                        <div id='addExpense'>
                            <button onClick={()=>setShowAddExpDialog(true)}>Add Expense</button>
                        </div>
                    </div>
                </div>
            }

            {/* show expenses list of selected recurring expense profile */}
            {showExpList &&
            <div id='main_expenses' style={{flex:'1'}}>
                <BodyNavbar/>
                {/* Below show list of expenses of an expense profile */}
                <div style={{marginTop:'20px'}}>
                    {/* <div id='expenseProfileDetail_TE'>
                        <h2>Profile Name: {selectExpProf.profile_name}</h2>
                        <div>
                            <p><strong>Expense Period:</strong> {selectExpProf.expenses_period}</p>
                            <p><strong>Total Budget:</strong> {selectExpProf.total_budget.$numberDecimal}</p>
                            <p><strong>Current Total Amount:</strong>  ₹{calTotalCurAm()}</p>
                            <p><strong>Description:</strong> {selectExpProf.description}</p>
                        </div>
                    </div> */}
                    { someProfData && <div id='expenseProfileDetail_TE' style={{marginTop:'unset', position:'relative'}}>
                        <div id="editProfile_TE" style={{width:'7%'}} onClick={()=>setEditProf(!editProf)}>
                        <img src="edit.png" alt="error" />
                        </div>
                        <h2>Profile Name: {selectExpProf.profile_name}</h2>
                        <div id="profDivInputs_TE">
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                            <div style={{display:'grid', gap:'20px', whiteSpace:'nowrap'}}>
                                <p><strong>Toal Budget:</strong></p>
                                <p><strong>Current Amount:</strong></p>
                                <p><strong>Start Date:</strong> </p>
                                {selectExpProf && selectExpProf.end_date && <p><strong>End Date:</strong> </p>}
                            </div>
                            <div style={{display:'grid', gap:'20px'}}>
                                <input type="text" onChange={(e)=>setSomeProfData((prev)=>({...prev, totalBudget:e.target.value}))}  value={0||someProfData.totalBudget} disabled={!editProf?true:false} />
                                <p>₹{calTotalCurAm().toFixed(2)}</p>
                                <input type="text" value={someProfData.startDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, startDate:e.target.value}))} disabled={!editProf?true:false} />
                                {selectExpProf && selectExpProf.end_date && <input type="text" value={someProfData.endDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, targetDate:e.target.value}))} disabled={!editProf?true:false} />}
                            </div>
                        </div>
                        <div>
                            <p><strong>Description:</strong></p>
                            <textarea name="" id="profDescription_T" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false}/>
                        </div>
                            {/* <div style={{flexDirection: 'row'}}>
                                <p><strong>Total Budget:</strong></p>
                                <input type="text" onChange={(e)=>setSomeProfData((prev)=>({...prev, totalBudget:e.target.value}))} value={0||someProfData.totalBudget} disabled={!editProf?true:false} />
                            </div>
                            <div style={{flexDirection: 'row', justifyContent:'unset'}}>
                                <p><strong>Current Amount:</strong></p>
                                <p style={{marginLeft:'20px'}}>₹{calTotalCurAm().toFixed(2)}</p>
                            </div>
                            <div style={{flexDirection: 'row'}}>
                                <p><strong>Description:</strong></p>
                                <input type="text" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false} />
                            </div>
                            <div style={{flexDirection: 'row'}}>
                                <p><strong>Start Date:</strong> </p>
                                <input type="text" value={someProfData.startDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, startDate:e.target.value}))} disabled={!editProf?true:false} />
                            </div> */}
                            {/* { selectExpProf && selectExpProf.end_date && <div style={{flexDirection: 'row'}}>
                                <p><strong>End Date:</strong> </p>
                                <input type="text" value={someProfData.endDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, endDate:e.target.value}))} disabled={!editProf?true:false} />
                            </div>} */}

                            { editProf && 
                            <div>
                                <button id="profChangesBtn_TE" onClick={handleProfChanges}>Save Changes</button>
                            </div>}
                        </div>
                    </div>
                    }
                    <div className="expenses-container">
                            {expData.map((expense, expenseIndex) => (
                                <div className="expense-card" id='expCard_GE'  key={expenseIndex}>
                                    <div>
                                        <div style={{display:'flex', gap:'15px'}} >
                                            <div
                                                className="expense-header"
                                                onClick={() => toggleExpense(expenseIndex)}
                                            >
                                                <h3>{expense.name}</h3>
                                                <span>{expandedExpense === expenseIndex ? "-" : "+"}</span>
                                            </div>
                                            <div style={{display:'flex', gap:'20px', alignItems:'center', marginRight:'20px', cursor:'pointer'}} onClick={()=>setShowConfirmBox({bool:true, data: {name:'expense',value:expense.expense_id}})}>
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
                                                        <td>Category:</td>
                                                        <td>{expense.category}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Sub Category:</td>
                                                        <td>{expense.subCategory}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Description:</td>
                                                        <td>{expense.exp_description}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Date:</td>
                                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Amount:</td>
                                                        <td>₹{expense.amount.$numberDecimal}</td>
                                                    </tr>
                                                </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}

                            <div id='addExpense'>
                                <button onClick={()=>(setShowAddExpDialog(true), parseFloat(selectExpProf.total_budget.$numberDecimal)<calTotalCurAm()?alert('You already exceed total budget'): '')}>Add Expense</button>
                                <button style={{backgroundColor:"rgb(173 6 36)",marginLeft:'20px',cursor:'pointer'}} onClick={()=>{setShowAnalysis(!showAnalysis)}}>Analysis</button>
                            </div>
                    </div>
                </div>
                 
                {/* Below code is used to show analysed data */}
                {showAnalysis && <div id='mainAnalysis_TME'>
                    {/* Show Details of Analysis */}
                    <div style={{padding: "10px", borderRadius: "10px" }}>
                        <h1>Expense Analysis</h1>
                        <div style={{ border: "0px 0px 3px 2px lightgrey", padding: "10px", borderRadius: "10px" }}>
                        <h2 style={{marginBottom:'10px'}}>Category Breakdown</h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                            {categoryAna.map((category, idx) => (
                            <div
                                key={idx}
                                style={{padding: "10px", borderRadius: "10px", backgroundColor:'rgba(0, 0, 0, 0.8)',  color:'white' }}
                            >
                                <p>Category: {category.name}</p>
                                <p>Total: ₹{category.amount}</p>
                            </div>
                            ))}
                        </div>

                        <h3 style={{margin:'15px 0px'}}>Subcategory Breakdown</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                            {subCategoryAna.map((subcategory, idx) => (
                            <div
                                key={idx}
                                style={{ border: "2px solid", padding: "10px", borderRadius: "10px" }}
                            >
                                <p>Subcategory: {subcategory.name}</p>
                                <p>Total: ₹{subcategory.amount}</p>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                    {/* Show Details of Analysis in the form of Bar chart and Pie chart */}
                    <div id='mainVisualCharts'>
                        {barChartData && <div id='barchartData'>
                        <Bar 
                            data={barChartData} 
                            options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Expenses by Category" } } }} 
                        />
                        </div>}
                        {subBarChartData && <div id='subBarchartData'>
                        <Bar 
                            data={subBarChartData} 
                            options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Expenses by Subcategory" } } }} 
                        />
                        </div>}
                        {pieChartData && (
                        <div id='pieChartData'>
                            <Pie 
                            data={pieChartData.data} 
                            options={pieChartData.options} 
                            plugins={[ChartDataLabels]} 
                            />
                        </div>
                        )}
                    </div>
                </div>}
                {/* Below code is used to add new expenses */}
            </div>
            }
            {showAddExpDialog && <div id='main_addExpense' className='addExpenseRec'>
                <div id='closeBtnDiv'>
                    <img src="./cross.png" alt="error" onClick={()=>setShowAddExpDialog(false)} />
                </div>
                <div style={{width: "60%", margin: 'auto'}}>
                    <img style={{width: '100%'}} src="./addExpense.jpg" alt="error" />
                </div>
                <div>
                    <div>
                        <span>Name: </span>
                        <input type="text" placeholder='Name' onChange={(e)=>setNewExpenseData((prev)=>({...prev, name:e.target.value}))} />
                    </div>
                    <div>
                        <div>
                            <label>
                            <strong style={{fontSize:'large', marginRight:'10px', marginBottom:'10px'}}>Select Category:</strong>
                                <select
                                    value={newExpenseData.category}
                                    onChange={(e)=>setNewExpenseData((prev)=>({...prev, category:e.target.value}))}
                                >
                                    <option value="">--Select Category--</option>
                                    {categories.map((category, index) => (
                                    <option key={index} value={category.name}>
                                        {category.name}
                                    </option>
                                    ))}
                                    <option onChange={()=>setNewExpenseData((prev)=>({...prev, category:"Other"}))} >Other</option>
                                </select>
                            </label>
                        </div>

                        {newExpenseData.category && newExpenseData.category !== "Other" && (
                        <div>
                            <label>
                                <strong style={{fontSize:'large', marginRight:'10px'}}>Select Subcategory:</strong>
                                <select
                                value={newExpenseData.subCategory}
                                onChange={(e)=>setNewExpenseData((prev)=>({...prev, subCategory:e.target.value}))}
                                >
                                <option value="">--Select Subcategory--</option>
                                {
                                    categories
                                    .find((cat) => cat.name === newExpenseData.category)
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
                    
                    <div style={{display:'flex', alignItems:'center', gap:'0px', margin:'unset'}}>
                        <span>Date: </span>
                        <input type="date" onChange={(e)=>setNewExpenseData((prev)=>({...prev, date:e.target.value}))}/>
                    </div>
                    
                    <div>
                        <span>Amount: </span>
                        <input type="number" placeholder='Amount'
                            onChange={(e) => {
                                const value = Number(e.target.value); // Convert input to integer
                                setNewExpenseData((prev) => ({ ...prev, amount: parseFloat(value) }));
                            }}
                        />
                    </div>
                    <div id='descriptionDiv_TE'>
                        <span>Description:</span>
                        <textarea placeholder='Description' onChange={(e)=>setNewExpenseData((prev)=>({...prev, description:e.target.value}))} ></textarea>
                    </div>
                </div>
                <div id='addExpense' style={{margin:'auto'}}>
                    <button onClick={addNewExpense}>Add Expense</button>
                </div>
            </div>}
            
            {/* Belew code use to ask again user that 'are you sure' to delete expense or expense profile */}
            {showConfirmBox.bool && <div id='delExpProfDiv_TME'>
                <div>
                    <h3 style={{textAlign: 'center'}}>Are you sure?</h3>
                </div>
                <div id='delExpProfDiv_TME_BTNDIV'>
                    <button onClick={()=>
                        {
                            if(showConfirmBox.data.name === "expenseProfile"){
                                handleDeleteExpProf(showConfirmBox.data.value);
                                setShowConfirmBox({bool:false, data:{name:'',value:''}});
                            }else if(showConfirmBox.data.name === "expense"){
                                handleExpDelete(showConfirmBox.data.value);
                                setShowConfirmBox({bool:false, data:{name:'',value:''}});
                            }
                        }
                    }>Yes</button>
                    <button onClick={()=> setShowConfirmBox({bool:false, data:{name:'',value:''}})}>No</button>
                </div>
            </div>}
            {showLoading? <Loader/> :null}
        </div>
    )
}
