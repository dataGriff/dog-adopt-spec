Feature: Browsing dogs and rescues
  As a person looking to adopt
  I want to list, filter and read about dogs and the rescues that hold them
  So that I can find a dog near me that suits my home

  These scenarios are acceptance criteria, not suggestions. An
  implementation that fails any of them is wrong. If a scenario is itself
  wrong, that is a versioned change to this file.

  Background:
    Given the rescue "Cardiff Dogs Home" exists in region "South Wales" at latitude 51.48 and longitude -3.17
    And the rescue "Dogs Trust" exists in region "National" with no coordinates
    And "Cardiff Dogs Home" holds these dogs:
      | name  | status    | age   | size   | gender | breeds                     | goodWithKids | goodWithCats |
      | Bella | available | Adult | Medium | Female | Staffordshire Bull Terrier | true         | false        |
      | Max   | reserved  | Young | Large  | Male   | Labrador Retriever         | null         | null         |
      | Rex   | adopted   | Adult | Large  | Male   | German Shepherd            | true         | true         |
      | Tiny  | withdrawn | Puppy | Small  | Female | Chihuahua                  | false        | false        |
    And "Dogs Trust" holds these dogs:
      | name | status    | age    | size  | gender | breeds        |
      | Dot  | available | Senior | Small | Female | Jack Russell Terrier |

  Scenario: Listing dogs shows only enquirable dogs by default
    When dogs are listed via listDogs with no filters
    Then the response status is 200
    And the items are exactly "Bella", "Max" and "Dot" in some order
    And meta.total is 3

  Scenario: Status can be chosen explicitly
    When dogs are listed via listDogs with status "adopted,withdrawn"
    Then the items are exactly "Rex" and "Tiny"

  Scenario Outline: Dogs are filtered by their attributes
    When dogs are listed via listDogs with <filter>
    Then the items are exactly <names>

    Examples:
      | filter                              | names          |
      | size "Small"                        | "Dot"          |
      | age "Young"                         | "Max"          |
      | gender "Female"                     | "Bella", "Dot" |
      | breed "Labrador Retriever"          | "Max"          |
      | region "South Wales"                | "Bella", "Max" |
      | goodWithKids true                   | "Bella"        |
      | goodWithCats false                  | "Bella"        |
      | q "bel"                             | "Bella"        |
      | q "staff"                           | "Bella"        |
      | rescueId of "Dogs Trust"            | "Dot"          |

  Scenario: An unknown compatibility is neither true nor false
    When dogs are listed via listDogs with goodWithKids false
    Then the items are empty
    And "Max" is not treated as either good or not good with kids

  Scenario: Pagination is honoured and described
    Given 30 further available dogs exist at "Dogs Trust"
    When dogs are listed via listDogs with page 2 and pageSize 24
    Then the response status is 200
    And there are 9 items
    And meta carries page 2, pageSize 24, total 33 and totalPages 2

  Scenario Outline: Invalid query parameters are rejected
    When dogs are listed via listDogs with <parameter>
    Then the response status is 400
    And the problem body has errorCode "validation_failed" and at least one errors entry

    Examples:
      | parameter        |
      | pageSize 101     |
      | page 0           |
      | size "Huge"      |
      | status "lost"    |
      | lat 91           |
      | radiusKm without lat and lng |

  Scenario: Distance is computed from the rescue when a location is given
    When dogs are listed via listDogs with lat 51.5 and lng -3.2
    Then every dog of "Cardiff Dogs Home" carries a distanceKm under 10
    And "Dot" carries no distanceKm and sorts last

  Scenario: Radius excludes distant dogs and dogs with unknown distance
    When dogs are listed via listDogs with lat 51.5, lng -3.2 and radiusKm 5
    Then the items are exactly "Bella" and "Max"

  Scenario: A dog can be fetched by id
    When "Bella" is fetched via getDog
    Then the response status is 200
    And the body carries id, name "Bella", status "available", breeds ["Staffordshire Bull Terrier"]
    And the body's rescue carries the id, name, region and website of "Cardiff Dogs Home"
    And every property in the Dog schema is present, null where unknown

  Scenario: Fetching an unknown dog returns 404
    When an unknown dog id is fetched via getDog
    Then the response status is 404
    And the problem body has errorCode "not_found"

  Scenario: A dog's age is derived from its birth date when known
    Given "Max" has birthYear 2 years ago and no birthMonth
    When "Max" is fetched via getDog
    Then age is "Young" regardless of the category the source gave

  Scenario: Rescues list with their enquirable dog count
    When rescues are listed via listRescues
    Then the response status is 200
    And the items are ordered by name
    And "Cardiff Dogs Home" carries dogCount 2
    And "Dogs Trust" carries dogCount 1

  Scenario: Rescues can be limited to those with dogs
    Given the rescue "Empty Paws" exists with no dogs
    When rescues are listed via listRescues with hasDogs true
    Then "Empty Paws" is not among the items

  Scenario: A rescue's dogs can be listed on their own
    When dogs are listed via listRescueDogs for "Cardiff Dogs Home"
    Then the items are exactly "Bella" and "Max"

  Scenario: Listing dogs for an unknown rescue returns 404
    When dogs are listed via listRescueDogs for an unknown rescue id
    Then the response status is 404

  Scenario: Breeds list canonical names with synonyms
    When breeds are listed via listBreeds
    Then "Staffordshire Bull Terrier" is present with synonyms including "Staffie" and "Staffy"
    And no synonym appears as a canonical name

  Scenario: Daily availability reports available dogs per day
    Given "Bella" became available 3 days ago
    And "Dot" became available 1 day ago
    When the report is fetched via getDailyAvailability from 4 days ago to today
    Then there are 5 items, one per day in date order
    And the item for 4 days ago has availableCount 0
    And the item for 2 days ago has availableCount 1
    And the item for today has availableCount 2

  Scenario: Daily availability can be scoped to a rescue
    When the report is fetched via getDailyAvailability for "Dogs Trust" from 4 days ago to today
    Then the item for today has availableCount 1

  Scenario: Daily availability rejects a reversed range
    When the report is fetched via getDailyAvailability from today to 4 days ago
    Then the response status is 400
