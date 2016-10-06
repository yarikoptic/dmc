// easing functions http://goo.gl/5HLl8
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) {
    return c/2*t*t + b
  }
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};

// the user should win over the scrollTo() animation
scrolling = undefined;
var events = ['mousedown', 'wheel', 'touchmove'];
for (var e of events) {
  document.querySelector('html').addEventListener(e, function() {
    if (scrolling != undefined) { cancelAnimationFrame(scrolling); scrolling = undefined; }
  });
}

function scrollTo(to) {
  // because it's so fucking difficult to detect the scrolling element, just move them all
  // "someday" document.scrollingElement can be used instead.
  function move(amount) {
    document.documentElement.scrollTop = amount;
    document.body.parentNode.scrollTop = amount;
    document.body.scrollTop = amount;
  }
  function position() {
    return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
  }
  function getOffset(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  var start = position(),
    dest = getOffset(to) - start,
    currentTime = 0,
    increment = 20,
    duration = 3000;

  var animateScroll = function() {
    currentTime += increment;
    move(Math.easeInOutQuad(currentTime, start, dest, duration));
    if (currentTime < duration) { // animate unless finished
      scrolling = requestAnimationFrame(animateScroll);
    } else {
      scrolling = undefined;
    }
  };
  scrolling = animateScroll();
}


// Accepts an input field a value (or a list of of values) to add
function addCheckbox(field, values) {
  if (! Array.isArray(values)) { values = [ values ]; }
  var dest = field.parentElement.querySelector('.checkboxes');

  for (var v of values) {
    var label = document.createElement('label');
    label.innerHTML = '<input type="checkbox" checked name="' + field.id + '[]"'
                    + ' onChange="this.parentNode.parentNode.removeChild(this.parentNode);"'
                    + ' value="' +  v + '"> ' + v + '</label>';
    dest.appendChild(label);
  }
  field.value = '';
}

function getUrlVar(key) {
  var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
  return result && unescape(result[1]) || "";
}

// populate form with values from json
function populateForm(json) {
  delete json['client_version']; // don't apply form-specific data
  delete json['json_leftovers'];

  // construct the user-built checkbox lists
  for (var key of ['sw_list[]', 'provider_list[]']) {
    if (json[key] == undefined) { continue; }
    addCheckbox(fields[key.slice(0, -2)], json[key]);
    delete json[key];
  }

  // now loop over the rest
  for (var key in json) {
    if (fields[key] == undefined) { continue; } // field doesn't exist

    if (Array.isArray(json[key])) { // checkboxes
      for (var cbox of fields[key]) {
        if (json[key].indexOf(cbox.value) > -1) {
          cbox.setAttribute('checked', true);
        }
      }
    } else if (fields[key].nodeName == 'SELECT') { // select
      for (var option of fields[key].children) {
        if (option.value == json[key]) {
          option.setAttribute('selected', true);
          break;
        }
      }
    } else { // everything else
      fields[key].value = json[key];
    }

    delete json[key];
  }

  // save leftovers, so they'll be submitted back, for paranoia's sake
  fields['leftovers'].value = JSON.stringify(json);
}

/*
 *  Mark question as valid or invalid
 */
function markInvalid(field) {
  var panel = getPanel(field);

  panel.classList.remove('badge-success');
  panel.classList.add('has-error');

  var error_box = panel.querySelector('div.error-box');
  if (error_box == null) {
    error_box = document.createElement('div');
    error_box.classList.add('error-box');
    panel.appendChild(error_box);
  }
  error_box.textContent = field.validationMessage;
}

function markValid(field) {
  var panel = getPanel(field);

  panel.classList.remove('has-error');
  panel.classList.add('badge-success');

  var error_box = panel.querySelector('div.error-box');
  if (error_box !== null) {
    panel.removeChild(error_box);
  }
}

function nextPanel(panel) {
  var next = panel.dataset.nextPanel;

  if (next == undefined) { // if none, then simply go to next in DOM
    return panel.nextElementSibling;
  } else {
    return getPanel(fields[next]);
  }

}
// panel = accepts a panel element
// duration = ms to fade in and for scrolling to
function showNextQuestion(panel, duration) {
  var next_panel = nextPanel(panel);
  showPanel(next_panel);
  scrollTo(next_panel);
}

// event = fired from onchange/input event
// TODO: holy hell this name is long...
function watchIfReadyForNextQuestion(event) {
  var field = event.target;
  var panel = getPanel(field);
  var timer = 0;

  if (field.nodeName == 'SELECT') {
    timer = 500;
  } else if (field.nodeName == 'INPUT') {
    switch (field.getAttribute('type')) {
      case 'checkbox':
        timer = 2000; break;
      case 'text':
        timer = 1500; break;
      default:
        timer = 1000;
    }
  }

  clearTimeout(panel.timer);
  panel.timer = setTimeout(function(){
    panel.timer = undefined;

    if (field.nodeName == 'A' || field.validity.valid) {
      try { field.postValidation(); } catch (e) { /* pass */ }

      markValid(field);
      showNextQuestion(panel, 2000);
    } else {
      markInvalid(field);
    }
  }, timer);
}

// Get the enclosing panel of an element
function getPanel(el) {
  while (el !== document) {
    if (el.classList.contains('tl-panel')) { return el; } else { el = el.parentNode; }
  }
  return null;
};

// hide the panel (or parent panel of the passed element)
function hidePanel() {
  for (var i = 0; i < arguments.length; i++) {
    var panel = getPanel(arguments[i]);
    panel.classList.remove('visible');
  }
}
// show the panel (or parent panel of the passed element)
function showPanel() {
  for (var i = 0; i < arguments.length; i++) {
    var panel = getPanel(arguments[i]);
    panel.classList.add('visible');
  }
}
