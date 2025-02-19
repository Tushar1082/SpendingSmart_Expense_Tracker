import React, { useEffect, useState } from 'react';
import { imageDb } from "../Firebase/config";
import { ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';
import Loader from '../Loader/loader';
import './userProfile.css';

export default function UserProfile() {
  const [data, setData] = useState(null);
  const [name, setName] = useState({
    changeValue:'',
    isDisable: true
  });
  const [email, setEmail] = useState({
    changeValue:'',
    isDisable: true
  });
  const [age, setAge] = useState({
    changeValue:'',
    isDisable: true
  });
  const [pass, setPass] = useState({
    oldPass:'',
    newPass:''
  });
  const [changePass, setChangePass] = useState(false);

  const [newProfImg, setNewProfImg] = useState('./dummyProfileImg.png');
  const [file, setFile] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const user_id = localStorage.getItem('Spending_Smart_User_id');

  async function getData(){
    try {
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user?user_id=${user_id}`); 
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('error from backend and failed to get data from user');
      }else if(finalResult.notFound){
        alert('user not exists');
      }
      
      setData(finalResult);
      setName((prev)=>({...prev,changeValue:finalResult.name}));
      setEmail((prev)=>({...prev,changeValue:finalResult.email}));
      setAge((prev)=>({...prev,changeValue:finalResult.age}));
      setPass((prev)=>({...prev,oldPass:finalResult.password}));
      setNewProfImg(finalResult.profile_image);
    } catch (error) {
      alert('error from frontend and failed to get data from user');
      console.log(error);
    }finally{
      setShowLoading(false);
    }
  }
  async function handleNewProfImg(e) {
    const file = e.target.files[0];

    if(file){
      const reader = new FileReader();
      setShowLoading(true);
      reader.onload = (res)=>{
        setNewProfImg(res.target.result);
        setFile(file);
        setTimeout(()=>{
          setShowLoading(false);
        },1000);
      };

      reader.readAsDataURL(file);
    }
  }
  async function generateImg(){
      if(!file)
        return;

      try {
      const imgRef = ref(imageDb, `SpendingSmart/Users/${email.changeValue}`);
        // Upload the image
        const snapshot = await uploadBytes(imgRef, file);
        console.log("File uploaded successfully!");
  
        // Get the download URL
        const imgUrl = await getDownloadURL(snapshot.ref);
        // setShowLoading(false);
        return imgUrl;
      } catch (error) {
        console.error("Error uploading file or fetching URL:", error); 
        // setShowLoading(false);
        return null;
      }finally{
        setShowLoading(false);
      }
  }
  async function deleteImage(userEmailId) {
    if (!userEmailId) {
      // alert("User email id is required to identify the image to delete.");
      alert('failed to delete image');
      return;
    }
    
    const imgRef = ref(imageDb, `SpendingSmart/Users/${userEmailId}`); // Path of the image
    setShowLoading(true);
    try {
      // Delete the file
      await deleteObject(imgRef);
      alert("Image deleted successfully!");
      // setShowLoading(false);
    } catch (error) {
      alert('error while deleting old image');
      console.error("Error deleting the image:", error.message);
      // setShowLoading(false);
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
      },1000);
    }
  }
  async function handleSaveChanges(){
    if(name.changeValue == data.name && email.changeValue == data.email && age.changeValue == data.age && pass.oldPass == data.password && data.profile_image == newProfImg){
      alert('you don\'t do any changes');
      return;
    }
    if(name.changeValue != data.name || email.changeValue != data.email || age.changeValue != data.age || (pass.oldPass!='' && pass.newPass!='')){
      await updateDetails();
    }
    if(data.profile_image != newProfImg){
      await updateProfImg();
    }
    location.reload();
  }
  async function checkOldPass(){
    const oldPass = pass.oldPass.trim();
    const newPass = pass.newPass.trim();
    const isValid = await bcrypt.compare(oldPass, data.password);

    if(isValid){
      const saltRounds = 10; // Number of rounds for salting
      const hassPass = await bcrypt.hash(newPass, saltRounds); // Hash the password
      return hassPass;
    }else{
      alert('your given password not match to old password');
      return false;
    }

  }
  async function updateDetails() {
    try {      
      //update other detail then profile image
      
      // Generate a salt and hash the password
      let hashedPass = null;

      if(pass.oldPass != data.password && (pass.oldPass!='' && pass.newPass!='')){
        hashedPass = await checkOldPass();
      }
      if(hashedPass === false){
        return;
      }
      setShowLoading(true);
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user`,{
        method:"PATCH",
        headers:{
          'content-type':'application/json'
        },
        body: JSON.stringify(
          {
            name:name.changeValue, 
            email: email.changeValue, 
            age: age.changeValue,
            password: hashedPass!=null?hashedPass:data.password,
            user_id
          })
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('error from backEnd and failed to updated changes');
      }else if(!finalResult.updated){
      alert('failed to updated changes');
      }else{
        setName((prev)=>({...prev, isDisable:true}));
        setEmail((prev)=>({...prev, isDisable:true}));
        setAge((prev)=>({...prev, isDisable:true}));
        alert('Changes saved successfully!');
      }

    } catch (error) {
      alert('error from here and failed to updated changes');
      console.log(error);
    }finally{
      setShowLoading(false);
    }
  }
  async function updateProfImg() {
    try {
    //then update profile image
      setShowLoading(true);
      const newProfileImg = await generateImg();
      
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user/profileImage`,{
        method:"PATCH",
        headers:{
          'content-type':'application/json'
        },
        body: JSON.stringify({profile_image:newProfileImg,user_id})
      });
      const finalResult = await result.json();

      if(finalResult.failed){
        alert('error from backEnd and failed to updated profile image');
      }else if(!finalResult.updated){
      alert('failed to updated profile image');
      }else{
        if(data.email != email.changeValue){
          deleteImage(data.email);
        }
        setNewProfImg(newProfileImg)
        alert('Profile image updated successfully!');
      }
    } catch (error) {
        alert('failed to update new profile image and error from here');
        console.log(error);
    }finally{
      setShowLoading(false);
    }
  }

  useEffect(()=>{
    getData();
  },[]);
  return (
    <div id='mainUserProfile'>
      <div id='userProfileNavbar'>
        <div id='userProfileLogoDiv'>
          <div>
            <img src="./logo.png" alt="error" id='loginImgF' />
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
            <img src={ newProfImg || "./dummyProfileImg.png"} alt="error" style={{width:'40px'}} id='profImgBN' />
            <span>Profile</span>
          </Link>
          <Link to="/friends">
            <img src="./friends(white).png" alt="error" />
            <span>Friends</span>
          </Link>
        </div>
      </div>
      { data && <div id='userProfileBox'>
        <div >
          <div id='imageNameDiv_UP'>
            <div style={{position:'relative'}}>
              <img src={newProfImg} alt="error" />
              <img src="./editProfile.png" alt="error" onClick={()=>{document.getElementById('takeNewProfImg').click()}} 
              />
              <input type="file" hidden accept='image/*' id='takeNewProfImg' onChange={handleNewProfImg} />
            </div>
            <div id='userEmailIdShown'>
              <p style={{fontSize:'xx-large'}}>{data.name}</p>
              <p style={{fontSize:'larger', color:'grey'}}>{data.email}</p>
            </div>
          </div>
        </div>

        <div id='userProfMid'>
            <div>
              <span>Name:</span>
              <div style={{position:'relative'}}>
                <input type="text" placeholder='your name' disabled={name.isDisable} value={name.changeValue} onChange={(e)=>setName((prev)=>({...prev, changeValue:e.target.value}))}/>
                <img src="./editProfile.png" alt="error" onClick={()=>setName((prev)=>({...prev, isDisable:!prev.isDisable}))}/>
              </div>
            </div>

            <div>
              <span>Email account:</span>
              <div style={{position:'relative'}}>
                <input type="text" placeholder='your email id' disabled={email.isDisable} value={email.changeValue} onChange={(e)=>setEmail((prev)=>({...prev, changeValue:e.target.value}))}/>
                <img src="./editProfile.png" alt="error" onClick={()=>setEmail((prev)=>({...prev, isDisable:!prev.isDisable}))} />
              </div>
            </div>

            <div>
              <span>Age:</span>
              <div style={{position:'relative'}}>
                <input type="number" placeholder='your age' disabled={age.isDisable}  value={age.changeValue} onChange={(e)=>setAge((prev)=>({...prev, changeValue:e.target.value}))}/>
                <img src="./editProfile.png" alt="error" onClick={()=>setAge((prev)=>({...prev, isDisable:!prev.isDisable}))} />
              </div>
            </div>
        </div>
            <div id='changePassBtn'>
              <button onClick={()=>setChangePass(!changePass)}>Change password</button>
            </div>

            {changePass && <div id='changePassDiv'>
              <div>
                <span>Old Password:</span>
                <input type="text" placeholder='old password' onChange={(e)=>setPass((prev)=>({...prev,oldPass:e.target.value}))}/>
              </div>
              <div>
                <span>New Password:</span>
                <input type="text" placeholder='new password' onChange={(e)=>setPass((prev)=>({...prev,newPass:e.target.value}))} />
              </div>
            </div>}

        <div id='saveChangesDiv_UP'>
          <button onClick={handleSaveChanges}>Save Changes</button>
        </div>
      </div>}
      {showLoading? <Loader/>:null}
    </div>
  )
}
