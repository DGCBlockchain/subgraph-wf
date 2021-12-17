import { BigInt, Address } from "@graphprotocol/graph-ts";
import { factory , ProjectCreated } from "../generated/factory/factory";
import { ProjectFactory } from "../generated/schema";
import { Project as ProjectTemplate } from "../generated/templates"

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0xF4190abd493410cb6fA6A1Ed0A6d36d48CF9e5d1'
export function handleProjectCreated(event: ProjectCreated): void {

 // load factory (create if first time)
  let factory = ProjectFactory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new ProjectFactory(FACTORY_ADDRESS);
    factory.projectCount = BigInt.fromI32(0);
  }

  factory.projectCount = BigInt.fromI32(1).plus(factory.projectCount);
  factory.save();

  // create the tracked contract based on the template
  ProjectTemplate.create(event.params.project);
  factory.projectIds.push(event.params.project);
  
  //save updated values
  factory.save();


}
