import React, { useEffect, useState } from "react";
import CreateGroupExp from "./Group Tour/createGroupExp";
import CreateIndividualExp from './Individual Tour/createIndividualExp';
import BodyNavbar from "../Homepage/Body/bodyNavbar";
import "./travelExpenses.css";

import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import IndivExpenseList from "./Individual Tour/indivExpenseList";
import GroupExpenseList from "./Group Tour/groupExpenseList";
import GroupMembers,{handleAddMember, handleDeleteMember} from "./groupMembers";
import CreateNewTourProf from "./createNewTourProf";
import { showHideOldExpProfBar } from "../../services/actions/actions";
import { useDispatch, useSelector } from 'react-redux';
import Loader from "../Loader/loader";

// Registering necessary components with Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default function TravelExpenses() {
  const userId = localStorage.getItem('Spending_Smart_User_id');
  const [currentBudget, setCurrentBudget] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [ userName,setUserName] = useState('');
  const [ profileImg,setProfileImg] = useState('./dummyProfileImg.png');
  const [showConfirmBox,setShowConfirmBox] = useState({bool:false, work:'', data:''});
  // Hooks use to show old tour expenses or show empty img when profile not exists
  const [tourPr, setTourPr] = useState(null);//it also contain data of tour expense profile
  //below hook show or hide dialog box that create tour profile
  const [showCreateTourProf, setShowCreateTourProf] = useState(false);
  // if group profile selected
  const [selectedTourProf, setSelectedTourProf] = useState(null);
  const [availMemList, setAvailMemList] = useState([]); //Total available memberlist from friend list
  //Below hook show or hide expense list. Also show or hide empty image
  const [showTourExp, setShowTourExp] = useState(null);
  const [showPayBackBox, setShowPayBackBox] = useState(false);
  //below hook show or hide dialog box that create expense for individual profile 
  const [showCreateIndExp, setShowCreateIndExp] = useState(false);
  //below hook contain list of expenses
  const [indExpData, setIndExpData] = useState([]);
 //below hook show or hide dialog box that create expense for group profile 
 const [showCreateGroupExp, setShowCreateGroupExp] = useState(false);
 //collect group expense data
 const [collectGroupExpData, setCollectGroupExpData] = useState({
   name: '',
   category:'',
   subCategory:'',
   description: '',
   date: new Date(),
   amount: '',
   splitType: '',
   paidBy: '',
   splitMethod: 'Equal', //equal or percentage or custom
   splitDetails: [],
   paymentMode:'',
   expense_location:'',
   otherLocation:''
 });
 //contain list of group expenses data
 const [groupExpData, setGroupExpData] = useState([]);
 //work for accordian menu in expense
