import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar/navbar';
import Body from './Body/body';
import "./homepage.css";
import SearchFriends from '../Search Friends/searchFriends';
import MoneyRequests from '../Money Requests/moneyRequests';
import Transactions from '../Transactions/transactions';
import Reports from '../Reports/reports';
import  Loader  from '../Loader/loader';

export default function Hompage() {
  const [currentComp, setCurrentComp] = useState('Home');
  const [userData, setUserData] = useState();
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  //670e95486dcd2b58d76a99e3 --> alice
  // const user_id = localStorage.getItem('Spending_Smart_User_id');
  localStorage.setItem('Spending_Smart_User_id','67b5603143fbb82dca78bf50');
  const user_id = '67b5603143fbb82dca78bf50';
  
  function checkLogined(){
    if(!user_id){
      navigate('/signin');
    }
    return true;
  }
  // 670e95486dcd2b58d76a99e5 --> alice brown
  // function func(){
  //   localStorage.setItem('user_id','670e95486dcd2b58d76a99e3');
  // }
  const [selected, setSelected] = useState(0);

  const handleClick = (index) => {
    setSelected(index); // Set the clicked index as selected
  };

  async function callUserData(){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/user?user_id=${user_id}`,{
            method:'GET',
            headers:{
                'content-type':'application/json'
            }
        });
        const finalResult = await result.json();
        if(finalResult){
          setUserData(finalResult);
        }else if(finalResult.notFound){
            alert('user data not found in server');
            setUserData(null);
        }else if(finalResult.failed){
            alert('error come from backend(/user)');
            setUserData(null);
        }

    } catch (error) {
     alert('error while get data from user');
     console.log(error);   
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
      },2000)
    }
  }

  function showComponent(){
    if(!userData)
      return;

    switch(currentComp){
      case 'Home':
        return <Body 
          friendRequests = {userData?.friendRequest_come} 
          moneyRequests={userData?.money_request}
          LastTransactions = {userData?.transactions?.slice(-3)} 
          reqGetterName={userData.name} 
          reqGetterProfileImg={userData.profile_image} 
          callUserData={callUserData}
          setCurrentComp = {setCurrentComp}
          handleClick={handleClick}
          />
      
      case 'Search Friend':
        return <SearchFriends userData={userData}/>
      
      case 'Requests':
        return <MoneyRequests moneyRequests={userData.money_request} callUserData={callUserData} user_id={user_id}/>
      
      case 'Transactions':
        return <Transactions data = {userData}/>;

      // case 'Reports':
      //   return <Reports/>;

      default:
        alert('Error in homepage');
        return 
    }
  }
  useEffect(()=>{
    // func();
    const bool = checkLogined();
    if(bool){
      callUserData();
    }
  },[])
  return (
    <div id="main_homepage">
      <Navbar 
        setCurrentComp={setCurrentComp} 
        userImg={userData?.profile_image} 
        userName= {userData?.name} 
        handleClick={handleClick} 
        selected={selected} 
      />

      {
        showComponent(currentComp)
      }
      {/* <Loader/> */}
      {showLoading?<Loader/>:null}
    </div>
  )
}
