import React, { useEffect, useState } from 'react'

export default function CreateGroupExp({
    setShowCreateGroupExp,
    collectGroupExpData, 
    setCollectGroupExpData, 
    groupMembers, 
    categories,
    tour_id,
    locations,
    getExpenses,
    setShowLoading
}) {
    const [showSummary,setShowSummary] = useState(false);
    const [bool, setBool] = useState(false);
    const [selectedMember,setSelectedMember] = useState('');
    const [paidByData, setPaidByData] = useState('');

    function changeToGroup(){
        if(bool){
            setCollectGroupExpData((prev)=> ({...prev, splitDetails: []}))
            setBool(false);
        }
    }

    function changeToIndividual(){
        if(!bool){
            setCollectGroupExpData((prev)=> ({...prev, splitDetails: []}))
            setBool(true);
        }
    }
    function selectMembers(e) {
        if(!groupMembers){
            return;
        }
        const selectedId = e.target.value;
        // console.log(selected);
        const memberName = groupMembers.filter((elm)=> elm.user_id == selectedId);
        const selected = memberName[0].name;
        const selectedProfImg = memberName[0].profile_image;

        setSelectedMember(selected);
        const memberExistsIndex = collectGroupExpData.splitDetails.findIndex(
            (member) => member.user_id === selectedId
        );
    
        if (selected) {
            let updatedSplitDetails;
    
            if (memberExistsIndex === -1) {
                updatedSplitDetails = collectGroupExpData.splitMethod === 'Percentage'
                    ? [
                        ...collectGroupExpData.splitDetails,
                        { user_id:selectedId, profile_image: selectedProfImg, name: selected, amount: 0, percentage: 0 },
                    ]
                    : [
                        ...collectGroupExpData.splitDetails,
                        { user_id:selectedId, profile_image: selectedProfImg, name: selected, amount: 0 },
                    ];
            } else {
                updatedSplitDetails = [...collectGroupExpData.splitDetails];
            }
    
            if (collectGroupExpData.splitMethod === 'Equal') {
                const totalMembers = updatedSplitDetails.length+1;//1 belong to the person that paid
                const computedAmount = parseFloat(( collectGroupExpData.amount / totalMembers)); 
    
                const recalculatedSplitDetails  = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: computedAmount,
                }));
                setCollectGroupExpData((prev) => ({
                    ...prev,
                    splitDetails: recalculatedSplitDetails,
                }));
            } else if (collectGroupExpData.splitMethod === 'Percentage') {
                const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: (member.percentage / 100) * collectGroupExpData.amount,
                }));
    
                setCollectGroupExpData((prev) => ({
                    ...prev,
                    splitDetails: recalculatedSplitDetails,
                }));
            } else if (collectGroupExpData.splitMethod === 'Custom') {
                setCollectGroupExpData((prev) => ({
                    ...prev,
                    splitDetails: updatedSplitDetails,
                }));
            }
            // setCollectGroupExpData((prev) => ({
            //     ...prev,
            //     splitDetails: updatedSplitDetails,
            // }));
        }
    }
    
    function handleDelete(idx) {
        const updatedSplitDetails = collectGroupExpData.splitDetails.filter(
            (_, index) => index !== idx
        );
    
        if (collectGroupExpData.splitMethod === 'Equal') {
            const totalMembers = updatedSplitDetails.length;
            const computedAmount =
                totalMembers > 0
                    ? parseFloat((collectGroupExpData.amount / totalMembers))
                    : 0;
    
            const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: computedAmount,
            }));
    
            setCollectGroupExpData((prev) => ({
                ...prev,
                splitDetails: recalculatedSplitDetails,
            }));
        } else if (collectGroupExpData.splitMethod === 'percentage') {
            const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: (member.percentage / 100) * collectGroupExpData.amount,
            }));
    
            setCollectGroupExpData((prev) => ({
                ...prev,
                splitDetails: recalculatedSplitDetails,
            }));
        }else {
            setCollectGroupExpData((prev) => ({
                ...prev,
                splitDetails: updatedSplitDetails,
            }));
        }
    }
    
    function handleSplitMethod(percentage, member_id, name, member_profile_image, amount) {        
        if(collectGroupExpData.splitMethod === 'Percentage'){
            const perc = Number(percentage);
            const computedAmount = (perc / 100) * amount;
            if(perc<0 || perc>100){
                alert('Provided percentage exceeds 100%. Please correct it.');
                setCollectGroupExpData((prev)=>({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elm)=>{
                        if(elm.user_id === member_id){
                            return {
                                ...elm,
                                amount: 0,
                                percentage: 0 //Reset percentage for the specific index
                            };
                        }
                        return elm; //keep other elements unchanged
                    })
                }));
                return;
            }

            setCollectGroupExpData((prev) => {
                const updatedSplitDetails = prev.splitDetails.map((elem) =>
                    elem.user_id === member_id ? { ...elem, percentage:perc, amount: parseFloat(computedAmount) } : elem
                );
                if (!prev.splitDetails.some((elem) => elem.user_id === member_id)) {
                    updatedSplitDetails.push({ user_id:member_id,profile_image: member_profile_image,name, percentage:perc, amount: parseFloat(computedAmount) });
                }
        
                return { ...prev, splitDetails: updatedSplitDetails };
            });
        }else if(collectGroupExpData.splitMethod === 'Custom'){
            const currentamount = Number(amount);

            if(currentamount<0 || currentamount>collectGroupExpData.amount){
                alert('Provided amount greater than total amount. Please correct it.');
                // console.log(name, amount, index);
                setCollectGroupExpData((prev)=>({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elm)=>{
                        if(elm.user_id === member_id){
                            return {
                                ...elm,
                                amount: 0,
                            };
                        }
                        return elm; //keep other elements unchanged
                    })
                }));
                return;
            }
            setCollectGroupExpData((prev) => {
                const updatedSplitDetails = prev.splitDetails.map((elem) =>
                    elem.user_id === member_id ? { ...elem, amount: parseFloat(currentamount) } : elem
                );
                if (!prev.splitDetails.some((elem) => elem.user_id === member_id)) {
                    updatedSplitDetails.push({ user_id:member_id,profile_image: member_profile_image,name, amount: parseFloat(currentamount) });
                }
        
                return { ...prev, splitDetails: updatedSplitDetails };
            });
        }
    }
    
    
    function computeSplitDetails() {
        if(!paidByData){
            return;
        }

        if (groupMembers && collectGroupExpData.splitMethod === 'Equal' && collectGroupExpData.splitType === "Group") {
            const arr = [];
            const amount = parseFloat((collectGroupExpData.amount / groupMembers.length));

            groupMembers.forEach((elm) => {
                if (elm.user_id !== paidByData.user_id) {
                    arr.push({ user_id: elm.user_id, profile_image: elm.profile_image, name: elm.name, amount });
                }
            });
            setCollectGroupExpData((prev) => ({ ...prev, splitDetails: arr }));
        }
    }

    async function handleCreateGroupExp(){//Create new Expense for group
        if(!collectGroupExpData.name) return alert("Enter the name of expense");
        else if(!collectGroupExpData.category) return alert("Select category for expense");
        else if(!collectGroupExpData.subCategory) return alert("Select sub category for expense");
        else if(collectGroupExpData.category === "Other" && !collectGroupExpData.subCategory) return alert("Provide sub category expense");
        else if(!collectGroupExpData.description) return alert("Fill the description for expense");
        else if(!collectGroupExpData.amount) return alert("Enter the amount of expense");
        else if(!collectGroupExpData.splitType) return alert("Provide spilit type (Individual or group)");
        else if(!collectGroupExpData.paidBy) return alert("Provide  the name of a person who pay amount of expense");
        else if(!collectGroupExpData.splitMethod) return alert("Provide split method");
        else if(collectGroupExpData.splitDetails.length==0) return alert("Add members that have to pay you back");
        else if(!collectGroupExpData.paymentMode) return alert("Select payment mode");
        else if(!collectGroupExpData.expense_location) return alert("Select expense location");
        else if(collectGroupExpData.expense_location === "Other" && !collectGroupExpData.otherLocation) return alert("Provide expense location");


        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`,{
                method: 'PATCH',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({...collectGroupExpData,tour_id,tour_type:"Group"})
            });
            const finalRes = await result.json();
            
            if(finalRes.updated){
                alert('success');
                setShowCreateGroupExp(false);
                setCollectGroupExpData({
                    name: '',
                    description: '',
                    date:'',
                    amount: '',
                    splitType: '',
                    paidBy: '',
                    splitMethod: 'Equal', //Equal or Percentage or custom
                    splitDetails: [],
                    paymentMode:'',
                    expense_location:'',
                    otherLocation:''
                })
                getExpenses();
            }else if(!finalRes.updated){
                console.log(finalRes);
                alert('failed');
            }else if(finalRes.failed){
                alert('failure come from backend');
            }

        } catch (error) {
            alert("Error from frontend");
            console.log(error);
        }  finally{
            setTimeout(()=>{
                setShowLoading(false);
            },1000)
        } 
    }
    // Below code display summary div and also compute some calculations
    function handleSubmit() {
        if (collectGroupExpData.splitMethod === "Percentage") {
            let totalPercentage = 0;
    
            // Calculate total percentage
            collectGroupExpData.splitDetails.forEach((elem) => {
                totalPercentage += elem.percentage || 0;
            });
    
            if (totalPercentage > 100) {
                alert('The total percentage exceeds 100%. Please correct it.');
    
                // Reset percentages asynchronously
                setCollectGroupExpData((prev) => ({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elem) => ({
                        ...elem,
                        percentage: 0,
                    })),
                }));
    
                return; // Stop execution
            }
        }else if(collectGroupExpData.splitMethod === "Custom"){
            let totalAmount = 0;

            collectGroupExpData.splitDetails.forEach((elem) => {
                totalAmount += elem.amount || 0;
            });
    
            if (totalAmount > collectGroupExpData.amount) {
                alert(`The total amount greater than ${collectGroupExpData.amount}. Please correct it.`);
    
                // Reset percentages asynchronously
                setCollectGroupExpData((prev) => ({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elem) => ({
                        ...elem,
                        amount: 0,
                    })),
                }));
    
                return; // Stop execution
            }        }
    
        // Toggle state and compute split details
        setShowSummary((prev) => !prev);
        computeSplitDetails();
    }

    function handleEdit() {
        setShowSummary(false); // Hide summary
        // setIsEditMode(true); // Enable clicks outside
    }
    useEffect(()=>{
        console.log(collectGroupExpData);
    },[]);

  return (
    <div id='newExp_GE' className='cGE'>
        {/* Expense Inputs */}
        <div style={{width:'200px', margin:'auto'}}>
            <img src="./addExpense.jpg" alt="error" style={{width:'100%'}} />
        </div>
        <div>
            <div>
                <span>Name:</span>
                <input
                    type="text"
                    placeholder="Expense name"
                    onChange={(e) =>
                        setCollectGroupExpData((prev) => ({ ...prev, name: e.target.value }))
                    }
                />
                </div>
            <div>
                <p>Expense for:</p>
                <input
                    type="radio"
                    name="expenseType"
                    value="Group"
                    id="wholeExpense"
                    onClick={changeToGroup}
                    onChange={(e) =>
                        setCollectGroupExpData((prev) => ({ ...prev, splitType: e.target.value }))
                    }
                />
                <label htmlFor="wholeExpense">Whole Group</label>

                <br />

                <input
                    type="radio"
                    name="expenseType"
                    value="Individual"
                    id="indiviExpense"
                    onClick={changeToIndividual}
                    onChange={(e) =>
                        setCollectGroupExpData((prev) => ({ ...prev, splitType: e.target.value }))
                    }
                />
                <label htmlFor="indiviExpense">Some Individuals</label>
            </div>
        </div>

        {/* Expense Details */}
        <div>
          <span>Category: </span>
          <select name="" id="" onChange={(e)=>setCollectGroupExpData((prev)=>({...prev,category:e.target.value}))}>
            <option value="">Select Category</option>
            {categories.map((elem, index)=>(
              <option value={elem.category} key={index}>{elem.category}</option>
            ))
            }
            <option value="Other">Other</option>
          </select>
        </div>

        {collectGroupExpData.category && <div>
          <span>Sub Category: </span>
          {
            collectGroupExpData.category === "Other"?(
              <input type="text" placeholder="Sub Category" onChange={(e)=>setCollectGroupExpData((prev)=>({...prev,subCategory:e.target.value}))}  />
            ):(
            <select name="" id="" onChange={(e)=>setCollectGroupExpData((prev)=>({...prev,subCategory:e.target.value}))}>
                <option value="">Select Sub Category</option>
              {
                categories.map((elem)=>(
                  elem.category === collectGroupExpData.category?(
                    elem.subcategories.map((elm,idx)=>(
                      <option value={elm} key={idx}>{elm}</option>
                    ))
                  ):''
                ))
              }
            </select>
            )
          }
        </div>}

        <div id="inputDiv_exp" style={{gap:'15px'}}>
            <div>
                <p>Description:</p>
                <textarea
                    placeholder="Description"
                    onChange={(e) =>
                        setCollectGroupExpData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    style={{marginTop:'0px'}}
                ></textarea>
            </div>

            <div>
                <span>Amount:</span>
                <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) =>
                        setCollectGroupExpData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                />
            </div>
            <div>
                <span>Date:</span>
                <input
                    type="date"
                    onChange={(e) =>
                        setCollectGroupExpData((prev) => ({ ...prev, date: e.target.value }))
                    }
                />
            </div>
            <div>
                <span>Paid By:</span>
                <select
                    // onChange={(e) =>
                    //     setCollectGroupExpData((prev) => ({ ...prev, paidBy: e.target.value }))
                    // }
                    onChange={(e) => {
                        const selectedMember = groupMembers.find(
                            (member) => member.user_id === e.target.value
                        );
                        setCollectGroupExpData((prev) => ({ ...prev, paidBy: {user_id:selectedMember.user_id,name:selectedMember?.name} })); // Set the name in paidBy
                        setPaidByData({user_id:e.target.value, name:selectedMember?.name}); // Set the unique ID of the selected member

                        if(collectGroupExpData.splitMethod == "Percentage"){
                            const sD = collectGroupExpData.splitDetails
                            .filter((elm) => elm.user_id != e.target.value) // Keep only elements that satisfy the condition
                            .map((elm) => ({ ...elm, percentage: 0, amount:0 })); // Update their percentage to 0
                         
                            setCollectGroupExpData((prev)=>({...prev, splitDetails:sD}));
                        }else if(collectGroupExpData.splitMethod == "Custom"){
                            const sD = collectGroupExpData.splitDetails
                            .filter((elm) => elm.user_id != e.target.value) // Keep only elements that satisfy the condition
                            .map((elm) => ({ ...elm, amount:0 })); // Update their percentage to 0
                         
                            setCollectGroupExpData((prev)=>({...prev, splitDetails:sD}));
                        }else if(collectGroupExpData.splitType == "Individual" && collectGroupExpData.splitMethod == "Equal"){
                            setCollectGroupExpData((prev)=>({...prev, splitDetails:[]}));
                        }
                    }}
                >
                    <option value="">Paid By</option>
                    {groupMembers?.map((member, idx) => (
                        <option value={member.user_id} key={idx}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <span>Payment mode: </span>
                <select name="" id="" onChange={(e)=>setCollectGroupExpData((prev)=>({...prev, paymentMode:e.target.value}))}>
                    <option value="">Mode</option>
                    <option value="Online">Online</option>
                    <option value="Cash">Cash</option>
                </select>
            </div>

            <div>
                <span>Location: </span>
                <select name="" id="" onChange={
                    (e)=>(
                    setCollectGroupExpData((prev)=>({...prev,expense_location: e.target.value}))
                    )}>
                    <option value="">Select Location</option>
                    {locations.map((elem,index)=>
                    (
                        <option value={elem} key={index}>{elem}</option>
                    ))
                    }
                    <option value="Other">Other</option>
                </select>
                {collectGroupExpData.expense_location === "Other" && <div>
                <input type="text" placeholder="Other Location" value={collectGroupExpData.otherLocation} onChange={(e)=>setCollectGroupExpData((prev)=>({...prev,otherLocation: e.target.value}))} /> 
                </div>}
            </div>
        </div>
        
        {/* Split Method (Equal or percentage or custom) */}
        <div>
            <span>Select Split Method: </span>
            <select name="" id="" 
            onClick={(e)=>collectGroupExpData.splitMethod !== e.target.value?collectGroupExpData.splitDetails=[]:''}
            onChange={(e)=>setCollectGroupExpData((prev)=>({...prev, splitMethod:e.target.value, splitDetails:[]}))}>
                <option value="Equal" >Equal</option>
                <option value="Percentage" >percentage</option>
                <option value="Custom">Custom</option>
            </select>
        </div>

        {/* Split Details */}
        <div>
            {collectGroupExpData.splitType === 'Individual' ? (
                <div>
                    <h3>Select member to pay back {collectGroupExpData.paidBy.name}</h3>
                    <select value={collectGroupExpData.splitDetails.length === 0?'Select Member':selectedMember} 
                        onChange={selectMembers}
                        style={{fontSize:'medium', marginTop:'5px'}}
                    >
                        <option value="">Select Member</option>
                        {groupMembers?.map((member, idx) =>
                            member.user_id !== collectGroupExpData.paidBy.user_id ? (
                                <option value={member.user_id} key={idx}>
                                    {member.name}
                                </option>
                            ) : null
                        )}
                    </select>

                    <div>
                        {collectGroupExpData.splitDetails.map((member, idx) => (
                            <div key={idx} id='eachPayBackMembDiv'>
                                <p>Name: {member.name}</p>
                                {collectGroupExpData.splitMethod==="Equal" && 
                                    <span>
                                        Amount: {parseFloat((collectGroupExpData.amount / (collectGroupExpData.splitDetails.length+1)).toFixed(2))}
                                    </span>}
                                    
                                {collectGroupExpData.splitMethod === 'Percentage' && (
                                    <input
                                        type="number"
                                        placeholder="Percentage"
                                        value={collectGroupExpData.splitDetails[idx].percentage === 0?'': collectGroupExpData.splitDetails[idx].percentage}
                                        onChange={(e) =>
                                            handleSplitMethod(e.target.value, member.user_id ,member.name, member.profile_image ,collectGroupExpData.amount)
                                        }
                                    />
                                )}
                                {collectGroupExpData.splitMethod === 'Custom' && (
                                    <input
                                        type="number"
                                        placeholder="Enter Amount"
                                        value={collectGroupExpData.splitDetails[idx].amount === 0? '': collectGroupExpData.splitDetails[idx].amount}
                                        onChange={(e) =>
                                            handleSplitMethod('', member.user_id, member.name, member.profile_image, e.target.value)
                                        }
                                    />
                                )}
                                <button onClick={() => handleDelete(idx)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {collectGroupExpData.splitType === 'Group' && collectGroupExpData.paidBy ? (
                <div>
                    <h3>Members who need to pay {collectGroupExpData.paidBy.name}</h3>
                    {groupMembers?.map((member, idx) =>
                        member.user_id !== collectGroupExpData.paidBy.user_id ? (
                            <div key={idx}>
                                <p>Name: {member.name}</p>
                                {collectGroupExpData.splitMethod==="Equal" && 
                                    <span>
                                        Amount: {parseFloat((collectGroupExpData.amount / (groupMembers.length)).toFixed(2))}
                                    </span>
                                }
                                {collectGroupExpData.splitMethod === 'Percentage' && (
                                    <input
                                        type="number"
                                        placeholder="Percentage"
                                        value={
                                            (collectGroupExpData.splitDetails.find((detail) => detail.user_id === member.user_id)?.percentage)==0?''
                                            :
                                            collectGroupExpData.splitDetails.find((detail) => detail.user_id === member.user_id)?.percentage
                                        }
                                        onChange={(e) =>
                                            handleSplitMethod(e.target.value, member.user_id, member.name,member.profile_image, collectGroupExpData.amount)
                                        }
                                    />
                                )}
                                {collectGroupExpData.splitMethod === 'Custom' && (
                                    <input
                                        type="number"
                                        placeholder="Custom Amount"
                                        value={
                                            (collectGroupExpData.splitDetails.find((detail) => detail.user_id === member.user_id)?.amount)==0?''
                                            :
                                            collectGroupExpData.splitDetails.find((detail) => detail.user_id === member.user_id)?.amount
                                        }
                                        onChange={(e) =>
                                            handleSplitMethod('', member.user_id, member.name, member.profile_image, e.target.value)
                                        }
                                    />
                                )}
                            </div>
                        ) : null
                    )}
                </div>
            ) : null}
        </div>
        
        <div id='addExpense' style={{margin:'auto'}}>
            <button style={{fontSize:'medium'}} onClick={handleSubmit}>Submit</button>
            <button
            style={{backgroundColor:'rgb(173, 6, 36)',fontSize:'medium',marginLeft:'10px'}}
            onClick={()=> {setCollectGroupExpData({
                name: '',
                category:'',
                subCategory:'',
                description: '',
                date:'',
                amount: '',
                splitType: '',
                paidBy: '',
                splitMethod: 'Equal', //Equal or percentage or custom
                splitDetails: [],
                paymentMode:'',
                expense_location:'',
                otherLocation:''
            }), setShowCreateGroupExp(false)}}>
            Close</button>
        </div>
        {/* Summary */}
        {showSummary && <div id='expSummaryDiv_exp'>
            <h3>Summary</h3>
            <p>Description: {collectGroupExpData.description}</p>
            <p>Amount: {collectGroupExpData.amount}</p>
            {/* <p>Who Paid: {collectGroupExpData.paidBy.name}</p> */}
            <p>Members that return money to {collectGroupExpData.paidBy.name}:</p>
            <div id='summayDiv_exp'>
                {showSummary && collectGroupExpData.splitDetails.map((elm, idx) => (
                <div key={idx}>
                    <p>Name: {elm.name}</p>
                    {collectGroupExpData.splitMethod === 'Percentage'? (<p>Percentage: {elm.percentage}%</p>) :null}
                    <p>Amount: {elm.amount}</p>
                </div>  
                ))}
            </div>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                <button onClick={()=>setShowSummary(false)}>Edit</button>
                <button onClick={handleCreateGroupExp}>Save</button>
            </div>
        </div>}
    </div>
  )
}