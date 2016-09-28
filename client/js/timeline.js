var $root = $('html, body');

/*
 *  Load data-list, and build checkbox-list of user-selected items
 */
function addCheckbox(event) {
  var field = event.target;
  var dest = field.parentElement.querySelector('.checkboxes');

  if (field.value !== '') {
    var label = document.createElement('label');
    label.innerHTML = '<input type="checkbox" checked name="' + field.id + '[]"'
                    + ' onChange="this.parentNode.parentNode.removeChild(this.parentNode);"'
                    + ' value="' +  field.value + '"> ' + field.value + '</label>';
    dest.appendChild(label);
    field.value = '';
  }
}

function getUrlVar(key) {
  var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
  return result && unescape(result[1]) || "";
}

/*
 *  Load (nearly) all JSON into the form
 */
function populateForm(id, user_data) {
  // remove data we don't want written to form
  delete user_data['client_version'];
  delete user_data['json_leftovers'];

  for (var f of inputs) {
    var field_name = f.getAttribute('name');

    if (field_name !== undefined) {
      field_name = field_name.replace('[]', ''); // remove array markers

      // if we have user_data for the field in question
      if (user_data[field_name] !== undefined) {
        if (f.nodeName == 'SELECT') {
          var options = f.querySelectorAll('option');
          for (var o of options) {
            if (o.value = user_data[field_name]) {
              o.setAttribute('selected', true);
              delete user_data[field_name];
              break;
            }
          }
        } else {
          switch(f.getAttribute('type')) {
            case 'checkbox':
              if (user_data[field_name].indexOf(f.value) > -1) {
                f.setAttribute('checked', true);
                delete user_data[field_name];
              }
              break;
            default:
              f.value = user_data[field_name];
              delete user_data[field_name];
          }
        }
      }
    }
  }

  // these checkbox lists are built by the datalist fields
  // so it needs to be done manually on load
  for (var dl of ['sw_list', 'provider_list']) {
    if (Array.isArray(user_data[dl])) {
      for (var val of user_data[dl]) {
        //TODO: doesn't work with new function :-/
        addCheckbox('#' + dl, dl + '[]', val);
      }
      delete user_data[dl];
    }
  }

  // save leftovers, so they'll be submitted back, for paranoia's sake
  survey.getElementById('leftovers').value = JSON.stringify(user_data);
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

// panel = accepts a panel element
// duration = ms to fade in and for scrolling to
function showNextQuestion(panel, duration) {
  var data_next = panel.getAttribute('data-next');
  var next_panel;

  // if there's no next-question explicitly set, then just go to next in DOM
  if (data_next == undefined) {
    next_panel = panel.nextElementSibling;
  } else {
    next_panel = getPanel(inputs[data_next]);
  }

  showPanel(next_panel);

  // allow user-scrolling to win over our scrolling
  //$root.on("scroll mousedown wheel DOMMouseScroll mousewheel touchmove", function(){
  //  $root.stop();
  //});
  //$root.animate({ scrollTop: $next_q.offset().top }, duration, function(){
  //  $root.off("scroll mousedown wheel DOMMouseScroll mousewheel touchmove");
  //});
}

// field = accepts object pointing to field
// timer = ms since last input/change to wait before checking if it's time
//         to go to the next question
// TODO: holy hell this name is long...
function watchIfReadyForNextQuestion(field, timer) {
  var panel = getPanel(field);

  clearTimeout(panel.timer);
  panel.timer = setTimeout(function(){
    panel.timer = undefined;

    // TODO: verify, later, if this nodeName check works as expected
    if (field.nodeName == 'A' || field.validity.valid) {
      var field_name = field.getAttribute('name');
      if (custom_functions[field_name] !== undefined) {
        custom_functions[field_name](field);
      }

      markValid(field);
      showNextQuestion(panel, 2000);
    } else {
      markInvalid(field);
    }
  }, timer);
}

// Get the enclosing panel
function getPanel(el) {
  for (; el !== document && el.nodeType === 1; el = el.parentNode) {
    if (el.classList.contains('tl-panel')) {
      return el;
    }
  }
  return null;
};

function isPanel(el) {
  if (el.nodeType === 1 && el.classList.contains('tl-panel')) {
    return true;
  } else {
    return false;
  }
}

// Hide the parent panel of any element passed
function hidePanel() {
  for (var i = 0; i < arguments.length; i++) {
    var panel = getPanel(arguments[i]);
    panel.classList.remove('visible');
  }
}
// show the parent panel of any element passed
function showPanel() {
  for (var i = 0; i < arguments.length; i++) {
    var panel = isPanel(arguments[i]) ? arguments[i] : getPanel(arguments[i]);
    panel.classList.add('visible');
  }
}
