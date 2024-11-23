import { Router } from "express";
import { ClientController } from "../controller/client.controller";
import { clientAuthorization } from "../middlewares/clientAuth";
const clientRouter = Router();
clientRouter.post('/register', ClientController.register);
clientRouter.post('/login', ClientController.login);
clientRouter.get('/connections', clientAuthorization(),ClientController.getConnectionData)
clientRouter.get('/:clientId',ClientController.getPublicData)
export default clientRouter;