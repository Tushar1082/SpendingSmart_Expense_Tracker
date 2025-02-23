import React, { useState } from 'react';
import { showHideHamMenu, changeBodyNavColor } from '../../../services/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import './navbar.css';

export default function Navbar({setCurrentComp,userImg, userName,handleClick,selected}) {
  const {showHamMenu} = useSelector((state)=>state.user);
  const dispatch = useDispatch();

  function handleSignOut(){
    localStorage.removeItem('Spending_Smart_User_id');
    location.reload();
  }
  return (
    <div id="main_navbar" className={showHamMenu?"showHideNavbar":''}>
      {/* User Info */}
      <div id='main_navbar_body' className={selected==2?'main_navbar_body':''}>
        <div id="profileImg_navbar">
          <img src={ userImg || "./dummyProfileImg.png"} alt="error" loading='lazy' />
        </div>
        {/* <h3 style={{ textAlign: 'center', borderBottom:'3px solid lightgrey' }}>
          <i>Hello, {userName}</i>
        </h3> */}
        <h3 style={{ 
          textAlign: 'center', 
          borderBottom: '3px solid lightgrey', 
          paddingBottom: '8px', 
          // fontSize: '1.5rem', 
          // color: '#333'
          padding:'5px' 
        }}>
          <i>Hello, {userName}!</i>
        </h3>

        {/* <hr style={{ marginRight: '20px', marginLeft: '20px' }} /> */}

        {/* Administration */}
        <div id="compNavbar">
          <h2>Administration</h2>
          <div
            className={selected === 0 ? 'selectedElem' : ''}
            onClick={() => {handleClick(0), setCurrentComp('Home'), dispatch(showHideHamMenu(false)), dispatch(changeBodyNavColor(false))}}
          >
              <img src="./home.png" alt="error" />
              <span className={selected==2?'navSpan':''}>Home</span>
          </div>
          <div
            className={selected === 1 ? 'selectedElem' : ''}
            onClick={() => {handleClick(1), setCurrentComp('Search Friend'), dispatch(showHideHamMenu(false)), dispatch(changeBodyNavColor(false))}}
            >
              <img src="./searchFriend.png" alt="err" />
              <span className={selected==2?'navSpan':''}> Search Friend</span>
          </div>
        </div>

        {/* Managements */}
        <div id="compNavbar">
          <h2>Managements</h2>
          <div
            className={selected === 2 ? 'selectedElemNewColor' : ''}
            onClick={() => {handleClick(2), setCurrentComp('Requests'), dispatch(showHideHamMenu(false)), dispatch(changeBodyNavColor(true))}}
          >
              <img src="./request.png" alt="error" />
              <span className={selected==2?'navSpan':''}> Requests</span>
          </div>
          <div
            className={selected === 3 ? 'selectedElem' : ''}
            onClick={() => {handleClick(3), setCurrentComp('Transactions'), dispatch(showHideHamMenu(false)), dispatch(changeBodyNavColor(false))}}
          >
              <img src="./transaction.png" alt="err" />
              <span className={selected==2?'navSpan':''}> Transactions</span>
          </div>
        </div>

        {/* Accounting */}
        {/* <div id="compNavbar">
          <h3>Accounting</h3>
          <div
            className={selected === 5 ? 'selectedElem' : ''}
            onClick={() => {handleClick(5),setCurrentComp('Reports')}}
          >
              <img src="./report.png" alt="err" />
              <span>Reports</span>
          </div>
        </div> */}

        {/* Sign Out */}
        <div id="signOutNavDiv" onClick={handleSignOut}>
          <button className={selected==2?'signOutNavDivButton':''}>Sign out</button>
        </div>
      </div>
      <div id='main_navbar_btn' onClick={()=>dispatch(showHideHamMenu(!showHamMenu))}>
        <img src="leftArrow.png" alt="error" />
      </div>
    </div>
  );
}
