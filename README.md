# Surveys

Briefly, this is the logic:
* Each input type has a different timer (checkbox vs select vs text input) that
  is started onChange/onInput.
* Once the timeout has expired, the question is validated using the in-browser
  HTML5 forms support
* If the field is valid, then postValidation() is run (if bound to that field).
  Question dependencies are handled in this step by examining the field's value
  and overwriting the panel's "data-next-panel" attribute.
* The next panel is determined by examining the "data-next-panel"
  attribute. Otherwise, the next panel in the DOM is used.
* The next panel fades in, is scrolled to, and the next field acquires focus.

`www/demo/index.html` is a working example with many different input types and
field dependencies.

## Adding a New Survey

Adding a new survey:
* `mkdir `www/survey_name`
* `cp -av www/demo/\* www/survey_name/`
* edit to your heart's content
* add 'survey_name' to `valid_surveys` in `server/submit.wsgi`
* `mkdir records/public/survey_name records/private/survey_name`

# Server

server/submit.wsgi is written for Apache's mod_wsgi
