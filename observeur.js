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
	  this.ci = new Array();
      this.vxSuivre = this.vySuivre = 5;
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      this.angleRotation += 0.007;
      this.vx = this.V * Math.cos(this.angleRotation);
      this.vy = this.V * Math.sin(this.angleRotation);

      this.X += (this.vx+this.vxSuivre) * dt;
      
      this.Y += (this.vy+this.vySuivre) * dt;
      
      this.p.x = this.X * 4;
      this.p.y = Q.height - this.Y*4;
	  
      this.teta.push({x:this.X, y:this.Y,
        angle:(Math.atan2((this.mobile.Y - this.Y), (this.mobile.X - this.X)))});
    },
    gradientConjugue: function() {
      // Construire la matrice ci(t)
      var ci = new Array();
      for(var i = 0; i < this.teta.length; i++) {
        ci.push($M(
          [-(Math.cos(this.teta[i].angle))],
          [Math.sin(this.teta[i].angle)],
          [i * Math.sin(this.teta[i].angle)],
          [i * Math.cos(this.teta[i].angle)])
        );
      }
      
      // Construire la matrice y(t)
      var y = new Array();
      for(var i = 0; i < this.teta.length; i++) {
        y.push((-(this.teta[i].y) * Math.sin(this.teta[i].angle)) + (this.teta[i].x * Math.cos(this.teta[i].angle)));
      }
      
      // Construire la matrice Gamma
      var gamma = Matrix.Zero(4, 4);
      for(var i = 0; i < ci.length; i++) {
        gamma.e(1, 1) += ci[i].e(1, 1) * ci[i].e(1, 1);
        gamma.e(1, 2) += ci[i].e(1, 1) * ci[i].e(2, 1);
        gamma.e(1, 3) += ci[i].e(1, 1) * ci[i].e(3, 1);
        gamma.e(1, 4) += ci[i].e(1, 1) * ci[i].e(4, 1);
        
        gamma.e(2, 1) += ci[i].e(2, 1) * ci[i].e(1, 1);
        gamma.e(2, 2) += ci[i].e(2, 1) * ci[i].e(2, 1);
        gamma.e(2, 3) += ci[i].e(2, 1) * ci[i].e(3, 1);
        gamma.e(2, 4) += ci[i].e(2, 1) * ci[i].e(4, 1);
        
        gamma.e(3, 1) += ci[i].e(3, 1) * ci[i].e(1, 1);
        gamma.e(3, 2) += ci[i].e(3, 1) * ci[i].e(2, 1);
        gamma.e(3, 3) += ci[i].e(3, 1) * ci[i].e(3, 1);
        gamma.e(3, 4) += ci[i].e(3, 1) * ci[i].e(4, 1);
        
        gamma.e(4, 1) += ci[i].e(4, 1) * ci[i].e(1, 1);
        gamma.e(4, 2) += ci[i].e(4, 1) * ci[i].e(2, 1);
        gamma.e(4, 3) += ci[i].e(4, 1) * ci[i].e(3, 1);
        gamma.e(4, 4) += ci[i].e(4, 1) * ci[i].e(4, 1);
      }
      
      // Construire la matrice b
      var b = Matrix.Zero(4, 1);
      for(var i = 0; i < ci.length; i++) {
        b.e(1, 1) += ci[i].e(1, 1) * y[i];
        b.e(2, 1) += ci[i].e(2, 1) * y[i];
        b.e(3, 1) += ci[i].e(3, 1) * y[i];
        b.e(4, 1) += ci[i].e(4, 1) * y[i];
      }
      
      // Initialiser les inconnues
      var x = Matrix.Zero(4, 1);
      // Initialiser la matrice de gradients
      var g = gamma.multiply(x);
      g = g.subtract(b);
      // Initialiser la matrice de gradients conjugués
      var h = g;
      
      // Déterminer les inconnues
      for(var i = 0; i < 4; i++) {
        x = x.subtract(
            h.multiply(
              (h.transpose().multiply(g)).multiply(
                (h.transpose().multiply(gamma).multiply(h)).inverse()
              )
            )
          );
        
        var old_g = g;
        g = gamma.multiply(x);
        g = g.subtract(b);
        
        h = g.add(
            h.multiply(
              (g.transpose().multiply(g)).multiply(
                (old_g.transpose().multiply(old_g)).inverse()
              )
            )
          );
      }
      
      // Renvoyer les incconus déterminées
      return x;
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
