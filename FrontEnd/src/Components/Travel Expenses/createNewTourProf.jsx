import React,{useEffect, useState} from 'react'
import Loader from '../Loader/loader';

export default function CreateNewTourProf({
    setShowCreateTourProf,
    availMemList,
    getTourExpensesProfiles,
    userName, 
    profile_image
}) {
    const userId = localStorage.getItem('Spending_Smart_User_id');
    //below hook collect data from user for tour profile
    const [ collectTourProfData, setCollectTourProfData] = useState({
        tour_name: "",
        admin_id: userId, //take for understand who create group if any will create group
        track_for: "",
        group_members: [],
        locations: [],
        start_date: "",
        end_date: "",
        description: "",
        total_budget: "",
    });
    const [selectMember, setSelectMember] = useState([]);
    //below hook use to show div which contain friend list that will may be add in group
    const [showGroupDiv, setShowGroupDiv] = useState(false);
    //below hook used to get and set friend list in select tag
    const [collMem, setCollMem] = useState([]); 
    //below hook used to add memebers in the tour group profile which are exist in friend list
    const [addMem, setaddMem] = useState(""); 
    //below hook used to take and insert locations in tour group profile
    const [inputData, setInputData] = useState(""); 
    const [showLoading, setShowLoading] = useState(false);
    
    //below function add location in profile
    function addLocation() {
        const val = collectTourProfData.locations;
        val.push(inputData);
        setCollectTourProfData((prev) => ({ ...prev, locations: val }));
    }
    
    function handleSelect(e){
        setShowLoading(true);
        let selected = e.target.value; //here we take user's id not name because may be duplicate which will produce problem
        
        // Avoid adding duplicate members and ensure a valid selection
        if(selected && !selectMember.includes(selected)){
            const member = availMemList.find(elm => elm.user_id === selected);
            if(member){
                setSelectMember((prev)=>[...prev, selected]);
                setCollectTourProfData((prev)=>({
                    ...prev, 
                    group_members:[...prev.group_members, member]
                }));
            }
        }
        // Reset select to 'Add Members'
        e.target.value = "Add Members";
        setTimeout(()=>{
          setShowLoading(false);
      });
    }

    //below function delete location in profile
    function deleteLocation(location) {
        const val = collectTourProfData.locations;
        const newArr = val.filter((elm) => elm != location);
        
        setCollectTourProfData((prev) => ({ ...prev, locations: newArr }));
    }

    //below function finally create tour profile
    async function createGroupProf() {
        // Proceed with further logic if no errors
        if (!collectTourProfData.tour_name) return "Enter the tour name";
        else if (!collectTourProfData.track_for) return "Choose for track type";
        else if (!collectTourProfData.locations) return "Add some locations";
        else if (!collectTourProfData.start_date) return "Provide starting date";
        else if (!collectTourProfData.total_budget) return "Enter initial budget";
        else if (!collectTourProfData.description) return "Provide some description";

        try {
          setShowLoading(true);
        const result = await fetch(`${import.meta.env.VITE_API_URL}/travelExpenses`, {
            method: "POST",
            headers: {
            "content-type": "application/json",
            },
            body: JSON.stringify({...collectTourProfData, userName, profile_image}),
        });
        const finalResult = await result.json();
    
        if(finalResult.failed){
            alert("failed due to server error");
        }else if(!finalResult.created){
            alert("fail");
        }else{
            alert("Successful");
            getTourExpensesProfiles();
            
        }
        setShowCreateTourProf(false);
        setCollectTourProfData({
            tour_name: "",
            admin_id: userId, //take for understand who create group if any will create group
            track_for: "",
            group_members: [],
            locations: [],
            start_date: "",
            end_date: "",
            description: "",
            total_budget: "",
        })
        } catch (error) {
            alert("failed to send data to backend");
            console.log(error);
        }finally{
          setTimeout(()=>{
            setShowLoading(false);
          },1000)
        }
    }

  return (
    <>
      <div id="tourProfCreateMain_TE">
        <div style={{width:'200px',margin:'auto'}}>
          <img src="./addProfile.png" alt="error" style={{width:'100%'}} />
        </div>
        <div>
          <span>Name:</span>
          <input
            type="text"
            placeholder="Tour Name"
            onChange={(e) =>
              setCollectTourProfData((prev) => ({ ...prev, tour_name: e.target.value }))
            }
          />
        </div>

        <div>
          <div>
            <h3>Create for which profile:</h3>
          </div>
          <div style={{
            display: "grid",
            gap: "10px",
            fontSize: "large",
            marginTop: "5px"
          }}>
            <label  htmlFor="individual_tour" style={{cursor:'pointer'}}>
              <input
                type="radio"
                name="tour_for"
                value="Individual"
                id="individual_tour"
                style={{marginRight:'5px'}}
                onChange={(e) =>
                  setCollectTourProfData((prev) => ({
                    ...prev,
                    track_for: e.target.value,
                  }))
                }
                onClick={() => setShowGroupDiv(false)}
              />
              Individual
            </label>
            <label htmlFor="group_tour" style={{cursor:'pointer'}}>
              <input
                type="radio"
                name="tour_for"
                value="Group"
                id="group_tour"
                style={{marginRight:'5px'}}
                onChange={(e) =>
                  setCollectTourProfData((prev) => ({
                    ...prev,
                    track_for: e.target.value,
                  }))
                }
                onClick={() => setShowGroupDiv(true)}
              />
              Group
            </label>
          </div>
        </div>

        {showGroupDiv && (
          <div>
            <h3>Select group members: </h3>
            <div id='selectMemberDiv_TE'>
                <select name="" id="" onChange={handleSelect}>
                    <option>Add Members</option>
                {
                    availMemList.length>0 && availMemList.map((elem,index)=>(
                    elem.user_id != userId ? <option value={elem.user_id} key={index}>{elem.name}</option> : null
                    ))
                }   
                </select>
                {collectTourProfData.group_members.length>0 && <div id='selectGMDiv'>
                    {collectTourProfData.group_members.map((elm,idx)=>(
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
                                    const arr = collectTourProfData.group_members.filter((elem)=>elem.user_id!=elm.user_id);
                                    setCollectTourProfData((prev)=>({...prev, group_members:arr}));
                                    const arr2 = selectMember.filter((elem)=>elem != elm.user_id);
                                    setSelectMember(arr2);
                                }}
                            />
                        </div>: null
                    ))}
                </div>}
            </div>
          </div>
        )}

        <h3>Enter Tour locations: </h3>
        <div>
          <input
            type="text"
            name=""
            id=""
            placeholder="Location name"
            onChange={(e) => setInputData(e.target.value)}
          />
          <button 
            style={{marginLeft:'10px', fontSize:'medium'}}
            onClick={addLocation}
          >Add</button>
        </div>
        <div id="selectedLocationDiv_TE">
          <div>
            <h3>Selected Locations:</h3>
          </div>
          {collectTourProfData.locations.length > 0 ?
            collectTourProfData.locations.map((elem, index) => (
              <div key={index} id="selectedLocations_TE">
                <span>{index+1}.</span>
                <span>{elem}</span>
                <button style={{fontSize:'small'}} onClick={(e) => deleteLocation(elem)}>Delete</button>
              </div>
            )):
            <p style={{marginTop:'10px'}}>Empty</p>
            }
        </div>

        <div style={{display:'grid', gap:'10px'}}>
          <label htmlFor="" >
            Start Date:
            <input
              type="date"
              style={{marginLeft:'10px'}}
              onChange={(e) =>
                setCollectTourProfData((prev) => ({
                  ...prev,
                  start_date: e.target.value,
                }))
              }
            />
          </label>
          <label htmlFor="">
            End Date (Optional):
            <input
              type="date"
              style={{marginLeft:'10px'}}
              onChange={(e) =>
                setCollectTourProfData((prev) => ({
                  ...prev,
                  end_date: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <div>
          <span>Total Budget:</span>
          <input
            type="number"
            placeholder="Total Budget"
            style={{
              width:'40%',
              textAlign:'center'
            }}
            onChange={(e) =>
              setCollectTourProfData((prev) => ({
                ...prev,
                total_budget: e.target.value,
              }))
            }
          />
        </div>

        <div style={{width:'100%'}}>
          <p
            style={{
              fontSize:'large',
              fontWeight: 'bold',
              marginBottom:"10px"
            }}
          >Description:</p>
          <textarea
            name=""
            id=""
            placeholder="Description"
            value={collectTourProfData.description}
            onChange={(e) =>
              setCollectTourProfData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={createGroupProf}>Submit</button>
          <button onClick={()=>setShowCreateTourProf(false)} style={{marginLeft:'10px', backgroundColor:'rgb(173, 6, 36)'}}>Close</button>
        </div>
      </div>
    {showLoading? <Loader/>:null}
    </>
  )
}
