import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  type DepositInput = {
    asset : Text;
    amount : Nat;
    txid : Text;
    screenshotBlobId : ?Text;
  };

  type Deposit = {
    id : Nat;
    user : Principal;
    asset : Text;
    amount : Nat;
    txid : Text;
    screenshotBlobId : ?Text;
    status : DepositStatus;
    timestamp : Time.Time;
  };

  // DepositOutput now includes userPrincipal so the admin queue can show real user IDs
  type DepositOutput = {
    id : Nat;
    userPrincipal : Text;
    asset : Text;
    amount : Nat;
    txid : Text;
    screenshotBlobId : ?Text;
    status : DepositStatus;
    timestamp : Time.Time;
  };

  type DepositStatus = {
    #pending;
    #verified;
    #rejected;
  };

  type Faq = {
    question : Text;
    answer : Text;
  };

  type Policy = {
    terms : Text;
    userPolicy : Text;
  };

  type SiteStats = {
    totalUsers : Nat;
    totalDeposits : Nat;
    pendingCount : Nat;
    approvedCount : Nat;
    rejectedCount : Nat;
  };

  var nextDepositId = 0;
  let deposits = Map.empty<Nat, Deposit>();
  let faqs = List.empty<Faq>();
  var policy : Policy = {
    terms = "";
    userPolicy = "";
  };
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Deposit Management
  public shared ({ caller }) func submitDeposit(input : DepositInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit deposits");
    };
    let deposit : Deposit = {
      id = nextDepositId;
      user = caller;
      asset = input.asset;
      amount = input.amount;
      txid = input.txid;
      screenshotBlobId = input.screenshotBlobId;
      status = #pending;
      timestamp = Time.now();
    };
    deposits.add(nextDepositId, deposit);
    nextDepositId += 1;
    deposit.id;
  };

  public query ({ caller }) func getMyDeposits() : async [DepositOutput] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deposits");
    };
    deposits.values().toArray().filter(func(d) { d.user == caller }).map(depositToOutput);
  };

  public query ({ caller }) func getAllDeposits() : async [DepositOutput] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    deposits.values().toArray().map(depositToOutput);
  };

  public shared ({ caller }) func approveDeposit(depositId : Nat) : async () {
    setDepositStatus(depositId, #verified, caller);
  };

  public shared ({ caller }) func rejectDeposit(depositId : Nat) : async () {
    setDepositStatus(depositId, #rejected, caller);
  };

  func setDepositStatus(depositId : Nat, status : DepositStatus, caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    switch (deposits.get(depositId)) {
      case (?deposit) {
        let updatedDeposit = { deposit with status };
        deposits.add(depositId, updatedDeposit);
      };
      case (null) { Runtime.trap("Deposit does not exist") };
    };
  };

  // Content Management
  public query func getFAQs() : async [Faq] {
    faqs.toArray();
  };

  public shared ({ caller }) func setFAQs(newFaqs : [Faq]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    faqs.clear();
    faqs.addAll(newFaqs.values());
  };

  public query func getTerms() : async Text {
    policy.terms;
  };

  public shared ({ caller }) func setTerms(terms : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    policy := { policy with terms };
  };

  public query func getPolicy() : async Text {
    policy.userPolicy;
  };

  public shared ({ caller }) func setPolicy(policyText : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    policy := { policy with userPolicy = policyText };
  };

  // Site Stats
  public query ({ caller }) func getSiteStats() : async SiteStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    let allDeposits = deposits.values().toArray();
    let totalDeposits = allDeposits.size();
    let pendingCount = allDeposits.filter(func(d) { d.status == #pending }).size();
    let approvedCount = allDeposits.filter(func(d) { d.status == #verified }).size();
    let rejectedCount = allDeposits.filter(func(d) { d.status == #rejected }).size();
    {
      totalUsers = userProfiles.size();
      totalDeposits;
      pendingCount;
      approvedCount;
      rejectedCount;
    };
  };

  func depositToOutput(deposit : Deposit) : DepositOutput {
    {
      id = deposit.id;
      userPrincipal = deposit.user.toText();
      asset = deposit.asset;
      amount = deposit.amount;
      txid = deposit.txid;
      screenshotBlobId = deposit.screenshotBlobId;
      status = deposit.status;
      timestamp = deposit.timestamp;
    };
  };
};
