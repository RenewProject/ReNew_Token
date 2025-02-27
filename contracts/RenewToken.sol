// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RenewToken is ERC20, Ownable, ReentrancyGuard {
    uint8 private _decimal;
    mapping(address => uint256) private _lockedBalances;

    event TokensLocked(address indexed user, uint256 amount);
    event TokensUnlocked(address indexed user, uint256 amount);
    event TokensRecalled(address indexed from, address indexed to, uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint8 decimal_,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        _decimal = decimal_;
        _mint(owner_, initialSupply_ * (10 ** decimal_));
    }

    function decimals() public view override returns (uint8) {
        return _decimal;
    }

    function lockTokens(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Lock must be > 0");
        require(amount <= balanceOf(user), "Insufficient balance");
        _lockedBalances[user] += amount;
        emit TokensLocked(user, amount);
    }

    function unlockTokens(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Unlock must be > 0");
        require(amount <= _lockedBalances[user], "Not enough locked");
        _lockedBalances[user] -= amount;
        emit TokensUnlocked(user, amount);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(
            balanceOf(msg.sender) - _lockedBalances[msg.sender] >= amount,
            "Transfer exceeds unlocked"
        );
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(
            balanceOf(sender) - _lockedBalances[sender] >= amount,
            "Transfer exceeds unlocked"
        );
        return super.transferFrom(sender, recipient, amount);
    }

    function recallLockedTokens(address from, uint256 amount) external onlyOwner nonReentrant {
        require(from != address(0), "Invalid from address");
        require(_lockedBalances[from] >= amount, "Not enough locked tokens to recall");

        _lockedBalances[from] -= amount;
        _transfer(from, owner(), amount);

        emit TokensRecalled(from, owner(), amount);
    }

    function batchTransfer(address[] memory recipients, uint256[] memory amounts)
        external
        nonReentrant
    {
        require(recipients.length == amounts.length, "Arrays mismatch");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            totalAmount += amounts[i];
        }
        require(
            balanceOf(msg.sender) - _lockedBalances[msg.sender] >= totalAmount,
            "Transfer exceeds unlocked"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
    }

    function transferAndLock(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(balanceOf(owner()) - _lockedBalances[owner()] >= amount, "Insufficient unlocked tokens");

        _transfer(owner(), recipient, amount);
        _lockedBalances[recipient] += amount;
        emit TokensLocked(recipient, amount);
    }

    function batchTransferAndLock(address[] memory recipients, uint256[] memory amounts)
        external
        onlyOwner
        nonReentrant
    {
        require(recipients.length == amounts.length, "Arrays mismatch");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            totalAmount += amounts[i];
        }
        require(
            balanceOf(owner()) - _lockedBalances[owner()] >= totalAmount,
            "Insufficient unlocked tokens"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(owner(), recipients[i], amounts[i]);
            _lockedBalances[recipients[i]] += amounts[i];
            emit TokensLocked(recipients[i], amounts[i]);
        }
    }
}
