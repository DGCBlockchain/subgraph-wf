import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts';
import {
    Project,
    ProjectFactory,
    User,
    UserMapping
  } from '../generated/schema';

import { Project as ProjectContract } from '../generated/templates';
import { USER_ADDED } from '../generated/templates/Project/Project';

export const FACTORY_ADDRESS = '0xF4190abd493410cb6fA6A1Ed0A6d36d48CF9e5d1';

// TODO: Goal: I should be able to query the functionality of the following functions 
// getAllProjects() - returns a list of all projects created from the factory
// getUserProjects(userID) - returns all  projects a user is registered to along with quotas and other useful information 
// getProjectUsers(projectID) - returns all users of a project with their quotas
// getProjectDistributors(projectID) - returns all distributers that have distribution rights for a project
// getDistributorProjectS(distributorId)- returns all projects that a distributor has rights for.

export function handleNewUser(event: USER_ADDED): void {

    const USER_ADDRESS = event.params.id.toHexString();
    let user = User.load(USER_ADDRESS);
    if (user === null) {
        user = new User(USER_ADDRESS);
        user.name = event.params.name.toHexString();
        user.organization = event.params.organization;
    
    }

    let mappingId = event.params.id.toHexString().concat('-').concat(event.address.toHexString())
    let userQuota = UserMapping.load(mappingId)
    if(userQuota === null) {
        userQuota  = new UserMapping(mappingId);
        userQuota.project = event.address.toHexString();
        userQuota.paid = BigDecimal.zero();
        userQuota.outstandingShare = BigDecimal.zero(); 
        userQuota.quota = event.params.quota;
        userQuota.user = event.params.id.toString();       
    }
    userQuota.save();
    user.save();

}