//  const [expandedExpense, setExpandedExpense] = useState(null);

 const [barChartData, setBarChartData] = useState();
 const [subBarChartData, setSubBarChartData] = useState();
 const [pieChartData, setPieChartData] = useState();
 const [showAnalysis, setShowAnalysis] = useState(false);
 const [categoryAna, setCategoryAna] = useState([]);
 const [subCategoryAna, setSubCategoryAna] = useState([]);
 const [editProf, setEditProf] = useState(false);
 const [someProfData, setSomeProfData] = useState();

 const [tableData, setTableData] = useState([]);
 
 const [activeIndex, setActiveIndex] = useState(null);
 const dispatch = useDispatch();
 const {showHideProfBar} = useSelector((state)=>state.user);
  //common for both type expenses
  const categories = [
    {
      category: "Travel",
      subcategories: [
        "Transportation",
        "Fuel",
        "Parking",
        "Tolls",
        "Ride Sharing"
      ]
    },
    {
      category: "Accommodation",
      subcategories: [
        "Hotels",
        "Hostels",
        "Rental Apartments",
        "Camping Sites",
        "Lodges"
      ]
    },
    {
      category: "Food & Drinks",
      subcategories: [
        "Restaurants",
        "Cafes",
        "Snacks",
        "Alcoholic Beverages",
        "Groceries"
      ]
    },
    {
      category: "Activities",
      subcategories: [
        "Adventure Sports",
        "Sightseeing",
        "Workshops",
        "Cultural Events",
        "Amusement Parks"
      ]
    },
    {
      category: "Shopping",
      subcategories: [
        "Souvenirs",
        "Clothing",
        "Accessories",
        "Gifts",
        "Local Specialties"
      ]
    },
    {
      category: "Miscellaneous",
      subcategories: [
        "Tips",
        "Donations",
        "Emergency Expenses",
        "Health Supplies",
        "Other"
      ]
    }
  ];

  // Toggle accordion state for an expense
  // const toggleExpense = (index) => {
  //   setExpandedExpense(expandedExpense === index ? null : index);
  // };

  const handleAccordionToggle = index => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  function calTotalCurAm(data){
    if(data){
      let sum=0; 
      const arr = data;
  
      for(let i =0; i<arr.length;i++){
          sum+= parseFloat(arr[i].amount.$numberDecimal);
      }
  
      return sum;
    }
  }
  
  // Call tour and user data
  async function callUserData() {
    if(!userId){
      return;
    }
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user?user_id=${userId}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert("error come from backend(/user)");
        return { bool: false };
      }else if(finalResult.notFound){
        alert("user data not found in server");
        return { bool: false };
      }else{
        setUserName(finalResult.name);
        setProfileImg(finalResult.profile_image);
       
        return {
          bool: true,
          friendList: finalResult.friendList,
          tours: finalResult.tours
        };
      }
    } catch (error) {
      alert("error while get data from user");
      console.log(error);
      return { bool: false };
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
    });
    }
  }
  function collectGroupMember(friendList) {
    if(!friendList){
      return;
    }
    let arr = [];
    friendList.forEach((elem) => {
      arr.push({ user_id: elem.user_id, profile_image:elem.profile_image, name: elem.name });
    });
    // setCollMem(friendList);
    setAvailMemList(arr);
  }
  async function handleGetProfile(obj){
      try {
        setShowLoading(true);
         const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`,{
            method:'GET',
            headers: {
              'content-type': 'application/json',
              'Array-Data': JSON.stringify(obj)
            }
         })
  
         const finalResult = await result.json();

         if(finalResult.notFound){
           alert('tour expenses not exists');
           setTourPr(false);
           setShowTourExp(null);
           
         }else if(finalResult.failed){
           alert('failed to get tour expenses profiles but error from backend');
           setTourPr(false);
           setShowTourExp(null);
         }else{
           setTourPr(finalResult);
            if(finalResult && finalResult.individualTourData.length>0){
              setSelectedTourProf(...finalResult.individualTourData);
            }else{
              setSelectedTourProf(...finalResult.groupTourData);
            }
         }
   } catch (error) {
         alert('failed to get expenses profiles');
         console.log(error);
   }finally{
    setTimeout(()=>{
      setShowLoading(false);
  });
  }
  }
  async function getTourExpensesProfiles() {
    const result = await callUserData();

    if (result.bool) {
      collectGroupMember(result.friendList);
      handleGetProfile(result.tours);
    }
  }

//--Delete Expense Profile
  async function handleDeleteExpProf(){
    if(!selectedTourProf){
      return;
    }
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`,{
        method:'DELETE',
        headers:{
          'content-type': 'application/json'
        },
        body: JSON.stringify({tour_id:selectedTourProf._id, tour_type: selectedTourProf.type})
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('Error from backend');
      }else if(!finalResult.updated){
        alert('fail');
      }else{
        alert(`${selectedTourProf.type} Expense Profile deleted`);
        getTourExpensesProfiles();
      }
    } catch (error) {
      alert('Failure occur from here');
      console.log(error);
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
    });
    }
  }

