Quintus.LunarLaunder = function(Q) {
  var g=1.6; //attraction lunaire (en m/s^2)
  Q.Sprite.extend("Lunar",{
    init: function(p) {
      this._super(p, { asset: "lunar.png",
        x: 45,
        y: 51,
      });
      te = this.Te = 0.04;
      Q.panel.set({"te" : (te*1000).toFixed(0)});
      this.state = $V([this.p.x, 1, this.p.y, -1]); // vecteur d'état de lunar
      this.mvide = 6839; // masse à  vide (kg)
      this.mfuel = 816.5;  // masse de carburant (kg) });
      this.m = this.mvide + this.mfuel;
      this.ve = 4500; // vitesse d'éjection des gaz (en m/s), ou specific impulse
      this.erg = this.ve/this.m; // epsilon
      this.ad =  $M([[1,te,0,0],
                  [0,1,0,0],
                  [0,0,1,te],
                  [0,0,0,1]]);
      a = this.erg*(te*te)/2;
      b = this.erg*te;
      this.bd = $M([[a,0],
                  [b,0],
                  [0,a],
                  [0,b]]);
      this.ax = this.ay = 0;
      this.ud = $V([this.ax, this.ay - g/this.erg]);
      this.tVol = 0; // temps de vol de lunar
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      var X=this.state;
      if(X.e(3) <= 0)
        Q.stageScene("endGame",0, { label: "You crash" });

      var p = this.p;
      var ad = this.ad, bd = this.bd, ud = this.ud;

      //console.log(ad, X, bd, [0, -g/this.erg]);

      // Calcule du nouveau vecteur d'état
      this.state = (ad.x(X)).add(bd.x(this.ud));
            
      // place lunar par rapport au repère en bas à gauche
      // on definit ici une échelle de 4px pour un metre
      p.x = X.e(1) * 4;
      p.y = Q.height - X.e(3)*4;
      Q.panel.set({"temps":(this.tVol+=this.Te).toFixed(1),
         "x_value": X.e(1).toFixed(2),
         "x_point": X.e(2).toFixed(2),
         "y_value": X.e(3).toFixed(2),
         "y_point": X.e(4).toFixed(2)});
    },
    addAx: function(ax) {
      this.ud = this.ud.add([ax, 0]);
      this.ax = this.ud.e(1);
    },
    addAy: function(ay) {
      this.ay += ay;
      this.ud = $V([this.ax, this.ay - g/this.erg]);
    }
  });
  return Q;
};
