import { ethers, network } from "hardhat";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const [admin, voter1, voter2] = await ethers.getSigners();
  console.log("Deploying contracts with account:", admin.address);

  // Deploy VotingNFT contract
  console.log("Deploying VotingNFT...");
  const VotingNFT = await ethers.getContractFactory("VotingNFT");
  const votingNFT = await VotingNFT.deploy("VOTE");
  await votingNFT.waitForDeployment();
  console.log("VotingNFT deployed to:", votingNFT.target);

  // Deploy Election contract
  console.log("Deploying Election...");
  const candidates = ["Alice", "Bob", "Charlie"];
  const block = await ethers.provider.getBlock("latest");
  const startTime = block!.timestamp + 5; // Starts in 5 seconds
  const endTime = startTime + 10; // Ends in 10 seconds

  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy(votingNFT.target, admin.address, candidates, startTime, endTime);
  await election.waitForDeployment();
  console.log("Election deployed to:", election.target);

  // Register voters (mint NFT)
  console.log("Registering voters...");
  let tx = await votingNFT.connect(admin).mintNFT(voter1.address);
  await tx.wait();
  console.log(`Voter1 (${voter1.address}) registered.`);

  tx = await votingNFT.connect(admin).mintNFT(voter2.address);
  await tx.wait();
  console.log(`Voter2 (${voter2.address}) registered.`);

  // Wait for election to start
  console.log("Waiting for election to start...");
  await delay(5000);

  // Voters cast their votes
  console.log("Casting votes...");
  tx = await election.connect(voter1).vote(1, 0); // Voter1 votes for Alice
  await tx.wait();
  console.log(`Voter1 (${voter1.address}) voted.`);

  tx = await election.connect(voter2).vote(2, 1); // Voter2 votes for Bob
  await tx.wait();
  console.log(`Voter2 (${voter2.address}) voted.`);

  // Wait for election to end
  console.log("Waiting for election to end...");
  await delay(10000);

  // Fetch results
  console.log("Fetching election results...");
  const results = await election.getResults();
  console.log(`Final results: Alice(${results[0]}), Bob(${results[1]}), Charlie(${results[2]})`);
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });