'use strict';

(() => {

  var Maze = function(col, row) {
    this.map = [];
    this.col = col;
    this.row = row;
    this.startX = 0;
    this.startY = 0;
    this.goalX = col - 1;
    this.goalY = row - 1;
    this.points = [
      [0, -1],
      [0, 1],
      [1, 0],
      [-1, 0]
    ];

    this.init = function() {
      for(var x = 0; x < col; x++) {
        this.map[x] = [];
        for(var y = 0; y < row; y++) {
          this.map[x][y] = 0;
        }
      }
    
      for(var x = 1; x < col; x += 2) {
        for(var y = 1; y < row; y += 2) {
          this.map[x][y] = 1;
        }
      }

      for(var x = 1; x < col; x += 2) {
        for(var y = 1; y < row; y += 2) {
          do {
            if(x === 1) {
            var r = this.points[this.rand(3)];
          } else {
            var r = this.points[this.rand(2)];
          }
         } while (this.map[x+r[0]][y+r[1]] === 1);
         this.map[x+r[0]][y+r[1]] = 1;
        }
      }
    };

    this.draw = function() {
      var view = new View();
      view.draw(this);
    };

    this.rand = function(n) {
      return Math.floor(Math.random() * (n+1));
    };

  };



  var View = function() {
    this.wallSize = 20;
    // this.wallColor = "rgb(149,110,231)";
    this.wallColor = "rgba(0, 0, 0, 0.8)";
    // this.routeColor = "#FF0088";
    this.routeColor = "rgb(91,141,236)";
    this.dotColor = "blue";
  
  
    this.canvas = document.querySelector('canvas');
    if(this.canvas.getContext === "undifined") {
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.draw = function(maze) {
      this.canvas.width = (maze.col + 2) * this.wallSize;
      this.canvas.height = (maze.row + 2) * this.wallSize;

      for(var x = 0; x < maze.col + 2; x++) {
        this.drawWall(x, 0);
        this.drawWall(x, maze.row+1);
      }
      
      for(var y = 1; y < maze.row + 1; y++) {
        this.drawWall(0, y);
        this.drawWall(maze.col+1, y);
      }
    
      for(var x = 0; x < maze.col; x++) {
        for(var y = 0; y < maze.row; y++) {
          if(maze.map[x][y] === 1) {
          this.drawWall(x+1, y+1);
          }
          if((x === maze.startX && y === maze.startY) || (x === maze.goalX && y === maze.goalY)) {
            this.drawRoute(x+1, y+1);
            if(x === maze.startX && y === maze.startY) this.drawDot(x+1.45, y+1.5);
          }
        }
      }
    };

    this.drawWall = function(x, y) {
      this.ctx.fillStyle = this.wallColor;
      this.drawRect(x, y);
    };
  
    this.drawRoute = function(x, y) {
      this.ctx.fillStyle = this.routeColor;
      this.drawRect(x, y);
    };

    this.drawDot = function(x, y) {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.dotColor;
      this.ctx.arc(x * this.wallSize, y * this.wallSize, this.wallSize / 3, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    this.eraseDot = function(x, y, f) {
      if(f) this.ctx.fillStyle = this.routeColor;
      // else this.ctx.fillStyle = 'rgb(172,246,194)';
      else {
        this.ctx.fillStyle = 'rgb(255,255,255)';
        // this.drawRect(x, y);
        // this.ctx.fillStyle = 'rgb(172,246,194)'
      } 
      this.drawRect(x, y);
    }
  
    this.drawRect = function(x, y) {
      this.ctx.fillRect(x * this.wallSize, y * this.wallSize, this.wallSize, this.wallSize);
    };

    this.success = function(time) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.font = 'bold 18px Verdana';
      this.ctx.textAlign = 'center';
      this.ctx.Baseline = 'middle';
      this.ctx.fillStyle = "rgba(0, 0, 0, 1)"
      this.ctx.fillText('Congratulation!!', this.canvas.width/2, this.canvas.height/2);
      this.ctx.font = 'bold 14px Verdana';
      this.ctx.fillText('time: ' + time + 's', this.canvas.width/2, this.canvas.height/2 + 20);
    }


  };



  var map = [];
  var startx;
  var starty;
  var goalx;
  var goaly;
  var col;
  var row;
  var nx;
  var ny;
  var count = 0;
  var isPlaying = false;
  var startTime;

  function reset(a) {
    var maze = new Maze(a, a);
    maze.init();
    maze.draw();
    nx = 0;
    ny = 0;
    map = maze.map;
    col = maze.col;
    row = maze.row;
    startx = maze.startX;
    starty = maze.startY;
    goalx = maze.goalX;
    goaly = maze.goalY;
    isPlaying = true;
  }

  document.getElementById('start').addEventListener('click', () => {
    reset(13);
    startTime = new Date();
    document.getElementById('container').classList.remove('hidden');
    document.getElementById('expBox').classList.add('hidden');
  });

  document.getElementById('reset').addEventListener('click', () => {
    count = 0;
    // startTime = new Date();
    // reset(13);
    document.getElementById('container').classList.add('hidden');
    document.getElementById('expBox').classList.remove('hidden');
  });




  var Movement = function() {
    this.dirx = [0, -1, 0, 1];
    this.diry = [-1, 0, 1, 0];
    this.key = ['w', 'a', 's', 'd'];

    this.updateDot = function(x, y, e) {
      for(var i = 0; i < 4; i++) {
        if(this.key[i] === e) {
          if((0 > x + this.dirx[i] || x + this.dirx[i] > col - 1) || (0 > y + this.diry[i] || y + this.diry[i] > row-1)) break;
          else if(map[x + this.dirx[i]][y + this.diry[i]] === 1) break;
          else {
            nx = x + this.dirx[i];
            ny = y + this.diry[i];
          }
        }
      }
    };

    this.move = function(x, y, e) {
      var flag = false;
      if(x == startx && y == starty) {
        flag = true;
      }
      this.updateDot(x, y, e);
      if(!(x == nx && y == ny)) {
        var view = new View();
        view.drawDot(nx+1.45, ny+1.5);
        view.eraseDot(x+1, y+1, flag);
        if(nx == goalx && ny == goaly) {
          count++;
          if(count != 5) {
            reset(row+2);
          } else {
            console.log('congratulation!')
            var view = new View();
            var time = (new Date() - startTime) / 1000;
            view.success(time);
            isPlaying = false;
          }
        }
      }
    };
  }

  window.addEventListener('keydown', (e) => {
    if(isPlaying) {
      console.log(e.key);
      var movement = new Movement();
      movement.move(nx, ny, e.key);
      console.log(nx, ny);
    }
  });



}) ();