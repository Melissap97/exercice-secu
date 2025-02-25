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


connectDB();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'nonce-random123'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            scriptSrcAttr: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    dnsPrefetchControl: true, // Prevent DNS prefetching
    hidePoweredBy: true, // Hide the "X-Powered-By" header
    noSniff: true, // Prevent browsers from sniffing content types
   
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);  // Log the error details to the server console or a logging service
  
    // Send a generic error response to the client
    res.status(500).send({
        message: 'Something went wrong. Please try again later.'
    });
  });
  
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

