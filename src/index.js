var game = {
    canvasWidth: 640,
    canvasHeight: 480,

    ctx: undefined,
    sprites: {
        background: undefined,
        platform: undefined,
        block: undefined,
        ball: undefined
    },
    objects: {},
    menuObjects: {"start": { width: 70, height: 40, href: function(){game.start()}}, "options": {width: 120, height: 40, href: ()=>(game.start()) }, "records": {width: 120, height: 40, href: ()=>(game.start())}},
    round: {
        cols: 4,
        rows: 4,
        blocks: {},
        walls: {"left" : {}, "right": {}, "top": {}, "bottom": {}}
    },
    menu: function() {
        var canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");
        //-----------------Настройки текста----------------------------
        this.ctx.fillStyle = "#00F";
        this.ctx.font = "italic 30pt Arial";
        //=============================================================
        let counter = 0;
        for (let id in this.menuObjects){
            this.menuObjects[id].x = this.canvasWidth/2-this.menuObjects[id].width/2;
            this.menuObjects[id].y = 100+50*counter;
            this.ctx.fillText(id, this.menuObjects[id].x, this.menuObjects[id].y);

            counter++;
        }
    },
    init: function() {
        var canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");


        //----------------------Объявление игровых объектов-----------
        class GameObject { //----Класс игрового объекта-----------
            constructor(name, x, y, sprite, width, height) {
                this.name = name;
                this.x = x;
                this.y = y;
                this.sprite = sprite;
                this.width = width;
                this.height = height;
                this.live = true;
            }
        }
        this.objects.platform = new GameObject("platform", game.canvasWidth/2-82, game.canvasHeight - 35, game.sprites.platform, 165, 45);
        this.objects.platform.speed_now = 0;
        this.objects.platform.move = function(){
          this.x += this.speed_now;
          if (this.ball){
              game.objects.ball.x += this.speed_now;
          }
        };
        this.objects.platform.dropBall = function(){
            if (this.speed_now > 0){
                game.objects.ball.speedX = 5;
            } else if (this.speed_now < 0){
                game.objects.ball.speedX = -2;
            }
            game.objects.ball.speedY = -3;
            this.ball = false;
        };
        this.objects.platform.ball = this.objects.ball;

        this.objects.ball = new GameObject("ball", (game.canvasWidth/2)-12, game.canvasHeight-60, game.sprites.ball, 25, 25);
        this.objects.ball.speedX = 0;
        this.objects.ball.speedY = 0;
        this.objects.ball.move = function (){
            this.x += this.speedX;
            this.y += this.speedY;
        };
        this.objects.ball.maxSpeedX = 3;
        this.objects.ball.maxSpeedY = 3;
        this.objects.ball.collide = function (elem) {
            let ball_left_x = this.x + this.speedX;
            let ball_top_y = this.y + this.speedY;
            let ball_right_x = this.x + this.speedX + this.width;
            let ball_bottom_y = this.y + this.speedY + this.height ;

            let elem_left_x = elem.x;
            let elem_top_y = elem.y;
            let elem_right_x = elem.x + elem.width;
            let elem_bottom_y = elem.y + elem.height;

            let side = false;

            //Проверка на сторону столкновения
            if (//------------------------Низ-----------------
                ball_right_x > elem_left_x &&
                ball_left_x < elem_right_x &&
                ball_top_y < elem_bottom_y &&
                ball_bottom_y > elem_bottom_y
            ) {
               side = "bottom";
            } else if (//------------------------Верх-----------------
                ball_right_x > elem_left_x &&
                ball_left_x < elem_right_x &&
                ball_top_y < elem_top_y &&
                ball_bottom_y > elem_top_y
            ) {
                side = "top";
            }

            if (//------------------------Левая сторона-----------------
                ball_right_x > elem_left_x &&
                ball_left_x < elem_left_x &&
                ball_bottom_y > elem_top_y &&
                ball_top_y < elem_bottom_y
            ) {
                if (side == "top"){//-------Спор left/top
                    if (Math.abs(ball_right_x-elem_left_x) > Math.abs(ball_bottom_y - elem_top_y)){
                        side = "top";
                    } else {
                        side = "left";
                    }
                } else if (side == "bottom") {//--------Спор left/bottom
                    if (Math.abs(ball_right_x-elem_left_x) > Math.abs(ball_top_y - elem_bottom_y)) {
                        side = "bottom";
                    } else {
                        side = "left";
                    }
                } else {
                    side = "left";
                }
            } else if ( //------------------------Правая сторона-----------------
                ball_right_x > elem_right_x &&
                ball_left_x < elem_right_x &&
                ball_bottom_y > elem_top_y &&
                ball_top_y < elem_bottom_y
            ) {
                if (side == "top"){//----------------Спор right/top
                    if (Math.abs(elem_right_x-ball_left_x) > Math.abs(ball_bottom_y - elem_top_y)){
                        side = "top";
                    } else {
                        side = "right";
                    }
                } else if (side == "bottom") {//------------------Спор right/bottom
                    if (Math.abs(elem_right_x-ball_left_x) > Math.abs(ball_top_y - elem_bottom_y)) {
                        side = "bottom";
                    } else {
                        side = "right";
                    }
                } else {
                    side = "right";
                }
            }
            return side;
        };
        this.objects.ball.bumpBlock = function (elem, side) {
            if (elem.name != "pit") {
                if (side == "bottom" || side == "top") {
                    this.speedY *= -1;
                } else if (side == "left" || side == "right" ){
                    this.speedX *= -1;
                }
            }
            if (elem.name == "platform"){
                if (this.speedX * elem.speed_now < 0){
                    if (this.speedX > 0){
                        this.speedX -= 1;
                    } else {
                        this.speedX += 1;
                    }
                } else if (this.speedX * elem.speed_now > 0) {
                    if (this.speedX > 0){
                        this.speedX += 1;
                    } else {
                        this.speedX -= 1;
                    }
                } else {
                    if (this.speedX == 0) {
                        this.speedX += elem.speed_now/3;
                    }
                }
            } else if (elem.name == "pit") {
                setTimeout(function () {
                    game.gameOver();
                }, 1000);
            }
        }
        //============================================================
    },
    load: function(){
        //---------------------SpritesLoad----------------------------
        this.sprites.background = new Image();
        this.sprites.background.src = "src/images/background.png";
        this.sprites.platform = new Image();
        this.sprites.platform.src = "src/images/Panel.png";
        this.sprites.block = new Image();
        this.sprites.block.src = "src/images/Block.png";
        this.sprites.ball = new Image();
        this.sprites.ball.src = "src/images/Ball.png";
        //============================================================
    },
    roundCreate: function(){
        this.objects.platform.x = game.canvasWidth/2-82;
        this.objects.platform.ball = this.objects.ball;
        this.objects.ball.x = (game.canvasWidth/2)-12;
        this.objects.ball.y = game.canvasHeight-60;
        this.objects.ball.speedX = 0;
        this.objects.ball.speedY = 0;
        class GameObject { //----Класс игрового объекта-----------
            constructor(name, x, y, sprite, width, height) {
                this.name = name;
                this.x = x;
                this.y = y;
                this.sprite = sprite;
                this.width = width;
                this.height = height;
                this.live = true;
            }
        }

        for(let i = 0; i <= this.round.cols; i++){
            for (let j = 0; j <= this.round.rows; j++){
                this.round.blocks["block"+i+""+j] = new GameObject("block", 100+90*i, 50+40*j, game.sprites.block, 85, 37);
                //----------------------------------------------------V---Костыль обыкновенный---V------------------------------------------------
                //eval("this.round.blocks.block"+i+""+j+" = new GameObject('block"+i+""+j+"', 90*"+i+", 40*"+j+", game.sprites.block, 85, 40);");
            }
        }
        this.round.walls["left"] = new GameObject("wall", 0, 0, '', 0, this.canvasHeight);
        this.round.walls["top"] = new GameObject("wall", 0, 0, '', game.canvasWidth, 0);
        this.round.walls["right"] = new GameObject("wall", game.canvasWidth, 0, '', 0, game.canvasHeight);
        this.round.walls["bot"] = new GameObject("pit", 0, this.canvasHeight, '', game.canvasWidth, 0);
    },
    start: function(){
        this.load();
        this.init();
        this.roundCreate();
        this.run();
    },
    render: function(){
        this.ctx.clearRect(0,0, this.canvasWidth, this.canvasHeight);
        this.ctx.drawImage(this.sprites.background, 0 ,0);

        for (let id in this.round.blocks){
            if (this.round.blocks[id].live){
                this.ctx.drawImage(this.round.blocks[id].sprite, this.round.blocks[id].x, this.round.blocks[id].y);
            }
        }

        for (let id in this.objects){
            if (this.objects[id].live){
                this.ctx.drawImage(this.objects[id].sprite, this.objects[id].x, this.objects[id].y);
            }
        }
    },
    update: function(){
        //---------------------------------Проверка на столкновение со всеми объектами----------------------------------
        for(let id in this.round.blocks){
            if(this.objects.ball.collide(this.round.blocks[id])){
                this.objects.ball.bumpBlock(this.round.blocks[id], this.objects.ball.collide(this.round.blocks[id]));
                delete this.round.blocks[id];
                break;
            }
        }
        if(this.objects.ball.collide(this.objects.platform)){
            this.objects.ball.bumpBlock(this.objects.platform, this.objects.ball.collide(this.objects.platform));
        }
        for(let id in this.round.walls){
            if(this.objects.ball.collide(this.round.walls[id])){
                this.objects.ball.bumpBlock(this.round.walls[id], this.objects.ball.collide(this.round.walls[id]));
            }
        }
        if (Math.abs(this.objects.ball.speedX) > this.objects.ball.maxSpeedX){
            if (this.objects.ball.speedX < 0) {
                this.objects.ball.speedX = -this.objects.ball.maxSpeedX;
            } else {
                this.objects.ball.speedX = this.objects.ball.maxSpeedX;
            }
        }
        if (Math.abs(this.objects.ball.speedY) > this.objects.ball.maxSpeedY){
            if (this.objects.ball.speedX < 0) {
                this.objects.ball.speedY = -this.objects.ball.maxSpeedY;
            } else {
                this.objects.ball.speedY = this.objects.ball.maxSpeedY;
            }
        }
        //==============================================================================================================
        if (this.objects.platform.speed_now < 0 && this.objects.platform.x >= 2){
            this.objects.platform.move();
        } else if (this.objects.platform.speed_now > 0 && this.objects.platform.x < this.canvasWidth-this.objects.platform.width-1){
            this.objects.platform.move();
        }

        if (this.objects.ball.speedX != 0 || this.objects.ball.speedY != 0) {
            this.objects.ball.move();
        }
    },
    run: function(){
        this.update();
        this.render();
        window.requestAnimationFrame(function() {
            game.run();
        });
    },
    gameOver: function(){
        this.roundCreate();
    }
};

