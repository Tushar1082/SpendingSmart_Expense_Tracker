import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './body.css';
import { changeBodyNavColor } from '../../../services/actions/actions';
import BodyNavbar from './bodyNavbar';
import Footer from '../Footer/footer';
import Loader from '../../Loader/loader';

export default function Body({friendRequests,moneyRequests,LastTransactions,callUserData,reqGetterName,reqGetterProfileImg,setCurrentComp,handleClick}) {
  const slider = [
    {
      source: "https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2Fslider%2FtrackExpensesEffortlessly.webp?alt=media&token=9eed43b0-5cb5-4f96-92a5-ef3d466d6635"
      ,
      // source:'./slider/trackExpensesEffortlessly.jpg',
      title:'Track Your Expenses Effortlessly',
      description:'Monitor daily, monthly, and yearly expenses at a glance. Stay on top of your spending like never before!',
      link: './trackMyExpenses'
    },
    {
      // source:'./slider/savingGoals.jpg',
      source: 'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2Fslider%2FsavingGoals.webp?alt=media&token=f2a2867d-f652-475b-bd56-77a34f81487b'
      ,title:'Set and Achieve Saving Goals',
      description:'Plan your savings and watch your progress grow. Make your financial dreams a reality.',
      link: './savingGoals'
    },
    {
      // source:'./slider/analyze.jpg',
      source: 'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2Fslider%2Fanalyze.webp?alt=media&token=8f5d544e-b2d3-4c38-a96f-316c364ffa7a',
      title:'Analyze and Optimize Spending',
      description:'Gain insights into your spending patterns and make smarter financial decisions.',
    },
    {
      // source:'./slider/collaborateWithFriends.jpg',
      source:'https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2Fslider%2FcollaborateWithFriends.webp?alt=media&token=8e72118f-8eef-4ae5-97d0-0cb0a1a9a9df',
      title:'Collaborate with Friends',
      description:'Easily track group expenses and share costs with your friends. Simplify financial planning together.',
      link: './groupExpenses'
    }
  ];
  const [showFriendReqDia,setShowFriendReqDia] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const currentSlide = slider[currentIndex];
  const user_id = localStorage.getItem('Spending_Smart_User_id');
  const [showLoading, setShowLoading] = useState(false);
  const dispatch = useDispatch();
  
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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slider.length); // Cycles back to the first slide
      setTimeout(()=>setAnimate(true),100);
    }, 3000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <BodyNavbar/>
    <div id='mainBodyDiv'>
      <div 
        id='sliderDiv'
        className={animate ? 'animate notRespView' : ''}
      >
        <div>
          <img 
            src={currentSlide.source} 
            alt="error" 
            fetchPriority={currentSlide.title==='Track Your Expenses Effortlessly'?'high':'low'}
            loading='lazy'
          />
        </div>
        <div>
          <h2>{currentSlide.title}</h2>
          <p>{currentSlide.description}</p>
          {currentSlide.title!=="Analyze and Optimize Spending"?<Link to={currentSlide.link}><button>Begin</button></Link>:null}
        </div>
      </div>

      <div 
        id='sliderDiv'
        className={animate ? 'animate responiveView' : ''}
      >
        <div>
          <img 
            src={currentSlide.source} 
            alt="error" 
            fetchPriority={currentSlide.title==='Track Your Expenses Effortlessly'?'high':'low'}
            loading='lazy'
          />
        </div>
        <div>
          <h2>{currentSlide.title}</h2>
          <p>{currentSlide.description}</p>
          {currentSlide.title!=="Analyze and Optimize Spending"?<Link to={currentSlide.link}><button>Begin</button></Link>:null}
        </div>
      </div>

      <div id='servicesMain'>
        <div id='servicesHeading'>
          <h1>Our Services</h1>
        </div>
        <div id='mainServices'>
          <div id='cardDiv_Body'>
            <div id='cardDivImg_Body'>
              <img loading='lazy' src="https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FtrackMyExpenses.webp?alt=media&token=e1700af1-ac43-4502-a876-29c387c0d51c" alt="error" />
            </div>
            <div id='cardDivContent_Body'>
              <div>
                <ul style={{display:'grid', gap:'5px'}}>
                  <li>Create & manage expense profiles. Each Profile have their own expense list</li>
                  <li>Categorize spending for better insights</li>
                  <li>Easily create, manage and delete expenses in expense list</li>
                  <li>Visual analysis to track financial habits</li>
                </ul>
              </div>
              <div>
                <p>Click to explore and start tracking now!</p>
              </div>
              <div style={{textAlign:'center', marginTop:'0.5rem'}}>
                <Link to='/trackMyExpenses' id='cardBtn_Body'>Track My Expenses</Link>
              </div>
            </div>
          </div>

          <div id='cardDiv_Body'>
            <div id='cardDivImg_Body'>
              <img loading='lazy' src="https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FgroupExpenses.webp?alt=media&token=b5d9d02b-8739-4608-a583-7d6edff982a3" alt="error" />
            </div>
            <div id='cardDivContent_Body'>
              <div>
                <ul style={{display:'grid', gap:'5px'}}>
                  <li>Create & manage group expense profiles. Each Profile have their own expense list</li>
                  <li>Add, track, and split expenses in real time</li>
                  <li>Ensure fair contribution and easy settlements</li>
                  <li>Easily create, manage and delete expenses in expense list</li>
                  <li>Visual analysis to track financial habits</li>
                </ul>
              </div>
              <div>
                <p>Click to organize group expenses now!</p>
              </div>
              <div style={{textAlign:'center', marginTop:'0.5rem'}}>
                <Link to="/groupExpenses" id='cardBtn_Body'>Group Expenses</Link>
              </div>
            </div>
          </div>

          <div id='cardDiv_Body'>
            <div id='cardDivImg_Body'>
              <img loading='lazy' src="https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FtravelExpenses.webp?alt=media&token=9da5600c-9af2-4db8-a42c-c40982f37125" alt="error" />
            </div>
            <div id='cardDivContent_Body'>
              <div>
                <ul style={{display:'grid', gap:'5px'}}>
                  <li>Create separate profiles for personal & group travel. Each Profile have their own expense list</li>
                  <li>Add, categorize, and track expenses in real time</li>
                  <li> Split costs fairly with friends & settle balances easily</li>
                  <li>Visual analysis to track financial habits</li>
                </ul>
              </div>
              <div>
                <p>Click to start tracking your travel expenses now!</p>
              </div>
              <div style={{textAlign:'center', marginBottom:'1.5rem', marginTop:'0.5rem'}}>
                <Link to="/travelExpenses" id='cardBtn_Body'>Travel Expenses</Link>
              </div>
            </div>
          </div>

          <div id='cardDiv_Body'>
            <div id='cardDivImg_Body'>
              <img loading='lazy' src="https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FrecurringExpenses.webp?alt=media&token=0e7b58ba-0585-4bbe-a32f-02203d7e7352" alt="error" />
            </div>
            <div id='cardDivContent_Body'>
              <div>
                <ul style={{display:'grid', gap:'5px'}}>
                  <li>Create & track recurring expense profiles. Each Profile have their own expense list</li>
                  <li>Analyze spending patterns for better budgeting</li>
                  <li>Easily create, manage and delete expenses in expense list</li>
                  <li>Visual analysis to track financial habits</li>
                </ul>
              </div>
              <div>
                <p>Click to manage your recurring expenses now!</p>
              </div>
              <div style={{textAlign:'center', marginBottom:'1.5rem', marginTop:'0.5rem'}}>
                <Link to="/recurringExpenses" id='cardBtn_Body'>Recurring Expenses</Link>
              </div>
            </div>
          </div>

          <div id='cardDiv_Body'>
            <div id='cardDivImg_Body'>
              <img loading='lazy' src="https://firebasestorage.googleapis.com/v0/b/ecommercewebapp-40db9.appspot.com/o/SpendingSmart%2FsiteOwnData%2FourServices%2FsavingGoals.webp?alt=media&token=0810db9e-f5e9-4f09-8f57-28b8cc4efe79" alt="error" />
            </div>
            <div id='cardDivContent_Body'>
              <div>
                <ul style={{display:'grid', gap:'5px'}}>
                  <li>Create & track multiple saving goals.</li>
                  <li>Monitor progress with real-time updates</li>
                  <li>Easily manage adjustments by depositing or withdrawing</li>
                </ul>
              </div>
              <div>
                <p>Click to start saving smarter today!</p>
              </div>
              <div style={{textAlign:'center', marginBottom:'1.5rem', marginTop:'0.5rem'}}>
                <Link to="/savingGoals" id='cardBtn_Body'>Saving Goals</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

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

