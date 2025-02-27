const { ethers } = require("hardhat");
require("dotenv/config");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const RenewToken = await ethers.getContractFactory("RenewToken");

  const name = "ReNew";
  const symbol = "RENEW";
  const initialSupply = 1000000000;
  const decimals = 18;
  const owner = process.env.RENEW_TOKEN_OWNER;

  const renewToken = await RenewToken.deploy(
    name,
    symbol,
    initialSupply,
    decimals,
    owner
  );

  // 배포가 완료될 때까지 기다림
  await renewToken.waitForDeployment();

  // ethers v6에서는 deployed address가 renewToken.target에 저장됩니다.
  console.log("RenewToken deployed to:", renewToken.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
