Feature: Browsing dogs on the website
  As a person looking to adopt
  I want to browse and filter dogs and see which rescue holds each one
  So that I can get in touch with the rescue

  These scenarios are acceptance criteria, not suggestions. An
  implementation that fails any of them is wrong. If a scenario is itself
  wrong, that is a versioned change to this file.

  The website reads only from the Dogs API through the generated client.
  It has no database, no service token and no admin area in this version.

  Background:
    Given the Dogs API returns dogs and rescues as described in the dogs-api features

  Scenario: The home page lists enquirable dogs
    When I open the home page
    Then I see a card for each dog from listDogs
    And each card shows the dog's name, breeds, age, size, gender and rescue name
    And each card links to the dog's profile on the rescue's website when profileUrl is present

  Scenario: Filters narrow the list through the API
    When I choose size "Small" and gender "Female"
    Then listDogs is called with size "Small" and gender "Female"
    And the list shows only the returned dogs
    And the filters are reflected in the page URL so the view can be shared

  Scenario: Searching by name or breed
    When I type "staff" into the search box
    Then listDogs is called with q "staff" after a short pause
    And matching dogs are shown

  Scenario: Near me orders dogs by distance
    Given the browser grants my location
    When I choose "Near me"
    Then listDogs is called with my lat and lng
    And each card shows its distanceKm rounded to one decimal
    And dogs with no distance are shown last

  Scenario: Paging through results
    Given listDogs reports totalPages 3
    When I go to the next page
    Then listDogs is called with page 2
    And the page number is in the URL

  Scenario: A dog has its own page
    When I open the page for "Bella"
    Then getDog is called with her id
    And I see her details, her compatibility flags as yes, no or not known
    And I see her rescue's name, region and a link to its website
    And the page title names the dog and the rescue

  Scenario: An unknown dog shows not found
    When I open a dog page for an id the API does not know
    Then I see a not found message and a link back to the list

  Scenario: Rescues are listed with their dog counts
    When I open the rescues page
    Then I see every rescue from listRescues with its dogCount
    And I can filter by region and by name

  Scenario: A rescue page lists its dogs and contact details
    When I open the page for "Cardiff Dogs Home"
    Then I see its phone, email, address and website where present
    And I see its dogs from listRescueDogs

  Scenario: Data freshness is disclosed
    Then every page footer says listings are gathered from rescue websites and may lag behind them
    And each dog shows when it was last seen listed

  Scenario: The site works at phone width
    Then every page is usable at 375 pixels wide with no horizontal scrolling

  Scenario: Errors from the API are shown, not hidden
    Given listDogs fails
    When I open the home page
    Then I see a message that dogs could not be loaded and a retry control
