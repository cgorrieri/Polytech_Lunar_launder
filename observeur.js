Quintus.Observeur = function(Q) {
  var Vmobile = 2; // en m/s

  // Observateur qui va definir la trajectoire du Mobile
  Q.Sprite.extend("Observateur",{
    init: function(p) {
      this._super(p, { 
        asset: "observer.png", // image
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
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      // Si on a pas assez de meusures alors on continue de meusurer
      if(this.currMesure < this.nbMesures) {
        this.angleRotation -= 0.006;
        this.vx = this.V * Math.cos(this.angleRotation);
        this.vy = this.V * Math.sin(this.angleRotation);

        // Position mathématique
        this.X += (this.vx+this.vxSuivre) * Q.Te;
        this.Y += (this.vy+this.vySuivre) * Q.Te;
        // Position à l'affichage
        this.p.x = Q.XtoPx(this.X);
        this.p.y = Q.YtoPy(this.Y);
        
        // Point A(x,y), atan2(x,y) retourn l'angle entre l'axe X et la droite (origin,A)
        this.teta.push({x:this.X, y:this.Y, t:Q.Te*this.currMesure,
          angle:Math.PI/2 - (Math.atan2((this.mobile.Y - this.Y), (this.mobile.X - this.X)))});
          
        this.currMesure++;
      } else if(this.currMesure == this.nbMesures) { // sinon on calcul grace au gradients conjugués
        infoMobile = this.calculeInfoMobile();
        // Affichage des infos sur le mobile calculé
        Q.panel.set({"calc_mobile_x_value":infoMobile[0],	"calc_mobile_x_speed":infoMobile[1],
               "calc_mobile_y_value":infoMobile[2],	"calc_mobile_y_speed":infoMobile[3]});
        
        // Consigne
        mobileDest = new Q.Target({x:infoMobile[0]+infoMobile[1]*this.nbMesures*Q.Te, vx:infoMobile[1],
                y: infoMobile[2] + infoMobile[3]*this.nbMesures*Q.Te, vy:infoMobile[3]});
        
        // On ajoute notre lunar au jeu
        Q.stage().insert(new Q.LunarRetourEtat({scale:0.1, state:$V([this.X, 0, this.Y,0]) , target:mobileDest}))
        
        // On incrémente pour ne plus rentrer dans les calculs
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
      
      // resolution par système d'équation
      var ga = gamma;
      var equations = ga.augment(b);
      console.log("equation");
      var eqns = equations.toRightTriangular();
      
      var sol_vy = eqns.e(4,5) / eqns.e(4,4);
      var sol_y =(eqns.e(3,5) - eqns.e(3,4)*sol_vy) / eqns.e(3,3);
      var sol_vx = (eqns.e(2,5) - eqns.e(2,4)*sol_vy - eqns.e(2,3)*sol_y) / eqns.e(2,2);
      var sol_x = (eqns.e(1,5) - eqns.e(1,4)*sol_vy - eqns.e(1,3)*sol_y - eqns.e(1,2)*sol_vx) / eqns.e(1,1);
      
      var res = [-sol_x, -sol_vx, -sol_y, sol_vy];
      //console.log(res);
      
      return res;
    }
  });

  // Mobile suivant une trajectoire linéaire
  Q.Target.extend("Mobile",{
    init: function(p) {
      this._super(p, {scale:0.25});
      this.vx = this.vy = Vmobile;
      // Met le point de référence du lunar en son haut au centre
      this.p.cx = this.p.w/2;
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
