// src/components/Header.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import '../Header.css'; 

const Header = () => {
 return (
    <div className="header row">
      <div className="col-12 d-flex justify-content-between align-items-center">
        <h1 className="m-0">
          <FontAwesomeIcon icon={faFileInvoice} /> receiptTract
        </h1>
       {/*  <div className="nav-links">
          <button className="btn btn-primary mx-2">Se connecter</button>
          <button className="btn btn-secondary mx-2">S'inscrire</button>
        </div> */}
      </div>
    </div>
 );
};

export default Header;
