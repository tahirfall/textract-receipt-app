// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


import UploadReceipt from './components/uploadReceipt';


function App() {
  return (
     <Router>
       <Routes>
         <Route path="/" element={<UploadReceipt/>} />
   
       </Routes>
     </Router>
  );
 }

export default App;
