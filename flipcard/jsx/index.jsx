/*
   This flipcard component is based on the flipcard component by
   Alex Devero, at:
   
   https://reactjsexample.com/react-flipping-card-with-tutorial/

   It was modified for ECS 162 by Nina Amenta, May 2019.
 */


const cardContainer = document.querySelector('.react-card');

const vbs = [{
  answer: 'starting',
  riddle: 'What 8 letter word can have a letter taken away and it still makes a word. Take another letter away and it still makes a word. Keep on doing that until you have one letter left. What is the word?'
}, {
  answer: 'Racecar',
  riddle: 'What 7 letter word is spelled the same way backwards and forewards?'
}, {
  answer: 'NOON',
  riddle: 'What 4-letter word can be written forward, backward or upside down, and can still be read from left to right?'
}, {
  answer: 'SWIMS',
  riddle: 'What 5 letter word typed in all capital letters can be read the same upside down?'
}, {
  answer: 'Alphabet',
  riddle: 'What word contains all of the twenty six letters?'
}, {
  answer: 'Ton',
  riddle: 'Foward I am heavy, but backward I am not. What am I?',
}, {
  answer: 'Dozens',
  riddle: 'I am six letters. When you take one away I am twelve. What am I?'
}, {
  answer: 'Queue',
  riddle: 'What English word retains the same pronunciation, even after you take away four of its five letters?'
}, {
  answer: 'Heroine',
  riddle: 'There is a word in the English language in which the first two letters signify a male, the first three letters signify a female, the first four signify a great man, and the whole word, a great woman. What is the word?'
}];

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
    vbs: vbs,
    ptr: 0,
    text: '',
    answer: vbs[0].answer,
    sfs: '',
    cbs: '',
    seen: 0,
    correct: 0,
    user: 'David Bowie',
    timeFlag: 0,
    currentSeen: 15,
    score: 0
  }

  componentDidMount() {
    this.counter()
  }
  
  counter() {
    let counter = setInterval(() => {
      this.setState({
	currentSeen: this.state.currentSeen - 1
      })
      if (this.state.currentSeen <= 1) {
	clearInterval(counter);
	this.handleFlip('reset');
	this.setState({
	  currentSeen: 15
	})
	this.counter();
      }
    }, 1000)
  }
  
  handleChange(e) {
    /* check if correct */
    if (
      e.target.value == vbs[this.state.ptr].answer
	&& this.state.answer !== 'Correct!'
    ) {
      this.setState({
	answer: 'Correct!'
      });
    }

    /* if correct after */
    if (
      this.state.answer == 'Correct!'
	&& e.target.value !== vbs[this.state.ptr].answer
    ) {
      this.setState({
	answer: vbs[this.state.ptr].answer
      })
    }
    
    this.setState({ text: e.target.value })
  }

  handleFlip(e) {
    if (e === 'reset') {
      this.setState({
	ptr: this.state.ptr + 1
      })
      this.setState({
	answer: vbs[this.state.ptr].answer
      })
      return;
    }
    if (e.key == 'Enter') {
      this.setState({
	currentSeen: 15
      });
      if (this.state.answer == 'Correct!') {
	this.setState({
	  correct: this.state.corrent + 1
	})
      }
      this.setState({
	sfs: 'side-front',
	cbs: 'card-body',
	seen: this.state.seen + 1
      })
      setTimeout(() => {
	this.setState({
	  sfs: 'hidden',
	  cbs: 'hidden',
	  text: ''	  
	})
	if (this.state.ptr <= 8) {
	  this.setState({ ptr: this.state.ptr + 1 })
	}
      }, 2000)
      setTimeout(() => {
	this.setState({
	  sfs: '',
	  cbs: '',
	  answer: vbs[this.state.ptr].answer
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
	      text={vbs[this.state.ptr].riddle}
	      value={this.state.text}
	      hc={this.handleChange.bind(this)}
	      sfs={this.state.sfs}
	    />
            <CardBack text={this.state.answer} />
          </div>
	</div>
	<div className='footer'>
	  <div>
	    Seen: {this.state.seen} <br/>
	    Correct: {this.state.correct} <br/>
	    CurrentSeen: {this.state.currentSeen}</div>
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
