/*
   This flipcard component is based on the flipcard component by
   Alex Devero, at:
   
   https://reactjsexample.com/react-flipping-card-with-tutorial/

   It was modified for ECS 162 by Nina Amenta, May 2019.
 */

const cardContainer = document.querySelector('.react-card');

// React component for form inputs
class CardInput extends React.Component {
  state = { text: '' }

  render(props) {
    return(
      <fieldset>
        <input
	  onChange={this.props.hc.bind(this)}
	  value={this.props.value}
	  name={this.props.name}
	  id={this.props.id}
	  type={this.props.type || 'text'}
	  placeholder={this.props.placeholder} required
	/>
      </fieldset>
    )
  }
}

// React component for textarea
class CardTextarea extends React.Component {
  render() {
    return(
      <fieldset>
        <textarea
	  name={this.props.name}
	  id={this.props.id}
	  placeholder={this.props.placeholder} required >
	</textarea>
      </fieldset>
    )
  }
}

// React component for the front side of the card
class CardFront extends React.Component {
  render(props) {
    return(
      <div className={`card-side ${this.props.sfs}`}>
        <div className='card-side-container'>
	  <h2 id='trans'>{this.props.text}</h2>
	  <CardInput hc={this.props.hc} value={this.props.value}  />
        </div>
      </div>
    )
  }
}

// React component for the back side of the card
class CardBack extends React.Component {
  render(props) {
    return(
      <div className='card-side side-back'>
        <div className='card-side-container'>
          <h2 id='congrats'>{this.props.text}</h2>
        </div>
      </div>
    )
  }
}

// React component for the card (main component)
class Card extends React.Component {
  state = {
    vbs: [{riddle: ''}],
    ptr: 0,
    text: '',
    answer: '',
    sfs: '',
    cbs: '',
    user: '',
    score: 0
  }

  componentDidMount() {
    fetch('/cards').then(r => {
      return r.json()
    }).then(r => {
      this.setState({
	ptr: 0,
	vbs: r,
	score: this.score(r[0])
      })
    })    
    
    fetch('/userinfo').then( r => {
      return r.json()
    }).then(j => {
      this.setState({
	user: j.first_name,
	answer: this.state.vbs[0].answer
      })
    })
  }
  
  handleChange(e) {
    /* check if correct */
    if (
      e.target.value == this.state.vbs[this.state.ptr].answer
	&& this.state.answer !== 'Correct!'
    ) {
      this.setState({
	answer: 'Correct!'
      });
    }

    /* if correct after */
    if (
      this.state.answer == 'Correct!'
	&& e.target.value !== this.state.vbs[this.state.ptr].answer
    ) {
      this.setState({
	answer: this.state.vbs[this.state.ptr].answer
      })
    }
    
    this.setState({ text: e.target.value })
  }

  /* score */
  score(card) {
    let correct = card.correct;
    let seen = card.seen + 1;
    let max = Math.max;

    let score = Math.floor(
      max(1, 5 - correct)
	+ max(1,5-seen)
	+ 5 * ((seen-correct)/seen)
    );

    console.log(score);
    return score;
  }
  
  /* next card */
  nc() {
    let random = Math.floor(Math.random() * 15);
    let card_ptr = Math.floor(Math.random() * 9);
    let score = this.score(this.state.vbs[card_ptr]);
    
    while (random > score) {
      random = Math.floor(Math.random() * 15);
      card_ptr = Math.floor(Math.random() * 9);
      score = this.score(this.state.vbs[card_ptr]);
    }

    this.setState({
      score: score
    });
    
    return card_ptr;
  }
  
  handleFlip(e) {
    let card = this.state.vbs[this.state.ptr];
    if (e.key == 'Enter') {
      fetch(`/update_seen?answer=${card.answer}&seen=${card.seen}`)
	.then(r => {
	  return r.json()
	}).then(r => {
	  console.log(r);
	})
      
      this.setState({
	sfs: 'side-front',
	cbs: 'card-body',
      });

      if (this.state.answer == 'Correct!') {
	fetch(`/update_correct?answer=${card.answer}&correct=${card.correct}`)
	  .then(r => {
	    return r.json();
	  })
	  .then(r => {
	    console.log(r);
	  })
      }

      setTimeout(() => {
	this.setState({
	  sfs: 'hidden',
	  cbs: 'hidden',
	  text: '',
	  ptr: this.nc()
	})
      }, 2000)

      setTimeout(() => {
	fetch('/cards').then(r => r.json()).then(r => {
	  this.setState({
	    sfs: '',
	    cbs: '',
	    vbs: r,
	    answer: this.state.vbs[this.state.ptr].answer,
	  })	
	})
      }, 3000)
    }
  }
  
  render() {
    return(
      <div style={{margin: '0 2rem'}}>
	<div className='card-container' onKeyPress={this.handleFlip.bind(this)}>
          <div className={this.state.cbs}>
	    <CardFront
	      text={this.state.vbs[this.state.ptr].riddle}
	      value={this.state.text}
	      hc={this.handleChange.bind(this)}
	      sfs={this.state.sfs}
	    />
            <CardBack text={this.state.answer} />
          </div>
	</div>
	<div className='footer'>
	  <div>
	    Seen: {this.state.vbs[this.state.ptr].seen} <br/>
	    Correct: {this.state.vbs[this.state.ptr].correct}
	  </div>
	  <div style={{textAlign: 'right'}}>
	    {this.state.score} <br/>
	    {this.state.user}
	  </div>
	</div>
      </div>
    )
  }
}

// Render Card component
ReactDOM.render(<Card />, cardContainer);
