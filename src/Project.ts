import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts';
import {
    Project,
    ProjectFactory,
    User,
    UserMapping
  } from '../generated/schema';

import { Project as ProjectContract } from '../generated/templates';
import { USER_ADDED } from '../generated/templates/Project/Project';

export const FACTORY_ADDRESS = '0xdaaC03F38D08f8EaC92A51705C11FF1515c4A0BE';

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
        user.name = event.params.name.toString();
        user.organization = event.params.organization.toString();
    
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

/*
************* example queries ****************************** 
// get all projects and member info
{
  projectFactories(first: 5) {
    id
    projectCount
    projectIds
  }
  projects(first: 5) {
    id
    revenue
    name
    projectId
    members {
      id
      quota
    }
  }
}
*********************************
// get users
{
  users {
    id
    name
    organization
    quotas {
      id
      user {
        id
      }
    }
  }
}
***********************
query where example to emulate
{
  swaps(where: {address: "0x3f1d224557afa4365155ea77ce4bc32d5dae2174" }) {
    address
    tokens {
      address
      name
    }
  }
}
*/
