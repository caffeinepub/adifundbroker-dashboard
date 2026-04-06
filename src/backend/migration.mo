import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";

module {
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

  type Notification = {
    id : Nat;
    message : Text;
    senderPrincipal : Text;
    targetAll : Bool;
    targetPrincipal : ?Text;
    timestamp : Time.Time;
  };

  type NotificationRead = {
    notificationId : Nat;
    readerPrincipal : Text;
  };

  // Old actor type (before notifications)
  type OldActor = {
    deposits : Map.Map<Nat, Deposit>;
    faqs : List.List<Faq>;
    policy : Policy;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextDepositId : Nat;
  };

  // New actor type (after notifications)
  type NewActor = {
    deposits : Map.Map<Nat, Deposit>;
    faqs : List.List<Faq>;
    policy : Policy;
    notifications : Map.Map<Nat, Notification>;
    notificationReadRecords : Map.Map<Text, NotificationRead>;
    nextNotificationId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextDepositId : Nat;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    {
      old with
      notifications = Map.empty<Nat, Notification>();
      notificationReadRecords = Map.empty<Text, NotificationRead>();
      nextNotificationId = 0;
    };
  };
};
