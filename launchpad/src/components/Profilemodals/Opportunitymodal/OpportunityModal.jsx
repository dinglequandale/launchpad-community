import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import "./opportunitymodal.css";
import MakeChanges from '../../Makechanges/MakeChanges';
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';

export default function OpportunityModal({visibility, onClose}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
//   const prevAboutMe =  localStorage.getItem("userAboutMe", "") ? localStorage.getItem("userAboutMe", "") : "";

  // later replace with logic tailored to FireStore

  const clearCache = () => {
    localStorage.setItem("userAboutMe", prevAboutMe);
  }

  const saveOpportunityData = () => {
    localStorage.setItem("userOpportunityData", opportunityData);
    onClose();
  }

//   useEffect(() => {
//     const storedOpportunityData = localStorage.getItem("userOpportunityData");
//     if (storedAboutMe || storedAboutMe === "") {
//         setOpportunityData(JSON.parse(storedOpportunityData));;
//     }
//     }, [visibility]);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: "3",
      overflow: "hidden",
    }
  };

  const [opportunityData, setOpportunityData] = useState({workplaceOpportunityType: '',
    hostCompany: '',
    internFieldOfWork: '',
    internPosition: '',
    internExpectations: '',
    isPaid: 'paid',
    applicants: 'both',
    workLocation: 'onsite',
    timeFrame: '',
    learnMoreLink: '',
    applyLink: '',
    organizationLogo: null,
  });

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    setOpportunityData({
      ...opportunityData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  return (
    <div style={{}}>
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose} clearCache={clearCache}/>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Opportunity Modal"
        shouldCloseOnOverlayClick={false} 
        preventScroll
      >
        <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "10px"}}> Your Workplace Opportunity <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Be the ember that lights a fire in young minds.</span></h2>
        <content>
        <form onSubmit={saveOpportunityData} style={{display: "flex", flexDirection: "column", justifyContent: "space-around", width: "800px"}}>
            <label htmlFor="workplaceOpportunityType">Workplace Opportunity Type:</label>
            <select
                id="workplaceOpportunityType"
                name="workplaceOpportunityType"
                value={opportunityData.workplaceOpportunityType}
                onChange={handleChange}
            >
                <option value="">Select Type</option>
                <option>Shadowing</option>
                <option>Internship</option>
            </select>

            <label htmlFor="hostCompany">Host Company / Organization:</label>
            <input
                id="hostCompany"
                name="hostCompany"
                value={opportunityData.hostCompany}
                onChange={handleChange}
                type='text'
                maxLength={40}
            />
            <div style={{display: "flex", justifyContent: "space-around"}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                    <label htmlFor="internFieldOfWork">Intern Field of Work</label>
                    <input
                        id="internFieldOfWork"
                        name="internFieldOfWork"
                        value={opportunityData.internFieldOfWork}
                        onChange={handleChange}
                        type='text'
                        maxLength={40}
                        placeholder='e.g. “finance”'
                    />
                </div>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                    <label htmlFor="internPosition">Intern Position</label>
                    <input
                        id="internPosition"
                        name="internPosition"
                        value={opportunityData.internPosition}
                        onChange={handleChange}
                        type='text'
                        maxLength={40}
                        placeholder='e.g. "data analytics"'
                    />
                </div>
            </div>
            <label htmlFor="internExpectations">Intern Expectations</label>
            <textarea 
                className='internExpectations'
                id="internExpectations"
                name="internExpectations"
                value={opportunityData.internExpectations}
                onChange={handleChange}
                maxLength={500}
                placeholder='Briefly describe the tools and knowledge interns will need to be equipped with to succeed in the internship."'>
            </textarea>
            <br />
            <label htmlFor="basicLogistics" style={{fontWeight: "bolder", fontSize: "larger"}}>Basic Logistics</label>
            <div style={{display: "flex", flexWrap: "wrap", justifyContent:"space-evenly", alignItems: "center"}} className='basicLogistics'>
                <div className='logisticsQuestion'>
                    <label htmlFor="isPaid">Is this opportunity paid or unpaid?</label>
                    <select
                        id="isPaid"
                        name="isPaid"
                        value={opportunityData.isPaid}
                        onChange={handleChange}>
                            <option>Paid</option>
                            <option>Unpaid</option>
                    </select>
                </div>
                <div className='logisticsQuestion'>
                    <label htmlFor="workLocation">What is the format of the opportunity?</label>
                    <select
                        id="workLocation"
                        name="workLocation"
                        value={opportunityData.workLocation}
                        onChange={handleChange}>
                            <option>On-site</option>
                            <option>Remote</option>
                            <option>Hybrid</option>
                    </select>
                </div>
                <div className='logisticsQuestion'>
                    <label htmlFor="applicants">Do applicants have to be in college or in high school?</label>
                    <select
                        id="applicants"
                        name="applicants"
                        value={opportunityData.applicants}
                        onChange={handleChange}>
                            <option>Either one</option>
                            <option>High School</option>
                            <option>College</option>
                    </select>
                </div>
                <div className='logisticsQuestion'>
                    <label htmlFor="timeFrame">What is the timeframe of this opportunity?</label>
                    <select
                        id="timeFrame"
                        name="timeFrame"
                        value={opportunityData.timeFrame}
                        onChange={handleChange}>
                            <option>One Week</option>
                            <option>Two Weeks</option>
                            <option>Three Weeks</option>
                    </select>
                </div>
            </div>
            <label htmlFor="learnMoreLink">Where would you like users to learn more about your opportunity?</label>
            <input
                type="link"
                id="learnMoreLink"
                name="learnMoreLink"
                value={opportunityData.learnMoreLink}
                onChange={handleChange}
                placeholder='Paste a link here!'
            />
            <label htmlFor="applyLink">Where can students apply?</label>
            <input
                type="link"
                id="applyLink"
                name="applyLink"
                value={opportunityData.applyLink}
                onChange={handleChange}
                placeholder='Paste a link here!'
            />
            <label htmlFor="organizationLogo">Upload a logo of your organization or an image that embodies your opportunity.</label>
            <input
                type="file"
                id="organizationLogo"
                name="organizationLogo"
                value={opportunityData.organizationLogo}
                onChange={handleChange}
            />
            <label htmlFor="cardPreview">Card Preview:</label>
            {/* <OrganizationProfile/> */}
        </form>
        </content>
        <footer style={{bottom: "0px", paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
          <button onClick={
            ()=>setMakeChangesVisibility(true)
            } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Cancel</button>
          <button onClick={saveOpportunityData} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Save Changes</button>
        </footer>
      </Modal>
    </div>
  );
};