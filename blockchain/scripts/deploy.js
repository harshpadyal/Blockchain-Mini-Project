import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect("localhost");

  const FileTracking = await ethers.getContractFactory("FileTracking");
  const fileTracking = await FileTracking.deploy();

  await fileTracking.waitForDeployment();

  console.log("Contract deployed to:", await fileTracking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});