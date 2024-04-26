import React, { useState } from 'react';
import Header from './Header'; // Assurez-vous que le chemin est correct
import axios from 'axios'; // Importez Axios
import '../UploadReceipt.css'; // Importez le fichier CSS
import DisplayData from './DisplayData'
import '../Header.css';

const UploadReceipt = () => {
 const [selectedImage, setSelectedImage] = useState(null);
 const [showData, setShowData] = useState(false); // État pour contrôler l'affichage du tableau


 const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
   
 };

 const handleUpload = async () => {
    if (!selectedImage) {
      alert("Veuillez sélectionner une image à téléverser.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert("L'upload a été effectué avec succès !");
    
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête :", error);
      alert("Une erreur est survenue lors de l'envoi de la requête.");
    }
 };

 const handleExtract = async () => {
    if (!selectedImage) {
      alert("Veuillez sélectionner une image à extraire.");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', selectedImage);
  
    try {
      const response =  await axios.post('http://localhost:3001/api/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert(`Les données ont été extraites avec succès`);
    } catch (error) {
      console.error("Erreur lors de l'extraction des données :", error);
      alert("Une erreur est survenue lors de l'extraction des données.");
    }
 };
  
 return (
    <div className="upload-container">
      <Header />
      <div className='offset-4 my-4'>
        <h2>Charger votre reçu svp!!</h2>
       
        <input type="file" accept="image/*" onChange={handleImageChange} />
       
        <button className="btn btn-primary mx-2" onClick={handleUpload}>Upload</button>
       <button className="btn btn-primary mx-2" onClick={handleExtract}>Extract</button>
      </div>
      <div className='list-container my-5 text-center'>
        <button className="btn btn-success" onClick={() => setShowData(true)}>Lister</button>
        {showData && <DisplayData />}

      </div>

    </div>
 );
};

export default UploadReceipt;
