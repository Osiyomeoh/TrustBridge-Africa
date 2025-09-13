import { expect } from "chai";
import { ethers } from "hardhat";

describe("Counter", function () {
  let counter: any;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  it("Should start with x = 0", async function () {
    expect(await counter.x()).to.equal(0);
  });

  it("Should increment x by 1 when calling inc()", async function () {
    await counter.inc();
    expect(await counter.x()).to.equal(1);
  });

  it("Should increment x by specified amount when calling incBy()", async function () {
    await counter.incBy(5);
    expect(await counter.x()).to.equal(5);
  });

  it("Should emit Increment event when calling inc()", async function () {
    await expect(counter.inc())
      .to.emit(counter, "Increment")
      .withArgs(1);
  });

  it("Should emit Increment event when calling incBy()", async function () {
    await expect(counter.incBy(3))
      .to.emit(counter, "Increment")
      .withArgs(3);
  });

  it("Should revert when calling incBy(0)", async function () {
    await expect(counter.incBy(0))
      .to.be.revertedWith("incBy: increment should be positive");
  });
});
