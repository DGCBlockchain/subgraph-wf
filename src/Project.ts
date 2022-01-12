import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts';
import {
    Project,
    ProjectFactory,
    User,
    UserMapping,
    Distributor,
    DistributorMapping
  } from '../generated/schema';

import { Project as ProjectContract } from '../generated/templates';
import { USER_ADDED, DISTRIBUTION_RIGHT_AWARDED, REVENUE_GENERATED } from '../generated/templates/Project/Project';

export const FACTORY_ADDRESS = '0xdaaC03F38D08f8EaC92A51705C11FF1515c4A0BE';

// TODO: Goals: I should be able to query the functionality of the following functions 
// getAllProjects() - returns a list of all projects created from the factory -> Done
// getUserProjects(userID) - returns all  projects a user is registered to along with quotas and other useful information -> done , test with multiple user
// getProjectUsers(projectID) - returns all users of a project with their quotas - Done
// getProjectDistributors(projectID) - returns all distributers that have distribution rights for a project - > done
// getDistributorProjectS(distributorId)- returns all projects that a distributor has rights for.

// test on rinkeby
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
        userQuota.user = user.id;   
    }
    userQuota.save();
    user.save();

}

export function handleNewDistributor(event: DISTRIBUTION_RIGHT_AWARDED): void {

  const DISTRIBUTOR_ADDRESS = event.params.id.toHexString();
  let distributor = Distributor.load(DISTRIBUTOR_ADDRESS);
  if (distributor === null) {
      distributor = new Distributor(DISTRIBUTOR_ADDRESS);
      distributor.name = event.params.name.toString();  
  }

  let mappingId = event.params.id.toHexString().concat('-').concat(event.address.toHexString());
  let distributorMapping = DistributorMapping.load(mappingId)
  if(distributorMapping === null) {
    distributorMapping  = new DistributorMapping(mappingId);
    distributorMapping.distributor = distributor.id;
    distributorMapping.project = event.address.toHexString();
    distributorMapping.revenueCollectedForProject = BigDecimal.zero();
  }
  distributorMapping.save();
  distributor.save();

}

export function handleRevenueInFlow(event: REVENUE_GENERATED): void {

  // TODO: add revenue inflow
 //  const CONTRACT_ADDRESS = event.params.projectId.toHexString(); // projectID in REVENUE_GENERATED event is not contract Address, project ID is human readable ID of the project, which might be redundant and could be removed as we can get this info from event.address.toHexString()
  const DISTRIBUTOR_ADDRESS = event.params.distributor.toHexString();
  const CONTRACT_ADDRESS = event.address.toHexString();
  let mappingId = DISTRIBUTOR_ADDRESS.concat('-').concat(CONTRACT_ADDRESS);

  let distributor = Distributor.load(DISTRIBUTOR_ADDRESS);
  if (distributor === null) {
      distributor = new Distributor(DISTRIBUTOR_ADDRESS);
  }


  let project = Project.load(CONTRACT_ADDRESS); 
  if (project === null) {
    project = new Project(CONTRACT_ADDRESS);
  }

  let distributorMapping = DistributorMapping.load(mappingId);
  if(distributorMapping === null) {
    distributorMapping  = new DistributorMapping(mappingId);
    distributorMapping.distributor = distributor.id;
    distributorMapping.project = project.id;
  }
  
  distributorMapping.revenueCollectedForProject = distributorMapping.revenueCollectedForProject.plus(event.params.amount.toBigDecimal());
  project.totalRevenue = project.totalRevenue.plus(event.params.amount.toBigDecimal());
  project.outStandingDues = project.totalRevenue.minus(project.totalPaid);

  
  // distributorMapping.TotalRevenue = distributorMapping.TotalRevenue.plus(event.params.amount);
  // distributorMapping.OutStandingDues = distributorMapping.TotalRevenue.minus(distributorMapping.TotalPaid);
  distributorMapping.save();
  distributor.save();
  project.save();

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
    totalRevenue
    name
    projectId
    outStandingDues
    members {
      id
      quota
    }
  }
}
*********************************
// get users info
{
  users {
    id
    name
    organization
    quotas {
      id
      outstandingShare
      project {
        id
        name
      }
    }
  }
}

// get projects
{
    projects {
    revenue
    name
    projectId
    members {
      id
      quota
      user {
        name
        organization
      }
    }
  }
}

//get projects with users and distributors -> fixed
{
  projects {
    id
    revenue
    name
    projectId
    members  {
      quota
      user {
        name
      }
    }
    distributors {
      distributor {
        id
        name
        
      }
    }
  }
}

// get all distributors -> fixed

{
  distributors {
    id
    name
    projects {
      id
      revenueCollectedForProject
    }
      
  }
}
// query for a single project


{
    project(id: "0x5c671eaf3a6191b38b8052ab1b6db33b1714d6ec") {
    id
    totalRevenue
    totalPaid
    outStandingDues
    name
    projectId
    members {
      id
      quota
    }
    distributors {
      id
      revenueCollectedForProject
    }
  }
}

// 
{
    project(id: "0xc0d9d25778a61270b6062c4f96d1cdb024758b42") {
    id
    revenue
    name
    projectId
    members (where : {
      id: "0x893017f5bff4951f7f893422767048a2bd6d0771-0xc0d9d25778a61270b6062c4f96d1cdb024758b42"
    }) {
      id
      quota
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