// Call specific tour profile expenses
  async function getExpenses(){
    if(!selectedTourProf)
      return;

    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses?tour_id=${selectedTourProf._id}&&tour_type=${selectedTourProf.type}`,{
        method: 'GET',
        headers:{
          'content-type': 'application/json'
        }
      });
      const finalResult = await result.json();
  
      if(finalResult.failed){
        setShowTourExp(false);
        alert('Error from backend');
        return;
      }
      else if(finalResult.notFound){
        setShowTourExp(false);
        alert(`${selectedTourProf.type} expenses not found`);
        if(selectedTourProf.type === "Individual"){
          setIndExpData([]);
          const arr = tourPr.individualTourData.map((elm)=>{
            if(elm._id == selectedTourProf._id ){
              return {...elm, expenses:[]};
            }else{
              return elm;
            }
          });
          setTourPr((prev)=>({...prev, individualTourData:arr}));
        }else if(selectedTourProf.type === "Group"){
          setGroupExpData([]);
          const arr = tourPr.groupTourData.map((elm)=>{
            if(elm._id == selectedTourProf._id ){
              return {...elm, expenses:[]};
            }else{
              return elm;
            }
          });
          setTourPr((prev)=>({...prev, groupTourData:arr}));
        }

        return;
      }else{
        alert('Success');
        // setShowLoading(true);
        // selectedTourProf.type==="Individual"?setIndExpData(finalResult):setGroupExpData(finalResult);
        if(selectedTourProf.type === "Individual"){
          setIndExpData(finalResult);
          const arr = tourPr.individualTourData.map((elm)=>{
            if(elm._id == selectedTourProf._id ){
              return {...elm, expenses:finalResult};
            }else{
              return elm;
            }
          });
          setTourPr((prev)=>({...prev, individualTourData:arr}));
        }else if(selectedTourProf.type === "Group"){
          setGroupExpData(finalResult);
          const arr = tourPr.groupTourData.map((elm)=>{
            if(elm._id == selectedTourProf._id ){
              return {...elm, expenses:finalResult};
            }else{
              return elm;
            }
          });
          setTourPr((prev)=>({...prev, groupTourData:arr}));
        }

        handleBarPieChart(finalResult, selectedTourProf.budget);
        setShowTourExp(true);

        if(selectedTourProf.type === "Group"){
          handleShowDetails(finalResult);
        }
        const currentVal = calTotalCurAm(finalResult);
        setCurrentBudget(currentVal);
        // setShowLoading(false);
      }
    } catch (error) {
      alert('fail from here');
      setShowTourExp(false);
      console.log(error);
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
    });
    }
  }
  //--Delete Expense of specific tour profile
  async function handleDeleteExp(data) {
    try {
      setShowLoading(true);
      const user_id = localStorage.getItem('Spending_Smart_User_id');
      const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`,{
        method:'PUT',
        headers:{
          'content-type': 'application/json'
        },
        body: JSON.stringify({tour_id:selectedTourProf._id,user_id,expense_id:data.expense_id, splitDetails:data.splitDetails|| [], tour_type: selectedTourProf.type})
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('Error from backend');
        return;
      }else if(!finalResult.updated){
        alert('fail');
        return;
      }else{
        alert('Expense deleted');
        getExpenses();
      }
    } catch (error) {
      alert('Failure occur from here');
      console.log(error);
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
    });
    }
  }
  // use to show data in view settlement div
  const computeTableData = (groupExpenses) => {
      const tableData = [];
      let serialNo = 1; // S.No. remains constant per expense
      setShowLoading(true);

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
                          totalAmount: firstRow ? parseFloat(totalAmount.$numberDecimal) : "", // Total Amount only for the first row
                          payer: firstRow ? paidBy.name : "", // Payer Name only for the first row
                          payerAmount: firstRow ? parseFloat(totalAmount.$numberDecimal) : "", // Payer Amount only for the first row
                          payee: split.name,
                          paybackAmount: parseFloat(split.amount.$numberDecimal)
                      });

                      firstRow = false; // After first row, leave cells blank for this expense
                  }
              });

              serialNo++; // Increment S.No. only after processing all payees for one expense
          }
      });
      setTimeout(()=>{
        setShowLoading(false);
      },1000);

      return tableData;
  };

  const handleShowDetails = (groupExpenses) => {
      if(!groupExpenses) return;

      const data = computeTableData(groupExpenses);
      setTableData(data);
  };
  // function handleShowDetails (groupExpenses){
  //   if(!groupExpenses){
  //     return;
  //   }
  //   const table_Data = [];
  //       groupExpenses.forEach(expense => {
  //         const { name: expenseName, amount: totalAmount, paidBy, splitDetails } = expense;
      
  //         splitDetails.forEach(split => {
  //           if (paidBy.name !== split.name) {
  //             table_Data.push({
  //               payer: paidBy.name,
  //               payee: split.name,
  //               expenseName,
  //               totalAmount: parseFloat(totalAmount.$numberDecimal),
  //               paybackAmount: parseFloat(split.amount.$numberDecimal)
  //             });
  //           }
  //         });
  //       });
  //       setTableData(table_Data);
  // };


  //code to change settlement value of specific expense
  
  async function changeIsSettledVal(expense_id,splitDetails,isSettled,paymentMode,){
      try {
        setShowLoading(true);
          const user_id = localStorage.getItem("Spending_Smart_User_id");

          const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`,{
              method: 'PATCH',
              headers:{
              'content-type':'application/json'
              },
              body: JSON.stringify({user_id,expense_id,isSettled:{confirm:isSettled, paymentMode},tour_id:selectedTourProf._id,bool:true,splitDetails})
          });
          const finalResult = await result.json();

          if(finalResult.failed){
              alert('Error from backend');
          }else if(!finalResult.updated){
            alert('failure due to backend');
          }else{
            alert('Success to update settlement');
          }
          setShowConfirmBox({bool:false, work:'', data:''});

      } catch (error) {
          alert('failed to change settlement value');
          setShowConfirmBox({bool:false, work:'', data:''});
          console.log(error);
      }finally{
        setTimeout(()=>{
          setShowLoading(false);
      });
      }
  }
  // Evaluate data for analysis
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
  
  async function  handleMakeAdmin(data){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses/makeAdmin`,{
            method:'PATCH',
            headers:{
                'content-type': 'application/json'
            },
            body: JSON.stringify({
              user_id: data.user_id, 
              tour_id: selectedTourProf._id,
              prevAdmin_id: selectedTourProf.admin_id
            })
        });
        const finalResult = await result.json();
        
        if(finalResult.failed){
            alert('error from backend');
        }else if(!finalResult.updated){
            alert('fail to make admin');
        }else{
            alert('Success');
            let arr = selectedTourProf.group_members.map((prev)=> ({...prev,isAdmin:prev.user_id == data.user_id? prev.isAdmin = true:prev.isAdmin=false}));
            // Below code update admin in specific profile from all profiles
            const updatedAdmin = tourPr.groupTourData.map((elm)=>{
                if(elm._id == selectedTourProf._id){
                    return {...elm, group_members:arr, admin_id: data.user_id}
                }else{
                    return elm;
                }
            });
            setTourPr((prev)=>({...prev,groupTourData:updatedAdmin}));
            setSelectedTourProf((prev)=>({...prev, group_members:arr, admin_id:data.user_id}));
        }
    } catch (error) {
        alert('failed to make admin and error from here');
        console.log(error);
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
    });
    }
  }
  const handleFun=(paymentMode)=>{
    switch (showConfirmBox.work) {
      case "individualProfileDelete":
        handleDeleteExpProf(showConfirmBox.data);
        setShowConfirmBox({bool:false, data:''});
        break;
      case "groupProfileDelete":
        handleDeleteExpProf(showConfirmBox.data);
        setShowConfirmBox({bool:false, data:''});
        break;
      case "individualExpenseDelete":
        handleDeleteExp(showConfirmBox.data)
        setShowConfirmBox({bool:false, data:''});
        break;
      case "groupExpenseDelete":
        handleDeleteExp(showConfirmBox.data)
        setShowConfirmBox({bool:false, data:''});
        break;
      case "isSettled":
        changeIsSettledVal(showConfirmBox.data.expense_id,showConfirmBox.data.splitDetails,showConfirmBox.isSettled,paymentMode);
        break;
      case "deleteMember":
        //function to delete members in group
        handleDeleteMember(showConfirmBox.data.member_id,showConfirmBox.data.tour_id, setShowLoading).then((res)=>{
          if(res.bool == true){
            if(res.member_id == userId){//When user leave group then we fetch groups again
              getTourExpensesProfiles();
            }else{
              const newArr = selectedTourProf.group_members.filter((elm)=> elm.user_id != res.member_id)
              const arr = tourPr.groupTourData.map((elm)=>{
                if(elm._id == selectedTourProf._id){
                  return {...elm, group_members: newArr}
                }else{
                  return elm;
                }
              });
              setTourPr((prev)=>({...prev,groupTourData:arr }));
              setSelectedTourProf((prev)=>({...prev, group_members:newArr}));
            }
            setShowConfirmBox({bool:false, data:'', work:''});
          }else{
            setShowConfirmBox({bool:false, data:'', work:''});
          }
        })
        break;
      case "addMember":
        //function to delete members in group
        handleAddMember(showConfirmBox.data, selectedTourProf._id, setShowLoading).then((res)=>{
          if(res.bool == true){
            const arr = tourPr.groupTourData.map((elm)=>{
              if(elm._id== selectedTourProf._id){
                return {...elm, group_members: [...selectedTourProf.group_members, res.data]}
              }else{
                return elm;
              }
            });
            setTourPr((prev)=>({...prev, groupTourData:arr}));
            setSelectedTourProf((prev)=>({...prev, group_members:[...prev.group_members, res.data]}));
            setShowConfirmBox({bool:false, data:'', work:''});
          }else{
            setShowConfirmBox({bool:false, data:'', work:''});
          }
        })
        break;
      default:
      alert('Error');
      break;
    }
  }
  async function handleProfChanges(){
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses/profileUpdate`,{
        method:'PATCH',
        headers:{
          'content-type': "application/json"
        },
        body: JSON.stringify({tour_id: selectedTourProf._id, ...someProfData})
      });
      const finalRes = await result.json();

      if(!finalRes.updated){
        alert('failed! Try again later');
      }else if(finalRes.failed){
        alert('Error from backend! Try again later');
      }
      else{
        alert('Changes save successfully');
        window.location.reload();
      }
    } catch (error) {
      alert('FrontEnd Error! Try again later');
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
    });
    }
  }
    function showHideOldProfBar(){
        dispatch(showHideOldExpProfBar(false));
    }

  function fun(){
    setSomeProfData({
      totalBudget: selectedTourProf.budget.$numberDecimal,
      description: selectedTourProf.description || 'empty',
      startDate: new Date(selectedTourProf.start_date).toLocaleDateString(),
      ...(selectedTourProf.end_date && {endDate: new Date(selectedTourProf.end_date).toLocaleDateString()}),
      locations: selectedTourProf.locations
    })
  }
  
  useEffect(()=>{
    if(selectedTourProf){
      if(selectedTourProf.type === "Group"){
        setIndExpData([]);
        if(selectedTourProf.expenses.length===0){
          setShowTourExp(false);
          return;
        }
        setShowTourExp(true);
        setGroupExpData(selectedTourProf.expenses);
        handleShowDetails(selectedTourProf.expenses);
        handleBarPieChart(selectedTourProf.expenses,selectedTourProf.budget)
      }else{//Individual
        setGroupExpData([]);
        if(selectedTourProf.expenses.length===0){
          setShowTourExp(false);
          return;
        }
        setShowTourExp(true);
        setIndExpData(selectedTourProf.expenses);
        handleBarPieChart(selectedTourProf.expenses,selectedTourProf.budget)
      }
      const currentVal = calTotalCurAm(selectedTourProf.expenses);
      // console.log(selectedTourProf)
      // const currentB = Number((selectedTourProf.budget.$numberDecimal - currentVal).toFixed(2));
      setCurrentBudget(currentVal);
      fun();
    }
  },[selectedTourProf]);

  useEffect(()=>{
    getTourExpensesProfiles();//used to call all tour profiles
    // fun();
  },[]);

  // useEffect(()=>{
  //   if(showAnalysis && selectedTourProf){
  //     // handleBarPieChart(selectedTourProf.expenses,selectedTourProf.budget)
  //   }
  // },[showAnalysis])  

  // useEffect(()=>{
  //   if(showPayBackBox){
  //     // handleShowDetails(selectedTourProf.expenses);
  //   }
  // },[showPayBackBox])
  // useEffect(()=>{
  //   console.log(selectedTourProf);
  // },[selectedTourProf]);

  return (
    <div id="tourMainDiv_TE">
      {/* Below code is execute when tour profiles are not exists */}
      {tourPr!== null && tourPr === false &&
        <div>
          <BodyNavbar/>
          <div style={{width:'35%', margin:'auto'}}>
            <img src="./empty.jpg" style={{width:'100%'}} alt="error" />
          </div>
          <div id="new_expense_profile_div" style={{margin:'auto'}} onClick={() => setShowCreateTourProf(true)}>
            <button>create new expense profile</button>
         </div>
        </div>
      }

      {/* below code is used to create new tour profile */}
      { showCreateTourProf && 
        <CreateNewTourProf
          setShowCreateTourProf = {setShowCreateTourProf}
          availMemList= {availMemList}
          getTourExpensesProfiles = {getTourExpensesProfiles}
          userName={userName}
          profile_image = {profileImg}
        />
      }

      {/* Below part show old created expense profiles */}
      {/* tourPr[0] contain array of individual tour profiles */}
      { selectedTourProf && tourPr &&
      <div id="mainOldTourProfDiv_TE" className={showHideProfBar?'showOldExpProfBar':''}>
        <div id="oldTourExpenseBody" >
          { tourPr && tourPr.individualTourData.length > 0 && 
          <>
          <h2 id="tourHeading">Individual Tours:</h2>
            <div id="all_expenese_profile">
              {tourPr.individualTourData.map((elm, index) => (
                <div 
                  key={index} 
                  id="each_expense_profile" 
                  style={{
                    backgroundColor: selectedTourProf._id == elm._id?"#AFEFEF":"rgba(0, 0, 0, 0.8)",
                    color: selectedTourProf._id == elm._id?"black":"white",
                    boxShadow: selectedTourProf._id == elm._id?"-1px 1px 4px 1px #000000a1":""
                  }} 
                  onClick={()=>{setSelectedTourProf(elm), setShowAnalysis(false), setTableData([])}}
                >
                  <h3 id="eachProfHeading">Profile name: {elm.name}</h3>
                  <div id="eachProfDetails">
                    <p>start date: {new Date(elm.start_date).toLocaleDateString()}</p>
                    { elm.end_date && <p>end date: {new Date(elm.end_date).toLocaleDateString()}</p>}
                      <p>total budget: {elm.budget.$numberDecimal}</p>
                      <p>Description: {elm.description || 'empty'}</p>
                      <div id="deleteExpProfDiv">
                        <button 
                          style={{
                              color: selectedTourProf._id == elm._id?"white":"black",
                              backgroundColor: selectedTourProf._id == elm._id?"rgba(0, 0, 0, 0.8)":'white',
                          }}
                          onClick={()=>setShowConfirmBox({bool:true, work:'individualProfileDelete', data: elm._id})}
                        >Delete</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          </>
          }
          { tourPr && tourPr.groupTourData.length > 0 && 
          <>
          <h2>Group Tours:</h2>
            <div id="all_expenese_profile">
              {tourPr.groupTourData.map((elm, index) => (
                <div 
                  key={index} 
                  id="each_expense_profile" 
                  style={{
                    backgroundColor: selectedTourProf._id == elm._id?"#AFEFEF":"rgba(0, 0, 0, 0.8)",
                    color: selectedTourProf._id == elm._id?"black":"white",
                    boxShadow: selectedTourProf._id == elm._id?"-1px 1px 4px 1px #000000a1":""
                  }}
                  onClick={()=>{setSelectedTourProf(elm), setShowAnalysis(false), setTableData([])}}
                >
                  <h3>Profile Name: {elm.name}</h3>
                <p>start date: {new Date(elm.start_date).toLocaleDateString()}</p>
                { elm.end_date && <p>end date: {new Date(elm.end_date).toLocaleDateString()}</p>}
                <p>Total budget: {elm.budget.$numberDecimal}</p>
                <p>Description: {elm.description || "empty"}</p>
                  {selectedTourProf.admin_id == userId && <div id="deleteExpProfDiv">
                    <button 
                      style={{
                          color: selectedTourProf._id == elm._id?"white":"black",
                          backgroundColor: selectedTourProf._id == elm._id?"rgba(0, 0, 0, 0.8)":'white',
                      }}
                      onClick={()=>setShowConfirmBox({bool:true, work:'groupProfileDelete', data: elm._id})}
                    >Delete</button>
                  </div>}
                </div>
              ))}
          </div>
          </>
          }

          <div id="new_expense_profile_div" onClick={() => setShowCreateTourProf(true)}>
              <button>Create New Expense Profile</button>
          </div>
        </div>
        <div id='leftToRightBtn'>
                    <img src="leftArrow.png" alt="error" onClick={showHideOldProfBar} />
                </div>
      </div>}
      
      {/* When list of individual or group tour's expenses empty  */}
      {showTourExp!== null && showTourExp === false &&
        <div style={{flex:'1'}}>
          <BodyNavbar/>
          
          <div id='emptyExpenseListMain'>
            <div id='emptyExpenseList'>
              <img src="./emptyExpenses.jpg" style={{width:'100%'}} alt="error" />
            </div>
            <div
              id="addExpense" 
              onClick={()=>{
                  if(selectedTourProf.type === "Group"){
                    setShowCreateGroupExp(true);
                  }else{
                    setShowCreateIndExp(true);
                  }
              }}
            >
              <button onClick={()=>{
                if(selectedTourProf.type === "Individual"){
                  setShowCreateIndExp(true);
                }else{
                  setShowCreateGroupExp(true);
                }
              }}>Add Expense</button>
            </div>
          </div>
        </div>
      }

      {/* create expense for individual tour */}
      {showCreateIndExp 
        && <CreateIndividualExp
              setShowCreateIndExp= {setShowCreateIndExp}
              getExpenses = {getExpenses}
              categories = {categories}
              locations = {selectedTourProf.locations}
              tour_id = {selectedTourProf._id}
              tour_type = {selectedTourProf.type}
              setShowLoading = {setShowLoading}
            />}

      {/* create expense for group tour */}
      {showCreateGroupExp && 
        <CreateGroupExp 
          setShowCreateGroupExp={setShowCreateGroupExp} 
          collectGroupExpData = {collectGroupExpData} 
          setCollectGroupExpData = {setCollectGroupExpData}
          groupMembers = {selectedTourProf.group_members}
          categories = {categories}
          tour_id={selectedTourProf._id}
          locations = {selectedTourProf.locations}
          getExpenses = {getExpenses}
          selectedGroup = {selectedTourProf}
          setShowLoading={setShowLoading}
        />}

      {/* Below Code Show Expense List */}
      {showTourExp  && someProfData!=null &&  <div id="mainTourExpDiv_TE" style={{flex:1}}>
        <BodyNavbar/>
          <div id="groupTravelProfDetails">
              <div id='expenseProfileDetail_TE' style={{marginTop:'unset', position:'relative'}}>
                <div id="editProfile_TE" style={{width:'7%'}} onClick={()=>setEditProf(!editProf)}>
                  <img src="edit.png" alt="error" />
                </div>
                <h2>Profile Name: {selectedTourProf.name}</h2>
                <div id="profDivInputs_TE">
                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                            <div style={{display:'grid', gap:'20px', whiteSpace:'nowrap'}}>
                                <p><strong>Toal Budget:</strong></p>
                                <p><strong>Current Amount:</strong></p>
                                <p><strong>Start Date:</strong> </p>
                                {selectedTourProf && selectedTourProf.end_date &&<p><strong>End Date:</strong> </p>}
                            </div>
                            <div style={{display:'grid', gap:'20px'}}>
                                <input type="text" onChange={(e)=>setSomeProfData((prev)=>({...prev, totalBudget:e.target.value}))}  value={0||someProfData.totalBudget} disabled={!editProf?true:false} />
                                <p>₹{currentBudget.toFixed(2)}</p>
                                <input type="text" value={someProfData.startDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, startDate:e.target.value}))} disabled={!editProf?true:false} />
                                {selectedTourProf && selectedTourProf.end_date && <input type="text" value={someProfData.endDate} onChange={(e)=>setSomeProfData((prev)=>({...prev, targetDate:e.target.value}))} disabled={!editProf?true:false} />}
                            </div>
                        </div>
                    {/* <h3>Locations: </h3>
                    {someProfData.locations.map((elm, idx) => (
                      <input
                        key={idx}
                        value={elm}
                        onChange={(e) =>
                          setSomeProfData((prev) => ({
                            ...prev,
                            locations: prev.locations.map((loc, i) =>
                              i === idx ? e.target.value : loc
                            ), // Update only the changed location
                          }))
                        }
                        disabled={!editProf}
                      />
                    ))} */}
                    <h3>Locations:</h3>
                    {someProfData.locations.map((elm, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: 'center', flexDirection:'row' }}>
                        <input
                          value={elm}
                          onChange={(e) =>
                            setSomeProfData((prev) => ({
                              ...prev,
                              locations: prev.locations.map((loc, i) =>
                                i === idx ? e.target.value : loc
                              ),
                            }))
                          }
                          disabled={!editProf}
                        />
                        {editProf && (
                          <img src="removeMember.png" style={{width:"35px", cursor:"pointer"}} onClick={() =>
                            setSomeProfData((prev) => ({
                              ...prev,
                              locations: prev.locations.filter((_, i) => i !== idx),
                            }))
                          }/>                            
                        )}
                      </div>
                    ))}
                    <div style={{flexDirection: 'row'}}>
                      <p><strong>Description:</strong></p>
                      <textarea name="" id="profDescription_T" value={someProfData.description} onChange={(e)=>setSomeProfData((prev)=>({...prev, description:e.target.value}))} disabled={!editProf?true:false}/>
                    </div>
                    <div style={{flexDirection:'row', gap:'5px'}}>
                      {editProf && (
                        <button
                          id="addLocationBtn_TE"
                          onClick={() =>
                            setSomeProfData((prev) => ({
                              ...prev,
                              locations: [...prev.locations, ""], // Add a new empty location
                            }))
                          }
                        >
                          ➕ Add Location
                        </button>
                      )}

                      { editProf && <button id="profChangesBtn_TE" onClick={handleProfChanges}>Save Changes</button>}
                    </div>
                </div>
              </div>
              {/* <div id="locationsGroupTravel">
                <div id="editProfile_TE">
                  <img src="edit.png" alt="error" />
                </div>
              </div> */}
          </div>    
            {/* expense list for individual tour */}
            {indExpData && indExpData.length > 0 && 
              <IndivExpenseList
                indExpData = {indExpData}
                setShowConfirmBox = {setShowConfirmBox}
                showAnalysis = {showAnalysis}
                setShowAnalysis = {setShowAnalysis}
                setShowCreateIndExp = {setShowCreateIndExp}
              />
            }
            {/* expense list for group tour */}
            {
              groupExpData && groupExpData.length>0 &&
              <GroupExpenseList
                userName={userName}
                profileImg={profileImg}
                groupId = {selectedTourProf._id}
                groupName = {selectedTourProf.name}
                groupExpData = {groupExpData}
                setGroupExpData = {setGroupExpData}
                setShowConfirmBox = {setShowConfirmBox}
                setShowCreateGroupExp = {setShowCreateGroupExp}
                showPayBackBox = {showPayBackBox}
                setShowPayBackBox = {setShowPayBackBox}
                showAnalysis = {showAnalysis}
                setShowAnalysis = {setShowAnalysis}
                setShowLoading = {setShowLoading}
              />
            }
            {/* View settlement Div (Accordion Menu) */}
            {/* {showPayBackBox && tableData.length > 0 && (
              <div style={{ marginTop: "20px" }}>
              {tableData.map((item, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                  <button
                      onClick={() => handleAccordionToggle(index)}
                      style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: activeIndex === index ? "#f0f0f0" : "#ddd",
                      border: "1px solid #ccc",
                      textAlign: "left",
                      cursor: "pointer"
                      }}
                  >
                      {item.payee} have to pay back to {item.payer} ({item.expenseName})
                  </button>

                  Accordion Content
                  {activeIndex === index && (
                      <div
                      style={{
                          border: "1px solid #ccc",
                          borderTop: "none",
                          padding: "10px",
                          backgroundColor: "#f9f9f9"
                      }}
                      >
                      <p><strong>Expense Name:</strong> {item.expenseName}</p>
                      <p><strong>Total Expense:</strong> ₹{item.totalAmount.toFixed(2)}</p>
                      <p><strong>{item.payee} has to pay back:</strong> ₹{item.paybackAmount.toFixed(2)}</p>
                      </div>
                  )}
                  </div>
              ))}
              </div>
            )} */}
            {showPayBackBox && tableData.length > 0 && (
                <div className="table-container" style={{marginBottom:'100px'}}>
                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Expense Name</th>
                                <th>Expense Amount</th>
                                <th>Payer Name</th>
                                <th>Payee Name</th>
                                <th>Payer Amount</th>
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
            {showAnalysis && selectedTourProf && selectedTourProf?.expenses.length>0 && <div id='mainAnalysis_TME'>
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
                    <div id="mainVisualCharts">
                        {barChartData && <div id="barchartData">
                        <Bar 
                            data={barChartData} 
                            options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Expenses by Category" } } }} 
                        />
                        </div>}
                        {subBarChartData && <div id="subBarchartData">
                        <Bar 
                            data={subBarChartData} 
                            options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Expenses by Subcategory" } } }} 
                        />
                        </div>}
                        {pieChartData && (
                        <div id="pieChartData">
                            <Pie 
                            data={pieChartData.data} 
                            options={pieChartData.options} 
                            plugins={[ChartDataLabels]} 
                            />
                        </div>
                        )}
                    </div>
            </div>}

        </div>}
      
      { tourPr && selectedTourProf && selectedTourProf.type == "Group" &&
            <GroupMembers
              group_members = {selectedTourProf.group_members}
              admin_id = {selectedTourProf.admin_id}
              availMemList = {availMemList}
              setShowConfirmBox = {setShowConfirmBox}
              tour_id={selectedTourProf._id}
              handleDeleteExpProf={handleDeleteExpProf}
              handleMakeAdmin = {handleMakeAdmin}
              setShowLoading = {setShowLoading}
            />
      }

      {/* Below code take permission before going to delete group profile*/}
      {showConfirmBox.bool && <div id='delExpProfDiv_TME'>
        <div>
            <h3 style={{textAlign: 'center'}}>Are you sure?</h3>
        </div>
        <div id='delExpProfDiv_TME_BTNDIV'>
            {showConfirmBox.work == "isSettled"?
            <>
              <button onClick={()=>handleFun("Online")}>Online</button>
              <button onClick={()=>handleFun("Cash")}>Cash</button>
            </>
            :
              <button onClick={handleFun}>Yes</button>
            }
            <button onClick={()=> setShowConfirmBox({bool:false, data:''})}>No</button>
        </div>
      </div>}
      {showLoading? <Loader/>:null}
      </div>
  );
}

