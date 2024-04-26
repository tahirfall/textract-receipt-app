// NewPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DisplayData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/data'); // Endpoint pour récupérer les données
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  return (
    <div>
      <h1>Liste des enregistrements</h1>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Receipt ID</th>
            <th>Nom</th>
            <th>Classe</th>
            <th>Somme</th>
            <th>Inscription</th>
            <th>Scolarité</th>
            <th>Date</th>
            <th>Paiement</th>
          </tr>
        </thead>
        <tbody>
          {data.map(record => (
            <tr key={record.receipt_id}>
              <td>{record.receipt_id}</td>
              <td>{record.nom}</td>
              <td>{record.classe}</td>
              <td>{record.sommeDe}</td>
              <td>{record.inscription}</td>
              <td>{record.scolarite}</td>
              <td>{record.date}</td>
              <td>{record.paiement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisplayData;



