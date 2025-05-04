import React, { useEffect, useState, useRef } from 'react';
import BodyNavbar from '../../Homepage/Body/bodyNavbar';
import Loader from '../../Loader/loader';
import './groupExpenses.css';

import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registering necessary components with Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default function GroupExpenses({
    groupId,
    userData,
    selectedGroup,
    showAnalysis,
    setShowAnalysis,
    tableData,
    setTableData,
    someProfData,
    setSomeProfData
}) {
    const [showLoading, setShowLoading] = useState(false);
    // const [groupId, setGroupId] = useState(group_id);
    const [groupExpenses,setGroupExpenses] = useState([]);
    const [expenseData, setExpenseData] = useState({
        name: '',
        category:'',
        subCategory:'',
        description: '',
        date: '',
        amount: '',
        splitType: '',
        paidBy: '',
        splitMethod: 'equal', //equal or percentage or custom
        splitDetails: []
    });
    const [paidByData, setPaidByData] = useState('');
    const [state, setState] = useState(false);
    const summaryRef = useRef(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [bool, setBool] = useState(false);
    const [showExp, setShowExp] = useState(null);
    const [showCreateNewExp, setShowCreateNewExp] = useState(false);
    const [expandedExpense, setExpandedExpense] = useState(null);
    const [showConfirmBox, setShowConfirmBox] = useState({bool:false});
    const [selectedMember,setSelectedMember] = useState('');
    const [showIsSettledBox, setShowIsSettledBox] = useState({
        bool:false,
        expense_id:'',
        splitDetails:[]
    });

    const [activeIndex, setActiveIndex] = useState(null);
    const [showSettlement, setShowSettlement] = useState(false);
    const [barChartData, setBarChartData] = useState();
    const [subBarChartData, setSubBarChartData] = useState();
    const [pieChartData, setPieChartData] = useState();
    const [categoryAna, setCategoryAna] = useState([]);
    const [subCategoryAna, setSubCategoryAna] = useState([]);
    const [editProf, setEditProf] = useState(false);

    const categories = [
        {
          category: "Travel",
          subcategories: ["Transportation", "Accommodation", "Food & Drinks", "Activities", "Miscellaneous"],
        },
        {
          category: "Food",
          subcategories: ["Groceries", "Restaurants", "Snacks", "Beverages"],
        },
        {
          category: "Entertainment",
          subcategories: ["Movies", "Concerts", "Amusement Parks", "Games", "Parties"],
        },
        {
          category: "Utilities",
          subcategories: ["Electricity", "Water", "Internet", "Gas"],
        },
        {
          category: "Shopping",
          subcategories: ["Clothing", "Electronics", "Gifts", "Home Decor"],
        },
        {
          category: "Health & Fitness",
          subcategories: ["Gym", "Sports", "Healthcare", "Yoga", "Supplements"],
        },
        {
          category: "Events",
          subcategories: ["Birthdays", "Weddings", "Festivals", "Anniversaries"],
        },
        {
          category: "Education",
          subcategories: ["Workshops", "Books & Supplies", "Courses", "Conferences"],
        },
        {
          category: "Charity",
          subcategories: ["Donations", "Fundraisers", "Community Service"],
        }
    ];
      

    function handleBarPieChart(data,budget) {
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
        
        const budgetValue = parseFloat(budget.$numberDecimal || 0);
        const yAxisOptions = {
        beginAtZero: true,
        max: budgetValue,
        ticks: {
            stepSize: Math.ceil(budgetValue / 5),
            },
        };
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
        // setBarChartData(categoryBarChart);
        setBarChartData({ data: categoryBarChart, options: { responsive: true, scales: { y: yAxisOptions } } });

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

        // setSubBarChartData(subcategoryBarChart);
              setSubBarChartData({ data: subcategoryBarChart, options: { responsive: true, scales: { y: yAxisOptions } } });

        // Handle Pie Chart
        const totalSpent = data.reduce((acc, exp) => acc + parseFloat( exp.amount.$numberDecimal ), 0);
        const remainingBudget = parseFloat( (budget.$numberDecimal || 0) ) - totalSpent;
      
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

    // const computeAccordionData = (groupExpenses) => {
    //     const accordionData = [];
    //     groupExpenses.forEach(expense => {
    //       const { expense_id, name: expenseName, amount: totalAmount, paidBy, splitDetails, isSettled } = expense;
        
    //       if(!isSettled.confirm){
    //         splitDetails.forEach(split => {
    //         if (paidBy.name !== split.name) {
    //             accordionData.push({
    //             expense_id,
    //             payer_id: paidBy.user_id,
    //             payer: paidBy.name,
    //             payee_id: split.user_id,
    //             payee_profile_image: split.profile_image,
    //             payee: split.name,
    //             expenseName,
    //             totalAmount: parseFloat(totalAmount.$numberDecimal),
    //             paybackAmount: parseFloat(split.amount.$numberDecimal)
    //             });
    //         }
    //         });
    //       }
    //     });
    //     return accordionData;
    // };
    
    const handleAccordionToggle = index => {
        setActiveIndex(activeIndex === index ? null : index);
      };
    
    // const handleShowDetails = () => {
    //     const data = computeAccordionData(groupExpenses);
    //     setAccordionData(data);
    // };

    const computeTableData = (groupExpenses) => {
        const tableData = [];
        let serialNo = 1; // S.No. remains constant per expense

        groupExpenses.forEach(expense => {
            const { expense_id, name: expenseName, amount: totalAmount, paidBy, splitDetails, isSettled } = expense;

            if (!isSettled.confirm) {
                let firstRow = true; // To track the first row for each expense

                splitDetails.forEach(split => {
                    if (paidBy.name !== split.name && split.paymentStatus !== "Paid") {
                        tableData.push({
                            serialNo: firstRow ? serialNo : "", // S.No. only for the first row
                            expense_id,
                            expenseName: firstRow ? expenseName : "", // Expense Name only for the first row
                            totalAmount: firstRow ? parseFloat (totalAmount.$numberDecimal) : "", // Total Amount only for the first row
                            payer: firstRow ? paidBy.name : "", // Payer Name only for the first row
                            payerAmount: firstRow ? parseFloat (totalAmount.$numberDecimal) : "", // Payer Amount only for the first row
                            payee: split.name,
                            paybackAmount: parseFloat(split.amount.$numberDecimal)
                        });

                        firstRow = false; // After first row, leave cells blank for this expense
                    }
                });

                serialNo++; // Increment S.No. only after processing all payees for one expense
            }
        });

        return tableData;
    };
    const handleShowDetails = () => {
        const data = computeTableData(groupExpenses);
        setTableData(data);
    };
    // Toggle accordion state for an expense
    const toggleExpense = (index) => {
    setExpandedExpense(expandedExpense === index ? null : index);
    };
    function calTotalCurAm(){
        if(groupExpenses.length===0)
            return;
        
        let sum=0; 
        const arr = groupExpenses;
    
        for(let i =0; i<arr.length;i++){
            sum+= parseFloat(arr[i].amount.$numberDecimal);
        }
    
        return sum;
    }


    function changeToGroup(){
        if(bool){
            setExpenseData((prev)=> ({...prev, splitDetails: []}))
            setBool(false);
        }
    }

    function changeToIndividual(){
        if(!bool){
            setExpenseData((prev)=> ({...prev, splitDetails: []}))
            setBool(true);
        }
    }

    // Handle member selection
    function selectMembers(e) {
        const selectedId = e.target.value;
        const memberName = selectedGroup.group_members.filter((elm)=> elm.user_id == selectedId);
        const selected = memberName[0].name;
        const selectedProfImg = memberName[0].profile_image;

        setSelectedMember(selected);
        const memberExistsIndex = expenseData.splitDetails.findIndex(
            (member) => member.user_id === selectedId
        );
    
        if (selected) {
            let updatedSplitDetails;
    
            if (memberExistsIndex === -1) {
                // Add new member if they don't exist
                updatedSplitDetails = expenseData.splitMethod== 'percentage'?  [
                    ...expenseData.splitDetails,
                    { user_id:selectedId, profile_image: selectedProfImg, name: selected, amount: 0, percentage: 0 },
                ]:
                [
                    ...expenseData.splitDetails,
                    {user_id:selectedId, profile_image: selectedProfImg, name: selected, amount: 0},
                ]
                ;
            } else {
                // Keep existing members
                updatedSplitDetails = [...expenseData.splitDetails];
            }
    
            if (expenseData.splitMethod === 'equal') {
                const totalMembers = updatedSplitDetails.length+1;
                const computedAmount = parseFloat(expenseData.amount / totalMembers);
    
                const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: computedAmount,
                }));
    
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: recalculatedSplitDetails,
                }));
            } else if (expenseData.splitMethod === 'percentage') {
                const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: (member.percentage / 100) * expenseData.amount,
                }));
    
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: recalculatedSplitDetails,
                }));
            } else if (expenseData.splitMethod === 'custom') {
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: updatedSplitDetails,
                }));
            }
        }
    }
    
    
    //Delete member then recompute amount for all members
    function handleDelete(idx) {
        const updatedSplitDetails = expenseData.splitDetails.filter(
            (_, index) => index !== idx
        );
    
        if (expenseData.splitMethod === 'equal') {
            const totalMembers = updatedSplitDetails.length;
            const computedAmount =
                totalMembers > 0
                    ? parseFloat(expenseData.amount / totalMembers)
                    : 0;
    
            const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: computedAmount,
            }));
    
            setExpenseData((prev) => ({
                ...prev,
                splitDetails: recalculatedSplitDetails,
            }));
        } else if (expenseData.splitMethod === 'percentage') {
            const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: (member.percentage / 100) * expenseData.amount,
            }));
    
            setExpenseData((prev) => ({
                ...prev,
                splitDetails: recalculatedSplitDetails,
            }));
        } else if (expenseData.splitMethod === 'custom') {
            setExpenseData((prev) => ({
                ...prev,
                splitDetails: updatedSplitDetails,
            }));
        }
    }
    

    function handleSplitMethod(percentage, member_id, name, member_profile_image, amount) {        
        if(expenseData.splitMethod === 'percentage'){
            const perc = Number(percentage);
            const computedAmount = (perc / 100) * amount;
            if(perc<0 || perc>100){
                alert('Provided percentage exceeds 100%. Please correct it.');
                setExpenseData((prev)=>({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elm)=>{
                        if(elm.user_id === member_id){
                            return {
                                ...elm,
                                amount: 0,
                                percentage: 0 //Reset percentage for the specific index
                            };
                        }
                        return elm; //keep other elements unchanged
                    })
                }));
                return;
            }

            setExpenseData((prev) => {
                const updatedSplitDetails = prev.splitDetails.map((elem) =>
                    elem.user_id === member_id ? { ...elem, percentage:perc, amount: parseFloat(computedAmount) } : elem
                );
                if (!prev.splitDetails.some((elem) => elem.user_id === member_id)) {
                    updatedSplitDetails.push({ user_id:member_id,profile_image: member_profile_image,name, percentage:perc, amount: parseFloat(computedAmount) });
                }
        
                return { ...prev, splitDetails: updatedSplitDetails };
            });
        }else if(expenseData.splitMethod === 'custom'){
            const currentamount = parseFloat(amount);

            if(currentamount<0 || currentamount>expenseData.amount){
                alert('Provided amount greater than total amount. Please correct it.');
                // console.log(name, amount, index);
                setExpenseData((prev)=>({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elm)=>{
                        if(elm.user_id === member_id){
                            return {
                                ...elm,
                                amount: 0,
                            };
                        }
                        return elm; //keep other elements unchanged
                    })
                }));
                return;
            }
            setExpenseData((prev) => {
                const updatedSplitDetails = prev.splitDetails.map((elem) =>
                    elem.user_id === member_id ? { ...elem, amount: parseFloat(currentamount) } : elem
                );
                if (!prev.splitDetails.some((elem) => elem.user_id === member_id)) {
                    updatedSplitDetails.push({ user_id:member_id,profile_image: member_profile_image,name, amount: parseFloat(currentamount) });
                }
        
                return { ...prev, splitDetails: updatedSplitDetails };
            });
        }
    }
    
    function computeSplitDetails() {
        if(!paidByData){
            return;
        }
        if (selectedGroup && expenseData.splitMethod === 'equal' && expenseData.splitType === "group") {
            const arr = [];
            const amount = parseFloat(expenseData.amount / selectedGroup.group_members.length);

            selectedGroup.group_members.forEach((elm) => {
                if (elm.user_id !== paidByData.user_id) {
                    arr.push({ user_id: elm.user_id, profile_image: elm.profile_image, name: elm.name, amount });
                }
            });
            setExpenseData((prev) => ({ ...prev, splitDetails: arr }));
        }
    }
    

    async function handleSave(){//Create new Expense for group
        if(!expenseData.name) return alert("Enter the name of expense");
        else if(!expenseData.category) return alert("Provide category for expense");
        else if(!expenseData.subCategory) return alert("Provide sub category for expense");
        else if(!expenseData.description) return alert("Fill the description for expense");
        else if(!expenseData.amount) return alert("Enter the amount of expense");
        else if(!expenseData.splitType) return alert("Provide spilit type (Individual or group)");
        else if(!expenseData.paidBy) return alert("Provide who pay amount of expense");
        else if(!expenseData.splitMethod) return alert("Provide split method");
        else if(expenseData.splitDetails.length<=0) return alert("Add members that have to pay you back");

        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/groupExpenses`,{
                method: 'POST',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({...expenseData,paidBy:{user_id:expenseData.paidBy.user_id, name:expenseData.paidBy.name},groupId})
            });
            const finalRes = await result.json();

            if(finalRes.created){
                callGroupExpenses();
                setShowCreateNewExp(false);
                setState(false);
                alert('success');
                setExpenseData({
                    name: '',
                    description: '',
                    date:'',
                    amount: '',
                    splitType: '',
                    paidBy: '',
                    splitMethod: 'equal', //equal or percentage or custom
                    splitDetails: []
                })
            }else if(!finalRes.created){
                alert('failed');
            }else if(finalRes.failed){
                alert('failure come from backend');
            }

        } catch (error) {
            alert("Error from frontend");
            console.log(error);
        }finally{
            setShowLoading(false);
        }        
    }

    function handleSubmit() {
        if (expenseData.splitMethod === "percentage") {
            let totalPercentage = 0;
    
            // Calculate total percentage
            expenseData.splitDetails.forEach((elem) => {
                totalPercentage += elem.percentage || 0;
            });
    
            if (totalPercentage > 100) {
                alert('The total percentage exceeds 100%. Please correct it.');
    
                // Reset percentages asynchronously
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elem) => ({
                        ...elem,
                        percentage: 0,
                    })),
                }));
    
                return; // Stop execution
            }
        }else if(expenseData.splitMethod === "custom"){
            let totalAmount = 0;

            expenseData.splitDetails.forEach((elem) => {
                totalAmount += elem.amount || 0;
            });
    
            if (totalAmount > expenseData.amount) {
                alert(`The total amount greater than ${expenseData.amount}. Please correct it.`);
    
                // Reset percentages asynchronously
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elem) => ({
                        ...elem,
                        amount: 0,
                    })),
                }));
    
                return; // Stop execution
            }        }
    
        // Toggle state and compute split details
        setState((prev) => !prev);
        computeSplitDetails();
    }

    async function callGroupExpenses(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/groupExpenses?group_id=${groupId}`,{
                method: 'GET',
                headers:{
                    'content-type': 'application/json'
                }
            });
            const finalResult = await result.json();

            if(finalResult.notFound){
                setShowExp(false);
            }else if(finalResult.failed){
                setShowExp(false);
            }else{
                setShowExp(true);
                setGroupExpenses(finalResult.expenses);
                handleBarPieChart(finalResult.expenses,selectedGroup.total_budget);
            }

        } catch (error) {
            alert('failed to fetch group expenses');
            console.log(error);
        }finally{
            setShowLoading(false);
        }
    }
    async function deleteGroupExp(expense_id,splitDetails, paidBy) {
        try {
            setShowLoading(true);
            const user_id = localStorage.getItem('Spending_Smart_User_id');

            const result = await fetch(`${import.meta.env.VITE_API_URL}/groupExpenses`,{
                method: 'PUT',
                headers:{
                    'content-type':'application/json'
                },
                body: JSON.stringify({groupId,expense_id,splitDetails,paidBy,user_id})
            });
            const finalResult = await result.json();

            if(finalResult.failed){
                alert('Error from backend');
            }else if(finalResult.updated){
                alert('Successfully updated');
                callGroupExpenses();
            }else{
                alert('failed due to backend');
            }
        } catch (error) {
            alert('failure occur from here');
            console.log(error);
        }finally{
            setShowLoading(false);
        }
    }

    async function changeIsSettledVal(paymentMode){
        try {
            setShowLoading(true)
            const user_id = localStorage.getItem('Spending_Smart_User_id');

            const result = await fetch(`${import.meta.env.VITE_API_URL}/groupExpenses`,{
               method: 'PATCH',
               headers:{
                'content-type':'application/json'
               },
               body: JSON.stringify({expense_id: showIsSettledBox.expense_id, paymentMode,groupId,user_id,splitDetails:showIsSettledBox.splitDetails})
            });
            const finalResult = await result.json();
            
            if(finalResult.failed){
                alert('Error from backend');
            }else if(!finalResult.updated){
                alert('fail to update settlement');
            }else{
                alert('Success to update settlement');
                // const arr = accordionData.filter((elm)=> elm.expense_id != showIsSettledBox.expense_id);
                // setAccordionData(arr);
                // Remove rows related to the settled expense
                const updatedTableData = tableData.filter(item => item.expense_id !== showIsSettledBox.expense_id);
                setTableData(updatedTableData);
            }
            // setShowIsSettledBox({ bool: false, expense_id: "", splitDetails: [] });
            setShowIsSettledBox((prev)=>({...prev,bool:false}));
        } catch (error) {
            alert('failed to change settlement value and error from here');
            console.log(error);
            setShowIsSettledBox((prev)=>({...prev,bool:false}));
        }finally{
            setShowLoading(false);
        }
    }
    async function handleMoneyReq(expense, index){
        const {expense_id, name, amount, date, paidBy, splitDetails} = expense;
        
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/user/sendMoneyRequest`,{
                method: 'PATCH',
                headers:{
                    'content-type':'application/json'
                },
                body: JSON.stringify({expense_id,...userData, from:'Group Expenses', expName:name, amount, date, paidBy, splitDetails, groupName:selectedGroup.name, group_id:groupId})
            });
            const finalResult = await result.json();

            if(finalResult.failed){
                alert('fail to send money request and may be error from backend');
            }else if(finalResult.success){
                setGroupExpenses((prevData) =>
                    prevData.map((exp, i) =>
                        i === index ? { ...exp, isRequestedMoney: true } : exp
                    )
                );
                const spliName = splitDetails.map((elm)=>elm.name).join(',');
                alert(`money requested to ${spliName} for ${name} expense`);
            }
        } catch (error) {
            alert('error from frontend and fail to send money request');
            console.log(error);
        }finally{
            setShowLoading(false);
        }
    }
    // async function accordionMoneyReq(data){
    //     const {expense_id, payer_id, payer, payee_id, payee_profile_image, payee, expenseName,expenseAmount:totalAmount,paybackAmount} = data;

    // }
    async function handleProfChanges(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/groupExpenses/profileUpdate`,{
              method:'PATCH',
              headers:{
                'content-type': "application/json"
              },
              body: JSON.stringify({group_id: selectedGroup._id, ...someProfData})
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
            setShowLoading(false);
        }
    }

    useEffect(()=>{
        setGroupExpenses([]);
        setShowExp(null);
        callGroupExpenses();
    },[groupId])

    useEffect(()=>{
        if(showAnalysis && groupExpenses){
          handleBarPieChart(groupExpenses,selectedGroup.total_budget);
        }
      },[showAnalysis])
    
    useEffect(()=>{
        if(showSettlement && groupExpenses){
            handleShowDetails()
        }
    },[showSettlement])

    function handleEdit() {
        setState(false); // Hide summary
        setIsEditMode(true); // Enable clicks outside
    }

    // Handle clicks outside summary div
    // useEffect(() => {
    //     function handleClickOutside(event) {
    //         // console.log('Clicked:', event.target);
    //         // console.log('Is Outside:', summaryRef.current.contains(event.target));
    //         // console.log('State:', state);
    //         // console.log('Is Edit Mode:', isEditMode);
    //         if (summaryRef.current && 
    //             !summaryRef.current.contains(event.target) == false && 
    //             state && !isEditMode) {
    //             event.stopPropagation();
    //         }
    //     }
    //     document.addEventListener('click', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('click', handleClickOutside);
    //     };
    // }, [state, isEditMode]);

    return (
        <div style={{flex:'1'}}>
            {/* Below Code to show group expenses */}
            {showExp && groupExpenses.length>0 &&
            <>
                <BodyNavbar/>
                <div>
                    {/* <div id='expenseProfileDetail_TE'>
                        <h2>Profile Name: {selectedGroup.name}</h2>
                        <div>
                            <p><strong>Total Budget:</strong> {selectedGroup.total_budget.$numberDecimal}</p>
                            <p><strong>Current Total Amount:</strong> ₹{calTotalCurAm()}</p>
                            <p><strong>Description:</strong> {selectedGroup.description}</p>
                        </div>
                    </div>*/}
                <div id='expenseProfileDetail_TE' style={{marginTop:'unset', position:'relative'}}>
                    <div id="editProfile_TE" style={{width:'7%'}} onClick={()=>setEditProf(!editProf)}>
                    <img src="edit.png" alt="error" />
                    </div>
                    <h2>Profile Name: {selectedGroup.name}</h2>
                    <div id="profDivInputs_TE">
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                            <div style={{display:'grid', gap:'20px', whiteSpace:'nowrap'}}>
                                <p><strong>Total Budget:</strong></p>
                                <p><strong>Current Total Amount:</strong></p>
                                <p><strong>Start Date:</strong> </p>
                                { selectedGroup && selectedGroup.end_date && <p><strong>End Date:</strong> </p>}
                            </div>
                            <div style={{display:'grid', gap:'20px'}}>
                                <input type="text" onChange={(e)=>setSomeProfData((prev)=>({...prev, totalBudget:e.target.value}))} value={someProfData.totalBudget} disabled={!editProf?true:false} />
                                <p style={{fontSize:'larger'}}>₹{calTotalCurAm()}</p>
                        <input type="text" value={someProfData.startDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, startDate:e.target.value}))} disabled={!editProf?true:false} />
                        { selectedGroup && selectedGroup.end_date && <input type="text" value={someProfData.endDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, endDate:e.target.value}))} disabled={!editProf?true:false} />}
                        {/* <input type="text" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false} /> */}

                            </div>
                        </div>
                        {/* <div style={{flexDirection: 'row'}}>
                        </div>
                        <div style={{flexDirection: 'row'}}>
                        </div>
                        <div style={{flexDirection: 'row'}}>
                        </div>
                        <div style={{flexDirection: 'row'}}>
                        </div>
                        { selectedGroup && selectedGroup.end_date && <div style={{flexDirection: 'row'}}>
                        </div>} */}
                        <div>
                        <p><strong>Description:</strong></p>
                        <textarea name="" id="profDescription_T" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false}/>

                        </div>
                        { editProf && 
                        <div>
                        <button id="profChangesBtn_TE" onClick={handleProfChanges}>Save Changes</button>
                        </div>}
                    </div>
                </div>
                <div className="expenses-container">
                    <h2>Group Expenses</h2>
                    {groupExpenses.map((expense, expenseIndex) => (
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
                                    <div 
                                        style={{display:'flex', gap:'20px', alignItems:'center', marginRight:'20px', cursor:'pointer'}} 
                                        onClick={()=>{setShowConfirmBox({bool:true,work:'expenseDelete', expense_id: expense.expense_id, splitDetails:expense.splitDetails,paidBy: expense.paidBy})}}
                                    >
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
                                                <td>Date:</td>
                                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Category:</td>
                                                <td>{expense.category}</td>
                                            </tr>
                                            <tr>
                                                <td>Sub Category</td>
                                                <td>{expense.subCategory}</td>
                                            </tr>
                                            <tr>
                                                <td>Description:</td>
                                                <td>{expense.description}</td>
                                            </tr>
                                            <tr>
                                                <td>Amount:</td>
                                                <td>₹{expense.amount.$numberDecimal}</td>
                                            </tr>
                                            <tr>
                                                <td>Paid By:</td>
                                                <td>{expense.paidBy.name}</td>
                                            </tr>
                                            <tr>
                                                <td>Split Type:</td>
                                                <td>{expense.splitType}</td>
                                            </tr>
                                            <tr>
                                                <td>Is Settled:</td>
                                                <td style={{position:'relative'}}>
                                                    <select 
                                                        value={expense.isSettled.confirm ? "Yes" : "No"} 
                                                        disabled={expense.isSettled.confirm || expense.paidBy.user_id != userData.user_id } // Disable the select when the value is true
                                                        onChange={(e) => {
                                                            const newIsSettled = e.target.value === "Yes"; // Convert value to boolean
                                                            if (newIsSettled !== expense.isSettled.confirm) {
                                                                setShowIsSettledBox({
                                                                    bool: true,
                                                                    expense_id: expense.expense_id,
                                                                    splitDetails: expense.splitDetails
                                                                });
                                                                expense.isSettled.confirm = newIsSettled; // Update the local value for immediate feedback
                                                            }
                                                        }}
                                                    >
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                    {expense.paidBy.user_id != userData.user_id && 
                                                    <span
                                                        style={{
                                                            fontSize:'smaller',
                                                            position: 'absolute',
                                                            marginLeft: '10px'
                                                        }}
                                                    > <i>isSettled value only changable by a person who paid for expense</i></span>}
                                                </td>
                                            </tr>
                                        </tbody>
                                        </table>

                                        <h4>Split Details</h4>
                                        <table className="split-table">
                                            <thead>
                                            <tr>
                                                <th>Member</th>
                                                <th>Amount</th>
                                                <th>Payment Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {expense.splitDetails.map((split, splitIndex) => (
                                                <tr key={splitIndex}>
                                                    <td>{split.name}</td>
                                                    <td>₹{split.amount.$numberDecimal}</td>
                                                    <td>{split.paymentStatus === "Paid" || expense.isSettled.confirm ? "Paid" : "Pending"}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        { !expense.isSettled.confirm && expense.paidBy.user_id == userData.user_id && <div id='reqMoneyDiv'>
                                            <p>!! Request Money From Split Members !!</p>
                                            {expense.isRequestedMoney=== true 
                                            // || locallyReqMoney === true
                                            ?<button onClick={()=>alert('You already requested')}>Requested Money</button>
                                            :
                                            <button onClick={()=>{
                                                handleMoneyReq(expense,expenseIndex); 
                                                expense.isRequestedMoney=true}}>Request Money</button>}
                                            {/* {console.log(expense.isRequestedMoney)}
                                            {console.log(locallyReqMoney)} */}
                                        </div>}
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}

                    <div id='expenseBtns'>
                        <button onClick={()=>{setShowCreateNewExp(true)}}>Add Expense</button>
                        <button style={{color:'black', padding:'10px 5px', backgroundColor:'#C0C0C0'}} onClick={()=>setShowSettlement(!showSettlement)}>View Expense Settlements</button>
                        <button style={{backgroundColor:'rgb(173, 6, 36)'}} onClick={()=>setShowAnalysis(!showAnalysis)}>Show Analysis</button>
                    </div>
                </div>

            {showSettlement && tableData.length > 0 && (
                <div className="table-container">
                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Expense Name</th>
                                <th>Expense Amount</th>
                                <th>Payer Name</th>
                                <th>Payer Amount</th>
                                <th>Payee Name</th>
                                <th>Payee Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.serialNo}</td>
                                    <td>{item.expenseName}</td>
                                    <td>{item.totalAmount !== "" ? `₹${item.totalAmount.toFixed(2)}` : ""}</td>
                                    <td>{item.payer}</td>
                                    <td>{item.payerAmount !== "" ? `₹${item.payerAmount.toFixed(2)}` : ""}</td>
                                    <td>
                                        {item.payee}
                                    </td>
                                    <td>₹{item.paybackAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
                    {/* Analysis */}
                    {showAnalysis && groupExpenses.length>0 && <div id='mainAnalysis_TME'>
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
{/*                         <Bar 
                            data={barChartData} 
                            options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Expenses by Category" } } }} 
                        /> */}
                        <Bar 
                            data={barChartData.data} 
                            options={{
                                ...barChartData.options,
                                responsive: true, 
                                plugins: 
                                    { legend: 
                                        { position: "top" }, 
                                        title: 
                                            { display: true, text: "Expenses by Category" } 
                                    } 
                                }} 
                        /> 
                        </div>}
                        {subBarChartData && <div id='subBarchartData'>
{/*                         <Bar 
                            data={subBarChartData} 
                            options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Expenses by Subcategory" } } }} 
                        /> */}
                        <Bar 
                            data={subBarChartData.data} 
                            options={{ 
                                ...subBarChartData.options,
                                plugins: 
                                    { legend: 
                                        { position: "top" }, 
                                        title: 
                                            { display: true, text: "Expenses by Subcategory" } 
                                    } 
                            }} 
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
                </div> 
            </>
            }

            {/* Below code execute when expenses not exists */}
            {showExp !== null && showExp===false && 
            <>
                <BodyNavbar/>
                <div id='emptyDiv_GE'>
                    <div id='emptyExpenseList'>
                        <img src="./emptyExpenses.jpg" alt="error" />
                    </div>
                    <div onClick={()=>setShowCreateNewExp(true)} id='addExpense'>
                        <button>Add Expense</button>
                    </div>
                </div>
            </>
            }
            {/* Div to create new expenses */}
            {showCreateNewExp && <div id='newExp_GE'>
                <div style={{width:'200px', margin:'auto'}}>
                    <img src="./addExpense.jpg" style={{width:'100%'}} alt="error" />
                </div>
                {/* Expense Inputs */}
                <div>
                    <div>
                        <span>Name: </span>
                        <input
                            type="text"
                            placeholder="Expense name"
                            onChange={(e) =>
                                setExpenseData((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                    </div>
                    <div id='createExpForMain'>
                        <div>
                            <h3>Create Expense For: </h3>
                        </div>
                        <div>
                            <input
                                type="radio"
                                name="expenseType"
                                value="group"
                                id="wholeExpense"
                                onClick={changeToGroup}
                                onChange={(e) =>
                                    setExpenseData((prev) => ({ ...prev, splitType: e.target.value }))
                                }
                                />
                            <label htmlFor="wholeExpense">Whole Group</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                name="expenseType"
                                value="individual"
                                id="indiviExpense"
                                onClick={changeToIndividual}
                                onChange={(e) =>
                                    setExpenseData((prev) => ({ ...prev, splitType: e.target.value }))
                                }
                            />
                            <label htmlFor="indiviExpense">Some Individuals</label>
                        </div>
                    </div>
                </div>

                {/* Expense Details */}
                <div id="inputDiv_exp">
                    <div>
                        <span>Category: </span>
                        <select name="" id="" onChange={(e)=>setExpenseData((prev)=>({...prev,category:e.target.value}))}>
                            <option value="">Select Category</option>
                            {categories.map((elem, index)=>(
                            <option value={elem.category} key={index}>{elem.category}</option>
                            ))
                            }
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    {expenseData.category && <div>
                    <span>Sub Category: </span>
                    {
                        expenseData.category === "Other"?(
                        <input type="text" placeholder="Sub Category" onChange={(e)=>setExpenseData((prev)=>({...prev,subCategory:e.target.value}))}  />
                        ):(
                        <select name="" id="" onChange={(e)=>setExpenseData((prev)=>({...prev,subCategory:e.target.value}))}>
                            <option value="">Select Sub Category</option>
                        {
                            categories.map((elem)=>(
                            elem.category === expenseData.category?(
                                elem.subcategories.map((elm,idx)=>(
                                <option value={elm} key={idx}>{elm}</option>
                                ))
                            ):''
                            ))
                        }
                        </select>
                        )
                    }
                    </div>}
                                        
                    <div>
                        <span>Amount: </span>
                        <input
                            type="number"
                            placeholder="Amount"
                            onChange={(e) =>
                                setExpenseData((prev) => ({ ...prev, amount: parseFloat(e.target.value) }))
                            }
                        />
                    </div>
                    <div>
                        <span>Date: </span>
                        <input
                            type="date"
                            onChange={(e) =>
                                setExpenseData((prev) => ({ ...prev, date: e.target.value }))
                            }
                        />
                    </div>
                    <div>
                        <span>Paid By: </span>
                        <select
                            // onChange={(e) =>
                            //     setExpenseData((prev) => ({ ...prev, paidBy: e.target.value }))
                            // }
                            onChange={(e) => {
                                const selectedMember = selectedGroup?.group_members.find(
                                    (member) => member.user_id === e.target.value
                                );
                                setExpenseData((prev) => ({ ...prev, paidBy: {user_id:selectedMember.user_id,name:selectedMember?.name} })); // Set the name in paidBy
                                setPaidByData({user_id:e.target.value, name:selectedMember?.name}); // Set the unique ID of the selected member

                                if(expenseData.splitMethod == "percentage"){
                                    const sD = expenseData.splitDetails
                                    .filter((elm) => elm.user_id != e.target.value) // Keep only elements that satisfy the condition
                                    .map((elm) => ({ ...elm, percentage: 0, amount:0 })); // Update their percentage to 0
                                 
                                    setExpenseData((prev)=>({...prev, splitDetails:sD}));
                                }else if(expenseData.splitMethod == "custom"){
                                    const sD = expenseData.splitDetails
                                    .filter((elm) => elm.user_id != e.target.value) // Keep only elements that satisfy the condition
                                    .map((elm) => ({ ...elm, amount:0 })); // Update their percentage to 0
                                 
                                    setExpenseData((prev)=>({...prev, splitDetails:sD}));
                                }else if(expenseData.splitType == "individual" && expenseData.splitMethod == "equal"){
                                    setExpenseData((prev)=>({...prev, splitDetails:[]}));
                                }
                            }}
                        >
                            <option value="">Paid By</option>
                            {selectedGroup?.group_members?.map((member, idx) => (
                                <option value={member.user_id} key={idx}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
                
                {/* Split Method (equal or percentage or custom) */}
                <div>
                    <span>Select Split Method: </span>
                    <select name="" id="" 
                    onClick={(e)=>expenseData.splitMethod !== e.target.value?expenseData.splitDetails=[]:''}
                    onChange={(e)=>setExpenseData((prev)=>({...prev, splitMethod:e.target.value, splitDetails:[]}))}>
                        <option value="equal" >equal</option>
                        <option value="percentage" >percentage</option>
                        <option value="custom">custom</option>
                    </select>
                </div>

                {/* Split Details */}
                {/* <div>
                </div> */}

                    {expenseData.splitType === 'individual' ? (
                        <div style={{width:'fit-content'}}>
                            <div>
                                <h3>Select member to pay back {expenseData.paidBy.name}</h3>
                            </div>
                            <div>
                                <select 
                                value={expenseData.splitDetails.length === 0?'Select Member':selectedMember}
                                onChange={selectMembers}>
                                    <option value="">Select Member</option>
                                    {selectedGroup?.group_members?.map((member, idx) =>
                                        member.user_id !== expenseData.paidBy.user_id ? (
                                            <option value={member.user_id} key={idx}>
                                                {member.name}
                                            </option>
                                        ) : null
                                    )}
                                </select>
                            </div>

                            <div>
                                {expenseData.splitDetails.map((member, idx) => (
                                    <div key={idx} style={{margin:'10px'}}>
                                        <span style={{fontWeight:'bold'}}>Name:</span>
                                        <span style={{fontWeight:'unset'}}> {member.name} </span>
                                        {expenseData.splitMethod === 'equal' && 
                                        <>
                                            <span style={{fontWeight:'bold'}}>
                                                Amount:
                                            </span>
                                            <span style={{fontWeight:'unset'}}> {parseFloat( expenseData.amount / (expenseData.splitDetails.length+1)).toFixed(2) }</span>
                                        </>
                                        }
                                        {expenseData.splitMethod==="percentage" && 
                                            <input 
                                                type="number" 
                                                placeholder='percentage' 
                                                // defaultValue={0} 
                                                value = {expenseData.splitDetails[idx].percentage === 0? '':expenseData.splitDetails[idx].percentage}
                                                onChange={(e)=>handleSplitMethod(e.target.value,member.user_id,member.name,member.profile_image,expenseData.amount)}
                                                style={{width:'20%', marginRight:'10px', textAlign:'center'}}
                                                />}
                                        
                                        {expenseData.splitMethod==="custom" && 
                                            <input 
                                                type="number" 
                                                placeholder='Enter Amount' 
                                                // defaultValue={0}
                                                value = {expenseData.splitDetails[idx].amount === 0? '':expenseData.splitDetails[idx].amount}
                                                onChange={(e)=>handleSplitMethod('',member.user_id,member.name,member.profile_image,e.target.value)} 
                                                style={{
                                                    width:'100px',
                                                    textAlign:'center',
                                                    marginRight:'10px'
                                                }}
                                            />}
                                            
                                        <button
                                            onClick = {()=> handleDelete(idx)}
                                            style={{
                                                border: "none",
                                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                color: "white",
                                                fontWeight: "bold",
                                                padding: "5px 10px",
                                                borderRadius: "5px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {expenseData.splitType === 'group' && expenseData.paidBy ? (
                        <div>
                            <h3>Members who need to pay {expenseData.paidBy.name}:</h3>
                            <div>
                            {selectedGroup?.group_members?.map((member, idx) =>
                                member.user_id !== expenseData.paidBy.user_id ? (
                                    <div key={idx} style={{marginTop:'10px'}}>
                                        <span style={{fontWeight:'bold'}}>Name:</span>
                                        <span style={{fontWeight:'unset'}}> {member.name} </span>
                                        {expenseData.splitMethod==="equal" && 
                                            <>
                                                <span style={{fontWeight:'bold'}}>
                                                    Amount:
                                                </span>
                                                <span style={{fontWeight:'unset'}}> {parseFloat(expenseData.amount / (selectedGroup.group_members.length)).toFixed(2) }</span>
                                            </>
                                            }
                                        {expenseData.splitMethod==="percentage" && 
                                            <input 
                                                type="number" 
                                                placeholder='percentage' 
                                                // defaultValue= {0}
                                                style={{width:'30%', textAlign:'center', padding:'5px 0px'}} 
                                                value={
                                                    (expenseData.splitDetails.find((detail) => detail.user_id === member.user_id)?.percentage)==0?''
                                                    :
                                                    expenseData.splitDetails.find((detail) => detail.user_id === member.user_id)?.percentage
                                                }
                                                onChange={(e)=>handleSplitMethod(e.target.value,member.user_id,member.name,member.profile_image,expenseData.amount)}/>}
                                        
                                        {expenseData.splitMethod==="custom" && 
                                            <input 
                                                type="number" 
                                                placeholder='custom'
                                                // defaultValue={0}
                                                style={{margin:'2px 5px'}}
                                                value={
                                                    (expenseData.splitDetails.find((detail) => detail.user_id === member.user_id)?.amount)==0?''
                                                    :
                                                    expenseData.splitDetails.find((detail) => detail.user_id === member.user_id)?.amount
                                                }
                                                onChange={(e)=>handleSplitMethod('',member.user_id,member.name,member.profile_image,e.target.value)}
                                            />}    
                                    </div>
                                ) : null
                            )}
                            </div>
                        </div>
                    ) : null}
                <div>
                    <h3>Description: </h3>
                    <textarea
                        type="text"
                        placeholder="Description"
                        onChange={(e) =>
                            setExpenseData((prev) => ({ ...prev, description: e.target.value }))
                        }
                    ></textarea>
                </div>

                <div id='submitBtnDiv_GE'>
                    <button onClick={handleSubmit}>Submit</button>
                    <div onClick={()=>{setShowCreateNewExp(false), setState(false)}}>
                        <button 
                        onClick={()=> setExpenseData({
                            name: '',
                            description: '',
                            date:'',
                            amount: '',
                            splitType: '',
                            paidBy: '',
                            splitMethod: 'equal', //equal or percentage or custom
                            splitDetails: []
                        })}
                        style={{backgroundColor:'rgb(173, 6, 36)'}}
                        >
                            Close
                        </button>
                    </div>
                </div>
                {/* Summary */}
                {state && <div id='expSummaryDiv_exp' ref={summaryRef} style={{fontWeight:'bold'}}>
                    <h3>Summary</h3>
                    <p> Description:  {expenseData.description}</p>
                    <p>Amount: {expenseData.amount}</p>
                    <p>Who Paid: {expenseData.paidBy.name}</p>
                    <p>Members that return money to {expenseData.paidBy.name}:</p>
                    <div id='summayDiv_exp'>
                        {state && expenseData.splitDetails.map((elm, idx) => (
                        <div key={idx}>
                            <p>Name: {elm.name}</p>
                            {expenseData.splitMethod === 'percentage'? (<p>Percentage: {elm.percentage}%</p>) :null}
                            <p>Amount: {elm.amount}</p>
                        </div>  
                        ))}
                    </div>
                    <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                        <button onClick={handleEdit}>Edit</button>
                        <button onClick={handleSave}>Save</button>
                    </div>
                </div>}
            </div>}
            
            {/* Below code used to ask user before going to update isSettled or delete expense */}
            {showConfirmBox.bool && <div id='delExpProfDiv_TME'>
                    <div>
                        <h3 style={{textAlign: 'center'}}>Are you sure?</h3>
                    </div>
                    <div id='delExpProfDiv_TME_BTNDIV'>
                        <button onClick={()=>
                            {
                                if(showConfirmBox.work === "isSettled"){
                                    changeIsSettledVal(showConfirmBox.expense_id,showConfirmBox.isSettled);
                                    setShowConfirmBox({bool:false});
                                }else if(showConfirmBox.work === "expenseDelete"){
                                    deleteGroupExp(showConfirmBox.expense_id, showConfirmBox.splitDetails, showConfirmBox.paidBy);
                                    setShowConfirmBox({bool:false});
                                }
                            }
                        }>yes</button>
                        <button onClick={()=> setShowConfirmBox({bool:false, data:{name:'',value:''}})}>no</button>
                    </div>
            </div>}
            { showIsSettledBox.bool && <div id='settlementConfBox'>
                <div id='settleConfBoxHead'>
                    <h2>Did you settle the payment manually using online methods or cash?</h2>
                    <p> <i> Note:-(changes only done one time after this, you will not able to change again)</i></p>
                </div>
                <div id='settleConfBoxBtnDiv'>
                    <button onClick={()=>changeIsSettledVal('Online')}>Online</button>
                    <button onClick={()=>changeIsSettledVal('Cash')}>Cash</button>
                    <button style={{color:'red'}} onClick={()=>setShowIsSettledBox((prev)=>({...prev, bool:false}))}>Exit</button>
                </div>
            </div>}
            {showLoading?<Loader/>:null}
        </div>
    );
}
