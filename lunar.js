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
      // Type de commande utilisé
      this.type;
      
      // Met le point de référence du lunar en son bas
      this.p.cy = this.p.h;
      
      // Coordonnée mathématique
      this.X = p.x;
      this.Y = p.y;
      
      this.ve = 4500; // vitesse d'éjection des gaz (en m/s)
      
      // Initialise les propriétés resetable
      this.reset(p.state);
      // Matrices de calcules
      this.Ad =  $M([[1,Q.Te,0,0],
                  [0,1,0,0],
                  [0,0,1,Q.Te],
                  [0,0,0,1]]);
      a = this.erg*(Q.Te*Q.Te)/2;
      b = this.erg*Q.Te;
      this.Bd = $M([[a,0],
                  [b,0],
                  [0,a],
                  [0,b]]);
    },
    step: function(dt) {
      // Si le Lunar à alunis
      if(this.state.e(3) <= 0.01) {
        Q.stage().pause();
        Q.stageScene("endLunarGame",1);
      }
      this.calc(dt);
      this._calculFuel(dt);
      this._updateState();
    },
    reset: function(state) {
      // si un état est donné on l'utilise
      if(state)
        this.state = state;
      else // sinon on initialise à 0
        this.state = $V([0,0,0,0]);
      this.mvide = 6839; // masse à  vide (kg)
      this.mfuel = 816.5;  // masse de carburant (kg) });
      this.mfuelCons= 0;
      this.m = this.mvide + this.mfuel; // masse total
      this.erg = this.ve/this.m; // epsilon
      // vecteurs de vitesses
      this.ax = this.ay = 0;
      this.Un = $V([this.ax, this.ay - g/this.erg]);
      this.tVol = 0; // temps de vol total
      this.resetMore();
    },
    // méthode à modifier qui calcul l'état
    calc: function(dt){
      var X=this.state;
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;

      // Calcule du nouveau vecteur d'état
      this.state = (Ad.x(X)).add(Bd.x(this.Un));
    },
    // Permet au fille de resetter leurs attributs
    resetMore: function(){},
    // Place le lunar et affiche son état
    _updateState : function() {
      var X = this.state;
      // mise à jour de la position du Lunar
      this.p.x = Q.XtoPx(this.X = X.e(1));
      this.p.y = Q.YtoPy(this.Y = X.e(3));
      // Affichage des valeurs
      Q.panel.set({     
             "temps":(this.tVol+=Q.Te).toFixed(1),
             "x_value": X.e(1).toFixed(2),
             "x_point": X.e(2).toFixed(2),
             "y_value": X.e(3).toFixed(2),
             "y_point": X.e(4).toFixed(2),
       "fuelRest": this.mfuel.toFixed(2)
      });
    },
    // Calcul du fuel
    _calculFuel : function(dt) {
      this.mfuelCons = (Math.abs(this.ax) + Math.abs(this.ay))*dt;
      this.mfuel -= this.mfuelCons;
      if(this.mfuel<0) {
        this.mfuel=0;
        this.ax=0;
        this.ay=0;
      } else {
        this.mfuel -= this.mfuelCons;
      }  
    }
  });
  
  /*
   * LunarLander en commande manuelle
   */
  Q.Lunar.extend("LunarManual",{
    init: function(p) {
      this._super(p, { });
      this.type="man";
    },
    // definition des methodes de controle
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
   * LunarLander abstrait ayant une consigne
   */
  Q.Lunar.extend("LunarTarget",{
    init: function(p) {
      this._super(p, { });
      // Objet à atteindre
      this.target = p.target;
      // Vecteur de consigne
      this.Cn = $V([p.target.X, p.target.vx, p.target.Y, p.target.vy]);
      // Vecteur correspondant au déplacememnt de la consigne à chaque instant
      this.AddCn = [this.Cn.e(2)*Q.Te, 0, this.Cn.e(4)*Q.Te, 0];
    },
    calc :function(dt) {
      // Evolution de la consigne par rapport à sa vitesse
      this.Cn = this.Cn.add(this.AddCn);
      this.sousCalc(dt);
    },
    // à redéfinir
    sousCalc : function() {},
    // Méthodes de controle de la consigne
    up: function() {this.addTargetY(1);},
    down: function() {this.addTargetY(-1);},
    right: function() {this.addTargetX(1);},
    left: function() {this.addTargetX(-1);},
    space: function() {},
    addTargetX: function(ax) {
      if(this.Cn.e(1) + ax >= 0) {
        this.Cn = this.Cn.add([ax, 0, 0, 0]);
        this.target.X = this.Cn.e(1);
       }
    },
    addTargetY: function(ay) {
      if(this.Cn.e(3) + ay >= 0) {
        this.Cn = this.Cn.add([0, 0, ay, 0]);
        this.target.Y = this.Cn.e(3);
      }
    }
  });
  
  /*
   * LunarLander en commande par retour d'état
   */
  Q.LunarTarget.extend("LunarRetourEtat",{
    init: function(p) {
      this._super(p, { });
      this.matGluneErg = $V([0, 0]);
      this.type="ret";
    },
    sousCalc: function(dt) {
      var X=this.state;
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;
      
      // Récuperer ax et ay
      axy = Q.valPropres.x(this.Cn.subtract(X));
      this.ax = axy.e(1);
      this.ay = axy.e(2);
      
      // Calcul du nouveau vecteur d'état
      //            (   Ad    -   Bd .    K        ) .  Xn     +   Bb   .   K    .   Cn            -      Bd  . (0, Glune/erg)
      this.state = ((Ad.subtract(Bd.x(Q.valPropres))).x(X)).add(Bd.x(Q.valPropres).x(this.Cn)).subtract(Bd.x(this.matGluneErg));
    }
  });

  /*
   * LunarLander en commande optimale
   */
  Q.LunarTarget.extend("LunarOptimal",{
    init: function(p) {
      this._super(p, { });
      this.type="opt";
      // Indice sur le tableau Kn
      this.currentStep = 0;
    },
    resetMore: function() {
      this.currentStep = 0;
    },
    sousCalc: function(dt) {
      // Si on n'a pas atteint l'horizon
      if(this.currentStep < Q.Kn.length) {
        var X=this.state;
        var Ad = this.Ad, Bd = this.Bd, Un = this.Un;
        // récupération des valeurs propres pour l'instant i
        var Ki = Q.Kn[this.currentStep];
        
        // Récuperer axn et ayn
        axy = Ki.x(this.Cn.subtract(X));
        this.ax = axy.e(1);
        this.ay = axy.e(2);
        
        // Calcule du nouveau vecteur d'état
        //            (   Ad    -  Bd . Ki ) .  Xn   +  Bb.  K   .   Cn        -      Bd  . Un
        this.state = ((Ad.subtract(Bd.x(Ki))).x(X)).add(Bd.x(Ki).x(this.Cn)).subtract(Bd.x(this.Un));
        this.currentStep++;
        console.log(this.state);
      } else {
        this.state = this.state.add([this.state.e(2)*Q.Te,0,this.state.e(4)*Q.Te,0]);
      }
    }
  });
  return Q;
};
