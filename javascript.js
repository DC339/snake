//食物的自调用函数
//使用自调用函数可以避免命名冲突
(function () {
   var elements = [];
   //食物对象（宽 高 背景颜色 横纵坐标）
   //先定义构造函数，再创建对象
   function Food (x,y,width,height,color){
   	this.x = x||0;
   	this.y = y || 0;
   	this.width = width || 20;
   	this.height = height || 20;
   	this.color = color || "green";
   }

   //为食物小方块设置样式
   Food.prototype.init = function(map){
   	//先删除小方块
   	remove();
   	//创建小方块div
   	var div = document.createElement("div");
    //把小方块加入到map
    map.appendChild(div);
    //为小方块设置样式
    div.style.width = this.width + "px";
    div.style.height = this.height + "px";
    div.style.backgroundColor = this.color;
    //随机位置
    //先脱离文档流
    div.style.position = "absolute";
    console.log(this);
    this.x = parseInt(Math.random()*(map.offsetWidth/this.width))*this.width;
    this.y = parseInt(Math.random()*(map.offsetHeight/this.height))*this.height;
    div.style.left = this.x + "px";
    div.style.top = this.y + "px"; 
    //把div加入到elements数组
    elements.push(div);
   };

   //私有函数--删除食物;外部无法访问
   function remove (){
   	for(var i=0;i<elements.length;i++){
   		var ele = elements[i];
   		//找到这个子元素的父级元素，然后删除这个子元素
   		ele.parentNode.removeChild(ele);
        //再次把elements中的这个子元素也要删除
        elements.splice(i, 1);
   	}
   }
   //将Food暴露给全局window
    window.Food = Food;
}());

//小蛇的自调用函数
(function () {
	var elements = [];//存放小蛇的身体部分
	function Snake(width, height,direction){
      this.width = width || 20;
      this.height = height || 20;
      this.body = [
      {x:3,y:2,color:"red"},
      {x:2,y:2,color:"orange"},
      {x:1,y:2,color:"orange"}
      ];
      //方向
      this.direction = direction || "right";
	}
	//为原型添加方法--小蛇初始化方法
	Snake.prototype.init=function(map){
		//先删除之前的小蛇
		remove();
		//循环遍历创建div
		for(var i=0;i<this.body.length;i++){
			//数组中的每个元素都是对象
			var obj = this.body[i];
			//创建div
			var div = document.createElement("div");
			//把div加到map地图中
			map.appendChild(div);
            //设置div样式
            div.style.position = "absolute";
            div.style.width = this.width + "px";
            div.style.height = this.height + "px";
            //横纵坐标
            div.style.left = obj.x * this.width + "px";
            div.style.top = obj.y *this.height + "px";
            div.style.backgroundColor = obj.color;

            //方向暂时不定

            //把div加入elements数组中-----目的是为了删除
            elements.push(div);
		}
	};

	//为原型添加方法----小蛇移动
	Snake.prototype.move = function(food, map){
		//改变小蛇身体坐标
		var i = this.body.length -1;//第二个小方块
		for(;i>0;i--){
			this.body[i].x = this.body[i-1].x;
			this.body[i].y = this.body[i-1].y;        		
		}
		//改变小蛇头部坐标位置
		//判断方向
		switch(this.direction){
			case "right":
			  this.body[0].x += 1;
			  break;
			case "left":
			  this.body[0].x -= 1;
			  break;
			 case "top":
			   this.body[0].y -= 1;
			   break;
			 case "bottom":
			   this.body[0].y += 1;
			   break;
		}

		//判断有没有吃到食物,即小蛇头部和食物坐标重合
		 var headX = this.body[0].x * this.width;
		 var headY = this.body[0].y *this.height;
		 //食物的横纵坐标
		 var foodX = food.x;
		 var foodY = food.y;
		 // console.log(headX + "==========" + foodX);
		 //判断小蛇坐标和食物坐标是否相同
		 if(headX == foodX && headY == foodY) {
            //获取小蛇的尾巴
            var last = this.body[this.body.length-1];
            //把最后的蛇尾复制一个，重新加入到小蛇的body中
            this.body.push({
            	x:last.x,
            	y:last.y,
            	color:last.color
            });
            //把食物删除，重新初始化食物
            food.init(map);
		 }
	};

	//删除小蛇的私有函数
	function remove() {
		//获取数组
		var i = elements.length - 1;
		for(;i>=0;i--){
			var ele = elements[i];
			ele.parentNode.removeChild(ele);
			elements.splice(i, 1);
		}
	}

	window.Snake = Snake;
}());

//游戏对象的自调用函数
(function(){
	var that = null;
	//游戏的构造函数
	function Game(map){
		this.food = new Food();//食物对象
		this.snake = new Snake();//小蛇对象
		this.map = map;//地图
		that = this;
	}

	Game.prototype.init = function(){
		//初始化游戏
		//食物初始化
		this.food.init(this.map);
		//小蛇初始化
		this.snake.init(this.map);
        //调用移动小蛇的方法
        this.runSnake(this.food, this.map);
        //调用按键方法
        this.bindKey();
	};

	//添加原型方法----设置小蛇可以自动跑起来
	Game.prototype.runSnake = function (food, map) {
		//自动移动
		var timeId = setInterval(function(){
			//此时的this是window
			//移动小蛇
			this.snake.move(food, map);
			//初始化小蛇
			this.snake.init(map);
			//横坐标的最大值
			var maxX = map.offsetWidth/this.snake.width;
			//纵坐标的最大值
			var maxY = map.offsetHeight/this.snake.height;
			//蛇头坐标
			var headX = this.snake.body[0].x;
			var headY = this.snake.body[0].y;
			//横坐标
			if(headX<0 || headX >=maxX){
               clearInterval(timeId);
               alert("游戏结束！");
			}
			//纵坐标
			if(headY < 0 || headY >= maxY){
				clearInterval(timeId);
				alert("游戏结束！");
			}
			console.log(maxX + "===" + this.snake.body[0].x);
		}.bind(that), 150);//bind()改变了this的指向，改为指向that
	};

	//添加原型方法---设置用户按键，改变小蛇移动的方向
	Game.prototype.bindKey = function(){
		document.addEventListener("keydown", function(e){//此处this为document
			//这里的this是触发keydown的事件的对象---document
			switch (e.keyCode){
				case 37: this.snake.direction = "left";break;
				case 38: this.snake.direction = "top";break;
				case 39: this.snake.direction = "right";break;
				case 40: this.snake.direction = "bottom";break;
			}
		}.bind(that), false);
	};

	window.Game = Game;
}());

//初始化游戏对象
var gm = new Game(document.querySelector(".map"));
//初始化游戏------开始游戏
gm.init();
		// var fd = new Food();
	 //    fd.init(document.querySelector(".map"));
	 //    // fd.init(document.querySelector(".map"));
  //       //创建小蛇
  //       var snake = new Snake();
  //       snake.init(document.querySelector(".map"));
  //       setInterval(function(){
  //         snake.init(document.querySelector(".map"));
  //         snake.move(fd, document.querySelector(".map"));
  //       }, 150);
