import React,{useState,useEffect} from 'react'

export async function handleAddMember(data,tour_id,setShowLoading ){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses/addMember`,{
            method:'PATCH',
            headers:{
                'content-type':'application/json'
            },
            body: JSON.stringify({...data, tour_id:tour_id})
        });
        const finalResult = await result.json();

        if(finalResult.failed){
            alert("error from backend and failed to add member");
            return {bool:false}
        }else if(!finalResult.updated){
            alert("failed to add member");
            return {bool:false}
        }else{
            return {bool:true, data}
        }
    } catch (error) {
        alert("error from frontEnd and failed to add member");
        console.log(error);        
        return {bool:false}
    }finally{
        setTimeout(()=>{
            setShowLoading(false);
        });
    }
}
export async function handleDeleteMember(member_id, tour_id, setShowLoading ){
    try {
        setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses/removeMember`,{
            method:'PATCH',
            headers:{
                'content-type':'application/json'
            },
            body: JSON.stringify({member_id:member_id, tour_id:tour_id})
        });
        const finalResult = await result.json();

        if(finalResult.failed){
            alert("error from backend and failed to remove member");
            return {bool:false}
        }else if(!finalResult.updated){
            alert("failed to remove member");
            return {bool:false}
        }else{
            return {bool:true, member_id:member_id}
        }
    } catch (error) {
        alert("error from frontEnd and failed to remove member");
        console.log(error);        
        return {bool:false}
    }finally{
        setTimeout(()=>{
            setShowLoading(false);
        });
      }
}

export default function GroupMembers({
    group_members,
    admin_id,
    availMemList,
    setShowConfirmBox,
    tour_id,
    handleDeleteExpProf,
    handleMakeAdmin,
    setShowLoading
}) {
    const [showMakeAdmin, setShowMakeAdmin] = useState({show:false, data:'', canMakeAdmin:false});
    const [showAddMember, setShowAddMember] = useState();
    const [adminLeave, setAdminLeave] = useState(false);
    const [showAdminDeleteMsgBox, setShowAdminDeleteMsgBox] = useState(false);
    const [showAdminBtn, setShowAdminBtn] = useState(false);
    
    const userId = localStorage.getItem('Spending_Smart_User_id');
    const [showHideDiv, setShowHideDiv] = useState(true);
    
    async function  handleAdminLeave(){
    }

    useEffect(()=>{
        if(showMakeAdmin.canMakeAdmin){
            handleMakeAdmin(showMakeAdmin.data);
            setShowMakeAdmin({show:false, data:'', canMakeAdmin:false});
        }
    },[showMakeAdmin]);

    useEffect(()=>{
        if(adminLeave){
            setShowAdminDeleteMsgBox(false);
            handleDeleteExpProf()
        }
    },[adminLeave]);

    useEffect(()=>{
        if(!admin_id){
            return;
        }
        if(admin_id == userId){
            setShowAdminBtn(true);
        }else{
            setShowAdminBtn(false);
        }
    },[admin_id]);

  return (
    <>
    <div id='mainGroupMember' className={showHideDiv?'showHideGroupDiv':''}>
        <div id='headingGM' onClick={()=>setShowHideDiv(!showHideDiv)}>
            <h2>Group Members</h2>
        </div>
        <div style={{flex:'1'}}>
            <div id='MemberListDiv'>
            { group_members.map((elm,idx)=>(
                <div 
                    id='memberDiv' key={idx} 
                    style={{cursor:admin_id == elm.user_id?'unset':'pointer'}}
                >
                    <div>
                        <img src={elm.profile_image||"./dummyProfileImg.png"} id='memberImg' alt="error" />
                    </div>
                    <div 
                        onClick={() => {
                            setShowMakeAdmin({
                                show:!showMakeAdmin.show,
                                data:elm,
                                canMakeAdmin:false
                            })
                        }}
                        style={{flex:'1'}}>
                        {elm.user_id === admin_id && <span style={{color:'green', fontSize:'smaller', fontWeight:'bold'}}>Admin</span>}
                        <p>{elm.name}</p>
                    </div>
                    <div>
                        {admin_id === userId && 
                            <img 
                                src="./removeMember.png" 
                                alt="error" 
                                onClick={()=>setShowConfirmBox({bool:true,work:'deleteMember', data:{member_id:elm.user_id, tour_id:tour_id }})} 
                                style={{width:'35px', cursor:'pointer'}} 
                            />
                        }
                    </div>
                    {/* make admin div */}
                    {showAdminBtn && admin_id !== elm.user_id && showMakeAdmin.show && showMakeAdmin.data.user_id == elm.user_id &&
                    <div id='makeAdminDiv'>
                        <div>
                            <button 
                                onClick={()=>setShowMakeAdmin({
                                    show: !showMakeAdmin.show,
                                    data:elm, 
                                    canMakeAdmin:true
                                })}>Make Admin</button>
                        </div>
                    </div>}
                </div>
                ))
            }
            </div>
            
            <div id='addMemberDiv'>
                { admin_id === userId &&  <button onClick={()=>{setShowAddMember(!showAddMember)}}>Add Member</button>}
                {/* below code to add member in member list */}
                {showAddMember && <div id='availableMemberDiv'>
                {
                    (() => {
                    // Filter out group members that are already in the group
                    const availableMembers = availMemList.filter(elm => 
                        !group_members.some(groupMember => groupMember.user_id === elm.user_id)
                    );

                    // If there are no available members, show the message
                    if (availableMembers.length === 0) {
                        return <h4>No more members to add</h4>;
                    }

                    // If there are available members, render them
                    return availableMembers.map((elm, idx) => (
                        <div 
                            key={idx}
                            id='newMemberDiv'  
                            onClick={()=>{setShowConfirmBox({bool:'true', work:'addMember', data:elm}, setShowAddMember(false))}}
                        >
                            <img 
                                src={elm.profile_image || "./dummyProfileImg.png"} 
                                alt="error" 
                            />
                            <span style={{ fontSize: 'medium' }}>{elm.name}</span>
                        </div>
                    ));
                    })()
                }
                </div>}
            </div>
        </div>
        {admin_id == userId?<div id='leaveBtn'>
            <button onClick={()=>setShowAdminDeleteMsgBox(true)}>Leave</button>
        </div>:
        <div id='leaveBtn'>
            <button onClick={()=> setShowConfirmBox({bool:true,work:'deleteMember', data:{member_id: userId, tour_id:tour_id }})}>Leave</button>
        </div>}
    </div>
    {showAdminDeleteMsgBox && <div id='adminLeaveDiv'>
        <div id='adminLeaveMsg'>
            <p> 
                <strong style={{color:'black'}}>Alert!</strong> 
                You are Admin and If you leave then group will delete. You can make other member to admin, So group will not delete.</p>
        </div>
        <div id='adminLeaveBtnDiv'>
            <button onClick={()=>setAdminLeave(true)}>Yes</button>
            <button onClick={()=>setShowAdminDeleteMsgBox(false)}>No</button>
        </div>
    </div>}
    </>
  )
}
