import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './body.css';
import { changeBodyNavColor } from '../../../services/actions/actions';
import BodyNavbar from './bodyNavbar';
import Footer from '../Footer/footer';
import Loader from '../../Loader/loader';


function MainServices({ourSRef}){

  const services = [
    {
      id:1,
      name:"Track My Expenses",
      image:'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FtrackMyExpenses.webp?alt=media&token=e1700af1-ac43-4502-a876-29c387c0d51c',
      url:'/trackMyExpenses',
      description:'Click to explore and start tracking now!'
    },
    {
      id:2,
      name:"Group Expenses",
      image:'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FgroupExpenses.webp?alt=media&token=b5d9d02b-8739-4608-a583-7d6edff982a3',
      url: '/groupExpenses',
      description:'Click to organize group expenses now!'
    },
    {
      id:3,
      name:"Travel Expenses",
      image:'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FtravelExpenses.webp?alt=media&token=9da5600c-9af2-4db8-a42c-c40982f37125',
      url:'/travelExpenses',
      description:'Click to start tracking your travel expenses now!'
    },{
      id:4,
      name:"Recurring Expenses",
      image:'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FrecurringExpenses.webp?alt=media&token=0e7b58ba-0585-4bbe-a32f-02203d7e7352',
      url: '/recurringExpenses',
      description:'Click to manage your recurring expenses now!'
    },{
      id:5,
      name:"Saving Goals",
      image:'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FsavingGoals.webp?alt=media&token=0810db9e-f5e9-4f09-8f57-28b8cc4efe79',
      url:'/savingGoals',
      description:'Click to start saving smarter today!'
    }
  ]
  return(
    <div id='servicesMain'>
    <div id='servicesHeading' ref={ourSRef}>
      <h1>Our Services</h1>
    </div>
    <div id='mainServices'>

    </div>
    <div id='mainServices'>
      {
        services.map((elm,idx)=>(
        <div id='cardDiv_Body' key={elm.id}>
          <div id='cardDivImg_Body'>
            <img loading='lazy' src={elm.image} alt="error" />
          </div>
          <div id='cardDivContent_Body'>
            <div>
              <p>{elm.description}</p>
            </div>
            <div style={{textAlign:'center', margin:'0.5rem auto'}}>
              <Link to={elm.url} id='cardBtn_Body'>{elm.name}</Link>
            </div>
          </div>
        </div>

        ))
      }
    </div>
  </div>
  );
}

