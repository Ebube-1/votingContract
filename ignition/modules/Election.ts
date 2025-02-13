// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Election = buildModule("Election", (m:any) => {
  const electionFactoryAddress = m.getParameter("_electionFactory");
  
  const event = m.contract("Election", [electionFactoryAddress]);
  return { event };
});

export default Election;