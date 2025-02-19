import React,{useEffect, useState} from 'react';
import "./forgotPass.css";
import Loader from '../Loader/loader';

export default function ForgotPass({name,email,profileImg}) {
  const [show,setShow] = useState(true);
  const [pass,setPass] = useState();
  const [conPass,setConPass] = useState();
  const [otp,setOtp] = useState();
  const [loading,setLoading] = useState(false);
  // const [profileImg, setProfileImg] = useState("./images/profile.png");

  // const navigate = useNavigate();
  let value,valueLen;
  useEffect(()=>{
    console.log(name);
    console.log(email);
    console.log(profileImg);
  },[]);
  async function fetchData(){
    try{
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forgotPassword`,{
        method:"POST",
        headers:{
          "Content-type":"application/json",
        },
        body: JSON.stringify({name,email})
      }) 
      const data = await res.json();
      setOtp(data.otp);
      setLoading(false);
    }catch(e){
      setLoading(false);
      console.log(e);
    }
  }

  const handleOtp=(e)=>{
    const len = e.target.value.length;
    if(len === 7){
      e.target.value = "";
      alert("length of otp is not more than 6");
    }
    valueLen = e.target.value.length;
    value = e.target.value;
  }
  const handleSubmit=()=>{

    if(valueLen !== 6){
      alert("Enter complete otp and otp length must be 6");
    }
    else if(otp == value){
      setShow(!show);
    }else{
      alert("Otp is wrong");
    }
  }
  const handlePassSubmit=async(e)=>{
    if(!pass){
      alert('Enter New Password');
      return;
    }else if(!conPass){
      alert("Enter Confirm Password");
      return;
    }

    if(pass != conPass)
    {
      e.preventDefault();
      alert("entered new password and confirm new password are not same");
    }else{
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/forgotPassword`,{
          method:"PUT",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify({pass,email})
        });
        const finalRes = await res.json();
        
        if(finalRes.failed || !finalRes.updated){
          alert('failed to change password, please try again later!');
          setLoading(false);
          return;
        }
        setTimeout(()=>{
          setLoading(false);
          // navigate("/login");
          window.location.reload();
        },2000)
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  }
  useEffect(()=>{
    setLoading(true);
    fetchData();
  },[])
  return (
    <>
    {loading?<Loader/>:null}
    <div id='mainforPass'>
      <div id='mainforPassDiv'>

        {show && otp && <div id='logoDivFP'>
          <img src="logo.png" alt="error" />
        </div>}

        {show&&<div id='forPassCon'>
        {otp && 
            <div id="otpCon">
              <h1>Enter OTP</h1>
              <input type="number" className="no-spin otpEnter" value={value} onChange={handleOtp}/>
              <div className="forPassLine"></div>
              <button className='submitForPass' onClick={handleSubmit}>Submit</button>
            </div>}
        </div>}

        {!show&&
        <div id='newPassMain'>
          <div id='newPassDiv'>
            <div id='profileImgForPass'>
              <img src={profileImg} alt="error" />
            </div>

            <div id='newPassForm'>
              <h2>Set new password : </h2>
              <input type="text" required id='newPassInput' placeholder='new password' onChange={(e)=>{setPass(e.target.value)}}/>
              <input type="password" required id='newConPassInput' placeholder='confirm new password' onChange={(e)=>{setConPass(e.target.value)}}/>
              <div>
                <button id='newPassSubmit' onClick={handlePassSubmit}>Submit</button>
              </div>
            </div>
          </div>
        </div>}
      </div>
      {show && otp && <div id='spanOfForPass'>
        <span><i style={{fontWeight:"bold"}}>For forgot password, first need to enter otp and otp send on your email id <strong style={{color:'black'}}>{email}</strong></i></span>    
      </div>}

    </div>
    </>
  );
}
