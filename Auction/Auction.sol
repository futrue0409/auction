// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Auction1 is ERC721URIStorage,Ownable {
    //使用计数器库
    using Counters for Counters.Counter;
    //用于生成唯一的代币id
    Counters.Counter private _tokenid;
    //拍卖结构体
    struct Auctions{
        address seller;//卖家地址
        uint256 highestBid;//最高出价
        address highestBidder;//最高出价者地址
        uint256 endTime;//拍卖结束时间
        bool ended;//拍卖是否结束
        uint256 trueBid;//真实出价
        uint256 expectBid;//卖家期望价格
        uint256 addCnt;//加时间的次数
    }
    //每个代币id对应的拍卖信息
    mapping (uint256=>Auctions) public auctions;
    //出价者最后的出价时间
    mapping (address=>uint256) public lastBidTime;
    //创建新的拍卖 每个代币的id和结束时间
    event NewAuctionCreated(uint256 indexed tokenid,uint256 endTime);
    //出价事件 每个代币id 出价者的地址，价格
    event NewBidPlaced(uint256 indexed tokenid,address indexed bidder,uint256 amount,uint256 trueAmount);
    //结束拍卖事件 每个代币id 最后的赢家 价格
    event AuctionEnded(uint256 indexed tokenid,address winner,uint256 amount,uint256 trueAmount);
    //最后5分钟
    uint256 public biddingTime = 5 minutes;
    uint256 public bidCooldownTime = 1 minutes; // 出价冷却时间
    //构造函数
    constructor(address addr) ERC721("white_mime","white_mime") Ownable(addr){}
    //创建拍卖
    function createAuction(uint256 auctionDuration,uint256 expectBid) external onlyOwner {
        //获取当前tokenid
        uint256 tokenid = _tokenid.current();
        //铸造
        _mint(msg.sender, tokenid);
        //拍卖时长必须大于等于5分钟
        require(auctionDuration >= 5 minutes,"set time is not true");
        uint256 endTime = block.timestamp + auctionDuration;
        //记录创建的拍卖
        auctions[tokenid] = Auctions({
            seller : msg.sender,
            highestBid : 0,
            highestBidder : address(0),
            endTime : endTime,
            ended : false,
            trueBid : 0,
            expectBid : expectBid,//卖家期望价格
            addCnt : 0
        });
        //释放创建拍卖事件
        emit NewAuctionCreated(tokenid,endTime);
        //更新计数器
        _tokenid.increment();
    }
    //出价函数 包含时间加权
    function timeWeightBid(uint256 tokenid) external payable {
        //获取拍卖信息
        Auctions storage auc = auctions[tokenid];
        require(auc.endTime > 0,"tokenid not exsit");
        require(block.timestamp < auc.endTime,"Auction has ended");
        require(block.timestamp >= lastBidTime[msg.sender],"Bid cooldown in effect");
        require(msg.value >= auc.expectBid,"price must be bigger than expect bid");
        uint256 remainingTime = auc.endTime - block.timestamp;
        uint256 weight = 1;
         if (remainingTime <= 5 minutes && remainingTime > 4 minutes) {
            weight = 2; 
        } else if (remainingTime <= 4 minutes && remainingTime > 3 minutes) {
            weight = 3; 
        } else if (remainingTime <= 3 minutes && remainingTime > 2 minutes) {
            weight = 4; 
        } else if (remainingTime <= 2 minutes && remainingTime > 1 minutes) {
            weight = 5; 
        } else if (remainingTime <= 1 minutes) {
            weight = 6; 
            if (msg.value >= (auc.expectBid * 5)&&auc.addCnt <= 10) {
                auc.endTime += 6 minutes;
                auc.addCnt ++;
            }
        }
        //计算加权后的价格
        uint256 weightBid = msg.value * weight;
        require(weightBid > auc.highestBid,"Bid amount must be higher than current highest bid.");
        //把钱退还
        if(auc.trueBid > 0) {
            (bool success,) = auc.highestBidder.call{value : auc.trueBid}("");
            require(success,"transfer is failed");
        }
        auc.highestBidder = msg.sender;
        auc.trueBid = msg.value;
        auc.highestBid = weightBid;
        //更新出价时间  出价时间加上冷却时间
        lastBidTime[msg.sender] = block.timestamp + bidCooldownTime;
        emit NewBidPlaced(tokenid,auc.highestBidder,auc.highestBid,auc.trueBid);
    }
    //结束拍卖
    function endAuction(uint256 tokenid) external {
         Auctions storage auc = auctions[tokenid];
         require(auc.endTime > 0,"tokenid not exsit");
         require(msg.sender == auc.seller,"Address is not true");
         require(block.timestamp >= auc.endTime,"Auction is not finished");
         require(!auc.ended,"set finish");
         auc.ended = true;
         emit AuctionEnded(tokenid,auc.highestBidder,auc.highestBid,auc.trueBid);
         _transfer(auc.seller, auc.highestBidder, tokenid);
         (bool success,) = auc.seller.call{value : auc.trueBid}("");
         require(success,"transfer is failed");
    }
}