window.addEventListener("load", function(){

    game.start();
});

$(document).keydown(function(eventObject){
    if (eventObject.which == '37'){
        game.objects.platform.speed_now = -5 ;
        if (game.objects.platform.x <= 2){
        }
    } else if (eventObject.which == '39' ) {
        game.objects.platform.speed_now = 5;
    } else if (eventObject.which == '32'){
        if (game.objects.platform.ball){
            game.objects.platform.dropBall();
        }
    }
});
$(document).keyup(function(eventObject){
    if (eventObject.which == '37' && game.objects.platform.speed_now < 0){
        game.objects.platform.speed_now = 0;
    } else if ( eventObject.which == '39' && game.objects.platform.speed_now > 0){
        game.objects.platform.speed_now = 0;
    }
});
$('canvas').click(function(eventObj){
    //console.log("x:"+eventObj.pageX + "\ny:"+ eventObj.pageY);
    //----------------------Проверить на что клинул-----------------------------
    let cursorX = eventObj.pageX;
    let cursorY = eventObj.pageY;
    for (let id in game.menuObjects){
        let elem_left_x = game.menuObjects[id].x;
        let elem_top_y = game.menuObjects[id].y;
        let elem_right_x = game.menuObjects[id].x + game.menuObjects[id].width;
        let elem_bottom_y = game.menuObjects[id].y + game.menuObjects[id].height;

        if (
            cursorX > elem_left_x &&
            cursorX < elem_right_x &&
            cursorY > elem_top_y &&
            cursorY < elem_bottom_y
        ) {
            //game.menuObjects[id].href();
            console.log(id);
        }
    }
});