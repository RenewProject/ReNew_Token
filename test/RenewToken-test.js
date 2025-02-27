const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RenewToken", function () {
  let renewToken, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const RenewToken = await ethers.getContractFactory("RenewToken");
    // 초기 공급량 1000 토큰, 소수점 18자리, owner에게 배포
    renewToken = await RenewToken.deploy(
      "RenewToken",
      "RWT",
      1000,
      18,
      owner.address
    );
    await renewToken.waitForDeployment();
  });

  it("should assign the initial supply to the owner", async function () {
    const balance = await renewToken.balanceOf(owner.address);
    expect(balance).to.equal(ethers.parseUnits("1000", 18));
  });

  it("should allow owner to lock and unlock tokens", async function () {
    // owner가 addr1에게 100 토큰 전송
    await renewToken.transfer(addr1.address, ethers.parseUnits("100", 18));

    // owner가 addr1의 토큰 중 40 토큰을 락
    await renewToken
      .connect(owner)
      .lockTokens(addr1.address, ethers.parseUnits("40", 18));

    // addr1은 락되지 않은 잔액(60 토큰) 이상 전송하려 하면 revert 되어야 함
    await expect(
      renewToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseUnits("70", 18))
    ).to.be.revertedWith("Transfer exceeds unlocked");

    // owner가 addr1의 락을 20 토큰 해제 -> unlocked = 80 토큰
    await renewToken
      .connect(owner)
      .unlockTokens(addr1.address, ethers.parseUnits("20", 18));
    // addr1은 이제 80 토큰 전송 가능
    await renewToken
      .connect(addr1)
      .transfer(addr2.address, ethers.parseUnits("80", 18));
  });

  it("should prevent transferring more than unlocked tokens", async function () {
    await renewToken.transfer(addr1.address, ethers.parseUnits("100", 18));
    await renewToken
      .connect(owner)
      .lockTokens(addr1.address, ethers.parseUnits("50", 18));
    await expect(
      renewToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseUnits("60", 18))
    ).to.be.revertedWith("Transfer exceeds unlocked");
  });

  it("should allow recall of locked tokens", async function () {
    // addr1에게 100 토큰 전송 후 40 토큰 락
    await renewToken.transfer(addr1.address, ethers.parseUnits("100", 18));
    await renewToken
      .connect(owner)
      .lockTokens(addr1.address, ethers.parseUnits("40", 18));

    const ownerBalanceBefore = await renewToken.balanceOf(owner.address);
    // recallLockedTokens를 통해 20 토큰 회수
    await renewToken
      .connect(owner)
      .recallLockedTokens(addr1.address, ethers.parseUnits("20", 18));
    const ownerBalanceAfter = await renewToken.balanceOf(owner.address);
    // BigInt 산술 연산자 사용
    expect(ownerBalanceAfter).to.equal(
      ownerBalanceBefore + ethers.parseUnits("20", 18)
    );
  });

  it("should allow transferAndLock to work correctly", async function () {
    const ownerBalanceBefore = await renewToken.balanceOf(owner.address);
    // owner가 addr1에게 100 토큰을 전송하면서 동시에 락업 처리
    await renewToken
      .connect(owner)
      .transferAndLock(addr1.address, ethers.parseUnits("100", 18));
    const ownerBalanceAfter = await renewToken.balanceOf(owner.address);
    expect(ownerBalanceAfter).to.equal(
      ownerBalanceBefore - ethers.parseUnits("100", 18)
    );

    // addr1은 모두 락업된 토큰이므로, 전송 시도 시 revert되어야 함
    await expect(
      renewToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseUnits("1", 18))
    ).to.be.revertedWith("Transfer exceeds unlocked");
  });

  it("should allow batchTransferAndLock to work correctly", async function () {
    const recipients = [addr1.address, addr2.address];
    const amounts = [ethers.parseUnits("50", 18), ethers.parseUnits("70", 18)];
    const total = ethers.parseUnits("120", 18);

    const ownerBalanceBefore = await renewToken.balanceOf(owner.address);
    await renewToken.connect(owner).batchTransferAndLock(recipients, amounts);
    const ownerBalanceAfter = await renewToken.balanceOf(owner.address);
    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore - total);

    // addr1과 addr2 모두 락 상태이므로 전송 시도 시 revert
    await expect(
      renewToken
        .connect(addr1)
        .transfer(addr3.address, ethers.parseUnits("1", 18))
    ).to.be.revertedWith("Transfer exceeds unlocked");
    await expect(
      renewToken
        .connect(addr2)
        .transfer(addr3.address, ethers.parseUnits("1", 18))
    ).to.be.revertedWith("Transfer exceeds unlocked");
  });

  it("should allow batchTransfer to work correctly", async function () {
    const recipients = [addr1.address, addr2.address];
    const amounts = [ethers.parseUnits("20", 18), ethers.parseUnits("30", 18)];

    await renewToken.batchTransfer(recipients, amounts);

    const balance1 = await renewToken.balanceOf(addr1.address);
    const balance2 = await renewToken.balanceOf(addr2.address);
    expect(balance1).to.equal(ethers.parseUnits("20", 18));
    expect(balance2).to.equal(ethers.parseUnits("30", 18));
  });
});
