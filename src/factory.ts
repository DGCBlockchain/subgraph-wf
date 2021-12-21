import { BigInt, Address } from "@graphprotocol/graph-ts";
import {  ProjectCreated } from "../generated/factory/factory";
import { Project, ProjectFactory } from "../generated/schema";
import { Project as ProjectTemplate } from "../generated/templates";

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0xdaaC03F38D08f8EaC92A51705C11FF1515c4A0BE'
export function handleProjectCreated(event: ProjectCreated): void {

 // load factory (create if first time)
  let factory = ProjectFactory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new ProjectFactory(FACTORY_ADDRESS);
    factory.projectCount = BigInt.fromI32(0);
    factory.projectIds = new Array<string>();
  }

 

  factory.projectCount = BigInt.fromI32(1).plus(factory.projectCount);
   // factory.projectIds = new Array<string>();
   let pIds = new Array<string>();
  
   pIds = factory.projectIds;
   pIds.push(event.params.project.toHexString());
   
   factory.projectIds = pIds;
   factory.save();

  let project = new Project(event.params.project.toHexString());
  project.name = event.params.name.toString();
  project.projectId = event.params.projectId.toString();
  project.save();

  // create the tracked contract based on the template
  ProjectTemplate.create(event.params.project);
  
  
  //save updated values
  factory.save();


}
