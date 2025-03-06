import React, { useState, useEffect, useRef } from "react";
import {Link} from 'react-router-dom';
import Loader from "../Loader/loader";
import BodyNavbar from "../Homepage/Body/bodyNavbar";
import "./moneyRequest.css";

export default function MoneyRequests({ callUserData, moneyRequests, user_id }) {
    const [paymentStatus,setPaymentStatus] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const [newProfImg, setNewProfImg] = useState('./dummyProfileImg.png');
    const myRef = useRef();

    useEffect(() => {
        // Ensure Razorpay script is loaded
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    async function makePayment(data,index) {
        try {
            setShowLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/makePayment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_RAZORPAY_API_SECRET}`
                },
                body: JSON.stringify({
                    amount: data.requested_amount.$numberDecimal, // No need to multiply by 100
                    currency: "INR"
                }),
            });

            const order = await response.json();

            if (!order.id) {
                throw new Error("Order creation failed");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Expense Tracker",
                description: `Payment for ${data.expense_name}`,
                image: "./logo.png",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/user/verifyPayment`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(
                                {
                                    ...response, 
                                    moneyRequest_id: data.moneyRequest_id, 
                                    user_id, 
                                    group_id: data.group_id, 
                                    expense_id: data.expense_id,
                                    expense_name: data.expense_name,
                                    expense_amount: data.requested_amount.$numberDecimal,
                                    from: data.from
                                }
                            ),
                        });

                        const verification = await verifyResponse.json();

                        if (verification.success) {
                            setPaymentStatus({status:verification.success, transaction_id: verification.transaction_id, payment_id:response.razorpay_payment_id, index: index});
                            alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                        } else {
                            setPaymentStatus({status:verification.success, transaction_id: verification.transaction_id, payment_id:response.razorpay_payment_id, index: index});
                            // alert("Payment verification failed!");
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        // alert("Payment verification failed!");
                    }    finally{
                        setShowLoading(false);
                      }
                },
                prefill: {
                    name: data.moneyRequestor_name,
                    email: "test@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("Payment failed. Please try again.");
        }    finally{
            setShowLoading(false);
          }
    }
    async function handleHideStatus(){
        const div = myRef.current;

        if(div){
            div.style.animation = "upToBottom 1s ease-in-out";
            setTimeout(()=>{
                setPaymentStatus(null);
            },1000);
            await callUserData();
        }
    }

    return (
    <div id="moneyReqMain">
        <div id="moneyReqBodyNav">
            <BodyNavbar/>
        </div>
        <div id="moneyReqDiv">
            <div style={{ textAlign: "center", margin: "10px 0px" }}>
                <h1 style={{ color: "white" }}>Money Requests</h1>
            </div>
            {moneyRequests && moneyRequests.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {moneyRequests.map((elm, idx) => (
                        <div key={idx} id="ReqestDiv_body" style={{ fontSize: "larger" }}>
                            <div id="requestorProfImg">
                                <img
                                    src={elm.moneyRequestor_profile_image || "./dummyProfileImg.png"}
                                    alt="error"
                                    style={{ width: "100%", objectFit: "cover" }}
                                />
                            </div>
                            <div style={{color:"white"}}>
                                <p>
                                    <strong>{elm.moneyRequestor_name}</strong> is requesting payment for <strong>{elm.expense_name}</strong> expense from <strong>{elm.from}</strong>
                                </p>
                                <p style={{fontSize:"medium"}}><span>Expense Amount: </span><span>₹{elm.expense_amount.$numberDecimal}</span></p>
                                <p style={{fontSize:"medium"}}><span>Requested Amount: </span><span>₹{elm.requested_amount.$numberDecimal}</span></p>
                            </div>
                            <div id="paymentBtn_MR">
                                <button onClick={() => makePayment(elm,idx)}>
                                    <i>Pay</i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div id="emptyMoneyReqDiv">
                    <div>
                        <img src="emptyMoneyReq.png" alt="error" />
                    </div>
                    <div>
                        <h1>Request empty....</h1>
                    </div>
                </div>
            )}
        </div>
        { paymentStatus!=null && paymentStatus && moneyRequests && moneyRequests[paymentStatus.index] &&<div id="mainPaymentStatus" ref={myRef}>
            <div id="crossDivMR" onClick={handleHideStatus}>
                <img src="cross.png" alt="error" />
            </div>

            <div id="statusImgMR">
                {paymentStatus.status?<img src="paymentSuccess.gif" alt="error" />:
                <img src="paymentFail.gif" alt="error" />}
                <h1>₹{moneyRequests[paymentStatus.index].requested_amount.$numberDecimal}</h1>
            </div>

            <div id="paymentDetailsMR">
                <div id="paymentD">
                    <span>Transaction_id:</span>
                    <span>{paymentStatus.transaction_id}</span>
                </div>
                <div id="paymentD">
                    <span>Payment_id:</span>
                    <span>{paymentStatus.payment_id}</span>
                </div>
                <div id="paymentD">
                    <span>Expense Name:</span>
                    <span>{moneyRequests[paymentStatus.index].expense_name}</span>
                </div>
                <div id="paymentD">
                    <span>Date:</span>
                    <span>{new Date().toLocaleString()}</span>
                </div>
            </div>
        </div>}

        {showLoading? <Loader/>:null}
    </div>
    );
}



