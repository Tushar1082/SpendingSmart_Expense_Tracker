import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../Loader/loader';
import { showHideHamMenu, showHideOldExpProfBar } from '../../../services/actions/actions';
import {useDispatch, useSelector} from 'react-redux';
import './bodyNavbar.css';

export default function BodyNavbar() {
  const [frNotif, setFrNotif] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showNotifAlert,setShowNotifAlert] = useState(false);
  // const [notifReaded, setNotifReaded] = useState(false);
  const [profImg, setProfImg] = useState('');
  const [showLoading, setShowLoading] = useState();
  const {showHamMenu, showHideProfBar, changeNavColor } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const notifRef = useRef();
  const user_id = localStorage.getItem('Spending_Smart_User_id');

  async function handleGetNotification(){
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user?user_id=${user_id}`,{
        method:'GET',
        headers:{
          'content-type':'application/json'
        }
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('error from backend');
      }else if(finalResult.notFound){
        alert('fail');
      }else{
        const arr = finalResult.notifications;
        setProfImg(finalResult.profile_image);

        let frArr=[];
        // let MoneyArr=[];
        arr.forEach((elm)=>{
          if(elm.type === "Friend_Request"){
            frArr.push({_id:elm.notification_id,date:elm.date, profile_image: elm.sender_profile_image, message:elm.message, status:elm.status});
          }
          if(elm.status === "Unread"){
            setShowNotifAlert(true);
          }
        });
        setFrNotif(frArr);
      }
    } catch (error) {
      alert('error from here');
      console.log(error);      
    }finally{
      setShowLoading(false);
    }
  }
  async function handleNotifReaded(){
    try {
      setShowLoading(true);
      let notifArr=[];

      frNotif.forEach((elm)=>{
        if(elm.status === "Unread")
          notifArr.push(elm._id);
      })
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user`,{
        method: 'PUT',
        headers:{
          'content-type': 'application/json'
        },
        body: JSON.stringify({notifArr:notifArr, user_id})
      });
      const finalResult = await result.json();

      if(finalResult.updated){
        alert('Status for notification is set to READ');
        setShowNotifAlert(false);
      }else if(!finalResult.updated){
        alert('fail to set Status to READ for notification');
      }else{
        alert('error from backend');
      }
    } catch (error) {
      alert('error from here');
      console.log(error);
    }finally{
    setShowLoading(false);
  }
  }
  async function handleHideNotif() {
    const notif = notifRef.current;

    if(notif){
      notif.style.animation = "leftToRightND 0.5s ease-out";

      setTimeout(()=>{
        setShowNotif(false);
      },400);
    }
  }
  useEffect(()=>{
      handleGetNotification();
  },[]);
  useEffect(()=>{
    let val = null;
    if(showNotif && frNotif.length>0 && showNotifAlert){
      val = setTimeout(()=>{
        handleNotifReaded();
        val = null;
      },2000)
    }else{
      if(val === null)
        return;
      
      clearTimeout(val);
    }
  },[showNotif]);
  function handleShowHideOldExpProf(){
    dispatch(showHideOldExpProfBar(true));
  }
  return (
    <>
    <div id='mainBodyNavbar' className={changeNavColor?'mainBodyNavbar':''}>
      <div id='hamMenuDiv_BNAV' onClick={()=>{setShowNotif(false), dispatch(showHideHamMenu(!showHamMenu), handleShowHideOldExpProf())}}>
        <img src="hamMenu.png" alt="error" />
      </div>
      <div id='logoDiv' onClick={()=>window.location.href="/"}>
        <div>
          <img src="./logo.png" alt="error" />
        </div>
        <div>
          <img src="./logoTitle.png" alt="error" />
        </div>
      </div>

      <div id='bodyNavbar'>
        <Link onClick={()=>window.location.href="/"} id="homeNavigation_BN">
          <img src="./home.png" alt="error" />
          <span>Home</span>
        </Link>
        <Link to="/userProfile">
          <img src={ profImg || "./dummyProfileImg.png"} alt="error" id='profImgBN' />
          <span>Profile</span>
        </Link>
        <Link to="/friends">
          <img src="./friends.png" alt="error" />
          <span>Friends</span>
        </Link>
        <Link onClick={()=>{setShowNotif(true), dispatch(showHideHamMenu(false))}}>
          <div id='notifiIconDiv'>
            <img src="./notifications.png"  alt="error" />
            {showNotifAlert?<span></span>:null}
          </div>
          <span>Notifications</span>
        </Link>
      </div>
      {showNotif && 
      <div id='NotificationDiv' style={{width:frNotif.length>0?'max-content':'25%'}} ref={notifRef}>
        <div id='hideNotifDiv'>
              {/* <button onClick={()=>setShowNotif(false)}> &#x21E5; </button> */}
              <button onClick={handleHideNotif}> &#x21E5; </button>
        </div>
          {/* show friend request result */}
          {frNotif.length>0 && <div id='mainFriendReqDiv'>
          <div style={{marginBottom:'10px'}}>
            <h2>Friend Request Result: -</h2>
          </div>
            {frNotif.map((elm,idx)=>(
              <div key={idx} id='notificationCard'>
                {/* <p>{new Date(elm.date).toLocaleDateString()}</p> */}
                <p>{new Date(elm.date).toLocaleString()}</p>
                <div id='messageDiv'>
                  <img src={elm.profile_image} alt="error" />
                  <span>{elm.message}</span>
                </div>
              </div>
            ))}
          </div>}
          {frNotif.length==0 && 
            <div id='emptyNotifDiv'>
              <img src="./emptyNotificaitonList.jpg" alt="error" 
              style={{width:'100%'}} 
              />
            </div>
          }
          {/* show when money payed back */}
      </div>}
  </div>
  {showLoading?<Loader/>:null}
          </>
  )
}
