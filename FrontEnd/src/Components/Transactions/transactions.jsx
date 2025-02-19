import React, { useState, useEffect, useMemo, useRef } from "react";
import "./transactions.css";
import BodyNavbar from "../Homepage/Body/bodyNavbar";
import Footer from "../Homepage/Footer/footer";
import Loader from "../Loader/loader";

export default function Transactions({ data }) {
  const [emptyTrans, setEmptyTrans] = useState(data.transactions.length > 0);
  const [transList, setTransList] = useState(null);
  const [currTrans, setCurrTrans] = useState({bool:false, details:''});
  const [showLoading, setShowLoading] = useState(false);
  
  const myRef = useRef();

  function getPeriod(transactions) {
    setShowLoading(true);
    const now = new Date();
    const today = [];
    const yesterday = [];
    const sevenDays = [];
    const last30Days = [];
    const older = [];

    // Define date boundaries
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(todayStart.getDate() - 6);
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(todayStart.getDate() - 29);

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
    );

    // Categorize transactions
    sortedTransactions.forEach((elm) => {
      const transactionDate = new Date(elm.payment_date);
      if (transactionDate >= todayStart) {
        today.push(elm);
      } else if (transactionDate >= yesterdayStart) {
        yesterday.push(elm);
      } else if (transactionDate >= sevenDaysAgo) {
        sevenDays.push(elm);
      } else if (transactionDate >= thirtyDaysAgo) {
        last30Days.push(elm);
      } else {
        older.push(elm);
      }
    });

    setTransList({ today, yesterday, sevenDays, last30Days, older });
    setTimeout(()=>{
      setShowLoading(false);
    },1000);
  }

  function handleShowTransDetails(details){
    setCurrTrans({bool:true, details: details});

    const div = myRef.current;
    if(!div) return;

    div.style.display='block';
    div.style.animation="bottomToUp 1s ease-in-out";
  }
  async function handleHideStatus(){
    const div = myRef.current;

    if(div){
        div.style.animation = "upToBottom 1s ease-in-out";
        setTimeout(()=>(
            div.style.display='none'
        ),900)
    }
  }

  const renderTransactions = useMemo(() => {
    if (!transList) return null;

    const sections = [
      { label: "Today", data: transList.today },
      { label: "Yesterday", data: transList.yesterday },
      { label: "Last 7 Days", data: transList.sevenDays },
      { label: "Last 30 Days", data: transList.last30Days },
      { label: "Older", data: transList.older },
    ];

    return sections.map(
      ({ label, data }) =>
        data.length > 0 && (
          <div key={label} id="certainPeriodDiv_T">
            <div id="labelDiv_T">
              <p>{label}</p>
            </div>
            {data.map((elm, idx) => (
              <div id="transactionItem" key={idx} onClick={()=> handleShowTransDetails(elm)}>
                <div>
                  <h3>{elm.expense_name}</h3>
                  <p>₹{elm.expense_amount.$numberDecimal}</p>
                </div>
                <div>
                  <span>{new Date(elm.payment_date).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )
    );
  }, [transList]);
  
  useEffect(() => {
    getPeriod(data.transactions);
    // console.log(data);
  }, [data]);

  return (
    <div id="mainTransactions">
      <BodyNavbar />
      <div>
        {emptyTrans && (
          <>
            <div id="transactionListHeading">
              <div>
                <img src="transactionList.png" alt="error" />
              </div>
              <div>
                <h1>Transaction List:</h1>
              </div>
            </div>
            {/* <div id="filterBtn_T">
              <img src="filter.png" alt="error" />
              <button>Filter</button>
            </div> */}
            <div id="transactionList">{renderTransactions}</div>
          </>
        )}

        {!emptyTrans && (
          <div style={{ width: "40%", margin: "auto" }}>
            <img style={{ width: "100%" }} src="emptyTransactionList.png" alt="error" />
            <h1 style={{ marginTop: "1rem", textAlign: "center" }}>
              !! Transaction List Is Empty !!
            </h1>
          </div>
        )}
      </div>
        { currTrans.bool &&
            <div id="mainPaymentStatus"  style={{backgroundColor:'#000000e6'}} ref={myRef}>
            <div id="crossDivMR" onClick={handleHideStatus}>
                <img src="cross.png" alt="error" />
            </div>

            <div id="statusImgMR">
                {currTrans.details.payment_status == "Success"?
                <img src="paymentSuccess.gif" alt="error" />:
                <img src="paymentFail.gif" alt="error" />}
                <h1 style={{color:'white'}}>₹{currTrans.details.expense_amount.$numberDecimal}</h1>
            </div>

            <div id="paymentDetailsMR" style={{color:'white'}}>
                <div id="paymentD">
                    <span>Transaction_id:</span>
                    <span>{currTrans.details.transaction_id}</span>
                </div>
                <div id="paymentD">
                    <span>Payment_id:</span>
                    <span>{currTrans.details.payment_id}</span>
                </div>
                <div id="paymentD">
                    <span>Expense Name:</span>
                    <span>{currTrans.details.expense_name}</span>
                </div>
                <div id="paymentD">
                    <span>Date:</span>
                    <span>{new Date(currTrans.details.payment_date).toLocaleString()}</span>
                </div>
            </div>
        </div>
        }
        {showLoading?<Loader/>:null}
      <Footer />
    </div>
  );
}
