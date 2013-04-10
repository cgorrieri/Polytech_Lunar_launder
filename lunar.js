Quintus.LunarLaunder = function(Q) {
  var valPropres = $M([[0.33,		1.11,		0.0,	0.0],
                      [0.0,		0.0,		0.33,	1.11]]);
  var g=1.6; //attraction lunaire (en m/s^2)
  Q.Sprite.extend("Lunar",{
    init: function(p) {
      this._super(p, { asset: "lunar.png",
        x: 0,
        y: 0,
      });
      
      // Met le point de référence du lunar en son bas
      this.p.cy = this.p.h;
      this.X = this.Y = 0;
      te = this.Te = 0.04;
      Q.panel.set({"te" : (te*1000).toFixed(0)});
      if(p.state)
        this.state = p.state;
      else
        this.state = $V([this.p.x, 1, this.p.y, -1]); // vecteur d'état de lunar
      this.mvide = 6839; // masse à  vide (kg)
      this.mfuel = 816.5;  // masse de carburant (kg) });
      this.mfuelCons= 0;
      this.m = this.mvide + this.mfuel;
      this.ve = 4500; // vitesse d'éjection des gaz (en m/s), ou specific impulse
      this.erg = this.ve/this.m; // epsilon
      this.Ad =  $M([[1,te,0,0],
                  [0,1,0,0],
                  [0,0,1,te],
                  [0,0,0,1]]);
      a = this.erg*(te*te)/2;
      b = this.erg*te;
      this.Bd = $M([[a,0],
                  [b,0],
                  [0,a],
                  [0,b]]);
      this.ax = this.ay = 0;
      this.Un = $V([this.ax, this.ay - g/this.erg]);
      this.tVol = 0; // temps de vol de lunar      
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) { },
    up: function() {},
    down: function() {},
    right: function() {},
    left: function() {},
    space: function() {},    
    // Methode utile
    _updateState : function() {
      var X = this.state;
      // place lunar par rapport au repère en bas à gauche
      // on definit ici une échelle de 4px pour un metre
      this.p.x = (this.X = X.e(1)) * 4;
      this.p.y = Q.height - (this.Y = X.e(3))*4;
      Q.panel.set({
       "temps":(this.tVol+=this.Te).toFixed(1),
             "x_value": X.e(1).toFixed(2),
             "x_point": X.e(2).toFixed(2),
             "y_value": X.e(3).toFixed(2),
             "y_point": X.e(4).toFixed(2),
       "fuelRest": this.mfuel.toFixed(2)
      });
    },
    _calculFuel : function() {
      this.mfuelCons = (Math.abs(this.ax) + Math.abs(this.ay))*this.tVol;
					if(this.mfuel<0)  
					{this.mfuel=0;
					this.ax=0;
					this.ay=0;}  
					else{this.fuel -= this.mfuelCons;}  
    }

  });
  
  Q.Lunar.extend("LunarManual",{
    init: function(p) {
      this._super(p, { });
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      var X=this.state;
      if(X.e(3) <= 0)
        Q.stageScene("endGame",0, { label: "You crash" });

      var p = this.p;
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;

      this._calculFuel();

      //console.log(Ad, X, Bd, [0, -g/this.erg]);

      // Calcule du nouveau vecteur d'état
      this.state = (Ad.x(X)).add(Bd.x(this.Un));
            
      this._updateState();
    },
    up: function() {this.addAy(1);},
    down: function() {this.addAy(-1);},
    right: function() {this.addAx(1);},
    left: function() {this.addAx(-1);},
    space: function() {this.stopMoteur();},
    addAx: function(ax) {
      this.Un = this.Un.add([ax, 0]);
      this.ax = this.Un.e(1);
    },
    addAy: function(ay) {
      this.ay += ay;
      this.Un = $V([this.ax, this.ay - g/this.erg]);
    },
    stopMoteur: function() {
      this.ax = this.ay = 0;
      this.Un = $V([0, - g/this.erg]);
    },
  });
  
  Q.Lunar.extend("LunarRetourEtat",{
    init: function(p) {
      this._super(p, { });
      this.target = p.target;
      this.Cn = $V([0, 0, 0, 0]);
      this.matGluneErg = $V([0, g/this.erg]);
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      var X=this.state;
      if(X.e(3) <= 0)
        Q.stageScene("endGame",0, { label: "You crash" });

      var p = this.p;
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;
      
      // Récuperer axn et ayn
      axy = valPropres.x(this.Cn.subtract(X));
      this.ax = axy.e(1);
      this.ay = axy.e(2);

      this._calculFuel();
      
      console.log(X);
      
      // Calcule du nouveau vecteur d'état
      /*            (   Ad    -      Bd.K        ) .  Xn     +   Bb   .   K    .   Cn        -   Bd  . (0, Glune/erg)*/
      this.state = ((Ad.subtract(Bd.x(valPropres))).x(X)).add(Bd.x(valPropres).x(this.Cn)).subtract(Bd.x(this.matGluneErg));
            
      this._updateState();
    },
    up: function() {this.addTargetY(1);},
    down: function() {this.addTargetY(-1);},
    right: function() {this.addTargetX(1);},
    left: function() {this.addTargetX(-1);},
    space: function() {},
    addTargetX: function(ax) {
      this.Un = this.Un.add([ax, 0]);
      this.ax = this.Un.e(1);
    },
    addTargetY: function(ay) {
      this.ay += ay;
      this.Un = $V([this.ax, this.ay - g/this.erg]);
    },
  });
  return Q;
};
