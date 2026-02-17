import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type EncryptedText = Text;
  public type Status = {
    #open;
    #closed;
    #awaitingCourt;
    #reviewingEvidence;
    #scheduled;
  };

  public type Hearing = {
    date : EncryptedText;
    outcome : EncryptedText;
    notes : EncryptedText;
    status : Status;
  };

  public type EncryptedCase = {
    caseNumber : EncryptedText;
    creationDate : EncryptedText;
    nextHearing : EncryptedText;
    clientName : EncryptedText;
    clientContact : EncryptedText;
    evidence : [EncryptedText];
    hearings : [Hearing];
    status : Status;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    organization : Text;
  };

  let caseMap = Map.empty<Principal, List.List<EncryptedCase>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Case Management Functions
  public shared ({ caller }) func addCase(newCase : EncryptedCase) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cases");
    };

    let currentCases = switch (caseMap.get(caller)) {
      case (null) { List.empty<EncryptedCase>() };
      case (?existing) { existing };
    };

    currentCases.add(newCase);
    caseMap.add(caller, currentCases);
  };

  public shared ({ caller }) func getCases() : async [EncryptedCase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };

    switch (caseMap.get(caller)) {
      case (null) { [] };
      case (?cases) { cases.toArray() };
    };
  };

  public shared ({ caller }) func updateStatus(caseNumber : EncryptedText, newStatus : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update case status");
    };

    let targetCases = switch (caseMap.get(caller)) {
      case (null) { Runtime.trap("Case not found") };
      case (?cases) { cases };
    };

    let updatedList = targetCases.map<EncryptedCase, EncryptedCase>(
      func(c) {
        if (c.caseNumber == caseNumber) {
          {
            caseNumber = c.caseNumber;
            creationDate = c.creationDate;
            nextHearing = c.nextHearing;
            clientName = c.clientName;
            clientContact = c.clientContact;
            evidence = c.evidence;
            hearings = c.hearings;
            status = newStatus;
          };
        } else { c };
      }
    );
    caseMap.add(caller, updatedList);
  };

  public shared ({ caller }) func addHearing(caseNumber : EncryptedText, hearing : Hearing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add hearings");
    };

    let relevantCases = switch (caseMap.get(caller)) {
      case (null) { Runtime.trap("Case not found") };
      case (?cases) { cases };
    };

    let updatedCases = relevantCases.map<EncryptedCase, EncryptedCase>(
      func(c) {
        if (c.caseNumber == caseNumber) {
          {
            caseNumber = c.caseNumber;
            creationDate = c.creationDate;
            nextHearing = c.nextHearing;
            clientName = c.clientName;
            clientContact = c.clientContact;
            evidence = c.evidence;
            hearings = c.hearings.concat([hearing]);
            status = c.status;
          };
        } else { c };
      }
    );
    caseMap.add(caller, updatedCases);
  };

  public shared ({ caller }) func addEvidence(caseNumber : EncryptedText, evidence : EncryptedText) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add evidence");
    };

    let targetCases = switch (caseMap.get(caller)) {
      case (null) { Runtime.trap("Case not found") };
      case (?cases) { cases };
    };

    let updatedCases = targetCases.map<EncryptedCase, EncryptedCase>(
      func(c) {
        if (c.caseNumber == caseNumber) {
          {
            caseNumber = c.caseNumber;
            creationDate = c.creationDate;
            nextHearing = c.nextHearing;
            clientName = c.clientName;
            clientContact = c.clientContact;
            evidence = c.evidence.concat([evidence]);
            hearings = c.hearings;
            status = c.status;
          };
        } else { c };
      }
    );
    caseMap.add(caller, updatedCases);
  };

  public query ({ caller }) func getCaseByNumber(caseNumber : EncryptedText) : async ?EncryptedCase {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };

    switch (caseMap.get(caller)) {
      case (null) { null };
      case (?cases) {
        cases.find(
          func(c) { c.caseNumber == caseNumber }
        );
      };
    };
  };

  public shared ({ caller }) func updateCase(updatedCase : EncryptedCase) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cases");
    };

    let allCases = switch (caseMap.get(caller)) {
      case (null) { List.empty<EncryptedCase>() };
      case (?existing) { existing };
    };

    let caseExists = allCases.any(
      func(c) { c.caseNumber == updatedCase.caseNumber }
    );

    if (not caseExists) {
      Runtime.trap("Case not found");
    };

    let updatedCases = allCases.map<EncryptedCase, EncryptedCase>(
      func(c) { if (c.caseNumber == updatedCase.caseNumber) { updatedCase } else { c } }
    );
    caseMap.add(caller, updatedCases);
  };

  public shared ({ caller }) func deleteCase(caseNumber : EncryptedText) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete cases");
    };

    let currentCases = switch (caseMap.get(caller)) {
      case (null) { Runtime.trap("Case not found") };
      case (?cases) { cases };
    };

    let filteredCases = currentCases.filter(
      func(c) { c.caseNumber != caseNumber }
    );

    caseMap.add(caller, filteredCases);
  };

  public query ({ caller }) func getCasesByStatus(status : Status) : async [EncryptedCase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };

    switch (caseMap.get(caller)) {
      case (null) { [] };
      case (?cases) {
        cases.filter(
          func(c) { c.status == status }
        ).toArray();
      };
    };
  };

  public shared ({ caller }) func addMultipleCases(cases : [EncryptedCase]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cases");
    };

    let existingCases = switch (caseMap.get(caller)) {
      case (null) { List.empty<EncryptedCase>() };
      case (?current) { current };
    };

    for (caseEntry in cases.values()) {
      existingCases.add(caseEntry);
    };

    caseMap.add(caller, existingCases);
  };
};
