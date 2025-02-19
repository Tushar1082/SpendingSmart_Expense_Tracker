import React,{useEffect, useState} from 'react';
import GroupExpenses from './groupExpenses/groupExpenses';
import BodyNavbar from '../Homepage/Body/bodyNavbar';
import { showHideOldExpProfBar } from '../../services/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Loader/loader';
import './group.css';

export default function Group() {
    const userId = localStorage.getItem('Spending_Smart_User_id');
    const [showLoading, setShowLoading] = useState(false);
    const [data,setData] = useState({
        group_name: '',
        admin_id: userId,
        group_members:[],
        total_budget:'',
        description:'',
        start_date:'',
        end_date:'',
    });
    const [selectMember, setSelectMember] = useState([]);
    const [availMemList, setAvailMemList] = useState([]); //Total available memberlist from friend list
    const [showAddMember, setShowAddMember] = useState();
    const [showAdminDeleteMsgBox, setShowAdminDeleteMsgBox] = useState(false);
    const [adminLeave, setAdminLeave] = useState(false);
    const [showMakeAdmin, setShowMakeAdmin] = useState({show:false, data:'', canMakeAdmin:false});

    const [groups,setGroups] = useState([]);
    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showConfirmBox, setShowConfirmBox] = useState({
        bool: false,
        data: ''
    });
    // const [accordionData, setAccordionData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showAdminBtn, setShowAdminBtn] = useState(false);
    const [userData,setUserData] = useState(); //contain main user id, name, profile image use to send money request in group expense page
    const [someProfData,setSomeProfData] = useState();
    const [showHideDiv, setShowHideDiv] = useState(true);
    const dispatch = useDispatch();
    const {showHideProfBar} = useSelector((state)=>state.user);

    async function callUserData(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/user?user_id=${userId}`,{
                method:'GET',
                headers:{
                    'content-type':'application/json'
                }
            });
            const finalResult = await result.json();
            if(finalResult){
                setUserData({user_id:finalResult._id, profile_image:finalResult.profile_image ,name: finalResult.name});
                return {
                    bool:true,
                    profileImg: finalResult.profile_image,
                    username: finalResult.name,
                    groups: finalResult.groups?finalResult.groups:[], //If user not enrolled in any group
                    friendList: finalResult.friendList
                }
            }else if(finalResult.notFound){
                alert('user data not found in server');
                return {bool:false};
            }else if(finalResult.failed){
                alert('error come from backend(/user)');
                return {bool:false};
            }
    
        } catch (error) {
         alert('error while get data from user');
         console.log(error);   
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
        }
    }

    async function getGroups(groups, idx=0){
        try { 
            setShowLoading(true);
            if(groups.length<0)
                return false;

            const arr=[];
            groups.map((elem)=>{
                arr.push(elem.group_id);
            });
            const result = await fetch(`${import.meta.env.VITE_API_URL}/group`,{
                method:'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Array-Data': JSON.stringify(arr)
                }
            })
            const finalResult = await result.json();
    
            if(finalResult.notFound){
                alert('group not exists');
                setSelectedGroup(false);
                setShowCreateNewGroup(false);
            }        
            else if(finalResult.failed){
                alert('failed to get groups but error from backend server');
                setSelectedGroup(false);
                setShowCreateNewGroup(false);
            }else{
                setGroups(finalResult.groups);
                setSelectedGroup(finalResult.groups[idx]);
                // setSelectedGroupId(finalResult.groups[0]._id);
            }
        } catch (error) {
            alert('failed to get groups');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
        }
    }

    function collectGroupMember(friendList){
        if(!friendList){
            return;
        }
        
        let arr = [];
        
        friendList.forEach((elem)=>{
            arr.push({user_id:elem.user_id,profile_image:elem.profile_image,name:elem.name});
        })
        setAvailMemList(arr);
    }

    function handleSelect(e){
        setShowLoading(true);
        let selected = e.target.value; //here we take user's id not name because may be duplicate which will produce problem
        
        // Avoid adding duplicate members and ensure a valid selection
        if(selected && !selectMember.includes(selected)){
            let member = availMemList.filter((elm) => {
                if(elm.user_id === selected){
                    return elm;
                }
            });
            setSelectMember((prev)=>[...prev, selected]);
            setData({...data,group_members:[...data.group_members,...member]});
        }
        // Reset select to 'Add Members'
        e.target.value = "Add Members";
        setTimeout(()=>{
            setShowLoading(false);
        });
    }
    
    async function createGroupProf(){//used to create group'
        if(!data.group_name) return alert("Provide group name");
        else if(data.group_members.length==1 || data.group_members.length==0) return alert("Select group members");
        else if(!data.total_budget) return alert("Provide total budget");
        else if(!data.description) return alert("Provide description");
        else if(!data.start_date) return alert("Enter start data");

        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/group`,{
                method:'POST',
                headers:{
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const finalResult = await result.json();
            if(finalResult.created){
                alert('group created');                
                getGroupProfiles();
            }
            else if(!finalResult.created){
                alert('group not created');
            }
            else if(finalResult.failed){
                alert('failed due to server error');
            }
            setShowCreateNewGroup(false);
            setData({
                group_name: '',
                admin_id: userId,
                group_members:[],
                total_budget:'',
                description:'',
                start_date:'',
                end_date:'',
            })
            setSelectMember([])
        } catch (error) {
            alert('failed to send data to backend');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
        }
    }
    async function deleteGroupProf(group_id){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/group`,{
                method:'DELETE',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({group_id, user_id: userId, groupMembers:selectedGroup.group_members})
            });

            const finalResult = await result.json();

            if(finalResult.failed){
                alert("Error From BackEnd");
            }
            else if(finalResult.updated){
                const newArr = groups.filter((elm)=> elm._id != group_id);
                setGroups(newArr);
                setSelectedGroup(newArr[0]);
            }else{
                alert('failed to delete expense from backend');
            }
        } catch (error) {
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
        }
    }

    async function getGroupProfiles(){
        const result = await callUserData();
        if(result.bool){
            getGroups(result.groups, groups.length);
            collectGroupMember(result.friendList);
            setData((prev)=>({...prev, group_members:[{user_id:userId,profile_image:result.profileImg,name:result.username}]}))
        }
    }
    async function deleteGroupMember(memberId) {
        if(!selectedGroup){
            return;
        }
        if(memberId === selectedGroup.admin_id && userId === memberId){
            setShowAdminDeleteMsgBox(true);
        }
        else{
            try {
                setShowLoading(true)
                const result = await fetch(`${import.meta.env.VITE_API_URL}/group`,{
                    method: 'PATCH',
                    headers:{
                        'content-type':'application/json'
                    },
                    body: JSON.stringify({member_id:memberId, group_id:selectedGroup._id, deleteMember:true})
                });
                const finalResult =await result.json();
    
                if(finalResult.failed){
                    alert('error from backend');
                }else if(!finalResult.updated){
                    alert('fail');
                }else{
                    if(memberId == userId){ //When user leave group then we fetch groups again
                        getGroupProfiles();
                        return;
                    }
                    let arr = selectedGroup.group_members.filter((elm)=> elm.user_id !== memberId);

                    const updatedProfilesArr = groups.map((elm)=>{
                        if(elm._id == selectedGroup._id){
                          return {...elm, group_members: arr}
                        }else{
                          return elm;
                        }
                      });
                    
                    setGroups(updatedProfilesArr);
                    setSelectedGroup((prev)=>({...prev, group_members:arr}));
                }
            } catch (error) {
                alert('error from here');
                console.log(error);
            }finally{
                setTimeout(()=>{
                    setShowLoading(false);
                });
            }
        }  

    }
    async function addGroupMember(memberId, name, profile_image){
        if(!selectedGroup){
            return;
        }
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/group`,{
                method: 'PATCH',
                headers:{
                    'content-type':'application/json'
                },
                body: JSON.stringify({member_id:memberId, group_id:selectedGroup._id, name, profile_image, addMember:true})
            });
            const finalResult =await result.json();

            if(finalResult.failed){
                alert('error from backend');
            }else if(!finalResult.updated){
                alert('fail');
            }else{
                const arr = groups.map((elm)=>{
                    if(elm._id== selectedGroup._id){
                      return {...elm, group_members: [...selectedGroup.group_members, {user_id:memberId, name, profile_image}]}
                    }else{
                      return elm;
                    }
                });
                setGroups(arr);
                setSelectedGroup((prev)=>({...prev, group_members:[...prev.group_members, {user_id:memberId, name, profile_image}]}));
            }
        } catch (error) {
            alert('error from here');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
        }
    }
    function handleAdminLeave(){
        if(selectedGroup.admin_id === userId){
            setShowAdminDeleteMsgBox(true);
        }
    }

    async function handleMakeAdmin(){
        try {
            setShowLoading(true);
            const result = await fetch(`${import.meta.env.VITE_API_URL}/group`,{
              method:'PATCH',
              headers:{
                'content-type':'application/json'
              },
              body: JSON.stringify({...showMakeAdmin.data,group_id: selectedGroup._id,makeAdmin:true,prevAdmin_id: selectedGroup.admin_id})
            });
            const finalResult = await result.json();

            if(finalResult.failed){
                alert('error form backend');
            }else if(!finalResult.updated){
                alert('fail to make admin');
            }else{
                let arr = selectedGroup.group_members.map((prev)=> ({...prev,isAdmin:prev.user_id == showMakeAdmin.data.user_id? prev.isAdmin = true:prev.isAdmin=false}));
                // Below code update admin in specific profile from all profiles
                const updatedAdmin = groups.map((elm)=>{
                    if(elm._id == selectedGroup._id){
                        return {...elm, group_members:arr, admin_id:showMakeAdmin.data.user_id}
                    }else{
                        return elm;
                    }
                });
                setGroups(updatedAdmin);
                setSelectedGroup((prev)=>({...prev, group_members:arr, admin_id:showMakeAdmin.data.user_id}));
                setShowMakeAdmin({show:false, data:'', canMakeAdmin:false});
            }
        } catch (error) {
            alert('failure from here');
            console.log(error);
        }finally{
            setTimeout(()=>{
                setShowLoading(false);
            });
        }
    }
    function showHideOldProfBar(){
        dispatch(showHideOldExpProfBar(false));
    }

    useEffect(()=>{
        getGroupProfiles();
    },[]);
    
    useEffect(()=>{
        if(adminLeave){
            setShowAdminDeleteMsgBox(false);
            deleteGroupProf(selectedGroup._id);
        }
    },[adminLeave]);
    
    useEffect(()=>{
        if(showMakeAdmin.canMakeAdmin){
            handleMakeAdmin();
            setShowMakeAdmin((prev)=>({show:false, data:prev.data, canMakeAdmin:false}));
        }
    },[showMakeAdmin]);
    
    function fun(){
        setSomeProfData({
            totalBudget: selectedGroup.total_budget.$numberDecimal,
            description: selectedGroup.description || 'empty',
            startDate: new Date(selectedGroup.start_date).toLocaleDateString(),
            // startDate: new Date(selectedGroup.start_date),
            // ...(selectedGroup.end_date && {endDate: new Date(selectedGroup.end_date).toLocaleString()}),
            ...(selectedGroup.end_date && {endDate: new Date(selectedGroup.end_date).toLocaleDateString()}),
        })
    }
    
    useEffect(()=>{
        if(!selectedGroup){
            return;
        }
        if(selectedGroup.admin_id == userId){
            setShowAdminBtn(true);
        }else{
            setShowAdminBtn(false);
        }
        fun();
    },[selectedGroup]);

    return (
        <div style={{display:'flex', }}>
            
            {/* Below part show old group profiles*/}
            {selectedGroup && 
            <div id='main_oldExpenses' className={showHideProfBar?'showOldExpProfBar':''} >
                <div id='oldExpenseBody'>
                    
                    {groups.length > 0 && <div id='all_expenese_profile'>
                        <div style={{margin:'1rem'}} id='allExpenseProfHeading'>
                            <h2>All Expense Profiles: -</h2>
                        </div>
                        {groups.map((elm,index)=>(                       
                            <div 
                                key={index} 
                                id='each_expense_profile' 
                                style={{
                                    backgroundColor: selectedGroup._id == elm._id?"#AFEFEF":"rgba(0, 0, 0, 0.8)",
                                    color: selectedGroup._id == elm._id?"black":"white",
                                    boxShadow: selectedGroup._id == elm._id?"-1px 1px 4px 1px #000000a1":""
                                }} 
                                onClick={()=>{setSelectedGroup(elm),setShowAnalysis(false), setTableData([])}}
                            >
                                <h3 id='eachProfHeading'>Profile Name: {elm.name}</h3>
                                <div id='eachProfDetails'>
                                    <p> <strong>Total budget:</strong> {elm.total_budget.$numberDecimal}</p>
                                    <p><strong>Start date:</strong> {new Date(elm.start_date).toLocaleDateString()}</p>
                                    { elm.end_date && <p><strong>End date:</strong> {new Date(elm.end_date).toLocaleDateString()}</p>}
                                    <p><strong>Description:</strong> {elm.description||'empty'}</p>
                                </div>
                                { selectedGroup.admin_id === userId && <div id="deleteExpProfDiv">
                                    <button 
                                        style={{
                                            color: selectedGroup._id == elm._id?"white":"black",
                                            backgroundColor: selectedGroup._id == elm._id?"rgba(0, 0, 0, 0.8)":'white',
                                        }}
                                        onClick={()=>setShowConfirmBox({bool:true, data:elm._id})}
                                    >Delete</button>
                                </div>}
                            </div>
                        ))
                        }
                    </div>
                    }

                    <div id='new_expense_profile_div' onClick={()=>setShowCreateNewGroup(true)}>
                        <button>Create New Expense Profile</button>
                    </div>
                </div>
                <div id='leftToRightBtn' onClick={showHideOldProfBar}>
                    <img src="leftArrow.png" alt="error"  />
                </div>
            </div>
            
            }
            
            {/* Below part show group exceptions */}
            {selectedGroup &&
                <GroupExpenses 
                    groupId = {selectedGroup._id}
                    userData = {userData} 
                    selectedGroup = {selectedGroup} 
                    showAnalysis={showAnalysis} 
                    setShowAnalysis={setShowAnalysis} 
                    tableData={tableData} 
                    setTableData={setTableData} 
                    setSomeProfData={setSomeProfData}
                    someProfData={someProfData}
                />}
            
            { selectedGroup && <div id='mainGroupMember' className={showHideDiv?'showHideGroupDiv':''}>
                <div id='headingGM' onClick={()=>setShowHideDiv(!showHideDiv)}>
                    <h2>Group Members</h2>
                </div>
                <div id='groupMemberList_G'>
                    <div id='MemberListDiv'>
                    { selectedGroup.group_members.map((elm,idx)=>(
                        <div 
                            id='memberDiv' key={idx} 
                            // onClick={()=>setShowMakeAdmin({show:!showMakeAdmin.show,data:elm, canMakeAdmin:false})}
                            style={{cursor:selectedGroup.admin_id == elm.user_id?'unset':'pointer'}}
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
                                {elm.user_id === selectedGroup.admin_id && <span id='adminTag'>Admin</span>}
                                <p>{elm.name}</p>
                            </div>
                            <div>
                                {selectedGroup.admin_id === userId && 
                                    <img 
                                        src="./removeMember.png" 
                                        alt="error" 
                                        onClick={()=>setShowConfirmBox({bool:true,work:'deleteMember', data:elm.user_id})} 
                                        style={{width:'35px', cursor:'pointer'}} 
                                    />
                                }
                            </div>
                            {/* make admin div */}
                            { showAdminBtn && selectedGroup.admin_id !== elm.user_id && showMakeAdmin.show && showMakeAdmin.data.user_id == elm.user_id &&
                            <div id='makeAdminDiv'>
                                <div>
                                    <button 
                                        onClick={()=>setShowMakeAdmin({
                                            show: !showMakeAdmin.show,
                                            data:elm, 
                                            canMakeAdmin:true
                                        })}
                                    >Make Admin</button>
                                </div>
                            </div>}
                        </div>
                        ))
                    }
                        <div id='addMemberDiv'>
                            { selectedGroup.admin_id === userId &&  <button onClick={()=>{setShowAddMember(!showAddMember)}}>Add Member</button>}
                            {/* below code to add member in member list */}
                            {showAddMember && <div id='availableMemberDiv'>
                            {
                                (() => {
                                // Filter out group members that are already in the group
                                const availableMembers = availMemList.filter(elm => 
                                    !selectedGroup.group_members.some(groupMember => groupMember.user_id === elm.user_id)
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
                    
                    {selectedGroup.admin_id == userId?<div id='leaveBtn'>
                        <button onClick={handleAdminLeave}>Leave</button>
                    </div>:
                    <div id='leaveBtn'>
                        <button onClick={()=> setShowConfirmBox({bool:true,work:'deleteMember', data:userId})}>Leave</button>
                    </div>}
                </div>
            </div>}

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
            
            {/* when empty group profiles */}
            {selectedGroup != null && selectedGroup === false && <div>
                <BodyNavbar/>
                <div id='emptyExpenseProfile'>
                    <img  src="./empty.jpg" alt="error" />
                </div>
                <div id='new_expense_profile_div' style={{margin:'auto'}}>
                    <button onClick={()=>setShowCreateNewGroup(true)}>Create new group</button>
                </div>
            </div>}

            {/* Below code create new group */}
            {showCreateNewGroup && 
                <div id='createNewGroupDiv_G'>
                    <div style={{width:'200px', margin:'auto'}}>
                        <img src="./addProfile.png" alt="error" style={{width:'100%'}} />
                    </div>
                    <div>
                        <span>Name: </span>
                        <input type="text" placeholder='Enter the group name..' onChange={(e)=>setData((prev)=>({...prev,group_name:e.target.value}))} />
                    </div>

                    <div>
                        <h3 style={{marginBottom:'15px'}}>Select group members: </h3>
                        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                            <select name="" id="" onChange={handleSelect}>
                                <option>Add Members</option>
                            {
                                availMemList.length>0 && availMemList.map((elem,index)=>(
                                elem.user_id != userId ? <option value={elem.user_id} key={index}>{elem.name}</option> : null
                                ))
                            }   
                            </select>
                            {data.group_members.length>0 && <div id='selectGMDiv'>
                                {data.group_members.map((elm,idx)=>(
                                  elm.user_id !=userId? 
                                    <div key={idx} id='selectGM'>
                                        <img 
                                            src={elm.profile_image || "./dummyProfileImg"} 
                                            alt="error" 
                                        />
                                        <span>{elm.name}</span>
                                        <img 
                                            src="./removeMember.png" 
                                            alt="error"
                                            onClick={()=>{
                                                const arr = data.group_members.filter((elem)=>elem.user_id!=elm.user_id);
                                                setData((prev)=>({...prev, group_members:arr}));
                                                const arr2 = selectMember.filter((elem)=>elem != elm.user_id);
                                                setSelectMember(arr2);
                                            }}
                                        />
                                    </div>: null
                                ))}
                            </div>}
                        </div>
                    </div>
                    <div>
                        <div>
                            <span>Start Date:</span>
                            <input type="date" name="" id="" onChange={(e)=>setData((prev)=>({...prev,start_date: e.target.value}))}/>
                        </div>
                        <div>
                            <span>End Date: (Optional)</span>
                            <input type="date" name="" id="" onChange={(e)=>setData((prev)=>({...prev, end_date: e.target.value}))} />
                        </div>
                    </div>

                    <div>
                        <span>Total Budget: </span>
                        <input type="number" name="" id="" placeholder='Enter the amount' onChange={(e)=>setData((prev)=>({...prev, total_budget:e.target.value}))}/>
                    </div>
                    
                    <div>
                        <h4>Description: </h4>
                        <textarea name="" id="" placeholder='Enter Description' value={data.description} onChange={(e)=>setData((prev)=>({...prev,description:e.target.value}))}></textarea>
                    </div>

                    <div id='createGroupProfBtn'>
                        <button onClick={createGroupProf}>Submit</button>
                        <button onClick={()=>{
                            setShowCreateNewGroup(false),
                            setData({
                                group_name: '',
                                admin_id: userId,
                                group_members:[],
                                total_budget:'',
                                description:'',
                                start_date:'',
                                end_date:'',
                            }),
                            setSelectMember([])
                            }} 
                            style={{marginLeft:'10px', backgroundColor:'rgb(173, 6, 36)'}}
                        >Close</button>
                    </div>
                </div>
            }

            {/* Below code take permission before going to delete group profile*/}
            {showConfirmBox.bool && <div id='delExpProfDiv_TME'>
                    <div>
                        <h3 style={{textAlign: 'center'}}>Are you sure?</h3>
                    </div>
                    <div id='delExpProfDiv_TME_BTNDIV'>
                        <button onClick={()=>
                            {
                                if(showConfirmBox.work === "deleteMember"){
                                    deleteGroupMember(showConfirmBox.data);
                                    setShowConfirmBox({bool:false, data:''});
                                }else if(showConfirmBox.work === "addMember"){
                                    addGroupMember(showConfirmBox.data.user_id, showConfirmBox.data.name, showConfirmBox.data.profile_image);
                                    setShowConfirmBox({bool:false, data:''});
                                }else{
                                    deleteGroupProf(showConfirmBox.data);
                                    setShowConfirmBox({bool:false, data:''});
                                }
                            }
                        }>Yes</button>
                        <button onClick={()=> setShowConfirmBox({bool:false, data:''})}>No</button>
                    </div>
            </div>}
            
            {showLoading && <Loader/>}
        </div>
    )
}