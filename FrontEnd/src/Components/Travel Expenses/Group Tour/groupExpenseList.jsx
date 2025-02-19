import React, { useState,useEffect } from 'react'

export default function GroupExpenseList({
    userName,
    profileImg,
    groupId,
    groupName,
    groupExpData,
    setGroupExpData,
    setShowConfirmBox,
    setShowCreateGroupExp,
    showPayBackBox,
    setShowPayBackBox,
    showAnalysis,
    setShowAnalysis,
    setShowLoading
}) {
    const [expandedExpense, setExpandedExpense] = useState(null);
    const [userId, setUserId] = useState('');

    const toggleExpense = (index) => {
        setExpandedExpense(expandedExpense === index ? null : index);
    };
    
    async function handleMoneyReq(expense,index){
        const {expense_id, name, amount, date, paidBy, splitDetails} = expense;
        
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/user/sendMoneyRequest`,{
                method: 'PATCH',
                headers:{
                    'content-type':'application/json'
                },
                body: JSON.stringify(
                    {
                        from:'Group Travel', 
                        user_id:userId,
                        profile_image: profileImg, 
                        name: userName,
                        expense_id,
                        expName:name, 
                        date, 
                        amount, 
                        paidBy, 
                        splitDetails, 
                        group_id:groupId,
                        groupName: groupName
                    }
                )
            });
            const finalResult = await result.json();

            if(finalResult.failed){
                alert('fail to send money request and may be error from backend');
            }else if(finalResult.success){
                // Update state to mark only the clicked expense as requested
                setGroupExpData((prevData) =>
                    prevData.map((exp, i) =>
                        i === index ? { ...exp, isRequestedMoney: true } : exp
                    )
                );
                const spliName = splitDetails.map((elm)=>elm.name).join(',');
                alert(`money requested to ${spliName} for ${name} expense`);
            }
        } catch (error) {
            alert('error from frontend and fail to send money request');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000)
        }
    }

    useEffect(()=>{
        const val = localStorage.getItem('Spending_Smart_User_id');
        setUserId(val);
    },[]);
  return (
    <div className="expenses-container">
        <h2>Group Expenses</h2>
        {groupExpData.map((expense, expenseIndex) => (
            <div className="expense-card" id='expCard_GE'  key={expense.expense_id}>
                <div>
                    <div style={{display:'flex', gap:'15px'}} >
                        <div
                            className="expense-header"
                            onClick={() => toggleExpense(expenseIndex)}
                        >
                            <h3>{expense.name}</h3>
                            <span>{expandedExpense === expenseIndex ? "-" : "+"}</span>
                        </div>
                        <div style={{display:'flex', gap:'20px', alignItems:'center', marginRight:'20px', cursor:'pointer'}} onClick={()=>{setShowConfirmBox({bool:true,work:'groupExpenseDelete', data: {expense_id:expense.expense_id, splitDetails: expense.splitDetails}})}}>
                            <img src="./delete.png" alt="error" style={{width:'45px'}}  />
                        </div>
                    </div>
                    {expandedExpense === expenseIndex && (
                        <div className="expense-details">
                            <table className="details-table">
                            <tbody>
                                <tr>
                                    <th>Field</th>
                                    <th>Details</th>
                                </tr>
                                <tr>
                                    <td>Date:</td>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td>Category:</td>
                                    <td>{expense.category}</td>
                                </tr>
                                <tr>
                                    <td>Sub Category</td>
                                    <td>{expense.subCategory}</td>
                                </tr>
                                <tr>
                                    <td>Description:</td>
                                    <td>{expense.description}</td>
                                </tr>
                                <tr>
                                    <td>Amount:</td>
                                    <td>₹{expense.amount.$numberDecimal}</td>
                                </tr>
                                <tr>
                                    <td>Payment Mode:</td>
                                    <td>{expense.paymentMode}</td>
                                </tr>
                                <tr>
                                    <td>Location:</td>
                                    <td>{expense.expense_location}</td>
                                </tr>
                                <tr>
                                    <td>Paid By:</td>
                                    <td>{expense.paidBy.name}</td>
                                </tr>
                                <tr>
                                    <td>Split Type:</td>
                                    <td>{expense.splitType}</td>
                                </tr>
                                <tr>
                                    <td>Is Settled:</td>
                                    <td>
                                        <select 
                                            value={expense.isSettled.confirm ? "Yes" : "No"} 
                                            disabled={expense.isSettled.confirm || expense.paidBy.user_id != userId } // Disable the select when the value is true
                                            onChange={(e) => {
                                                const newIsSettled = e.target.value === "Yes"; // Convert value to boolean
                                                if (newIsSettled !== expense.isSettled.confirm) {
                                                    setShowConfirmBox({
                                                        bool: true,
                                                        data: {expense_id: expense.expense_id, splitDetails: expense.splitDetails},
                                                        work: 'isSettled',
                                                        isSettled: newIsSettled
                                                    });
                                                    expense.isSettled.confirm = newIsSettled; // Update the local value for immediate feedback
                                                }
                                            }}
                                        >
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                        {expense.paidBy.user_id != userId && 
                                            <span
                                                style={{
                                                    fontSize:'smaller',
                                                    position: 'absolute',
                                                    marginLeft: '10px'
                                                }}
                                            > <i>isSettled value only changable by a person who paid for expense</i></span>}
                                    </td>
                                </tr>
                            </tbody>
                            </table>

                            <h4>Split Details</h4>
                            <table className="split-table">
                                <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Amount</th>
                                    <th>Payment Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {expense.splitDetails.map((split, splitIndex) => (
                                    <tr key={splitIndex}>
                                    <td>{split.name}</td>
                                    <td>₹{split.amount.$numberDecimal}</td>
                                    <td>{split.paymentStatus === "Paid" || expense.isSettled.confirm ? "Paid" : "Pending"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            { !expense.isSettled.confirm && expense.paidBy.user_id == userId && <div id='reqMoneyDiv'>
                                <p>!! Request Money From Split Members !!</p>
                                {expense.isRequestedMoney=== true 
                                // || locallyReqMoney === true
                                ?<button onClick={()=>alert('You already requested')}>Requested Money</button>
                                :
                                <button onClick={()=>{
                                    handleMoneyReq(expense,expenseIndex); 
                                    expense.isRequestedMoney=true}}>Request Money</button>}
                                {/* {console.log(expense.isRequestedMoney)}
                                {console.log(locallyReqMoney)} */}
                            </div>}
                        </div>
                    )}
                </div>

            </div>
        ))}

        <div id="expenseBtns">
            <button onClick={()=>{setShowCreateGroupExp(true)}}>Add Expense</button>
            <button 
            onClick={()=>setShowPayBackBox(!showPayBackBox)}
            style={{
                color: "black",
                padding: "10px 5px",
                backgroundColor: "rgb(192, 192, 192)"
            }}
            >View Expense Settlements</button>
            <button onClick={()=>setShowAnalysis(!showAnalysis)} style={{backgroundColor:'rgb(173, 6, 36)'}}>Show Analysis</button>
        </div>
    </div>
  )
}
