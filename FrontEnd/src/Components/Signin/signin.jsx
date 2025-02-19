import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import {compare} from 'bcryptjs';
import Loader from '../Loader/loader';
import './signin.css';
import ForgotPass from '../Forget Password/forgotPass';

export default function Signin() {
  const [data,setData] = useState({
    name:'',
    profileImg:null,
    emailID:null,
    password:null
  });
  const [showLoading,setShowLoading] = useState(false);
  const [correctPass, setCorrectPass] = useState(false);
  const [showForgotPass,setShowForgotPass] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(){
    if(!data.emailID){
      alert('emailId must be required');
      return;
    }else if(!/^[\w.-]+@gmail\.com$/.test(data.emailID)){ //test() used to check string according to regression
      alert('Given emailId is invalid');
      return;
    }
    if(!data.password){
      alert('Password must be required');
      return;
    }
    setShowLoading(true);
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/signin?email_id=${data.emailID}`,{
        method:'GET',
        headers:{
          'content-type': 'application/json'
        }
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('error from backend');
        setTimeout(()=>{
          setShowLoading(false);
        },1000);
        return;
      }else if(finalResult.notFound){
        alert('You don\'t have account, please signup');
        setTimeout(()=>{
          setShowLoading(false);
        },1000);
        return
      }else{
        setData((prev)=>({...prev, name:finalResult.name}));
        compare(data.password, finalResult.password, (err, result) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            setTimeout(()=>{
              setShowLoading(false);
            },1000);
            return;
          }
          if (result) {
            alert('Passwords match! User authenticated.');
            setCorrectPass(true);
          } else {
            alert('Passwords do not match! Authentication failed.');
            setTimeout(()=>{
              setShowLoading(false);
            },1000);
            return;
          }
        });
        // console.log(finalResult);
        localStorage.setItem('Spending_Smart_User_id',finalResult.user_id);
        setData((prev)=>({...prev, profileImg:finalResult.profile_image||"./dummyProfileImg.png"}));
      }
    } catch (error) {
      alert('error from here')
      console.log(error);
      setTimeout(()=>{
        setShowLoading(false);
      },1000);
    }
  }
  async function handleForPass(){
    if(!data.emailID){
      alert('Enter your email id');
      return;
    }
    else if(!/^[\w.-]+@gmail\.com$/.test(data.emailID)){
      alert('Given emailId is invalid');
      return;
    }
    setShowLoading(true);
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/forgotpassword?emailId=${data.emailID}`,{
        method:'GET',
        headers:{
          'content-type': 'application/json'
        }
      });
      const finalResult = await result.json();
      
      if(finalResult.failed){
        alert('Failed to process further, Please Try again Later!');
        return;
      }else if(finalResult.notFound){
        alert('You don\'t have account, please signup');
        return;
      }else{
        setData((prev)=>({...prev, emailID:finalResult.email, name: finalResult.name, profileImg: finalResult.profile_image}));
        setShowForgotPass(true);
      }
    } catch (error) {
      alert('Failed to process further, Please Try again Later!');
      console.log(error);
    } finally{
      setTimeout(()=>{
        setShowLoading(false);
      });
    }
  }
  useEffect(() => {
    // This will run when 'data.profileImg' is updated
    if (data.profileImg && correctPass) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [data.profileImg,correctPass]);

  return (
    <>
    {!showForgotPass ? <div id='signin_main'>
      <div id='logoDivSignin'>
        <div>
          <img src="logo.png" alt="error" />
        </div>
        <div>
          <img src="logoTitle.png" alt="error" />
        </div>
      </div>
      <div id='signinDiv'>
          <div id='signin_profileImg'>
                <img src={data.profileImg||'./dummyProfileImg.png'} alt="error"/>
          </div>
          <div id='signin_detail'>
              <input type="text" placeholder='Email id..' id='signin_emailId' onChange={(e)=>setData((prev)=>({...prev,emailID: e.target.value.toLowerCase().trim()}))} />
              <div>
                  <div>
                      <input type="password" placeholder='Password' id='signin_password' onKeyDown={(e)=>e.key == "Enter"?handleSubmit():''} onChange={(e)=>setData((prev)=>({...prev,password: e.target.value}))} />
                  </div>
                  <p id='signin_Links' onClick={handleForPass}  style={{float:"right", textDecoration:'none', marginTop:'5px'}}>forget Password?</p>
              </div>
          </div>
          <div id='signin_submit' onClick={handleSubmit}>
              <button>Submit</button>
          </div>
          <div style={{textAlign:'center', marginTop:'20px', fontSize:'large'}}>
            <p> <strong>New User?</strong> <Link to='/signup' id='signin_Links' style={{ textDecoration:'none'}}>Signup</Link></p>
          </div>
      </div>
    </div>
    : <ForgotPass name={data.name} email={data.emailID} profileImg={data.profileImg}/>
    }
    {showLoading?<Loader/>:null}
    </>
  )
}
