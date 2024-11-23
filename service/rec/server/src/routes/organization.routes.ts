import { Router } from "express";
import { OrganizationController } from "../controller/organization.controller";
import { clientAuthorization } from "../middlewares/clientAuth";
const organizationRouter = Router();
organizationRouter.post('/login', OrganizationController.login);
organizationRouter.post('/register', OrganizationController.register);
organizationRouter.get('/connection/clients', clientAuthorization(), OrganizationController.getClientConnectionData);
organizationRouter.get('/connection/organizations', clientAuthorization(), OrganizationController.getOrganizationConnectionData);
organizationRouter.get('/connected-organization/clients/:connectedOrganizationId', clientAuthorization(), OrganizationController.getConnectedOrganizationClients);
organizationRouter.post('/connected-organization/clients/sorted-data',clientAuthorization(), OrganizationController.retrieveConnectionOrganizationSpecificClientData)
organizationRouter.get('/realtime-data/:connectionId', clientAuthorization(), OrganizationController.getRealtimeData);
organizationRouter.get('/sorted-data/:connectionId', clientAuthorization(), OrganizationController.getSortedData);
organizationRouter.get('/all', OrganizationController.retriveAllOrgPublicData);
organizationRouter.get('/:organizationId', OrganizationController.getPublicData);
export default organizationRouter;