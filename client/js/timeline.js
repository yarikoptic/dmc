var $root = $('html, body');

/*
 *  Load data-list, and build checkbox-list of user-selected items
 */
function addCheckbox(field, name, val) {
  $(field).append('<div class="checkbox"><label>'
                + '<input type="checkbox" checked name="' + name + '" '
                +        'onChange="this.parentNode.parentNode.removeChild(this.parentNode);" '
                +        'value="' +  val + '"> ' + val + '</label></div>');
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

  $(id).find('select, input').each(function() {
    var $this = $(this);
    var field_name = $this.attr('name');

    if (field_name !== undefined) {
      field_name = field_name.replace('[]', ''); // remove array markers

      // if we have user_data for the field in question
      if (user_data[field_name] !== undefined) {
        if ($this.is('select')) {
          var option = $this.find(':contains("' + user_data[field_name] + '")');

          if (option.length) { // only select an option if it exists
            $(option).prop('selected', true);
            delete user_data[field_name];
          }
        } else {
          switch($this.attr('type')) {
            case 'checkbox':
              if ($.inArray($this.val(), user_data[field_name])) {
                $this.prop('checked', true);
                delete user_data[field_name];
              }
              break;
            default:
              $this.val(user_data[field_name]);
              delete user_data[field_name];
          }
        }
      }
    }
  });

  // these checkbox lists are built by the datalist fields
  // so it needs to be done manually on load
  ['sw_list', 'provider_list'].forEach(function(arr) {
    if (Array.isArray(user_data[arr])) {
      user_data[arr].forEach(function(val) {
        addCheckbox('#' + arr, arr + '[]', val);
      });
      delete user_data[arr];
    }
  });

  // save leftovers, so they'll be submitted back, for paranoia's sake
  $('#leftovers').val(JSON.stringify(user_data));
}

/*
 *  Mark question as valid or invalid
 */
function markInvalid($field) {
  var $panel = $field.closest('.tl-panel');
  //var $group = $parent_li.children('.form-group');

  $panel.removeClass('badge-success').addClass('badge-problem');
  //$group.addClass('has-error');
  //TODO: figure out how this form-group validation shit works

  //$parent_li.find('.help-block.with-errors').html($field[0].validationMessage);
}

function markValid($field) {
  var $panel = $field.closest('.tl-panel');
  //var $group = $parent_li.children('.form-group');

  $panel.removeClass('badge-problem').addClass('badge-success');

  //TODO: figure out how this form-group validation shit works
  //$group.removeClass('has-error');

  //$parent_li.find('.help-block.with-errors').empty();
}

// $current_q = accepts object pointing to question <li>
// duration = ms to fade in and for scrolling to
function showNextQuestion($current_q, duration) {
  var data_next = $current_q.attr('data-next');
  var $next_q;

  // if there's no next-question explicitly set, then just go to next in DOM
  if (data_next == undefined) {
    $next_q = $current_q.next();
  } else {
    $next_q = $(data_next);
  }

  $next_q.fadeIn(duration);

  // allow user-scrolling to win over our scrolling
  $root.on("scroll mousedown wheel DOMMouseScroll mousewheel touchmove", function(){
    $root.stop();
  });
  $root.animate({ scrollTop: $next_q.offset().top }, duration, function(){
    $root.off("scroll mousedown wheel DOMMouseScroll mousewheel touchmove");
  });
}

// $field = accepts object pointing to field
// timer = ms since last input/change to wait before checking if it's time
//         to go to the next question
// TODO: holy hell this name is long...
function watchIfReadyForNextQuestion($field, timer) {
  var $panel = $field.closest('.tl-panel');

  clearTimeout($panel.data('timer'));
  $panel.data('timer', setTimeout(function(){
    $panel.removeData('timer');

    if ($field.is('a') || $field[0].validity.valid) {
      var field_name = $field.attr('name');
      if (custom_functions[field_name] !== undefined) {
        custom_functions[field_name]($field);
      }

      markValid($field);
      showNextQuestion($panel, 2000);
    } else {
      markInvalid($field);
    }
  }, timer));
}

