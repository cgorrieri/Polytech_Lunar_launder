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
      this.vxSuivre = this.vySuivre = 5;
	  
	  this.teta = new Array();
	  this.ci = new Array();
	  this.nbMesures = 0;
	  this.trajectoireMobile;
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
		
	  this.nbMesures++;
	  
	  if(this.nbMesures == 16) {
		this.trajectoireMobile = this.gradientConjugue();
		//console.log(this.trajectoireMobile);
	  }
    },
	
    gradientConjugue: function() {
	  // Construire la matrice ci(t)
      var ci = new Array();
      for(var i = 0; i < this.teta.length; i++) {
        /*ci.push($M(
          [-(Math.cos(this.teta[i].angle))],
          [Math.sin(this.teta[i].angle)],
          [i * Math.sin(this.teta[i].angle)],
          [i * Math.cos(this.teta[i].angle)])
        );*/
		ci.push($M([
		  [Math.sin(this.teta[i].angle)],
          [-(Math.cos(this.teta[i].angle))],
          [i * Math.sin(this.teta[i].angle)],
          [-i * Math.cos(this.teta[i].angle)]])
        );
		
		console.log(ci[i]);
      }
	  
	  // Construire la matrice y(t)
      var y = new Array();
      for(var i = 0; i < this.teta.length; i++) {
        y.push((-(this.teta[i].y) * Math.sin(this.teta[i].angle)) + (this.teta[i].x * Math.cos(this.teta[i].angle)));
      }
	  
	  // Construire la matrice Gamma
      var gamma = $M([
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	  ]);
      for(var i = 0; i < ci.length; i++) {
	    /*var tmp = $M([
			[ci[i].e(1, 1) * ci[i].e(1, 1), ci[i].e(1, 1) * ci[i].e(2, 1), ci[i].e(1, 1) * ci[i].e(3, 1), ci[i].e(1, 1) * ci[i].e(4, 1)],
			[ci[i].e(2, 1) * ci[i].e(1, 1), ci[i].e(2, 1) * ci[i].e(2, 1), ci[i].e(2, 1) * ci[i].e(3, 1), ci[i].e(2, 1) * ci[i].e(4, 1)],
			[ci[i].e(3, 1) * ci[i].e(1, 1), ci[i].e(3, 1) * ci[i].e(2, 1), ci[i].e(3, 1) * ci[i].e(3, 1), ci[i].e(3, 1) * ci[i].e(3, 1)],
			[ci[i].e(4, 1) * ci[i].e(1, 1), ci[i].e(4, 1) * ci[i].e(2, 1), ci[i].e(4, 1) * ci[i].e(3, 1), ci[i].e(4, 1) * ci[i].e(4, 1)]
		]);*/
		var tmp = ci[i].multiply(ci[i].transpose());
		
		//console.log(ci[i]);
		
		gamma = gamma.add(tmp);
      }     
      
      // Construire la matrice b
      var b = $M([
		[0],
		[0],
		[0],
		[0]
	  ]);
      for(var i = 0; i < ci.length; i++) {
	    var tmp = $M([
			[ci[i].e(1, 1) * y[i]],
			[ci[i].e(2, 1) * y[i]],
			[ci[i].e(3, 1) * y[i]],
			[ci[i].e(4, 1) * y[i]]
		]);
		
		b = b.add(tmp);
      }
      
      // Initialiser les inconnues
      var x = $M([
		[0],
		[0],
		[0],
		[0]
	  ]);
      // Initialiser la matrice de gradients
      var g = (gamma.multiply(x)).subtract(b);
      // Initialiser la matrice de gradients conjugués
      var h = g;
      
      // Déterminer les inconnues
      for(var i = 0; i < 4; i++) {
		x = x.subtract(
			h.multiply(
				((h.transpose()).multiply(g)).multiply(
					(((h.transpose()).multiply(gamma)).multiply(h)).inverse()
				)
			)
		);
		g = g.subtract(
			(gamma.multiply(h)).multiply(
				((h.transpose()).multiply(g)).multiply(
					(((h.transpose()).multiply(gamma)).multiply(h)).inverse()
				)
			)
		);		
		h = g.subtract(
			h.multiply(
				(((h.transpose()).multiply(gamma)).multiply(g)).multiply(
					(((h.transpose()).multiply(gamma)).multiply(h)).inverse()
				)
			)
		);
      }
      
	  console.log(x);
      // Renvoyer les inconnues déterminées
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
