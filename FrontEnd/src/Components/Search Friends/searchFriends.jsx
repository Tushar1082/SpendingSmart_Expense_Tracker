import React, { useEffect, useState } from 'react';
import './searchFriends.css';
import BodyNavbar from '../Homepage/Body/bodyNavbar';
import Loader from '../Loader/loader';

function EachSearchedProf(
  {
    elm, 
    setShowLoading, 
    user_id, 
    sender_name, 
    userProfImg, 
    name, 
    alreadyFr, 
    friendRequest_send
  }
) {
  const [showReqBtn, setShowReqBtn] = useState(false); // this hook show or hide requested button
  // const user_id = localStorage.getItem('user_id');

  async function handleSendRemReq(sender_id, work){
    try {
      setShowLoading(true);
      
      const result = await fetch(`${import.meta.env.VITE_API_URL}/searchFriends`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({sender_id, userProfImg, name,sender_name,user_id,work})
      });
      const finalResult = await result.json();

      if (finalResult.failed) {
        alert('Error From BackEnd');
        work === 'send'?setShowReqBtn(false):setShowReqBtn(true);
      } else if (finalResult.notFound) {
        alert('fail to send request');
        work === 'send'?setShowReqBtn(false):setShowReqBtn(true);        
      } else {
        work === 'send'?setShowReqBtn(true):setShowReqBtn(false);        
      }
    } catch (error) {
      alert('error from here');
      console.log(error);
    }finally{
      setShowLoading(false);
    }
  }
  async function handleRemoveFriend(friend_id){
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user/removeFriend`,{
        method:"PATCH",
        headers:{
          'content-type':'application/json'
        },
        body: JSON.stringify({friend_id, user_id})
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('failed to remove friend and error from here');
      }else if(!finalResult.updated){
        alert('failed to remove friend');        
      }else{
        location.reload();
      }
    } catch (error) {
      alert('failed to remove friend and error from here');
      console.log(error);
    }finally{
      setShowLoading(false);
    }
  }

  useEffect(()=>{
    if(friendRequest_send.includes(elm._id)){
      setShowReqBtn(true);
    }else{
      setShowReqBtn(false);
    }
  },[friendRequest_send, elm._id]);

  return(
    <div id="eachUser_SF">
      <div id="profileImg_SF">
        <img src={elm.profile_image || './dummyProfileImg.png'} alt="error" />
        <span>{elm.name}</span>
      </div>
      <div id="sendReqDiv">
        {alreadyFr.length > 0 && alreadyFr.includes(elm._id) ? (
          <button style={{backgroundColor:'rgb(173, 6, 36)'}} onClick={()=>handleRemoveFriend(elm._id)}>Remove</button>
        ) : showReqBtn ? (
          <button onClick={() => handleSendRemReq(elm._id, 'remove')}>
            Requested
          </button>
        ) : (
          <button onClick={() => handleSendRemReq(elm._id, 'send')} style={{backgroundColor:user_id === elm._id?'silver':'black'}} disabled={user_id === elm._id?true:false}>
            Send Request
          </button>
        )}
      </div>
    </div>
  )
}
export default function SearchFriends({userData}) {
  const [showloading, setShowLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [alreadyFr, setAlreadyFr] = useState([]); //already friend
  const [frReq,setfrReq] = useState([]);
  const resultsPerPage = 10; // Number of results to show per page
  const friendRequest_send = userData.friendRequest_send||[];
  
  async function getUser() {
    if (!search) {
      return;
    }

    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/searchFriends?name=${search}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });
      const finalResult = await result.json();

      if (finalResult.failed) {
        alert('Error From BackEnd');
        setSearchResult([]);
        setDisplayResults([]);
      } else if (finalResult.notFound) {
        alert('User Not Found');
        setSearchResult([]);
        setDisplayResults([]);
      } else {
        setSearchResult(finalResult);
        setDisplayResults(finalResult.slice(0, resultsPerPage)); // Display the first page of results
        setCurrentPage(1);
      }
    } catch (error) {
      alert('Failed to get users error from here');
      console.log(error);
    }finally{
      setShowLoading(false);
    }
  }

  function loadMore() {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    setDisplayResults((prev) => [...prev, ...searchResult.slice(startIndex, endIndex)]);
    setCurrentPage(nextPage);
  }

  function checkAlreadyFriend(){
    if(searchResult.length===0){
      return;
    }
    let arr = [];
    let userFL = userData.friendList;

    for(let i=0;i<searchResult.length;i++){
      for(let j=0;j<userFL.length;j++){
        if(searchResult[i]._id === userFL[j].user_id){
          arr.push(searchResult[i]._id);
        }
      }
    }
    setAlreadyFr(arr);
  }
  function getIdFromFrReqS(){//get only ids from friend request send
    let arr=[];

    friendRequest_send.forEach((elm)=>{
      arr.push(elm.user_id);
    });;
    setfrReq(arr);
  }
  useEffect(()=>{
    getIdFromFrReqS();
  },[]);
  useEffect(()=>{
    if(searchResult){
      checkAlreadyFriend();
    }
  },[searchResult]);
  return (
    <div id="mainSearchFriends">
      <BodyNavbar />
      <div id="searchDiv_SF">
        <input 
          type="text" 
          placeholder="Search Friends.." 
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {  // Check if the pressed key is Enter
              getUser();
              setAlreadyFr([]);
            }
          }} 
        />
        <button onClick={() => {getUser(),setAlreadyFr([])}}>Search</button>
      </div>

      {displayResults.length > 0 && (
        <div id="userList_SF">
          <div>
            <h1>Search Result:</h1>
          </div>
          {displayResults.map((elm, index) => (
            <EachSearchedProf 
              elm={elm} 
              key={index} 
              setShowLoading={setShowLoading}
              user_id = {userData._id} 
              sender_name={elm.name}
              userProfImg = {userData.profile_image} 
              name={userData.name} 
              alreadyFr={alreadyFr} 
              friendRequest_send={frReq}
            />
          ))}
          {/* Show the "More" button if there are additional results */}
          {searchResult.length > displayResults.length && (
            <div id="loadMore_SF">
              <button onClick={loadMore}>More</button>
            </div>
          )}
        </div>
      )}

      {/* Empty Search list */}
      {searchResult.length === 0 && (
        <div id="emptySearchList">
          <img id='emptySeaRes' src="./emptySearchResult.jpg" alt="error" />
          <img id='emptySeaRes_ResImg' src="emptySearchResult_responsive.jpg" alt="error" />
        </div>
      )}
      {showloading?<Loader/>:''}
    </div>
  );
}
