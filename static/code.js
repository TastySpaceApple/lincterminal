var LincTerminal = {};
LincTerminal.TerminalScreen = (function(){
  function TerminalScreen(el){
    this.el = el;
    // this.el = document.createElement('div');
    // this.el.className = 'terminal-text';
  }
  TerminalScreen.prototype.clear = function(){
    this.el.innerHTML = '';
  }
  TerminalScreen.prototype.println = function(text){
    this.append(document.createTextNode(text + '\n'))
  }
  TerminalScreen.prototype.print = function(text){
    this.append(document.createTextNode(text))
  }
  TerminalScreen.prototype.append = function(n){
    this.el.appendChild(n);
  }
  return TerminalScreen;
})()

LincTerminal.NumPad = (function(){
  function NumPad(el) {
    this.el = el;
    this.listeners = []
    el.innerHTML =
    ['EXIT', 9, 8, 7,
             6, 5, 4,
      0, 3, 2, 1].map(function(num){
       return '<button href="#" class="numpad-button" data-key="'+num+'">'+num+'</button>'
     })
     .join('')
     el.addEventListener('click', this.handleClick.bind(this));
  }
  NumPad.prototype.handleClick = function(e){
    if(e.target.tagName === 'BUTTON'){
      this.emit(e.target.dataset.key);
    }
  }
  NumPad.prototype.emit = function(key){
    this.listeners.forEach(function(listener){ listener.call(null, key) })
  }
  NumPad.prototype.register = function(listener){
    this.listeners.push(listener);
  }
  return NumPad;
})()

LincTerminal.AudioPlayer = (function(){
    var NUM_DASHES = 36;
    var CHAR_EMPTY = '.';
    var CHAR_FILL = '>';
    function AudioPlayer(fileName){
      this.events = new util.EventEmitter();
      this.audioEl = new Audio();
	  this.active = false;
      this.el = document.createElement('div');
      this.el.innerHTML = CHAR_EMPTY.repeat(NUM_DASHES);
      this.bind();
    }
    AudioPlayer.prototype.bind = function(){
      var progressTimer;
      var self = this;
      this.audioEl.addEventListener('timeupdate', this.updatePosition.bind(this))
	  this.audioEl.addEventListener('canplay', this.play.bind(this))
      //this.audioEl.addEventListener('ended', function(){ // doesn't work on ios
	  //	self.events.emit('ended');
      //})
    }
    AudioPlayer.prototype.updatePosition = function(){
      if(!this.audioEl.duration) return;
	  if(this.audioEl.duration - this.audioEl.currentTime < 1)
		  this.events.emit('ended');
      var pos = Math.floor(this.audioEl.currentTime / this.audioEl.duration * NUM_DASHES);
      this.el.innerHTML = CHAR_FILL.repeat(pos) + CHAR_EMPTY.repeat(NUM_DASHES - pos);
    }
    AudioPlayer.prototype.load = function(fileName){
	  this.active = true;
      this.audioEl.src = fileName;
	  this.audioEl.load();
	  this.audioEl.play();
      this.el.innerHTML = CHAR_EMPTY.repeat(NUM_DASHES);
    }
	AudioPlayer.prototype.play = function(){
		this.audioEl.play();
	}
	AudioPlayer.prototype.pause = function(){
		this.audioEl.pause();
	}
	AudioPlayer.prototype.playpause = function(){
		this['p' + (!this.audioEl.paused ? 'ause' : 'lay')]()
	}

    AudioPlayer.prototype.stop = function(){
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
	  this.audioEl.src = '';
	  this.active = false;
    }
    return AudioPlayer;
})();

LincTerminal.Terminal = (function(){
  function Terminal(el){
      this.screen = new LincTerminal.TerminalScreen(el.querySelector('.terminal-text'))
      this.numpad = new LincTerminal.NumPad(el.querySelector('.terminal-numpad'))
      this.audioPlayer = new LincTerminal.AudioPlayer();

      this.screen.println('LOADING')
      this.numpad.register(this.numpadClick.bind(this));
      this.audioPlayer.events.on('ended', this.numpadClick.bind(this, 9));
  }
  Terminal.prototype.load = function(screen){
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      self.audioPlayer.stop();
      self.screen.clear();
      var data = JSON.parse(xhr.responseText);
      self.actions = data.actions;
      if('include' in data){
        self.audioPlayer.load(data.include[0]);
        self.screen.append(self.audioPlayer.el);
      }
      self.screen.print(data.text);
    }
    xhr.open('GET', '/get/screen/' + screen);
    xhr.send(null);
  }
  Terminal.prototype.numpadClick = function(key){
	if(!window.madeSound){
		this.audioPlayer.load('b.wav');
		window.madeSound = true;
	}

    if(key in this.actions)
      this.load(this.actions[key])
    if(key == 5 && this.audioPlayer.active) // hidden key 5 = play/pause
	   this.audioPlayer.playpause();

  }
  return Terminal;
})()
