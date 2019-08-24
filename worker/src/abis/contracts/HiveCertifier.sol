pragma solidity ^0.4.24;

import "./Certifier.sol";
import "./Owned.sol";

contract HiveCertifier is Owned, Certifier {

	string private constant ERROR_VALIDATOR_ALREADY_ADDED = "VALIDATOR_ALREADY_ADDED";
  string private constant ERROR_NO_VALIDATOR = "NO_VALIDATOR";


	/// State
	uint256 public epoch;

	struct Certification {
		bool active;
	}

	mapping (address => Certification) certs;
	mapping (address => Certification) validators;

	// So that the server posting puzzles doesn't have access to the ETH.
	address public delegate = msg.sender;

	event AddValidator(address indexed validator);
  event RemoveValidator(address indexed validator);
	event UpdateEpoch(uint256 indexed epoch);


	modifier onlyDelegate {
		require(msg.sender == delegate);
		_;
	}

	modifier onlyCertified(address _who) {
		require(certs[_who].active);
		_;
	}

	function updateEpoch(uint256 _epoch) external onlyDelegate {
		epoch = _epoch;
		emit UpdateEpoch(_epoch);
	}

	function addValidator(address _validator) external onlyDelegate {
		validators[_validator] = true;
		emit AddValidator(_validator);
	}

	function removeValidator(address _validator) external onlyDelegate {
		validators[_validator].active = false;
		emit RemoveValidator(_validator);
	}

	function certify(address _who)
		external
		onlyDelegate
	{
		certs[_who].active = true;
		emit Confirmed(_who);
	}

	function revoke(address _who)
		external
		onlyDelegate
		onlyCertified(_who)
	{
		certs[_who].active = false;
		emit Revoked(_who);
	}

	function setDelegate(address _new)
		external
		onlyOwner
	{
		delegate = _new;
	}

	function certified(address _who)
		external
		view
		returns (bool)
	{
		return certs[_who].active;
	}

	function isValidator(address _who)
		external
		view
		returns (bool)
	{
		return validators[_who].active;
	}
}