export default function Body({friendRequests,moneyRequests,LastTransactions,callUserData,reqGetterName,reqGetterProfileImg,setCurrentComp,handleClick}) {

  const [showFriendReqDia,setShowFriendReqDia] = useState(false);
  const user_id = localStorage.getItem('Spending_Smart_User_id');
  const [showLoading, setShowLoading] = useState(false);
  const dispatch = useDispatch();
  const ourSRef = useRef();

  async function acceptRejReq(requester_id,requesterName,requesterProfileImg, work) {
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/searchFriends`,{
        method:'PUT',
        headers:{
          'content-type': 'application/json'
        },
        body: JSON.stringify({reqGetterId:user_id,requester_id,requesterName,requesterProfileImg, work,reqGetterName,reqGetterProfileImg})
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('fail from backend');
      }else if(!finalResult.updated){
        alert('fail');
      }else{
        alert('success');
        callUserData();
      }

    } catch (error) {
      alert('error from here');
      console.log(error);
    }   finally{
      setShowLoading(false);
    }
  }
  function handleBegin(){
    const ourS = ourSRef.current;
    if(ourS){
      ourS.scrollIntoView({ behavior: 'smooth' });

    }
  }
  

  return (
    <div>
      <BodyNavbar/>
    <div id='mainBodyDiv'>
      {/* <SliderComp/> */}
      <div id='mainHS' className='mobileHS'>
        <div id='heroSecCon'>
          <div>
            <h1>Track, Save, Grow – Your Smart Expense Companion</h1>
          </div>
          <div>
            <p>Stay in control of your finances with our seamless expense tracker. Monitor your spending, set budgets, and achieve financial goals effortlessly. Smart insights, easy tracking, and a stress-free financial future—start today!</p>
          </div>
          <div>
            <button  onClick={handleBegin}>Let's Begin</button>
          </div>
        </div>

        <div id='heroSecConMob'>
          <div>
            <h1>Track Your Expense Smartly</h1>
          </div>
          <div>
            <p>Take control of your finances—track expenses, set budgets, and reach your goals effortlessly.</p>
          </div>
          <div>
            <button onClick={handleBegin}>Let's Begin</button>
          </div>
        </div>
        <div id='heroSecImg'>
          <img src="heroSectionImg.webp" alt="error" loading='lazy' />
        </div>
      </div>
      <MainServices ourSRef={ourSRef}/>

        {/* {friendRequests && friendRequests.length > 0 || moneyRequests && moneyRequests.length>0 &&  */}
        <div style={{marginTop:'30px', padding:'20px'}}>
          <h2>Today's insights</h2>
        </div>
        {/* } */}
      
        <div id='todayInsightsMain'>
          {/*Friend requests  */}
            <div id='mainReq' onClick={()=>setShowFriendReqDia(true)}>
              <div id='todayInsightsDivHead' >
                <p>Friend Requests</p>
                <img src="./rightArrow.png" alt="error" />
              </div>

            { !showFriendReqDia && friendRequests && friendRequests.length > 0? 
                <div>
                  {friendRequests.slice(0, 5).map((elm, idx) => (
                    <div id='ReqestDiv_body' key={idx}>
                      <div style={{ height:'50px', borderRadius: '10px', overflow: 'hidden', display: 'flex', }}>
                        <img src={elm.profile_image||'./dummyProfileImg.png'} alt="error" style={{ width: '100%',objectFit:'cover' }}  />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontSize:'large', textAlign:'left' }}>
                          <strong>{elm.name}</strong> sent a friend request
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Show "more..." if there are more than 5 requests */}
                  {friendRequests.length > 5 && (
                    <div style={{ color: 'white', cursor: 'pointer' }}>
                      <strong>more...</strong>
                    </div>
                  )}
                </div>:
                <div>
                  <p style={{color:'white'}}>Empty...</p>
                </div>
            }

            </div>

            { showFriendReqDia && friendRequests && friendRequests.length > 0 && <div className='mainReq'>
              <div id='FriendReqHeading_body' >
                <h2 style={{marginLeft:'30px', color:'white'}}>Friend Requests</h2>
                <img src="./cross.png" alt="error" onClick={()=>setShowFriendReqDia(false)} />
              </div>
              {/*  */}
                <div>
                  {friendRequests.map((elm, idx) => (
                    <div className='ReqestDiv_body' key={idx}>
                      <div id='friendReqSNo_body'>
                        <p style={{color:'white', fontSize:'x-large'}}>{idx+1}.</p>
                      </div>
                      <div id='friendReqPopMenuProfImg'>
                        <img src={elm.profile_image||'./dummyProfileImg.png'} alt="error" style={{ width: '100%', objectFit:'cover' }}  />
                      </div>
                      <div>
                        <p id='friendReqPopMenuUserName'>
                          <strong>{elm.name}</strong> sent a friend request
                        </p>
                      </div>
                      <div className='friendReqBtnDiv'>
                        <button onClick={()=>acceptRejReq(elm.user_id, elm.name,elm.profile_image, "accept")}>Accept</button>
                        <button onClick={()=>acceptRejReq(elm.user_id, elm.name,elm.profile_image, "reject")}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>}

            {/* Requested money */}
            <div id='mainReq' onClick={()=>{setCurrentComp("Requests"), handleClick(2),dispatch(changeBodyNavColor(true))}}>
              <div id='todayInsightsDivHead'>
                <p>Money Requests</p>
                <img src="./rightArrow.png" alt="error" />
              </div>

              {moneyRequests && moneyRequests.length>0 ? 
              <div>
                {moneyRequests.slice(0,5).map((elm,idx)=>(
                  <div key={idx} id='ReqestDiv_body'>
                    <div style={{width: '100px', borderRadius: '10px', overflow:'hidden', display:'flex'}}>
                      <img src={elm.moneyRequestor_profile_image||"./dummyProfileImg.png"} alt="error" style={{width:'100%', objectFit:'cover'}} />
                    </div>
                    <div>
                      <p style={{color:'white', fontSize:'large'}}> <strong>{elm.moneyRequestor_name}</strong> is requested payment for <strong>{elm.expense_name}</strong> expense from <strong>{elm.from}</strong></p>
                      <p><span style={{fontWeight:'bold', marginTop:'5px'}}>Amount: </span><span>₹{elm.requested_amount.$numberDecimal}</span></p>
                    </div>
                </div>
                ))}
              </div>:
                <div>
                  <p style={{color:'white'}}>Empty..</p>
                </div>
            }
            </div>
          {/* Last transactions */}
          <div id='mainReq'>
            <div id='todayInsightsDivHead'>
                <p>Last Transactions</p>
                <img src="./rightArrow.png" alt="error" />
            </div>
            {LastTransactions && LastTransactions.length>0 ?
              <div id='lastTransCon'>
                {
                  LastTransactions.map((elm,idx)=>(
                    <div key={idx} id='lastTransElm'>
                      <div>
                        <span>Transaction_id: </span>
                        <span>{elm.transaction_id}</span>
                      </div>
                      <div>
                        <span>Expense Name: </span>
                        <span>{elm.expense_name}</span>
                      </div>
                      <div>
                        <span>Expense Amount: </span>
                        <span>{elm.expense_amount.$numberDecimal}</span>
                      </div>
                      <div>
                        <span>Payment Date: </span>
                        <span>{elm.payment_date}</span>
                      </div>
                      <div>
                        <span>Payment Status: </span>
                        <span>{elm.payment_status}</span>
                      </div>
                    </div>
                  ))
                }
              </div>: 
              <div>
                <p style={{color:'white'}}>Empty...</p>
              </div>
            }
          </div>
        </div>
      {/* </div> */}
    </div>
    {showLoading? <Loader/>:null}
    <Footer/>
    </div>
  )
}
