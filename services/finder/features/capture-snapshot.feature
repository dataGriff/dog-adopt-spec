Feature: Capturing a rescue snapshot
  As the operator of Dog Adopt
  I want each rescue website parsed into the shared snapshot shape and posted to the API
  So that listings stay current without anyone re-typing them

  These scenarios are acceptance criteria, not suggestions. An
  implementation that fails any of them is wrong. If a scenario is itself
  wrong, that is a versioned change to this file.

  Live fetching of rescue websites is a decision not yet taken. Until it
  is, the finder must be fully exercisable from saved fixtures and must
  not contact any rescue website unless explicitly enabled.

  Background:
    Given the adapter "cardiff-dogs-home" is registered for rescue "Cardiff Dogs Home"
    And saved fixture HTML exists for "cardiff-dogs-home"

  Scenario: An adapter parses fixtures into a valid snapshot
    When "cardiff-dogs-home" is run in fixture mode
    Then a RescueSnapshot is produced that validates against the ingestRescueSnapshot body schema
    And source.adapter is "cardiff-dogs-home" and source.mode is "fixture"
    And complete is true
    And every dog has a stable externalId derived from its profile URL
    And no dog carries a description

  Scenario: Only factual data is captured
    When "cardiff-dogs-home" is run in fixture mode
    Then each dog carries name, age, size, gender and breeds as written on the site
    And compatibility flags are null where the site does not say
    And imageUrl, when present, is a link to the rescue's own image and nothing is downloaded

  Scenario: Live fetching is off unless explicitly enabled
    Given FINDER_LIVE_FETCH is unset
    When "cardiff-dogs-home" is run in live mode
    Then no HTTP request is made to any rescue website
    And the run fails with a message saying live fetching is disabled

  Scenario: Live fetching can be enabled for one adapter at a time
    Given FINDER_LIVE_FETCH is "cardiff-dogs-home"
    When "cardiff-dogs-home" is run in live mode
    Then the listing page and each dog page are fetched with the finder's User-Agent
    And requests to the same host are at least 1 second apart
    And source.mode is "live"

  Scenario: The schedule ships disabled
    Then the worker configuration has no enabled cron trigger
    And a capture can be started by hand through the finder's run endpoint

  Scenario: A captured snapshot is queued as a CloudEvent
    When "cardiff-dogs-home" is run in fixture mode
    Then a "SnapshotCaptured" message is sent on "finder.snapshot.captured.v1"
    And the envelope carries specversion "1.0", a unique id, source /finder and the rescue id as subject
    And data carries rescueId and the snapshot

  Scenario: The queue consumer posts the snapshot with the envelope id as Idempotency-Key
    Given a "SnapshotCaptured" message with id M is on the queue
    When the consumer handles it
    Then ingestRescueSnapshot is called for data.rescueId with Idempotency-Key M and data.snapshot as the body
    And the bearer token is the finder's service token
    And the message is acked on a 200

  Scenario Outline: The consumer retries only what can succeed later
    Given a "SnapshotCaptured" message is on the queue
    When the API answers <status>
    Then the message is <outcome>

    Examples:
      | status | outcome |
      | 200    | acked   |
      | 400    | acked   |
      | 401    | acked   |
      | 404    | acked   |
      | 409    | acked   |
      | 429    | retried |
      | 503    | retried |

  Scenario: An adapter failure is reported, not swallowed
    Given the fixture for "cardiff-dogs-home" is unparseable
    When "cardiff-dogs-home" is run in fixture mode
    Then an "AdapterFailed" message is sent on "finder.adapter.failed.v1"
    And data carries the rescueId, adapter, mode and a message
    And no "SnapshotCaptured" message is sent for that rescue

  Scenario: Adding a rescue means adding one adapter
    Then every adapter implements the same interface: parse(listingHtml, pageHtmlByUrl) to RescueSnapshot
    And the registry maps each adapter name to exactly one rescue id
    And an adapter's fixture test is the only test it needs to ship
