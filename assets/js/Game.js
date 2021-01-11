var Game = function(container){

  this._container = document.getElementById(container),
  this._grid = null,
  this._x = null,
  this._y = null,
  this._bombers = null,
  this._htmlGrid = null,
  this._debug = true,
  this._debugGrid = false,
  this._timer = 0,
  this._placed = 0,
  this._nbCellTotal = 0,
  this._totalClick = 0,
  this._correct = 0,
  this._lock = false,
  this._timerInterval = null
  ;

  const empty = 0;
  const bomb = -1;

  var _self = this;

  this._reload = function(){
    _self._grid = null,
    _self._x = null,
    _self._y = null,
    _self._bombers = null,
    _self._htmlGrid = null,
    _self._debug = true,
    _self._debugGrid = false,
    _self._timer = 0,
    _self._placed = 0,
    _self._nbCellTotal = 0,
    _self._totalClick = 0,
    _self._correct = 0,
    _self._lock = false;

    $('#errorForm').addClass('d-none')
    $('#victory').addClass('d-none');
    $('#defeat').addClass('d-none');
    $('#currentTimer').addClass('d-none');

    if (_self._timerInterval !== null){
      clearInterval(_self._timerInterval);
    }
  }

  this.log = function(){
    if (_self._debug){
      console.log.apply(null, arguments);
    }
  };

  this.defined = function(el){
    return typeof el !== typeof void(0);
  };

  this._getCell = function(x, y){
    if (_self.defined(_self._grid[x]) && _self.defined(_self._grid[x][y])){
      return _self._grid[x][y];
    }
    return null;
  };

  this._setCell = function(x, y, value){
    if (_self.defined(_self._grid[x]) && _self.defined(_self._grid[x][y])){
      _self._grid[x][y] = value;
    }
  };

  this._getHtmlCell = function(x, y){
    var el = $('#cell-'+ x +'-'+ y);
    return el.length > 0 ? el : null;
  };

  this._isBomb = function(x, y){
    var cell = _self._getCell(x, y);
    return cell !== null && cell == bomb;
  };

  this._isEmpty = function(x, y){
    var cell = _self._getCell(x, y);
    return cell !== null && cell == empty;
  };

  this._htmlToCell = function(element){
    var cell = null;
    try {
      var x = parseInt($(element).data('x'));
      var y = parseInt($(element).data('y'));
      cell = _self._getCell(x, y);
    }catch(e){}
    
    return cell;
  };

  this._initGrid = function(){
    _self._grid = [[]];
    for(var x = 0; x < _self._x; x++){
      for(var y = 0; y < _self._y; y++){
        if (!_self.defined(_self._grid[x])){
          _self._grid[x] = [];
        }
        _self._grid[x][y] = empty;
        _self._nbCellTotal++;
      }
    }
    this.log('grid initialised', _self._grid);
    _self._placed = 0;
    
  };
 
  this._initBomb = function(){
    var maxBombInRow = Math.floor(((_self._bombers / _self._x) * 10) / 2);
    var r = null;
    while(_self._placed < _self._bombers){
      for(var x = 0; x < _self._x; x++){
        var bombInRow = 0;
        for(var y = 0; y < _self._y; y++){
          if (_self._placed < _self._bombers && _self._grid[x][y] != bomb){
            if (bombInRow >= 0 && bombInRow < maxBombInRow){
              r = Math.floor(Math.random() * Math.floor(100));
              _self._setCell(x, y, r > 95 ? bomb : empty);
              if (_self._getCell(x, y) === bomb){
                _self._placed++;
                bombInRow++;
              }
            }
          }
        }
      }
    }
    _self.log("Bomb initialized", _self._grid, _self._placed);
  };

  this._initNumbers = function(){
    for(var x = 0; x < _self._x; x++){
      for(var y = 0; y < _self._y; y++){

        var cell = _self._getCell(x, y);
        if (cell !== null && cell !== bomb){
            let count = 0;

            // top
            if (_self._isBomb(x, y - 1)){
              count++;
            }
            // bottom
            if (_self._isBomb(x, y + 1)){
              count++;
            }
            // left
            if (_self._isBomb(x - 1, y)){
              count++;
            }
            // right
            if (_self._isBomb(x + 1, y)){
              count++;
            }
            // top-left
            if (_self._isBomb(x - 1, y - 1)){
              count++;
            }
            // top-right
            if (_self._isBomb(x + 1, y - 1)){
              count++;
            }
            // bottom-left
            if (_self._isBomb(x - 1, y + 1)){
              count++;
            }
            // bottom-right
            if (_self._isBomb(x + 1, y + 1)){
              count++;
            }
            _self._setCell(x, y, count);
        }
      }
    }

    _self.log("number initialized", _self._grid);
  };


  this._draw = function(){
    _self._container.innerHTML = "";
    _self._htmlGrid = '<table>';

    for(var x = 0; x < _self._x; x++){
      _self._htmlGrid += '<tr id="row['+ x +']">';
      for(var y = 0; y < _self._y; y++){
        var cell = _self._getCell(x, y);
        if (cell !== null){
          var text = "";
          if (cell === bomb){
            text = '<i class="fa fa-bomb"></i>';
          }else if (cell !== empty){
            text = cell;
          }
          var hide = 'hide';
          if (_self._debugGrid){
            hide = '';
          }
          _self._htmlGrid += '<td id="cell-'+ x +'-'+ y +'" class="nb'+ cell +' '+ hide +'" data-x="'+x+'" data-y="'+y+'">'+ text +'</td>';
        }
      }
      _self._htmlGrid += '</tr>';
    }

    _self._htmlGrid += '</table>';
    _self.log("drawing grid");
    _self._container.innerHTML = _self._htmlGrid;
  };

  this._startTimer = function(){
    if ($('#currentTimer').hasClass('d-none')){
      $('#currentTimer').removeClass('d-none');
      _self._timerInterval = setInterval(() => {
          _self._timer++;
          $('#timer').text(_self._timer + ' s');
      }, 1000);
    }
  };

  this._gameEvents = function(){
    $('td').on('click', function(e){
      if (_self._lock){
        return;
      }
      _self._startTimer();
      _self._onLeftClick($(this));
    });
    $('td').on('contextmenu', function(e){
      e.preventDefault();
      if (_self._lock){
        return;
      }
      _self._startTimer();
      _self._onRightClick($(this));

    });
  };

  this._onRightClick = function(htmlEl){
    if (!htmlEl.hasClass('hide')){
      return;
    }

    var cell = _self._htmlToCell(htmlEl);
    var wasFlagged = $(htmlEl).hasClass('flag');

    var cellHtml = "";
    if (!wasFlagged){
      cellHtml = '<i class="fa fa-flag"></i>';
    }else {
      if (cell === bomb){
        cellHtml = '<i class="fa fa-bomb"></i>';
      }else if (cell !== empty){
        cellHtml = cell;
      }
    }

    htmlEl.html(cellHtml);
    htmlEl.toggleClass('flag');  

    if (cell === bomb && wasFlagged){
      _self._correct--;
    }else {
      _self._correct++;
    }
    _self._checkVictory();
  }

  this._onLeftClick = function(htmlEl){
    if (!htmlEl.hasClass('hide')){
      return;
    }
    var cell = _self._htmlToCell(htmlEl);

    if (cell !== empty && _self._totalClick == 0){
      this._firstClick(htmlEl);
      return;
    }

    if (cell === bomb){
      _self._defeat(htmlEl);
    }else if (cell == empty){
      _self._revealCellAndOthers(htmlEl);
    }else {
      htmlEl.removeClass('hide');
    }
    _self._totalClick++;
  }

  this._firstClick = function(htmlEl){
    this.log("Remove start on non empty");
    var x = htmlEl.data('x');
    var y = htmlEl.data('y');

    // Empty self and around
    _self._setCell(x, y, empty);
    // top
    _self._setCell(x, y - 1, empty);
    // bottom
    _self._setCell(x, y + 1, empty);
    // left
    _self._setCell(x - 1, y, empty);
    // right
    _self._setCell(x + 1, y, empty);
    // top-left
    _self._setCell(x - 1, y - 1, empty);
    // top-right
    _self._setCell(x + 1, y - 1, empty);
    // bottom-left
    _self._setCell(x - 1, y + 1, empty);
    // bottom-right
    _self._setCell(x + 1, y + 1, empty);

    
    // redraw correctly
    _self._initNumbers();
    _self._draw();
    _self._gameEvents();
    
    _self._totalClick++;
    _self._onLeftClick(htmlEl);
  }

  this._revealCellAndOthers = function(htmlEl){
    if (htmlEl === null || !htmlEl.hasClass('hide')){
      return;
    }
    var cell = _self._htmlToCell(htmlEl);

    if (cell === bomb){
      return;
    }

    if (cell !== empty){
      htmlEl.removeClass('hide');
      return;  
    }

    htmlEl.removeClass('hide');
    var x = htmlEl.data('x');
    var y = htmlEl.data('y');

    // top
    _self._revealCellAndOthers(_self._getHtmlCell(x, y - 1));
    // bottom
    _self._revealCellAndOthers(_self._getHtmlCell(x, y + 1));
    // left
    _self._revealCellAndOthers(_self._getHtmlCell(x - 1, y));
    // right
    _self._revealCellAndOthers(_self._getHtmlCell(x + 1, y));
    // top-left
    _self._revealCellAndOthers(_self._getHtmlCell(x - 1, y - 1));
    // top-right
    _self._revealCellAndOthers(_self._getHtmlCell(x + 1, y - 1));
    // bottom-left
    _self._revealCellAndOthers(_self._getHtmlCell(x - 1, y + 1));
    // bottom-right
    _self._revealCellAndOthers(_self._getHtmlCell(x + 1, y + 1));

  }

  this._checkVictory = function(){
    if (_self._correct == _self._bombers){
      clearInterval(_self._timerInterval);
      $('#victory').removeClass('d-none');
      $('.total-time').text(_self._timer + ' secondes');
      _self._lock = true;
    }
  }

  this._defeat = function(htmlEl){
    clearInterval(_self._timerInterval);
    $('.nb-1 .fa').addClass('reveal');
    $(htmlEl).find('.fa').addClass('exploded');
    $('#defeat').removeClass('d-none');
    $('.total-time').text(_self._timer + ' secondes');
    _self._lock = true;
  }

  this._start = function(){
    _self._reload();
    
    _self._x = $('input[name="x"]').val();
    _self._y = $('input[name="y"]').val();
    _self._bombers = $('input[name="bombers"]').val();
    
    if (!_self._x || !_self._y || !_self._bombers){
      $('#errorForm').text("Veuillez compléter tous les champs").removeClass('d-none');
      return;
    }
    
    _self._initGrid();
    if (_self._bombers > _self._nbCellTotal ){
      $('#errorForm').text("Trop de bombes !").removeClass('d-none');
      return;
    }
    _self._initBomb();
    _self._initNumbers();
    _self._draw();
    _self._gameEvents();

  };

  this._addListener = function(){
    $('#startButton').on('click', function(){
      _self._start();
    })
  }


  this.init = function(){
    _self.log('initialisation game');
    _self._addListener();
  };
}

window.Game = Game;