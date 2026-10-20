Feature: Ingesting a rescue snapshot
  As the finder
  I want to post everything a rescue currently lists
  So that the API holds the current state of that rescue's dogs

  These scenarios are acceptance criteria, not suggestions. An
  implementation that fails any of them is wrong. If a scenario is itself
  wrong, that is a versioned change to this file.

  Background:
    Given the rescue "Cardiff Dogs Home" exists
    And the finder holds a valid service token
    And a snapshot is a complete capture from adapter "cardiff-dogs-home" unless stated otherwise

  Scenario: A snapshot of a rescue with no dogs creates them all
    When a snapshot with dogs "Bella" (externalId "bella-2") and "Max" (externalId "max-7") is posted via ingestRescueSnapshot
    Then the response status is 200
    And counts are received 2, created 2, updated 0, unchanged 0, withdrawn 0, rejected 0
    And "Cardiff Dogs Home" holds "Bella" and "Max" with status "available"
    And both dogs' firstSeenAt and lastSeenAt equal the snapshot's capturedAt
    And a "DogListed" event is published for each dog

  Scenario: A dog is matched on externalId within the rescue, not on name
    Given "Cardiff Dogs Home" holds "Bella" from externalId "bella-2"
    When a snapshot with "Bella Rose" (externalId "bella-2") is posted
    Then counts are created 0 and updated 1
    And the dog from externalId "bella-2" is now named "Bella Rose"
    And a "DogUpdated" event is published with changedFields containing "name"

  Scenario: Two rescues can list dogs with the same externalId
    Given the rescue "Dogs Trust" exists and holds "Dot" from externalId "dog-1"
    When a snapshot for "Cardiff Dogs Home" with "Dusty" (externalId "dog-1") is posted
    Then "Dot" at "Dogs Trust" is unchanged
    And "Cardiff Dogs Home" holds "Dusty"

  Scenario: An unchanged dog only has its lastSeenAt advanced
    Given "Cardiff Dogs Home" holds "Bella" from a snapshot captured yesterday
    When an identical snapshot captured today is posted
    Then counts are unchanged 1 and updated 0
    And "Bella" has lastSeenAt today and firstSeenAt yesterday
    And no event is published

  Scenario: A dog missing from a complete snapshot is withdrawn
    Given "Cardiff Dogs Home" holds "Bella" and "Max" from the finder
    When a complete snapshot with only "Bella" is posted
    Then counts are withdrawn 1
    And "Max" has status "withdrawn" and keeps its lastSeenAt from the earlier snapshot
    And a "DogWithdrawn" event is published for "Max"

  Scenario: A dog missing from a partial snapshot is left alone
    Given "Cardiff Dogs Home" holds "Bella" and "Max" from the finder
    When a snapshot with complete false and only "Bella" is posted
    Then counts are withdrawn 0
    And "Max" still has status "available"

  Scenario: A withdrawn dog that reappears is listed again
    Given "Cardiff Dogs Home" holds "Max" with status "withdrawn"
    When a snapshot with "Max" (same externalId) is posted
    Then "Max" has status "available"
    And counts are updated 1
    And a "DogUpdated" event is published with changedFields containing "status"

  Scenario: Dogs that were entered by hand are never withdrawn by the finder
    Given "Cardiff Dogs Home" holds "Hand Entered" with no externalId
    When a complete snapshot with only "Bella" is posted
    Then "Hand Entered" still has status "available"

  Scenario: Breed names are resolved through synonyms
    When a snapshot with "Bella" with breeds ["Staffie", "lab"] is posted
    Then "Bella" has breeds ["Staffordshire Bull Terrier", "Labrador Retriever"]
    And unresolvedBreeds is empty

  Scenario: An unknown breed is kept as unresolved, not rejected
    When a snapshot with "Bella" with breeds ["Sprollie"] is posted
    Then counts are created 1 and rejected 0
    And "Bella" has breeds [] and unresolvedBreeds ["Sprollie"]

  Scenario: Descriptions and images are never taken from the snapshot
    When a snapshot with "Bella" with imageUrl "https://www.cardiffdogshome.co.uk/img/bella.jpg" is posted
    Then "Bella" has imageUrl "https://www.cardiffdogshome.co.uk/img/bella.jpg" as a link only
    And "Bella" has description null

  Scenario: A dog that fails storage is reported, not fatal
    When a snapshot with "Bella" and a dog whose externalId collides with a hand-entered profile is posted
    Then the response status is 200
    And counts are rejected 1
    And rejected carries that dog's externalId and a reason
    And "Bella" is stored

  Scenario: Replaying an Idempotency-Key returns the original result
    Given a snapshot was posted with Idempotency-Key "snap-1" and created 2 dogs
    When the same body is posted again with Idempotency-Key "snap-1"
    Then the response status is 200
    And the same snapshotId and counts are returned
    And no further dogs are created and no further events are published

  Scenario: A different body on a used Idempotency-Key is rejected
    Given a snapshot was posted with Idempotency-Key "snap-1"
    When a different snapshot is posted with Idempotency-Key "snap-1"
    Then the response status is 409
    And the problem body has errorCode "idempotency_conflict"

  Scenario: The result of a snapshot can be fetched later
    Given a snapshot was posted and returned snapshotId S
    When S is fetched via getSnapshotResult
    Then the response status is 200
    And the body equals the original SnapshotResult

  Scenario Outline: Requests without a valid service token are refused
    When a snapshot is posted with <authorization>
    Then the response status is 401
    And the problem body has errorCode "unauthorized"
    And nothing is stored

    Examples:
      | authorization             |
      | no Authorization header   |
      | a bearer token that is wrong |

  Scenario: A snapshot for an unknown rescue is refused
    When a snapshot is posted for an unknown rescue id
    Then the response status is 404
    And the problem body has errorCode "not_found"

  Scenario Outline: An invalid snapshot body is rejected whole
    When a snapshot is posted <defect>
    Then the response status is 400
    And the problem body has errorCode "validation_failed" and errors naming the path
    And nothing is stored

    Examples:
      | defect                                   |
      | without capturedAt                       |
      | with a dog missing externalId            |
      | with a dog whose size is "Huge"          |
      | with a dog whose status is "withdrawn"   |
      | with source.mode "scraped"               |
      | with an unknown top-level property       |
      | without an Idempotency-Key header        |
