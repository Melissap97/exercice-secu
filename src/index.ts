import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import TodoRoutes from "./routes/TodoRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import swaggerDocs from './config/swagger';
import swaggerUi from 'swagger-ui-express'
import cors from 'cors';
import UserRoutes from "./routes/UserRoutes";
import ExpressMongoSanitize from "express-mongo-sanitize";
import verifyErrorMiddleware from "./middleware/verifyErrorMiddleware";
import helmet from "helmet";

//Création serveur express
const app = express()

//chargement des variables d'environnement
dotenv.config()

//Définition du port du serveurS
const PORT = process.env.PORT

//COnfig du serveur par défaut
app.use(express.json());

// Activer CORS uniquement pour une seule origine
//curl ifconfig.me pour connaître l'ip publique de votre pc
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Placer le domaine du client pour l'autoriser
    methods: 'GET,POST,DELETE,PUT', // Restreindre les méthodes autorisées
    allowedHeaders: 'Content-Type,Authorization', // Définir les en-têtes acceptés
    credentials: true // Autoriser les cookies et les headers sécurisés
   };

   app.use(cors(corsOptions));

//connecter MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB connecté avec succès');
    } catch (err) {
        console.error('Erreur lors de la connexion à MongoDB:', err);
        process.exit(1);
    }
};

// Appliquer express-mongo-sanitize sur les requêtes entrantes
app.use(ExpressMongoSanitize());
app.use(verifyErrorMiddleware);

connectDB();


// Activer helmet pour sécuriser les en-têtes HTTP
app.use(
    helmet({
    contentSecurityPolicy: {
    directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-random123'"],
    styleSrc: ["'self'"], // Supprimer 'strict-dynamic'
    imgSrc: ["'self'"], // Supprimer 'data:'
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    scriptSrcAttr: ["'none'"],
    upgradeInsecureRequests: [],
    },
    },
    })
   );

//TODO ajouter routes ici
app.use('/todos', TodoRoutes)
app.use('/auth', AuthRoutes)
app.use('/users', UserRoutes)

// 📌 Route pour exporter le swagger.json
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
    });


// Route pour accéder au JSON brut
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));




console.log(process.env.NODE_ENV);

//app.listen indique au serveur d'écouter les requêtes HTTP arrivant sur le
//port indiqué
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

