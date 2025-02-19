import React,{useEffect, useState} from 'react'
import BodyNavbar from '../Homepage/Body/bodyNavbar';
import Loader from '../Loader/loader';
import { showHideOldExpProfBar } from '../../services/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import './trackMyExpenses.css';

import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';


// Registering necessary components with Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default function TrackMyExpenses() {
  const user_id = localStorage.getItem('Spending_Smart_User_id');
  const [someProfData,setSomeProfData] = useState();
  const [editProf, setEditProf] = useState(false);
  
    const [data,setData] = useState({
    user_id: user_id,
    expenses_profile_name:'',
    total_budget:'',
    expenses_period: '',
    start_date:'',
    end_date:'',
    description:'',
    });
  const [exp_pr,setExpPr] = useState([]);
  const [state, setState] = useState(null);
  const [showCreateNewExpDiv, setShowCreateNewExpDiv] = useState(false);
  const [selectExpProf, setSelectExpProf ] = useState(); //Select Expense Profile
  const [showAddExpDialog,setShowAddExpDialog] = useState(false); //toggle dialog box of creating new expense
  const [showConfirmBox, setShowConfirmBox] = useState({
    bool: false,
    data: {name:'', value:''}
  });

  const [newExpenseData, setNewExpenseData] = useState({
    name:'',
    date: new Date(),
    // quantity:0,
    amount: 0,
    description: ''
  });
  const [expandedExpense, setExpandedExpense] = useState(null);
  const toggleExpense = (index) => {
    setExpandedExpense(expandedExpense === index ? null : index);
    };
  const [selectedCategory, setSelectedCategory] = useState({ category: "", subcategory: "" });
  const [showLoading, setShowLoading] = useState(false);

  const categories = [
    {
      name: "Housing",
      subcategories: ["Rent/Mortgage", "Utilities", "Maintenance and Repairs"],
    },
    {
      name: "Food and Dining",
      subcategories: ["Groceries", "Restaurants/Dining Out", "Coffee and Snacks"],
    },
    {
      name: "Transportation",
      subcategories: ["Fuel", "Public Transport", "Vehicle Maintenance", "Ride-Sharing Services"],
    },
    {
      name: "Health and Fitness",
      subcategories: ["Medical Bills", "Health Insurance", "Gym Membership", "Medicines and Supplements"],
    },
    {
      name: "Entertainment",
      subcategories: ["Movies", "Subscriptions", "Games and Apps", "Events and Concerts"],
    },
    {
      name: "Shopping",
      subcategories: ["Clothing and Accessories", "Electronics", "Home Decor", "Gifts"],
    },
    {
      name: "Personal Care",
      subcategories: ["Haircuts and Salons", "Skincare", "Personal Hygiene"],
    },
    {
      name: "Education",
      subcategories: ["Tuition Fees", "Books and Supplies", "Online Courses"],
    },
    {
      name: "Travel",
      subcategories: ["Flights", "Accommodation", "Local Transport", "Activities and Tours"],
    },
    {
      name: "Bills and Subscriptions",
      subcategories: ["Mobile and Internet", "Streaming Services", "Cloud Storage"],
    },
    {
      name: "Savings and Investments",
      subcategories: ["Emergency Fund", "Mutual Funds", "Stock Investments"],
    },
    {
      name: "Miscellaneous",
      subcategories: ["Charity/Donations", "Pet Care", "Unexpected Expenses"],
    },
  ];

  const [barChartData, setBarChartData] = useState();
  const [subBarChartData, setSubBarChartData] = useState();
  const [pieChartData, setPieChartData] = useState();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [categoryAna, setCategoryAna] = useState([]);
  const [subCategoryAna, setSubCategoryAna] = useState([]);
  const dispatch = useDispatch();
  const {showHideProfBar} = useSelector((state)=>state.user);
   
