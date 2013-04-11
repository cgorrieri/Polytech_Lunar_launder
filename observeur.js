Quintus.Observeur = function(Q) {
  // Observateur qui va definir la trajectoire du Mobile
  Q.Sprite.extend("Observateur",{
    init: function(p) {
      this._super(p, { asset: "observer.png",
        x: 0,
        y: 0,
        scale: 0.5
      });
      this.X = this.p.x;
      this.Y = this.p.y;
      this.V = 10;
      this.angleRotation = (p.angle ? p.angle : 0);
      this.mobile = p.mobile;
      this.teta = new Array();
      this.vxSuivre = this.vySuivre = 5;
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      this.angleRotation += 0.02;
      this.vx = this.V * Math.cos(this.angleRotation);
      this.vy = this.V * Math.sin(this.angleRotation);

      this.X += (this.vx+this.vxSuivre) * dt;
      
      this.Y += (this.vy+this.vySuivre) * dt;
      
      this.p.x = this.X * 4;
      this.p.y = Q.height - this.Y*4;
	  
      this.teta.push({x:this.X, y:this.Y,
        angle:(Math.atan2((this.mobile.Y - this.Y), (this.mobile.X - this.X)))});
    }
  });

  // Mobile suivant une trajectoire linéaire
  Q.Sprite.extend("Mobile",{
    init: function(p) {
      this._super(p, { asset: "observer.png",
        x: 45,
        y: 51,
        scale:0.25
      });
      this.X = this.Y = 0;
      this.vx = 5;
      this.vy = 5;
      // fonction appelé à cheque boucle du jeu
    },
    step: function(dt) {
      this.X += this.vx * dt;
      
      this.Y += this.vy * dt;
      
      this.p.x = this.X * 4;
      this.p.y = Q.height - this.Y*4;
    }
  });
  return Q;
};


  //fonction qui calcule le bruit 
 
 /*   bruit: function(k) {
        x: 0;
        w: 0;
     
     	for(var i=0;i<32;i)
	{
	x+=Math.random()-0.5; 
	}
	w=(x/32)*k;//k : gain
     }*/
