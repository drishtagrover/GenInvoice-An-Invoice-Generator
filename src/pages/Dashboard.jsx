import React, { useContext, useState,useEffect } from 'react'
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AppContext,initialInvoiceData} from "../context/AppContext.jsx";
import { getAllInvoices } from '../service/invoiceService';
import {formatDate} from "../util/formatInvoiceData.js";
import { useAuth } from '@clerk/clerk-react';

function Dashboard() {
  const [invoices, setInvoices]= useState([]);
  const navigate = useNavigate();
  const {baseURL,setInvoiceData,setSelectedTemplate,setInvoiceTitle}= useContext(AppContext);
  const {getToken}= useAuth();


    useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = await getToken();
        const response = await getAllInvoices(baseURL,token);
        setInvoices(response.data);
      } catch (error) {
        console.error("Failed to load invoices", error);
        toast.error("Something went wrong. Unable to load invoices");
      }
    };
    fetchInvoices();
  }, [baseURL]);


    const handleViewClick = (invoice) => {
    setInvoiceData(invoice);
    setSelectedTemplate(invoice.template || "template1");
    setInvoiceTitle(invoice.title || "View Invoice");
    navigate("/preview");
  };

  const handleCreateNew = () => {
    setInvoiceTitle("New Invoice");
    setSelectedTemplate("template1");
    setInvoiceData(initialInvoiceData);
    navigate("/generate");
  };

  return (
    <div className="container py-5">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
        {/* Create new invoice card*/}
        <div className="col">
          <div onClick={handleCreateNew}
            className="card h-100 d-flex justify-content-center align-items-center border border-2 border-light shadow-sm"
            style={{ cursor: "pointer", minHeight: "270px" }}
          >
            <Plus size={48} />
            <p className="mt-3 fw-medium">Create New Invoice</p>
          </div>
        </div>
        {/* render existing invoices*/}
        {invoices.map((invoice,idx)=>(
          <div className='col' key={idx}>
            <div className='card h-100 shadow-sm cursor-pointer' style={{minHeight:'270px'}} onClick={() => handleViewClick(invoice)}>
              {invoice.thumbnailUrl && (
                <img src={invoice.thumbnailUrl} alt='Invoice Thumbnail' className='card-img-top' style={{height:"200px",objectFit:"cover"}}/>
              )}
              <div className="card-body">
                <h6 className="card-title mb-1">{invoice.title}</h6>
                <small className="text-muted">
                  Last Updated: {formatDate(invoice.createdAt)}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard