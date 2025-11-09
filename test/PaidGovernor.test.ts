import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaidGovernor", function () {
  it("Should allow paid vote", async function () {
    const [owner, voter] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("VoteToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Timelock = await ethers.getContractFactory("TimelockController");
    const timelock = await Timelock.deploy(0, [], [], owner.address);
    await timelock.waitForDeployment();

    const Governor = await ethers.getContractFactory("PaidGovernor");
    const gov = await Governor.deploy(token.target, ethers.parseEther("10"), owner.address, timelock.target);
    await gov.waitForDeployment();

    // Setup timelock roles
    await timelock.grantRole(await timelock.PROPOSER_ROLE(), gov.target);
    await timelock.grantRole(await timelock.EXECUTOR_ROLE(), gov.target);

    await token.transfer(voter.address, ethers.parseEther("100"));
    await token.connect(voter).approve(gov.target, ethers.parseEther("10"));

    const targets = [voter.address];
    const values = [0];
    const calldatas = [ethers.ZeroHash];
    const description = "Test proposal";

    const tx = await gov.propose(targets, values, calldatas, description);
    const receipt = await tx.wait();
    const proposalId = receipt!.logs[0].topics[1];

    await ethers.provider.send("evm_mine", []); // pass voting delay

    await gov.connect(voter).castVoteWithPayment(proposalId, 1); // For
    expect(await gov.hasVoted(proposalId, voter.address)).to.be.true;
  });
});
