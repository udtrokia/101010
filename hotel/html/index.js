;(function() {
  /* Global Tools */
  function dqs(ident) {
    return document.querySelector(ident)
  }

  function e(tag, _class, text, options = {attrs: {}, methods: {}}) {
    let el = document.createElement(tag);
    el.setAttribute('class', _class);

    Object.entries(options.attrs).reduce(
      (element, [field, value]) => {
	element.setAttribute(field, value);
	return element;
      }, el);

    Object.entries(options.methods).reduce(
      (element, [event, method]) => {
        element.addEventListener(event, method);
        return element;
      }, el);

    text?el.innerHTML = text:'';
    return el;
  }
  
  /* Fixed DOM */
  const ut = dqs('#up-title');
  const dt = dqs('#down-title');
  const uc = dqs('#up-container');
  const dc = dqs('#down-container');

  /* Trigger */
  ;(function() {
    dqs('#login').addEventListener('click', function(e) {
      dqs('#account').setAttribute('style', 'display: flex;')
    });

    dqs('.close').addEventListener('click', function(e) {
      dqs('#account').setAttribute('style', 'display: none;')
    });
  })();

  
  
  /* Models */
  function card(data) {
    let _card = e('div', 'card');
    _card.appendChild(e('text', 'card-title', data.name));
    _card.appendChild(e('text', 'card-rate', data.rate));
    
    return _card;
  }
  
  /* Home Page */
  ;(function() {
    const hotels = [{
      name: 'Omni Parker House',
      rate: '4.2'
    }, {
      name: 'The Lenox Hotel',
      rate: '4.6'
    }, {
      name: 'Mandarin Oriental',
      rate: '4.6'
    }, {
      name: 'Fairmont Copley Plaza',
      rate: '4.6'
    }, {
      name: 'The Eliot Hotel',
      rate: '4.5'
    }];

    hotels.map(h => {
      uc.appendChild(card(h));
    });
  })();
  
  /* Detail Page */
  
})();
