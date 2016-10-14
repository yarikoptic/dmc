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
function scrollStop() {
  cancelAnimationFrame(scrolling);
  for (var e of ['mousedown', 'wheel', 'touchmove']) {
    document.querySelector('html').removeEventListener(e, scrollStop);
  }
}
function scrollTo(to, duration) {
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

  for (var e of ['mousedown', 'wheel', 'touchmove']) {
    document.querySelector('html').addEventListener(e, scrollStop);
  }

  var start = position(),
    dest = getOffset(to) - start,
    currentTime = 0,
    increment = 20;

  var animateScroll = function() {
    currentTime += increment;
    move(Math.easeInOutQuad(currentTime, start, dest, duration));
    if (currentTime < duration) { // animate unless finished
      scrolling = requestAnimationFrame(animateScroll);
    } else {
      scrollStop();
    }
  };
  scrolling = animateScroll();
}

/*
 *  Mark question as valid or invalid
 */
function markInvalid(el) {
  var panel = getPanel(el);

  panel.classList.remove('badge-success');
  panel.classList.add('has-error');

  var error_box = panel.querySelector('div.error-box');
  if (error_box == null) {
    error_box = document.createElement('div');
    error_box.classList.add('error-box');
    panel.appendChild(error_box);
  }

  var message = ''
  for (f of panel.querySelectorAll('input,select')) {
    if (f.validationMessage != undefined) {
      message += f.validationMessage;
    }
  }
  error_box.textContent = message;
}

function markValid(el) {
  var panel = getPanel(el);

  panel.classList.remove('has-error');
  panel.classList.add('badge-success');

  var error_box = panel.querySelector('div.error-box');
  if (error_box !== null) {
    panel.removeChild(error_box);
  }
}

function nextPanel(el) {
  var panel = getPanel(el);
  var next = panel.dataset.nextPanel;

  if (next == undefined) { // if none, then simply go to next in DOM
    return panel.nextElementSibling;
  } else {
    return getPanel(fields[next]);
  }
}

function scrollToNextPanel(el) {
  var next_panel = nextPanel(el);
  showPanel(next_panel);
  scrollTo(next_panel, 3000);
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
      try { field.postValidation(); } catch(e) { /* pass */ }

      markValid(panel);
      scrollToNextPanel(panel);
    } else {
      markInvalid(panel);
    }
  }, timer);
}

// get the parent panel of an element
function getPanel(el) {
  var el = el.nodeName ? el : el[0]; // if a list, choose first item
  while (el !== document) {
    if (el.classList.contains('tl-panel')) { return el; } else { el = el.parentNode; }
  }
  return null;
};

// hide the panel(s) (or parent panel(s) of the passed element(s))
function hidePanel() {
  for (var i = 0; i < arguments.length; i++) {
    var panel = getPanel(arguments[i]);
    panel.classList.remove('visible');
  }
}
// show the panel(s) (or parent panel(s) of the passed element(s))
function showPanel() {
  for (var i = 0; i < arguments.length; i++) {
    var panel = getPanel(arguments[i]);
    panel.classList.add('visible');
  }
}
