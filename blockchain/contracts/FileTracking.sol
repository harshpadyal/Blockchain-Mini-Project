// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileTracking {
    struct File {
        uint id;
        string name;
        address currentOwner;
    }

    struct Transfer {
        address from;
        address to;
        uint timestamp;
    }

    mapping(uint => File) public files;
    mapping(uint => Transfer[]) public history;

    uint public fileCount = 0;

    function createFile(string memory _name) public {
        fileCount++;
        files[fileCount] = File(fileCount, _name, msg.sender);
    }

    function transferFile(uint _id, address _to) public {
        require(_id > 0 && _id <= fileCount, "Invalid file ID");
        require(files[_id].currentOwner == msg.sender, "Not owner");

        history[_id].push(Transfer(msg.sender, _to, block.timestamp));
        files[_id].currentOwner = _to;
    }

    function getHistory(uint _id) public view returns (Transfer[] memory) {
        require(_id > 0 && _id <= fileCount, "Invalid file ID");
        return history[_id];
    }
}