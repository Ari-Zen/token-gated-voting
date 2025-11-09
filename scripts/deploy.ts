import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy Token
  const Token = await ethers.getContractFactory("VoteToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("VoteToken:", token.target);

  // Deploy Timelock
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(3600, [deployer.address], [deployer.address], deployer.address);
  await timelock.waitForDeployment();
  console.log("Timelock:", timelock.target);

  // Deploy Governor
  const Governor = await ethers.getContractFactory("PaidGovernor");
  const governor = await Governor.deploy(
    token.target,
    ethers.parseEther("10"), // vote cost = 10 VOTE
    deployer.address,       // treasury
    timelock.target
  );
  await governor.waitForDeployment();
  console.log("PaidGovernor:", governor.target);

  // Setup roles
  await timelock.grantRole(await timelock.PROPOSER_ROLE(), governor.target);
  await timelock.grantRole(await timelock.EXECUTOR_ROLE(), governor.target);
  await timelock.revokeRole(await timelock.DEFAULT_ADMIN_ROLE(), deployer.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
