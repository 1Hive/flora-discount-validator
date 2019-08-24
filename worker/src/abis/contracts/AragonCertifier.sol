pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "./lib/ArrayUtils.sol";

import "./Certifier.sol";
import "./Owned.sol";

contract AragonCertifier is Owned, Certifier, AragonApp {
	using SafeMath for uint256;
	using ArrayUtils for address[];

	/// ACL
	bytes32 constant public INCREMENT_ROLE = keccak256("UPDATE_EPOCH_ROLE");
	bytes32 constant public ADD_TOKEN_ROLE = keccak256("ADD_VALIDATOR_ROLE");
	bytes32 constant public REMOVE_TOKEN_ROLE = keccak256("REMOVE_VALIDATOR_ROLE");

	string private constant ERROR_VALIDATOR_ALREADY_ADDED = "VALIDATOR_ALREADY_ADDED";
  string private constant ERROR_NO_VALIDATOR = "NO_VALIDATOR";


	/// State
	uint256 public epoch;

	struct Certification {
		bool active;
	}

	mapping (address => Certification) certs;

	mapping (address => bool) validators;
	address[] public activeValidators;

	// So that the server posting puzzles doesn't have access to the ETH.
	address public delegate = msg.sender;

	event AddValidator(address indexed validator);
  event RemoveValidator(address indexed validator);
	event UpdateEpoch(uint256 indexed epoch);


	/**
	* @notice Initialize
	* @param _validators Validators addresses
	*/
	function initialize(address[] _validators) external onlyInit {

			initialized();

			for (uint i = 0; i < _validators.length; i++) {
					validators[_validators[i]] = true;
					activeValidators.push(_validators[i]);
			}

	}

	/**
	* @notice Add `_validator` to active validators
	* @param _validator validator address
	*/
	function addValidator(address _validator) external auth(ADD_VALIDATOR_ROLE) {
			require(!validators[_validator], ERROR_VALIDATOR_ALREADY_ADDED);

			validators[_validator] = true;
			activeValidators.push(_validator);

			emit AddValidator(_validator);
	}

	/**
	* @notice Remove `_validator` from active validators
	* @param _validator validator address
	*/
	function removeValidator(address _validator) external auth(REMOVE_VALIDATOR_ROLE) {
			require(validators[_validator], ERROR_NO_VALIDATOR);

			validators[_validator] = false;
			activeValidators.deleteItem(_validator);

			emit RemoveValidator(_validator);
	}

	/**
	* @notice Update `_epoch` period
	* @param _epoch amount of blocks
	*/
	function updateEpoch(uint256 _epoch) external auth(UPDATE_EPOCH_ROLE) {

			epoch = _epoch;

			emit UpdateEpoch(_epoch);
	}

	modifier onlyDelegate {
		require(msg.sender == delegate);
		_;
	}

	modifier onlyCertified(address _who) {
		require(certs[_who].active);
		_;
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
}