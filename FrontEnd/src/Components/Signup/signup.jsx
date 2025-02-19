import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { imageDb } from "../Firebase/config";
import { ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";
import Loader from "../Loader/loader";
import "./signup.css";

export default function Signup() {
  const [data, setData] = useState({
    name: null,
    age: null,
    emailID: null,
    password: null,
    confirmPass: null,
  });
  const [showloading, setShowLoading] = useState(false);
  const [img, setImg] = useState("./dummyProfileImg.png");
  const [file, setFile] = useState(null); // To track the uploaded file
  const navigate = useNavigate();

  // Generate Image URL
  async function generateImgUrl() {
    if (!file) return; // Don't proceed if no file is uploaded

    const imgRef = ref(imageDb, `SpendingSmart/Users/${data.emailID}`);
    try {
      // Upload the image
      const snapshot = await uploadBytes(imgRef, file);
      console.log("File uploaded successfully!");

      // Get the download URL
      const imgUrl = await getDownloadURL(snapshot.ref);
      return imgUrl;
    } catch (error) {
      console.error("Error uploading file or fetching URL:", error);
      return null;
    }
  }

  // Function to delete image from Firebase Storage
  async function deleteImage(userName) {
    if (!userName) {
      console.error("Username is required to identify the image to delete.");
      return;
    }

    const imgRef = ref(imageDb, `SpendingSmart/Users/${userName}`); // Path of the image

    try {
      // Delete the file
      await deleteObject(imgRef);
      console.log("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting the image:", error.message);
    }
  }

  // Handle form submission
  async function handleSubmit() {
    if (!data.emailID) {
      alert("Email ID must be required");
      return;
    } else if (!/^[\w.-]+@gmail\.com$/.test(data.emailID)) {
      alert("Given Email ID is invalid");
      return;
    }

    if (!data.password) {
      alert("Password must be required");
      return;
    } else if (data.password !== data.confirmPass) {
      alert("Password and Confirm Password must be the same");
      return;
    }
    setShowLoading(true);
    let profileImg = null;
    // Check if the user uploaded an image before generating URL
    if (file) {
      profileImg  = await generateImgUrl();
    } else {
      console.log("No image uploaded, skipping image upload.");
    }
    if(profileImg == null){
      profileImg = 'dummyProfileImg.png';
    }

    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/user`,{
        method: "POST",
        headers:{
          'content-type': 'application/json'
        },
        body: JSON.stringify({...data, profileImg})
      })

      const finalResult = await result.json();

      if(finalResult.failed){
        alert('ERROR from Backend');
        deleteImage(data.emailID);
      }else if(!finalResult.created){
        alert('failed to signup... try again! after sometime');
        deleteImage(data.emailID);
      }else{
        navigate('/Signin');
      }
    } catch (error) {
      alert('error from here...');
      deleteImage(data.emailID);
      console.log(error);
    }finally{
      setTimeout(()=>{
        setShowLoading(false);
      },1000);
    }
  }

  // Handle file upload
  function handleFile(e) {
    const uploadedFile = e.target.files[0];

    if (uploadedFile) {
      setFile(uploadedFile); // Save the file for later use
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result); // Preview the image
      };
      reader.readAsDataURL(uploadedFile);
    }
  }

  return (
    <div id="signup_main">
            <div id='logoDivSignin'>
        <div>
          <img src="logo.png" alt="error" />
        </div>
        <div>
          <img src="logoTitle.png" alt="error" />
        </div>
      </div>
    <div id='signupDiv'>
      <div id="signup_profileImg">
        <label htmlFor="signup_upload_img">
          <img src={img} alt="Profile Preview" />
        </label>
        <input
          type="file"
          hidden
          id="signup_upload_img"
          onChange={handleFile}
        />
      </div>
      <div id="signup_detail">
        <input
          type="text"
          placeholder="Name"
          onChange={(e) =>
            setData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Age"
          onChange={(e) =>
            setData((prev) => ({ ...prev, age: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Email ID"
          id="signup_emailId"
          onChange={(e) =>
            setData((prev) => ({ ...prev, emailID: e.target.value.toLowerCase() }))
          }
        />
        <input
          type="password"
          placeholder="Password"
          id="signup_password"
          onChange={(e) =>
            setData((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) =>
            setData((prev) => ({ ...prev, confirmPass: e.target.value }))
          }
        />
      </div>
      <div id="signup_submit" onClick={handleSubmit}>
        <button>Submit</button>
      </div>
      <div>
        <p style={{marginTop:'5px'}}>
         <strong> Already have a account?</strong> <Link id="signupLink" to="/signin">Signin</Link>
        </p>
      </div>
    </div>
    {showloading?<Loader/>:null}
    </div>
  );
}
