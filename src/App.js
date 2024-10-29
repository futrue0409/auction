import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// 智能合约ABI
const ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "trueAmount",
				"type": "uint256"
			}
		],
		"name": "AuctionEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "auctionDuration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expectBid",
				"type": "uint256"
			}
		],
		"name": "createAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenid",
				"type": "uint256"
			}
		],
		"name": "endAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "NewAuctionCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenid",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "trueAmount",
				"type": "uint256"
			}
		],
		"name": "NewBidPlaced",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenid",
				"type": "uint256"
			}
		],
		"name": "timeWeightBid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "auctions",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "highestBid",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "highestBidder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "ended",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "trueBid",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expectBid",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "addCnt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bidCooldownTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "biddingTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastBidTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const CONTRACT_ADDRESS = "0xf289208c345a5Caeb6B9081f958751d6283A0DC0"; // 替换为您的合约地址

const AuctionDApp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [newAuctionDuration, setNewAuctionDuration] = useState('');
  const [newAuctionExpectBid, setNewAuctionExpectBid] = useState('');

  // 连接MetaMask钱包
  const connectWallet = async () => {
    try {
      setLoading(true);
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(address);
        setIsConnected(true);
      } else {
        alert('请安装 MetaMask!');
      }
    } catch (error) {
      console.error('连接钱包错误:', error);
      alert('连接钱包失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建新拍卖
  const createNewAuction = async () => {
    try {
      setLoading(true);
      const duration = ethers.BigNumber.from(newAuctionDuration * 60);
      const expectBid = ethers.utils.parseEther(newAuctionExpectBid);
      
      const tx = await contract.createAuction(duration, expectBid);
      await tx.wait();
      
      alert('拍卖创建成功！');
      fetchAuctions();
    } catch (error) {
      console.error('创建拍卖错误:', error);
      alert('创建拍卖失败');
    } finally {
      setLoading(false);
    }
  };

  // 出价
  const placeBid = async (tokenId, amount) => {
    try {
      setLoading(true);
      const bidAmount = ethers.utils.parseEther(amount);
      const tx = await contract.timeWeightBid(tokenId, { value: bidAmount });
      await tx.wait();
      alert('出价成功！');
      fetchAuctions();
    } catch (error) {
      console.error('出价错误:', error);
      alert('出价失败');
    } finally {
      setLoading(false);
    }
  };

  // 结束拍卖
  const endAuction = async (tokenId) => {
    try {
      setLoading(true);
      const tx = await contract.endAuction(tokenId);
      await tx.wait();
      alert('拍卖已结束！');
      fetchAuctions();
    } catch (error) {
      console.error('结束拍卖错误:', error);
      alert('结束拍卖失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取拍卖信息
  const fetchAuctions = async () => {
    if (!contract) return;
    
    try {
      const auctionsData = [];
      for (let i = 0; i < 5; i++) {
        try {
          const auction = await contract.auctions(i);
          if (auction.seller !== ethers.constants.AddressZero) {
            auctionsData.push({
              id: i,
              seller: auction.seller,
              highestBid: ethers.utils.formatEther(auction.trueBid),
              highestBidder: auction.highestBidder,
              endTime: auction.endTime.toNumber(),
              ended: auction.ended,
              expectBid: ethers.utils.formatEther(auction.expectBid),
              addCnt: auction.addCnt.toNumber()
            });
          }
        } catch (error) {
          break;
        }
      }
      setAuctions(auctionsData);
    } catch (error) {
      console.error('获取拍卖信息错误:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchAuctions();
    }
  }, [contract]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      {/* 粒子背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30 animate-float"
            style={{
              width: Math.random() * 8 + 2 + 'px',
              height: Math.random() * 8 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">NFT 拍卖平台</h1>
        <button
          onClick={connectWallet}
          disabled={loading || isConnected}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? '处理中...' : isConnected ? `已连接: ${account.slice(0, 6)}...${account.slice(-4)}` : '连接钱包'}
        </button>
      </div>

      {/* 创建拍卖表单 */}
      {isConnected && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-4">创建新拍卖</h2>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="拍卖时长（分钟）"
              value={newAuctionDuration}
              onChange={(e) => setNewAuctionDuration(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              placeholder="期望价格（ETH）"
              value={newAuctionExpectBid}
              onChange={(e) => setNewAuctionExpectBid(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={createNewAuction}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
            >
              创建拍卖
            </button>
          </div>
        </div>
      )}

      {/* 拍卖列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <div key={auction.id} className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">拍卖 #{auction.id}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${auction.ended ? 'bg-red-500' : 'bg-green-500'}`}>
                  {auction.ended ? "已结束" : "进行中"}
                </span>
              </div>
              <div className="space-y-2 text-white">
                <p>卖家: {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}</p>
                <p>当前最高出价: {auction.highestBid} ETH</p>
                <p>期望价格: {auction.expectBid} ETH</p>
                <p>加价次数: {auction.addCnt}</p>
                <p>结束时间: {new Date(auction.endTime * 1000).toLocaleString()}</p>
                {auction.highestBidder !== ethers.constants.AddressZero && (
                  <p>最高出价者: {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-white/10">
              {!auction.ended && isConnected && (
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="输入出价金额（ETH）"
                    className="w-full px-4 py-2 bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    min={auction.expectBid}
                    step="0.01"
                    id={`bid-input-${auction.id}`}
                  />
                  <button
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50"
                    onClick={() => {
                      const input = document.getElementById(`bid-input-${auction.id}`);
                      placeBid(auction.id, input.value);
                    }}
                    disabled={loading}
                  >
                    出价
                  </button>
                </div>
              )}
              {isConnected && 
               auction.seller.toLowerCase() === account.toLowerCase() && 
               !auction.ended && 
               Date.now() / 1000 > auction.endTime && (
                <button
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white disabled:opacity-50"
                  onClick={() => endAuction(auction.id)}
                  disabled={loading}
                >
                  结束拍卖
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionDApp;