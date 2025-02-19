import React,{useState} from 'react'

export default function CreateIndividualExp({
        setShowCreateIndExp,
        getExpenses,
        categories,
        locations,
        tour_id,
        tour_type,
        setShowLoading
    }) {
    
    // below hook Gather expense Details to create expense for individual tour profile 
    const [collectIndExpData, setCollectIndExpData] = useState({
        name:'',
        category: '',
        subCategory:'',
        date: new Date(),
        description:'',
        amount: '',
        paymentMode: '',
        expense_location:'',
        otherLocation: ''
    });

    async function handleCreateIndExp(){
        if(!collectIndExpData.name) return alert('Provide name');
        else if(!collectIndExpData.category) return alert('Provide category');
        else if(!collectIndExpData.subCategory) return alert('Porvide sub category');
        else if(collectIndExpData.category === "Other" && !collectIndExpData.subCategory) return alert('Provide other category');
        else if(!collectIndExpData.description) return alert('Provide description');
        else if(!collectIndExpData.amount) return alert('Provide amount');
        else if(!collectIndExpData.paymentMode) return alert('Provide payment mode');
        else if(!collectIndExpData.expense_location) return alert('Provide expense location');
        else if(collectIndExpData.expense_location === "Other" && !collectIndExpData.otherLocation) return alert('Provide other expense location');

        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`,{
                method: 'PATCH',
                headers:{
                'content-type': 'application/json'
                },
                body: JSON.stringify({...collectIndExpData, tour_id, tour_type})
            });
            const finalResut = await result.json();
        
            if(finalResut.failed){
                alert('Error from backend');
            }
            else if(finalResut.created){
                alert('Success');
                getExpenses();
            }else{
                alert('fail');
            }
            setShowCreateIndExp(false);
            setCollectIndExpData(
                {
                name:'',
                category: '',
                subCategory:'',
                date: new Date(),
                description:'',
                amount: '',
                paymentMode: '',
                expense_location:'',
                otherLocation: ''
                }
            );
        } catch (error) {
            alert('fail from here');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
          }
    }

    return (
    <div id="newExp_GE">
            <div style={{width:'200px', margin:'auto'}}>
                <img src="./addProfile.png" alt="err" style={{width:'100%'}} />
            </div>
            <div style={{display:'flex', flexDirection:'row', gap:'10px', justifyContent:'space-between'}}>
                <div style={{display:'grid', gap:'20px', whiteSpace:'nowrap'}}>
                    <span>Name: </span>
                    <span>Date: </span>
                    <span>Amount: </span>
                </div>
                <div style={{display:'grid', gap:'20px'}}>
                    <input type="text" placeholder="Name" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,name:e.target.value}))}/>
                    <input type="date" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,date: e.target.value}))}/>
                    <input type="number" placeholder="Amount" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,amount: e.target.value}))}/>
                </div>
            </div>

            <div>
                <span>Category: </span>
                <select name="" id="" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,category:e.target.value}))}>
                    <option value="">Select Category</option>
                    {categories.map((elem, index)=>(
                    <option value={elem.category} key={index}>{elem.category}</option>
                    ))
                    }
                    <option value="Other">Other</option>
                </select>
            </div>

            {collectIndExpData.category && <div>
            <span>Sub Category: </span>
            {
                collectIndExpData.category === "Other"?(
                <input type="text" placeholder="Sub Category" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,subCategory:e.target.value}))}  />
                ):(
                <select name="" id="" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,subCategory:e.target.value}))}>
                    <option value="">Select Sub Category</option>
                {
                    categories.map((elem)=>(
                    elem.category === collectIndExpData.category?(
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

            <div>
                <span>Payment mode: </span>
                <select name="" id="" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,paymentMode: e.target.value}))}>
                    <option value="">Select mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                </select>
            </div>

            <div>
                <span>Location: </span>
                <select name="" id="" onChange={
                    (e)=>(
                        setCollectIndExpData((prev)=>({...prev,expense_location: e.target.value}))
                    )}>
                    <option value="">Select Location</option>
                    {locations && locations.map((elem,index)=>
                    (
                        <option value={elem} key={index}>{elem}</option>
                    ))
                    }
                    <option value="Other">Other</option>
                </select>
                {collectIndExpData.expense_location === "Other" && <div id="otherLocationDiv">
                    <span>Other Location:</span>
                <input type="text" placeholder="Other Location"  value={collectIndExpData.otherLocation} onChange={(e)=>setCollectIndExpData((prev)=>({...prev,otherLocation: e.target.value}))} /> 
                </div>}
            </div>
            <div>
                <p style={{fontWeight:'bold', fontSize:'large'}}>Description: </p>
                <textarea name="" id="" placeholder="Description" onChange={(e)=>setCollectIndExpData((prev)=>({...prev,description: e.target.value}))}></textarea>
            </div>
            <div id="addExpense" style={{margin:'auto', marginTop:'10px'}}>
            <button onClick={handleCreateIndExp}>Submit</button>
            <button onClick={()=>setShowCreateIndExp(false)} style={{marginLeft:'10px', backgroundColor:'rgb(173, 6, 36)'}}>Close</button>
            </div>
    </div>
  )
}
