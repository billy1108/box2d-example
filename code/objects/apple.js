
//Apple object
function apple(options)
{
	this.height = 0.25;
	this.width = 0.25;
	this.x = options.x;
	this.y = options.y;
	
	this.game = options.game;
	
	var linear_damping = 10 - (parseInt(this.game.points / 10) + 1)*0.5;
	
	var info = { 
		'density' : 10 ,
		'linearDamping' : linear_damping ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

apple.img = img_res('apple.png');

apple.prototype.draw = function()
{
	if(this.body == null)
	{
		return false;
	}
	//draw_body(this.body, this.game.ctx);
	
	var c = this.game.get_offset(this.body.GetPosition());
	
	var scale = this.game.scale;
	
	var sx = c.x * scale;
	var sy = c.y * scale;
	
	var width = this.width * scale;
	var height = this.height * scale;
	
	this.game.ctx.translate(sx, sy);
	this.game.ctx.drawImage(apple.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

apple.prototype.tick = function()
{
	this.age++;
	
	//destroy the apple if it falls below the x axis
	if(this.body.GetPosition().y < 0)
	{
		this.game.destroy_object(this);
	}
}

//Destroy the apple when player eats it
apple.prototype.destroy = function()
{
	if(this.body == null)
	{
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
}
