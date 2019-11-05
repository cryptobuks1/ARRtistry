pragma solidity 0.5.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/drafts/Counters.sol";

import { IArtifactRegistry } from "./interfaces/IArtifactRegistry.sol";
import { IGovernance } from "./interfaces/IGovernance.sol";
import { ERC721ApprovalEnumerable } from "./ERC721ApprovalEnumerable.sol";

/**
 * @title ArtifactRegistry
 * @dev The core registry of the artifact
 */
contract ArtifactRegistry is IArtifactRegistry, Ownable, ERC721Full, ERC721ApprovalEnumerable {

  using Counters for Counters.Counter;

  IGovernance public governance;

  Counters.Counter public _tokenId;
  mapping (uint256 => Artifact) public artifacts;

  constructor(address owner, IGovernance _governance) public ERC721Full("Artifact", "ART") {
    _transferOwnership(owner);
    governance = _governance;
  }

  function mint(address who, Artifact memory _artifact) public returns (uint256) {
    require(msg.sender == owner(), "ArtifactRegistry::mint: Not minted by the owner");

    _tokenId.increment();
    uint256 newTokenId = _tokenId.current();

    artifacts[newTokenId] = _artifact;

    _mint(who, newTokenId);
    _setTokenURI(newTokenId, _artifact.metaUri);

    return newTokenId;
  }

  function getArtifactForToken(uint256 tokenId) public view returns (address, string memory) {
    Artifact memory artwork = artifacts[tokenId];

    return (artwork.artist, artwork.metaUri);
  }

  function transfer(address who, address recipient, uint256 tokenId, string memory metaUri, uint price, string memory location) public {
    safeTransferFrom(who, recipient, tokenId);

    Artifact storage artwork = artifacts[tokenId];
    artwork.metaUri = metaUri;

    governance.recordARR(who, recipient, tokenId, price, location);
  }
}
