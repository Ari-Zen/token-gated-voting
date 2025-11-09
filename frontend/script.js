async function voteWithPayment(proposalId) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
  const gov = new ethers.Contract(GOV_ADDRESS, GOVERNOR_ABI, signer);

  await token.approve(GOV_ADDRESS, ethers.parseEther("10"));
  await gov.castVoteWithPayment(proposalId, 1);
  console.log("Voted with payment!");
}