function handleBarPieChart(data, budget) {
    if (selectExpProf.expenses.length === 0) return;

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

  async function addNewExpense(){
    if(!newExpenseData.name) return alert("Give Name of New Expense");
    else if(!selectedCategory.category) return alert("Select category");
    else if(selectedCategory.category !== "Other" && !selectedCategory.subcategory) return alert("Select sub-category");
    // else if(!newExpenseData.quantity) return alert("Give Quantity");
    else if(!newExpenseData.amount) return alert("Give Amount");
    else if(!newExpenseData.description) return alert("Give Some Description");
    else{
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/trackMyExpenses`,{
               method: 'PATCH',
               headers:{
                'content-type': 'application/json'
               },
               body: JSON.stringify({...newExpenseData,selectedCategory,user_id,expenses_profileId:selectExpProf.expenses_profileId})
            });

            const finalResult = await result.json();

            if(finalResult.failed)
            {
                alert("Error From BackEnd");
                return;
            }
            
            if(finalResult.updated){
                const res = await getExpenesProfile();
                setState(res);
                setShowAddExpDialog(false);
            }else{
                alert('failed to add new expense');
            }
        } catch (error) {
            console.log(error);
            alert('Failed to send new expense to backend');
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000)
        }
    }
  }

  async function handleExpDelete(expense_id){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/trackMyExpenses`,{
            method: 'PUT',
            headers:{
                'content-type': 'application/json'
            },
            body: JSON.stringify({user_id,expenses_profileId:selectExpProf.expenses_profileId,expense_id})
        });
        const finalResult = await result.json();

        if(finalResult.failed)
        {
            alert("Error From BackEnd");
            return;
        }
        
        if(finalResult.updated){
            const res = await getExpenesProfile();
            setState(res);
            setShowConfirmBox({bool:false, data:{}});
        }else{
            alert('failed to delete expense from backend');
        }
    } catch (error) {
        console.log(error);
        alert("Failed to delete expense");
    }finally{
        setTimeout(()=>{
            setShowLoading(false);
        },1000)
    }
  }

  async function handleDeleteExpProf(exp_prfId){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/trackMyExpenses`,{
            method: 'DELETE',
            headers:{
                'content-type': 'application/json'
            },
            body: JSON.stringify({user_id,expenses_profileId:exp_prfId,length: exp_pr.length})
        });
        const finalResult = await result.json();

        if(finalResult.failed)
        {
            alert("Error From BackEnd");
            return;
        }
        
        if(finalResult.updated){
            const res = await getExpenesProfile();
            setState(res);
            // setShowConfirmBox(false);
            setShowConfirmBox({bool:false, data:{}});
        }else{
            alert('failed to delete expense from backend');
        }
    } catch (error) {
        console.log(error);
        alert("Failed to delete expense");
    }finally{
        setTimeout(()=>{
            setShowLoading(false);
        },1000)
    }
  }

  async function createExpProf(){ //create new expense profile
    if(!data.expenses_profile_name) return alert("Give Expense Profile Name");
    else if(!data.total_budget) return alert("Give Total budget");
    else if(!data.expenses_period) return alert("Give Expense Period");
    else if(!data.start_date) return alert("Give Start Date");
    else if(!data.description) return alert("Give Description");
        
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/trackMyExpenses`,{
            method:'POST',
            headers:{
                'content-type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const finalResult = await result.json();

        if(finalResult.created){
            const res = await getExpenesProfile(exp_pr.length);
            setShowCreateNewExpDiv(false);
            setState(res);
        }else{
            alert('not submitted');
        }
    } catch (error) {
        alert('failed to send data to backend');
        console.log(error);
    }finally{
        setTimeout(()=>{
            setShowLoading(false);
        },1000)
    }
  }
  async function getExpenesProfile(idx=0){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/trackMyExpenses?user_id=${user_id}`,{
            method:'GET'
        })
        const finalResult = await result.json();

        if(finalResult.notFound){
            alert('expenses not exists');
            return false;
        }        
        else if(finalResult.failed){
            alert('failed to get expenses profiles but error from here');
            return false;   
        }

        setSelectExpProf(finalResult[idx]);
        setExpPr(finalResult);
        if(showAnalysis){
            handleBarPieChart(finalResult[idx].expenses,finalResult[idx].total_budget);
        }
        return true;
    } catch (error) {
        alert('failed to get expenses profiles');
        console.log(error);
    }finally{
        setTimeout(()=>{
            setShowLoading(false);
        },1000)
    }
  }
    async function handleProfChanges(){
        try {
            setShowLoading(true);
            const user_id = localStorage.getItem('Spending_Smart_User_id');
            const result = await fetch(`${import.meta.env.VITE_API_URL}/trackMyExpenses/profileUpdate`,{
              method:'PATCH',
              headers:{
                'content-type': "application/json"
              },
              body: JSON.stringify({expProf_id: selectExpProf.expenses_profileId,user_id, ...someProfData})
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
            },1000)
        }
    }
   
    function showHideOldProfBar(){
        dispatch(showHideOldExpProfBar(false));
    }
  
  function fun(){
    if(!selectExpProf) return;
    // console.log(selectExpProf);
    setSomeProfData({
        totalBudget: selectExpProf.total_budget.$numberDecimal,
        description: selectExpProf.description || 'empty',
        startDate: new Date(selectExpProf.start_date).toLocaleDateString(),
        ...(selectExpProf.end_date && {endDate: new Date(selectExpProf.end_date).toLocaleDateString()}),
    })
   }
  useEffect(()=>{
   getExpenesProfile()
   .then((res)=>{  
        setState(res);
   });
  },[])

  useEffect(()=>{
    if(!selectExpProf) return;
    fun()
  },[selectExpProf])
  useEffect(()=>{
    if(showAnalysis){
        handleBarPieChart(selectExpProf.expenses,selectExpProf.total_budget);
    }
  }, [showAnalysis])
  
    return (
    <div id='main_trackMyExpenses' style={{gridTemplateColumns: state?"1fr 4fr": "1fr"}}>

        {/* dialog box */}
        {/* div to create new expense profile*/}
        {showCreateNewExpDiv && <div id='createNewExpDiv_TME'>
                <div onClick={()=>setShowCreateNewExpDiv(!showCreateNewExpDiv)} id='closeBtnDiv'
                //   style={{position: 'absolute', right: "-45px", top: "-45px", cursor:"pointer"}}
                  >
                    <img src="./cross.png" alt="error" width={"40px"} />
                </div>
                <div style={{width:'200px', margin:'auto'}}>
                    <img src="./addProfile.png" alt="error" style={{width:'100%'}} />
                </div>
                <div>
                    <span style={{marginRight:'5px'}}>Name: </span>
                    <input type="text" placeholder='Expenses Profile Name' onChange={(e)=>setData({...data,expenses_profile_name: e.target.value})} />
                </div>
                <div>
                    <span style={{marginRight:'5px'}}>Total Budget: </span>
                    <input type='number' placeholder='Total Budget' onChange={(e)=>setData({...data,total_budget: e.target.value})} />
                </div>
                <div style={{display:'grid', gap:'10px', fontWeight:'bold'}}>
                    <h3>Track for which option?</h3>
                    <label htmlFor="daily_input_id"
                    onClick={()=>setData({...data,expenses_period:'Daily'})}
                    >
                    <input 
                        type="radio" 
                        name='Track_on'
                        id='daily_input_id'
                        className='trackFor'
                    />
                    Daily
                    </label>

                    <label htmlFor="monthly_input_id" onClick={()=>setData({...data,expenses_period:'Monthly'})}>
                    <input 
                        type="radio" 
                        name='Track_on'
                        className='trackFor'
                        id = 'monthly_input_id'
                    />
                        Monthly
                    </label>

                    <label htmlFor="yearly_input_id"  onClick={()=>setData({...data,expenses_period:'Yearly'})}>
                    <input 
                        type="radio"
                        name='Track_on' 
                        value='Yearly'
                        className='trackFor'
                        id= 'yearly_input_id'
                    />
                    Yearly
                    </label>
                </div>
                <div style={{display:'grid', gap:'10px'}}>
                    <label htmlFor="">
                        <span>Start Date: </span>
                        <input type="date" onChange={(e)=>setData({...data, start_date:e.target.value})} />
                    </label>
                    <label htmlFor="">
                        <span>End Date(Optional): </span>
                        <input type="date" onChange={(e)=>setData({...data, end_date:e.target.value})} />
                    </label>
                </div>
                <div
                    id='descriptionDiv_TE'
                >
                    <span>Description: </span>
                    <textarea placeholder='Description' onChange={(e)=>setData({...data, description:e.target.value})}></textarea>
                </div>

                <div style={{alignSelf:'center'}}>
                    <button onClick={createExpProf}>Submit</button>
                </div>

            </div> }
            {/* Above is the part of creation */}

            {/* Below part show old created expenses profiles */}

            {state && 
            exp_pr.length > 0 && <div id='main_oldExpenses' className={showHideProfBar?'showOldExpProfBar':''}>
                <div id='oldExpenseBody'>
                    <div id='all_expenese_profile'>
                        <div style={{margin:'1rem'}} id='allExpenseProfHeading'>
                            <h2>All Expense Profiles: -</h2>
                        </div>
                        {exp_pr.map((elm,index)=>(
                            <div 
                                key={index} 
                                id='each_expense_profile' 
                                style={{
                                    backgroundColor: selectExpProf.expenses_profileId == elm.expenses_profileId?"#AFEFEF":"rgba(0, 0, 0, 0.8)",
                                    color: selectExpProf.expenses_profileId == elm.expenses_profileId?"black":"white",
                                    boxShadow: selectExpProf.expenses_profileId == elm.expenses_profileId?"-1px 1px 4px 1px #000000a1":""
                                }} 
                                onClick={()=>{setSelectExpProf(elm), setShowAnalysis(false)}}
                            >
                                <h3 id='eachProfHeading'>Profile Name: {elm.profile_name}</h3>
                                <div id='eachProfDetails'>
                                    <p> <strong>Total budget:</strong> {elm.total_budget.$numberDecimal}</p>
                                    <p> <strong>Expense Period:</strong> {elm.expenses_period}</p>
                                    <p><strong>Start date:</strong> {new Date(elm.start_date).toLocaleDateString()}</p>
                                    { elm.end_date && <p><strong>End date:</strong> {new Date(elm.end_date).toLocaleDateString()}</p>}
                                    <p><strong>Description:</strong> {elm.description||'empty'}</p>
                                </div>
                                <div id="deleteExpProfDiv">
                                    <button 
                                        style={{
                                            color: selectExpProf.expenses_profileId == elm.expenses_profileId?"white":"black",
                                            backgroundColor: selectExpProf.expenses_profileId == elm.expenses_profileId?"rgba(0, 0, 0, 0.8)":'white',
                                        }}
                                        onClick={()=>setShowConfirmBox({bool:true, data: {name:'expenseProfile',value:elm.expenses_profileId}})}
                                    >Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div id='new_expense_profile_div'>
                        <button onClick={()=>setShowCreateNewExpDiv(true)}>Create New Expense Profile</button>
                    </div>
                </div>
                <div id='leftToRightBtn' onClick={showHideOldProfBar}>
                    <img src="leftArrow.png" alt="error"  />
                </div>
            </div>}
            
            {/* Below show on display when expense profile empty */}
            {state !== null && state === false && <div>
                <BodyNavbar/>
                <div id='emptyExpenseProfile'>
                    <img src="./empty.jpg" alt="error" />
                </div>

                <div id='new_expense_profile_div' style={{margin:'auto'}} onClick={()=>setShowCreateNewExpDiv(true)}>
                    <button>Create New Expense Profile</button>
                </div>
            </div>}

            {/* Below part show list of expenses of selected expense profile*/}
            {state && <div id='main_expenses'>
                <BodyNavbar/>
                {/* Below show on display when expense list of expense profile is empty */}
                { state && (!selectExpProf || selectExpProf.expenses.length==0) &&
                    <div id='emptyExpenseListMain'>
                        <div id='emptyExpenseList'>
                            <img src="./emptyExpenses.jpg" alt="error"/>
                        </div>
                        <div id='addExpense'>
                            <button onClick={()=>setShowAddExpDialog(true)}>Add Expense</button>
                        </div>
                    </div>
                }

                {/* Below code show expense list */}
                { state && selectExpProf && selectExpProf.expenses.length>0 &&
                <div style={{marginTop:'20px'}}>
                    {/* <div id='expenseProfileDetail_TE'>
                        <h2>Profile Name: {selectExpProf.profile_name}</h2>
                        <div>
                            <p><strong>Expense Period:</strong> {selectExpProf.expenses_period}</p>
                            <p><strong>Total Budget:</strong> {selectExpProf.total_budget.$numberDecimal}</p>
                            <p><strong>Current Total Amount:</strong> ₹{calTotalCurAm()}</p>
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
                                {selectExpProf && selectExpProf.end_date &&<p><strong>End Date:</strong> </p>}
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
                                <span style={{marginLeft:'20px'}}>₹{calTotalCurAm().toFixed(2)}</span>
                            </div>
                            <div style={{flexDirection: 'row'}}>
                                <p><strong>Description:</strong></p>
                                <input type="text" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false} />
                            </div>
                            <div style={{flexDirection: 'row'}}>
                                <p><strong>Start Date:</strong> </p>
                                <input type="text" value={someProfData.startDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, startDate:e.target.value}))} disabled={!editProf?true:false} />
                            </div>
                            { selectExpProf && selectExpProf.end_date && <div style={{flexDirection: 'row'}}>
                                <p><strong>End Date:</strong> </p>
                                <input type="text" value={someProfData.endDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, endDate:e.target.value}))} disabled={!editProf?true:false} />
                            </div>}
 */}
                            { editProf && 
                            <div>
                                <button id="profChangesBtn_TE" onClick={handleProfChanges}>Save Changes</button>
                            </div>}
                        </div>
                    </div>}
                    <div className="expenses-container">
                            {selectExpProf.expenses.map((expense, expenseIndex) => (
                                <div className="expense-card" id='expCard_GE'  key={expense.expense_id}>
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
                                <button onClick={()=>(setShowAddExpDialog(true), parseFloat(selectExpProf.total_budget.$numberDecimal) <calTotalCurAm()?alert('You already exceed total budget'): '')}>Add Expense</button>
                                <button style={{backgroundColor:"rgb(173 6 36)",marginLeft:'20px',cursor:'pointer'}} onClick={()=>{setShowAnalysis(!showAnalysis)}}>Analysis</button>
                            </div>
                    </div>
                </div>
                }
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
                {showAddExpDialog && <div id='main_addExpense'>
                    <div id='closeBtnDiv'>
                        <img src="./cross.png" alt="error" onClick={()=>setShowAddExpDialog(false)} />
                    </div>
                    <div id='addExpenseImgDiv'>
                        <img style={{width: '100%'}} src="./addExpense.jpg" alt="error" />
                    </div>
                    <div>
                        <div>
                            <span>Name: </span>
                            <input type="text" placeholder='Expense Name' onChange={(e)=>setNewExpenseData((prev)=>({...prev, name:e.target.value}))} />
                        </div>
                        <div style={{display:'grid', gap:'15px'}}>
                            <div>
                                <label>
                                    <span>Select Category:</span>
                                    <select
                                        value={selectedCategory.category}
                                        onChange={(e) => {
                                        setSelectedCategory({ category: e.target.value, subcategory: "" });
                                        }}
                                    >
                                        <option value="">--Select Category--</option>
                                        {categories.map((category, index) => (
                                        <option key={index} value={category.name}>
                                            {category.name}
                                        </option>
                                        ))}
                                        <option onChange={()=>(setSelectedCategory({category: "Other", subcategory: ""}))} >Other</option>
                                    </select>
                                </label>
                            </div>

                            {selectedCategory.category && selectedCategory.category !== "Other" && (
                            <div>
                                <label>
                                    <span>Select Subcategory:</span>
                                    <select
                                    value={selectedCategory.subcategory}
                                    onChange={(e) =>
                                        setSelectedCategory({
                                        ...selectedCategory,
                                        subcategory: e.target.value,
                                        })
                                    }
                                    >
                                    <option value="">--Select Subcategory--</option>
                                    {
                                        categories
                                        .find((cat) => cat.name === selectedCategory.category)
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
                        <div style={{display:'flex', alignItems:'center', margin:'unset', gap:'0px'}}>
                            <span>Date:</span>
                            <input type="date"
                                onChange={(e)=>setNewExpenseData((prev)=>({...prev, date: e.target.value}))}
                                />
                        </div>

                        {/* <div>
                            <span>Quantity: </span>
                            <input type="number" placeholder='Enter Quantity'
                                onChange={(e) => {
                                    const value = Math.floor(Number(e.target.value)); // Convert input to integer
                                    setNewExpenseData((prev) => ({ ...prev, quantity: value }));
                                }}
                                />
                        </div> */}

                        <div>
                            <span>Amount: </span>
                            <input type="number" placeholder='Enter Amount'
                                onChange={(e) => {
                                    const value = Number(e.target.value); // Convert input to integer
                                    setNewExpenseData((prev) => ({ ...prev, amount: parseFloat(value) }));
                                }}
                            />
                        </div>
                        <div id='descriptionDiv_TE'>
                            <span>Description: </span>
                            <textarea placeholder='Description' onChange={(e)=>setNewExpenseData((prev)=>({...prev, description:e.target.value}))}></textarea>
                        </div>
                    </div>
                    <div id='addExpense'>
                        <button onClick={addNewExpense}>Add Expense</button>
                    </div>
                </div>}
            </div>}
             {/* Below code take permission before going to delete expense profile or expense */}
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
            {showLoading?<Loader/>:null}
    </div>
  )
}