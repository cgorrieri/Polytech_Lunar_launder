Quintus.Observeur = function(Q) {
  var Te = 0.04; // en secondes
  var Vmobile = 2; // en m/s
  // Observateur qui va definir la trajectoire du Mobile
  Q.Sprite.extend("Observateur",{
    init: function(p) {
      this._super(p, { asset: "observer.png",
        scale: 0.5
      });
      this.X = p.x;
      this.Y = p.y;
      this.V = 5;
      this.angleRotation = (p.angle ? p.angle : 0);
      this.mobile = p.mobile;
      this.vxSuivre = this.vySuivre = Vmobile;
	  
      this.teta = new Array();
      this.ci = new Array();
      this.nbMesures = 25;
      this.currMesure = 0;
      this.trajectoireMobile;
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      // Si on a pas assez de meusures alors on continue de meusurer
      if(this.currMesure < this.nbMesures) {
        this.angleRotation -= 0.006;
        this.vx = this.V * Math.cos(this.angleRotation);
        this.vy = this.V * Math.sin(this.angleRotation);

        // Position mathématique
        this.X += (this.vx+this.vxSuivre) * Te;
        this.Y += (this.vy+this.vySuivre) * Te;
        // Position à l'affichage
        this.p.x = this.X * 4;
        this.p.y = Q.height - this.Y*4;
        
        // Point A(x,y), atan2(x,y) retourn l'angle entre l'axe X et la droite (origin,A)
        this.teta.push({x:this.X, y:this.Y, t:Te*this.currMesure,
          angle:Math.PI/2 - (Math.atan2((this.mobile.Y - this.Y), (this.mobile.X - this.X)))});
          
        this.currMesure++;
      } else if(this.currMesure == this.nbMesures) { // sinon on calcul grace au gradients conjugués
        this.trajectoireMobile = this.calculeInfoMobile();
        
        // calculer consigne et envoyer module lunaire
        
        this.currMesure++;
      }
    },
    calculeInfoMobile: function() {
      // Construire la matrice ci(t)
      var ci = new Array();
      for(var i = 0; i < this.teta.length; i++) {
        ci.push($M([
          [Math.sin(this.teta[i].angle)],
          [this.teta[i].t * Math.sin(this.teta[i].angle)],
          [-(Math.cos(this.teta[i].angle))],
          [this.teta[i].t * Math.cos(this.teta[i].angle)]])
        );
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
        gamma = gamma.add(ci[i].multiply(ci[i].transpose()));
      }
      
      // Construire la matrice b
      var b = $M([
        [0],
        [0],
        [0],
        [0]
      ]);
      for(var i = 0; i < ci.length; i++) {
        b = b.add(ci[i].x(y[i]));
      }
      
      //* resolution par système d'équation
      var ga = gamma;
      var equations = ga.augment(b);
      console.log("equation");
      var eqns = equations.toRightTriangular();
      
      var sol_vy = eqns.e(4,5) / eqns.e(4,4);
      var sol_vx =(eqns.e(3,5) - eqns.e(3,4)*sol_vy) / eqns.e(3,3);
      var sol_y = (eqns.e(2,5) - eqns.e(2,4)*sol_vy - eqns.e(2,3)*sol_vx) / eqns.e(2,2);
      var sol_x = (eqns.e(1,5) - eqns.e(1,4)*sol_vy - eqns.e(1,3)*sol_vx - eqns.e(1,2)*sol_y) / eqns.e(1,1);
      
      var res = [sol_x, sol_y, sol_vx, sol_vy];
      console.log(res);
      //*/
      
      return res;
    }
  });

  // Mobile suivant une trajectoire linéaire
  Q.Sprite.extend("Mobile",{
    init: function(p) {
      this._super(p, { asset: "observer.png",
        scale:0.25
      });
      this.X = p.x;
      this.Y = p.y;
      // vitesse en m/s
      this.vx = Vmobile;
      this.vy = Vmobile;
    },
    step: function(dt) {
      this.X += this.vx * Te;
      
      this.Y += this.vy * Te;
      
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
