import React, { useContext, useEffect, useRef, useState } from 'react'
import { templates } from "../assets/assets";
import toast, { LoaderIcon } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import html2canvas from "html2canvas";
import { uploadInvoiceThumbnail } from "../service/cloudinaryService";
import InvoicePreview from '../components/InvoicePreview';
import { deleteInvoice, saveInvoice, sendInvoice } from '../service/invoiceService';
import { generatePdfFromElement } from '../util/pdfUtils';
import { useAuth,useUser } from '@clerk/clerk-react';

function PreviewPage() {
  const previewRef= useRef();

  const {selectedTemplate,invoiceData,setSelectedTemplate,baseURL}=useContext(AppContext);
  const [loading,setLoading]= useState(false)
  const [downloading,setDownloading]= useState(false)
  const [showModal,setShowModal]= useState(false);
  const [customerEmail,setCustomerEmail]=useState("");
  const [emailing,setEmailing]=useState(false);
  const navigate= useNavigate();
  const {getToken}= useAuth();
  const {user}=useUser();
  
  const handleSaveAndExit = async()=>{
    try{
      setLoading(true);
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS:true,
        backgroundColor:"#fff",
        scrollY:-window.scrollY,
      })
      const imageData= canvas.toDataURL("image.png");
      const thumbnailUrl = await uploadInvoiceThumbnail(imageData);
      const payload={
        ...invoiceData,
        clerkId: user.id,
        thumbnailUrl,
        template:selectedTemplate,
      }
      console.log("Payload to save:", payload);
      const token = await getToken();
      
      const response = await saveInvoice(baseURL,payload,token)
      if(response.status==200){
        toast.success("Invoice saved successfully")
        navigate("/dashboard");
      }else{
        toast.error("Something went wrong.")
      }
    }catch(error){
      console.error(error);
      toast.error("Failed to save invoice", error.message);
    } finally{
      setLoading(false);
    }
  }

  const handleDelete= async ()=>{
    try{
      const token = await getToken();
      const response = await deleteInvoice( baseURL,invoiceData.id,token);
      if(response.status==204){
        toast.success("Invoice deleted successfully");
        navigate("/dashboard")
      } else{
        toast.error("Unable to delete invoice.")
      }
    } catch(error){
      toast.error("Failed to delete invoice", error.message)
    }
  }

  const handleDownloadPdf = async()=>{
    if(!previewRef.current) return;
    try{
      setDownloading(true);
      await generatePdfFromElement(previewRef.current,`invoice_${Date.now()}.pdf`);
    } catch(error){
      toast.error("Failed to generate invoice", error.message)
    } finally{
      setDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!previewRef.current || !customerEmail) {
      return toast.error("Please enter a valid email and try again.");
    }

    try {
      setEmailing(true);

      
      const pdfBlob = await generatePdfFromElement(
        previewRef.current,
        `invoice_${Date.now()}.pdf`,
        true
      ); 

      const formData = new FormData();
      formData.append("file", pdfBlob);
      formData.append("email", customerEmail);

      const token = await getToken();
      const response = await sendInvoice(baseURL , formData,token);

      if (response.status === 200) {
        toast.success("Email sent successfully!");
        setShowModal(false);
        setCustomerEmail("");
      } else {
        toast.error("Failed to send email.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while sending email.");
    } finally {
      setEmailing(false);
    }
  };

  useEffect(()=>{
    if(!invoiceData || !invoiceData.items?.length){
      toast.error("Invoice data is empty");
      navigate("/dashboard")
    }
  },[invoiceData,navigate]);

  return (
    <div className="previewpage container-fluid d-flex flex-column p-3 min-vh-100">
      {/* action buttons*/}
      <div className='d-flex flex-column align-items-center mb-4 gap-3'>
        {/* list of template buttons*/}
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          {templates.map(({id,label})=>(
            <button key={id}
            onClick={()=>setSelectedTemplate(id)}
            className={`btn btn-sm rounded-pill p-2 ${
                selectedTemplate === id
                  ? "btn-warning"
                  : "btn-outline-secondary"
              }`}
              style={{ height: "38px", minWidth: "100px" }}>{label}</button>
          ))}
        </div>
        {/* list of action buttons*/}
        <div className="d-flex flex-wrap justify-content-center gap-2" >
          <button className="btn btn-primary d-flex align-items-center justify-content-center " onClick={handleSaveAndExit} disabled={loading}>
            {loading && <LoaderIcon  className='me-2 spin-animation' size={18}/> }
            {loading? "Saving...": "Save and exit"}
          </button>
          {invoiceData.id && <button className="btn btn-danger" onClick={handleDelete}>Delete Invoice</button>}
          <button className="btn btn-secondary" onClick={()=>navigate('/dashboard')}>Back to Dashboard</button>
          <button className="btn btn-info" onClick={()=>setShowModal(true)}>Send Email</button>
          <button className="btn btn-success d-flex align-items-center justify-content-center"disabled={loading} onClick={handleDownloadPdf}>
            {downloading && (
              <LoaderIcon className='me-2 spin-animation' size={18}/>
            )}
            {downloading? "Downloading..": "Downloading PDF"}
            </button>
        </div>
      </div> 
      {/* display the invoice preview*/}
      <div className='flex-grow-1 overflow-auto d-flex justify-content-center align-items-start bg-light py-3'>
        <div ref={previewRef} className='invoice-preview'>
          <InvoicePreview invoiceData={invoiceData} template={selectedTemplate}/>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" role='dialog' style={{backgroundColor:"rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog" role='document'>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className='modal-title'> Send Invoice</h5>
                <button type='button' className='btn-close' onClick={()=>setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="email" className='form-control' placeholder='Customer Email' onChange={(e)=>setCustomerEmail(e.target.value)} value={customerEmail} />
              </div>
              <div className="modal-footer">
                <button type='button' className='btn btn-primary' onClick={handleSendEmail} disabled={emailing}>
                  {emailing? "Sending..":"Send"}
                </button>
                <button type='button' className='btn btn-secondary' onClick={()=>setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviewPage