# RenewToken

RenewToken is an ERC20 token contract built using Solidity 0.8.20 and OpenZeppelin Contracts 5.2.0. This contract extends the standard ERC20 functionality with several additional features, including manual token locking/unlocking, token recall, and both single and batch transfer functions that incorporate token locking.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Interacting with the Contract](#interacting-with-the-contract)
- [Usage Summary](#usage-summary)
- [License](#license)
- [Additional Resources](#additional-resources)

## Overview

The RenewToken contract implements a standard ERC20 token with the following additional functionalities:

- **Manual Token Lock/Unlock**:
  The owner can lock a portion of any user's tokens, preventing their transfer until the tokens are unlocked.

- **Token Recall**:
  The owner can recall locked tokens from any address and transfer them back to the owner.

- **Batch Transfers**:
  The contract supports sending tokens to multiple recipients in one transaction via `batchTransfer`.

- **Transfer and Lock**:
  The owner can transfer tokens from the owner's balance to a recipient and simultaneously lock the transferred amount.

- **Batch Transfer and Lock**:
  The owner can send tokens to multiple recipients and lock the transferred tokens in each recipient's balance in one transaction.

The contract is protected by OpenZeppelin's Ownable (for owner-based access control) and ReentrancyGuard (to prevent reentrancy attacks).

## Features

### ERC20 Standard Implementation:

- Implements all ERC20 functions, including `transfer`, `transferFrom`, and `balanceOf`.

### Token Locking:

- `lockTokens(address user, uint256 amount)`: Locks tokens for a specified address.
- `unlockTokens(address user, uint256 amount)`: Unlocks previously locked tokens.

### Token Recall:

- `recallLockedTokens(address from, uint256 amount)`: Recalls locked tokens from a user to the owner.

### Batch Transfer Functions:

- `batchTransfer(address[] recipients, uint256[] amounts)`: Transfers tokens to multiple recipients.
- `transferAndLock(address recipient, uint256 amount)`: Transfers tokens to a recipient and locks the transferred tokens.
- `batchTransferAndLock(address[] recipients, uint256[] amounts)`: Performs batch transfers from the owner and locks the transferred tokens for each recipient.

### Security:

- Uses ReentrancyGuard to prevent reentrancy attacks and restricts certain functions to the owner using Ownable.

## Project Structure

```
├── contracts
│   └── RenewToken.sol         // ERC20 token contract with additional features
├── scripts
│   └── deployRenewToken.js    // Deployment script using Hardhat and ethers.js v6
├── test
│   └── RenewToken-test.js     // Test scripts using Mocha and Chai
├── hardhat.config.ts          // Hardhat configuration file (network settings, compiler, etc.)
├── package.json               // Project dependencies and scripts
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd tokenGeneration
```

Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

## Deployment

### Hardcoded RPC URL

In this project, RPC URLs are hardcoded in the configuration, so you do not need to set them via environment variables.

### Deploying to a Local Network

Start a local Hardhat node:

```bash
npx hardhat node
```

Deploy the contract:

```bash
npx hardhat run --network localhost scripts/deployRenewToken.js
```

The deployment script will deploy the contract and output the deployed contract address.

### Deploying to Mainnet

Before deploying to mainnet, thoroughly test your contract on a testnet.

Deploy to mainnet:

```bash
npx hardhat run --network mainnet scripts/deployRenewToken.js
```

Verify the Contract on Etherscan:

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> "ReNew" "RENEW" 1000000000 18 "<RENEW_TOKEN_OWNER>"
```

## Testing

The test suite uses Mocha and Chai and is located in the `/test` folder. To run the tests, execute:

```bash
npx hardhat test
```

The tests validate that:

- The initial supply is correctly assigned to the owner.
- Token locking and unlocking behave as expected.
- Transferring tokens does not exceed the unlocked balance.
- Token recall correctly transfers locked tokens back to the owner.
- The `transferAndLock` and `batchTransferAndLock` functions operate as intended.
- Batch transfers without locking function correctly.

Note: The tests are written using ethers.js v6 functions (e.g., `ethers.parseUnits`).

## Interacting with the Contract

Once deployed and verified, you can interact with the contract through:

### PolygonScan/Etherscan Interface:

After verification, use the "Read Contract" tab to call view functions (like `balanceOf` and `decimals`), and the "Write Contract" tab to execute functions (such as `transfer`, `lockTokens`, etc.). Make sure to connect your Web3 wallet (e.g., MetaMask).

### Front-End Integration:

Use the verified ABI along with libraries like ethers.js or web3.js in your front-end application to interact with the contract.

## Usage Summary

### Owner-Only Functions:

- `lockTokens`
- `unlockTokens`
- `recallLockedTokens`
- `transferAndLock`
- `batchTransferAndLock`

### General Functions:

- `transfer`
- `transferFrom`
- `batchTransfer`

Locked tokens cannot be transferred until they are unlocked, and only the owner has the authority to manage locked tokens.

## License

This project is licensed under the MIT License.

## Additional Resources

- Hardhat Documentation
- OpenZeppelin Contracts Documentation
- Ethers.js v6 Documentation
