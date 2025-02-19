import React,{useState} from 'react'

export default function IndivExpenseList({
    indExpData,
    setShowConfirmBox,
    showAnalysis,
    setShowAnalysis,
    setShowCreateIndExp,
}) {
    const [expandedExpense, setExpandedExpense] = useState(null);
    
    const toggleExpense = (index) => {
        setExpandedExpense(expandedExpense === index ? null : index);
    };

  return (
    <div className="expenses-container">
    <h2>Individual Expenses</h2>
    {indExpData.map((expense, index) => (
      <div className="expense-card" id="expCard_IE" key={index}>
        <div>
          <div style={{ display: "flex", gap: "15px" }}>
            <div
              className="expense-header"
              onClick={() => toggleExpense(index)}
            >
              <h3>{expense.name}</h3>
              <span>{expandedExpense === index ? "-" : "+"}</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                marginRight: "20px",
                cursor: "pointer",
              }}
              onClick={() => setShowConfirmBox({
                bool: true,
                work: "individualExpenseDelete",
                data: {expense_id: expense.expense_id},
              })}
            >
              <img src="./delete.png" alt="error" style={{ width: "45px" }} />
            </div>
          </div>
          {expandedExpense === index && (
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
                    <td>Sub Category:</td>
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
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    ))}
    <div id='addExpense' style={{display:'flex', gap:'10px'}}>
      <button onClick={() => setShowCreateIndExp(true)}>Add Expense</button>
      <button style={{backgroundColor:'rgb(173, 6, 36)'}} onClick={()=> setShowAnalysis(!showAnalysis)}>Show Analysis</button>
    </div>
  </div>
  )
}
