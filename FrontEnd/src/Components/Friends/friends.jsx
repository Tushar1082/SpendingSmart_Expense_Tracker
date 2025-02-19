import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../Loader/loader';
import './friends.css';

export default function Friends() {
  const [data, setData] = useState(null);
  const [profImg, setProfImg] = useState('');
  const [showConfirm,setShowConfirm] = useState({bool:false, data:''});
  const [loading,setLoading] = useState(false);
  const user_id = localStorage.getItem('Spending_Smart_User_id'); 
  
  async function getData(){
    try {
      setLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user?user_id=${user_id}`); 
      const finalResult = await result.json();
      
      if(finalResult.failed){
        alert('error occur while getting data');
        setData(false);
      }else if(finalResult.notFound){
        alert('user not exists');
        setData(false);
      }else
      setProfImg(finalResult.profile_image);
      setData(finalResult.friendList);
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  }
  
  async function handleRemoveFriend(){
    try {
      setLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user/removeFriend`,{
        method:"PATCH",
        headers:{
          'content-type':'application/json'
        },
        body: JSON.stringify({friend_id: showConfirm.data, user_id})
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('failed to remove friend and error from here');
      }else if(!finalResult.updated){
        alert('failed to remove friend');        
      }else{
        location.reload();
      }
      setShowConfirm({bool:false, data:''})
    } catch (error) {
      alert('failed to remove friend and error from here');
      console.log(error);
      setShowConfirm({bool:false, data:''})
    }finally{
      setLoading(false);
    }
  }
  
  useEffect(()=>{
    getData();
  },[])
  return (
    <div id='mainFriends'>
        <div id='friendNavbar'>
          <div id='logoDiv'>
            <div>
              <img src="./logo.png" alt="error" id='loginImgF' style={{width:'80%'}} />
            </div>
            <div>
              <img src="./logoTitle(white).png" alt="error" />
            </div>
          </div>
    
          <div id='bodyNavF'>
            <Link onClick={()=>window.location.href="/"}>
              <img src="./home(white).png" alt="error" />
              <span>Home</span>
            </Link>
            <Link to="/userProfile">
              <img src={ profImg || "./dummyProfileImg.png"} alt="error" style={{width:'40px'}} id='profImgBN' />
              <span>Profile</span>
            </Link>
            <Link to="/friends">
              <img src="./friends(white).png" alt="error" />
              <span>Friends</span>
            </Link>
          </div>
        </div>
        { data==false &&
            <div id='emptyFriendListDiv'>
                <div>
                    <img src="./emptyFriendList.png" alt="error" />
                </div>
                <div style={{margin:'20px 0px'}}>
                    <h1>!!Friend List Empty!!</h1>
                </div>
            </div>
        }
        { data && data.length>0 && <div id='friendListDiv'>
            <div style={{textAlign:'center'}}>
              <h1 style={{color:'white'}}>Friend List:-</h1>
            </div>
            { data.map((elm,idx)=>(
              <div id='friendDiv_F' key={idx}>
                    <div>
                        <img src={elm.profile_image||"./dummyProfileImg.png"} alt="error" />
                    </div>
                    <div>
                        <p>{elm.name}</p>
                    </div>
                    <div>
                        <button onClick={()=>setShowConfirm({bool:true,data:elm.user_id})}>remove</button>
                    </div>
                </div>
            ))}    
        </div>}

        { showConfirm.bool && <div id='mainConfirmBox_f'>
          <div>
            <h1>Are you sure?</h1>
          </div>
          <div>
            <button onClick={handleRemoveFriend}>Yes</button>
            <button onClick={()=>setShowConfirm({bool:false, data:''})}>No</button>
          </div>
        </div>}
        {loading?<Loader/>:null}
    </div>
  )
}
