Quintus.LunarLaunder = function(Q) {
  var g=1.6; //attraction lunaire (en m/s^2)
  
  /* Class Lunar de base sans aucun calcul
   * Initialise tous les paramètres par defaut
   */
  Q.Sprite.extend("Lunar",{
    init: function(p) {
      this._super(p, { asset: "lunar.png",
        scale:0.7
      });
      
      // Met le point de référence du lunar en son bas
      this.p.cy = this.p.h;
      // getter des X et Y reels
      this.X = this.Y = 0;
      // Fixation du Te
      te = this.Te = 0.04;
      // Affichage du Te
      Q.panel.set({"te" : (te*1000).toFixed(0)});
      // si un état est donné on l'utilise
      if(p.state)
        this.state = p.state;
      else // sinon on initialise à 0
        this.state = $V([0,0,0,0]);
      this.mvide = 6839; // masse à  vide (kg)
      this.mfuel = 816.5;  // masse de carburant (kg) });
      this.mfuelCons= 0;
      this.m = this.mvide + this.mfuel; // masse total
      this.ve = 4500; // vitesse d'éjection des gaz (en m/s), ou specific impulse
      this.erg = this.ve/this.m; // epsilon
      // Matrices de calcules
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
      // vecteurs de vitesses
      this.ax = this.ay = 0;
      this.Un = $V([this.ax, this.ay - g/this.erg]);
      this.tVol = 0; // temps de vol total   
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      if(this.state.e(3) <= 0)
        Q.stageScene("endGame",0, { label: "You crash" });

      this.calc(dt);
      this._calculFuel();
      this._updateState();
    },
    // méthode à modifier qui calcul l'état
    calc: function(dt){},
    // fonction de control
    up: function() {},
    down: function() {},
    right: function() {},
    left: function() {},
    space: function() {},    
    // Place le lunar et affiche son état
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
    // Calcul du fuel
    _calculFuel : function() {
      this.mfuelCons = (Math.abs(this.ax) + Math.abs(this.ay))*this.tVol;
 					this.mfuel -= this.mfuelCons;
					if(this.mfuel<0)  
					{this.mfuel=0;
					this.ax=0;
					this.ay=0;}  
					else{this.mfuel -= this.mfuelCons;}  
    }

  });
  
  /*
   * LunarLander en commande manuelle
   */
  Q.Lunar.extend("LunarManual",{
    init: function(p) {
      this._super(p, { });
    },
    // fonction appelé à cheque boucle du jeu
    calc: function(dt) {
      var X=this.state;
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;

      // Calcule du nouveau vecteur d'état
      this.state = (Ad.x(X)).add(Bd.x(this.Un));
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
  
  /*
   * LunarLander en commande par retour d'état
   */
  Q.Lunar.extend("LunarRetourEtat",{
    init: function(p) {
      this._super(p, { });
      this.target = p.target;
      this.Cn = $V([0, 0, 0, 0]);
      this.matGluneErg = $V([0, g/this.erg]);
    },
    // fonction appelé à cheque boucle du jeu
    calc: function(dt) {
      var X=this.state;
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;
      
      // Récuperer axn et ayn
      axy = Q.valPropres.x(this.Cn.subtract(X));
      this.ax = axy.e(1);
      this.ay = axy.e(2);
      
      // Calcule du nouveau vecteur d'état
      //            (   Ad    -   Bd .    K        ) .  Xn     +   Bb   .   K    .   Cn            -      Bd  . (0, Glune/erg)
      this.state = ((Ad.subtract(Bd.x(Q.valPropres))).x(X)).add(Bd.x(Q.valPropres).x(this.Cn)).subtract(Bd.x(this.matGluneErg));
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
