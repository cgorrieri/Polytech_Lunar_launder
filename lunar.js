Quintus.LunarLaunder = function(Q) {
  var g=1.6; //attraction lunaire (en m/s^2)
  Q.Sprite.extend("Lunar",{
    init: function(p) {
      this._super(p, { asset: "lunar.png",
        x: 45,
        y: 51,
      });
      te = this.Te = 0.04;
      this.state = [this.p.x, 1, this.p.y, -1]; // vecteur d'état de lunar
      this.mvide = 6839; // masse à  vide (kg)
      this.mfuel = 816.5;  // masse de carburant (kg) });
      this.m = this.mvide + this.mfuel;
      this.ve = 4500; // vitesse d'éjection des gaz (en m/s), ou specific impulse
      this.erg = this.ve/this.m; // epsilon
      this.ad =  [[1,te,0,0],
                  [0,1,0,0],
                  [0,0,1,te],
                  [0,0,0,1]];
      a = this.erg*(te*te)/2;
      b = this.erg*te;
      this.bd = [[a,0],
                  [b,0],
                  [0,a],
                  [0,b]];
      this.tVol = 0; // temps de vol de lunar
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      var X=this.state;
      if(X[2] <= 0)
        Q.stageScene("endGame",0, { label: "You crash" });

      var p = this.p;
      var ad = this.ad, bd = this.bd;

      //console.log(ad, X, bd, [0, -g/this.erg]);

      // Calcule du nouveau vecteur d'état
      this.state = this.add_vect(
        this.multiply_4x(ad, X, 4),
        this.multiply_4x(bd,[0, -g/this.erg], 2)
      );
    
      // place lunar par rapport au repère en bas à gauche
      // on definit ici une échelle de 4px pour un metre
      p.x = X[0] * 4;
      p.y = Q.height - X[2]*4;
      Q.panel.set({"te":(this.Te*1000).toFixed(0), "temps":(this.tVol+=this.Te).toFixed(1),
         "x_value":X[0].toFixed(2),
         "x_point":X[1].toFixed(2),
         "y_value":X[2].toFixed(2),
         "y_point":X[3].toFixed(2)});
    },
    // A: matrix 4xl
    // B: vecteur l
    // l: integer
    multiply_4x: function(A, B, l) {
      xd = [0,0,0,0];
      for(var i=0;i<4;i++)
        for(var j=0;j<l;j++)
          xd[i]+=A[i][j]*B[j];
      
      return xd;
    },
    // Add 2 vecteur 4
    add_vect: function(x1, x2) {
      for(i=0;i<4;i++)
        x1[i]+=x2[i];
      return x1;
    }

  });
  return Q;
};
