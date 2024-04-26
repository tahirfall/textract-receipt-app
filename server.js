const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const upload = multer();

const REGION = 'us-east-1'
const accessKeyId = 'ASIAQCWHONCUPBSRAOMW'
const secreteKey = 'd+VKxffTIXIYDTWVPK4/dufzrP++ggYmFIRkvhZM'
const sessionKey = 'IQoJb3JpZ2luX2VjEA4aCXVzLXdlc3QtMiJHMEUCIQCediOwQ7Dk+LErBBs6YDIxZvwFpNS+J5Z3maDxlzSmUgIgbpTJhU3yOxk13YblK0LE5pAhyB4uiLHDomd//l8YaUkqsAIIRxAAGgwwMDU3ODY5ODY2NjQiDGyYGHTk1ClvhkjHIyqNAi1GZ2cnNjjZ1YlFbgRMgu1q0w4Y7tbb4D+e1pwRVAd35xdZNi3QpQvMVRY4YcqviezYwRF0NkExtMj6FhgpvX7EC4vmQKg7v8BDOCbgmFJrJVCnmiuWYljZFqMkQmNK/XhGElNEnR3jY2dXPPiLePzyl0yRcTFJKzgLj5+bxxBvBe2idV+E4ji9flDJtVtWnWQZA4vEUdEMStBC2Uy8GNCc4qCq9w/D2gpGgS7qLw18bJ5A+CD3CCVxFmGPuwH0Ue8VNrvPdondpLFsRc/D3LQcFDQareAq5ETf3K9ZVP4U4AJCwfXs382tVNVyATLNgdZngZO1+9C2AaYHs2F/+0BSDTGb5PMAfJRIsZeTMJbL37AGOp0BLnAEkQCIykLjj+FrNIcoKdiHSH9KnRsXXkhPJr9+qSRwGSqexsVQBn4ZpMfLN4ewz+5/Jzx9nVCzhsF/SeDJ+a4VGcnAl+JFM1LWncL4q6EUl4okEwuV3I9WolQsNpBAzDnKdX7RsKAUSENWbZ+Z7fRRYtYBJf5qamazcc0+QlxEj29cez+oBLWi7SFGigNnXQM6n8IQoKlGzWe0aA=='
AWS.config.update({REGION, credentials: {accessKeyId: accessKeyId, secretAccessKey: secreteKey,sessionToken:sessionKey}})
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const textractClient = new AWS.Textract({ region: 'us-east-1' });

app.use(cors());

// Route pour téléverser l'image vers S3
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('Aucun fichier sélectionné.');
  }

  const uploadParams = {
    Bucket: 'receipt-textract-bucket', // Remplacez par le nom de votre bucket S3
    Key: file.originalname, // Utilisez le nom d'origine du fichier comme clé dans S3
    Body: file.buffer // Utilisez le buffer du fichier
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error("Erreur lors du téléversement du fichier :", err);
      return res.status(500).send("Une erreur est survenue lors du téléversement du fichier.");
    }
    
    console.log("Téléversement réussi :", data.Location);
    res.send("L'image a été téléversée avec succès !");
  });
});

// Route pour extraire les données à partir de l'image
app.post('/api/extract', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('Aucun fichier sélectionné.');
  }

  const textractParams = {
    Document: {
      Bytes: file.buffer
    },
    FeatureTypes: ['TABLES', 'FORMS'] // Ajoutez les types de fonctionnalités que vous souhaitez extraire
  };
  
  try {
    const textractResponse = await textractClient.analyzeDocument(textractParams).promise();
    const extractedData = extractDataFromTextractResponse(textractResponse);

    // Générer un documentKey aléatoire
  const documentKey = Math.floor(Math.random() * 10000001);

  // Ajouter le documentKey à l'objet Item
  const dbParams = {
    TableName: 'receipt-textract-DB', 
    Item: {
      receipt_id: documentKey, 
      ...extractedData 
    }
  };
    await dynamoDB.put(dbParams).promise();

    res.json({ message: "Les données ont été extraites avec succès !", receipt_id: extractedData.DocumentKey });
  } catch (error) {
    console.error("Erreur lors de l'extraction des données avec Textract :", error);
    res.status(500).send("Une erreur est survenue lors de l'extraction des données avec Textract");
  }
});



// Ajoutez cette route pour récupérer les données depuis la base de données
app.get('/api/data', async (req, res) => {
  try {
    const dbParams = {
      TableName: 'receipt-textract-DB', // Nom de la table DynamoDB
    };
    const data = await dynamoDB.scan(dbParams).promise(); // Scan de la table pour récupérer tous les enregistrements
    res.json(data.Items); // Renvoie les enregistrements sous forme de JSON
  } catch (error) {
    console.error("Erreur lors de la récupération des données depuis DynamoDB :", error);
    res.status(500).send("Une erreur est survenue lors de la récupération des données depuis DynamoDB.");
  }
});



// Fonction pour extraire les données de TextractResponse
function extractDataFromTextractResponse(response) {
  // Implémentez la logique pour extraire les données pertinentes de la réponse de Textract
  const blocks = response.Blocks;

  // Définir les informations à extraire
  const extractedData = {
    nom: getTextFromBlock(blocks, "Reçu de M :"),
    classe: getTextFromBlock(blocks, "De la classe de :"),
    sommeDe: getTextFromBlock(blocks, "La somme de :"),
    inscription: getTextFromBlock(blocks, "Inscription :"),
    scolarite: getTextFromBlock(blocks, "Scolarité :"),
    date: getTextFromBlock(blocks, "Dakar, le"),
    paiement: getTextFromBlock(blocks, "Paiement")
  };

  return extractedData;
}

// Fonction pour obtenir le texte associé à un certain bloc
function getTextFromBlock(blocks, key) {
  const block = blocks.find(block => block.Text && block.Text.includes(key));
  return block ? block.Text.split(key)[1].trim() : '';
}

const port = 3001;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
