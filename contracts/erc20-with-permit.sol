
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// Coded by Emiliano Solazzi 2024.

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";

contract RebalancingCryptoPortfolio is Pausable, Ownable {
    using SafeERC20 for IERC20;

    ISwapRouter public immutable uniswapRouter;
    ILendingPoolAddressesProvider public lendingPoolProvider;
    ILendingPool public aaveLendingPool;
    mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => uint) public desiredRatios;
    address[] public assets;
    uint public lastRebalanceTimestamp;
    uint public rebalanceInterval = 1 days;
    uint public minDriftThreshold = 500; // Minimum drift threshold in basis points (5%)

    uint private constant MIN_HEALTH_FACTOR = 1.1 ether;
    uint private constant UTILIZATION_THRESHOLD = 80; // 80%

    event Rebalanced(string indexed reason, uint indexed timestamp);
    event DepositedToAave(address indexed asset, uint amount);
    event WithdrawnFromAave(address indexed asset, uint amount);

    constructor(address _router, address _lendingPoolProvider) {
        uniswapRouter = ISwapRouter(_router);
        lendingPoolProvider = ILendingPoolAddressesProvider(_lendingPoolProvider);
        aaveLendingPool = ILendingPool(lendingPoolProvider.getLendingPool());
    }

    function configureAsset(address token, address feed, uint ratio) external onlyOwner {
        require(desiredRatios[token] == 0, "Asset already configured");
        priceFeeds[token] = AggregatorV3Interface(feed);
        desiredRatios[token] = ratio;
        assets.push(token);
        IERC20(token).safeApprove(address(uniswapRouter), type(uint256).max);
        IERC20(token).safeApprove(address(aaveLendingPool), type(uint256).max);
    }

    function checkAndRebalance() external whenNotPaused {
        require(block.timestamp >= lastRebalanceTimestamp + rebalanceInterval, "Rebalance interval not met");
        uint totalValue = calculateTotalValue();
        bool isRebalanceNeeded = false;

        for (uint i = 0; i < assets.length; i++) {
            uint currentRatio = calculateCurrentRatio(assets[i], totalValue);
            if (abs(int(currentRatio) - int(desiredRatios[assets[i]])) > int(minDriftThreshold)) {
                isRebalanceNeeded = true;
                break;
            }
        }

        require(isRebalanceNeeded, "Rebalance not required; drift within threshold");

        for (uint i = 0; i < assets.length; i++) {
            adjustPosition(assets[i], totalValue);
            manageYieldGeneratingAssets(assets[i]);
        }

        lastRebalanceTimestamp = block.timestamp;
        emit Rebalanced("Scheduled Rebalance", block.timestamp);
    }

    function adjustPosition(address token, uint totalValue) private {
        uint currentRatio = calculateCurrentRatio(token, totalValue);
        if (currentRatio != desiredRatios[token]) {
            uint amountRequired = executeSwap(token, currentRatio, desiredRatios[token], totalValue);
            rebalanceLiquidity(token, amountRequired);
        }
    }

    function executeSwap(address tokenIn, uint currentRatio, uint targetRatio, uint totalValue) private returns (uint amountRequired) {
        address tokenOut = findBestSwapMatch(tokenIn);
        uint amountIn = calculateSwapAmount(tokenIn, currentRatio, targetRatio, totalValue);
        uint amountOutMin = getMinAmountOut(amountIn, tokenIn, tokenOut);
        uint amountOut;

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });

        amountOut = uniswapRouter.exactInputSingle(params);
        return amountOut;
    }

    function manageYieldGeneratingAssets(address token) private {
        uint balance = IERC20(token).balanceOf(address(this));
        uint minThreshold = desiredRatios[token] * 10 ** IERC20(token).decimals() / 100; // 1% of desired ratio as threshold

        if (balance > minThreshold) {
            uint amountToDeposit = balance - minThreshold;
            aaveLendingPool.deposit(token, amountToDeposit, address(this), 0);
            emit DepositedToAave(token, amountToDeposit);
        }
    }

    function rebalanceLiquidity(address token, uint amountRequired) private {
        uint available = IERC20(token).balanceOf(address(this));
        if (available < amountRequired) {
            uint amountToWithdraw = amountRequired - available;
            aaveLendingPool.withdraw(token, amountToWithdraw, address(this));
            emit WithdrawnFromAave(token, amountToWithdraw);
        }
    }

    // Additional helper functions...

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
