/*
***************************************************
* lunar.js                                        *
*   Script du module lunaire                      *
*                                                 *
* Auteurs :                                       *
*   Loïc FAIZANT, Cyril GORRIERI, Maurice RAMBERT *
*                                                 *
* Ecole Polytech' Nice Sophia Antipolis           *
* Sciences Informatiques - 4e année               *
***************************************************
*/

// Définir le module lunaire
Quintus.LunarLaunder = function(Q) {
  // Définir la gravité lunaire (m/s²)
  var g = 1.6;
  
  // Définir le module lunaire de base
  Q.Sprite.extend("Lunar",{
    // Initialiser le module
    init: function(p) {
      // Charger l'image du module
      this._super(p, { asset: "lunar.png",
        // Définir la taille de l'image
        scale:0.7
      });
    
      // Initialiser la commande du module
      this.type;
      // Définir le point de référence du module en son bas
      this.p.cy = this.p.h;
      // Définir les coordonnées cartésiennes du module
      this.X = p.x;
      this.Y = p.y;
      // Définir la vitesse d'éjection des réacteurs (m/s)
      this.ve = 4500;
      // Initialiser les propriétés réinitialisables
      this.reset(p.state);
    
      // Définir les matrices de calcul
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
  
    // Définir la boucle du module
    step: function(dt) {
      // Traiter le cas d'un éventuel alunissage
      if(this.state.e(3) <= 0.01) {
        // Mettre l'animation en pause
        Q.stage().pause();
        // Afficher le menu de fin
        Q.stageScene("endLunarGame", 1);
      }
    
      // Calculer le nouvel état du module
      this.calc(dt);
      // Calculer la quantité de carburant restant
      this._calculFuel(dt);
      // Mettre à jour l'état du module
      this._updateState();
    },
  
    // Définir la réinitialisation du module
    reset: function(state) {
      // Contrôler l'éventuelle présence d'un état en paramètre
      if(state)
        // Mettre à jour l'état du module
        this.state = state;
      else
        // Réinitialiser l'état du module
        this.state = $V([0,0,0,0]);
    
      // Définir la masse à vide du module (kg)
      this.mvide = 6839;
      // Initialiser la masse de carburant embarqué
      this.mfuel = 816.5;
      // Initialiser la masse de carburant consommé
      this.mfuelCons= 0;
      // Définir la masse total du module
      this.m = this.mvide + this.mfuel;
      // Définir le coefficient de poussée des réacteurs
      this.erg = this.ve / this.m;
      // Initialiser l'accélération du module (abscisse et ordonnée)
      this.ax = this.ay = 0;
      // Initaliser les forces appliquées au module
      this.Un = $V([this.ax, this.ay - g/this.erg]);
      // Initialiser le temps de vol
      this.tVol = 0;
      this.resetMore();
    },
  
    // Définir le calcul du nouvel état du module  
    calc: function(dt) {
      // Obtenir l'état actuel du module
      var X = this.state;
      // Obtenir les matrices de calcul et la matrice de commande
      var Ad = this.Ad, Bd = this.Bd, Un = this.Un;

      // Calculer le nouvel état du module
      this.state = (Ad.x(X)).add(Bd.x(Un));
    },
  
    // Définir la réinitialisation des modules dérivés
    resetMore: function(){},
  
    // Définir l'affichage du module et de son état
    _updateState : function() {
      // Obtenir l'état du module
      var X = this.state;
      // Mettre à jour la position du module
      this.p.x = Q.XtoPx(this.X = X.e(1));
      this.p.y = Q.YtoPy(this.Y = X.e(3));
      // Afficher l'état du module
      Q.panel.set({     
     "temps":(this.tVol+=Q.Te).toFixed(1),
     "x_value": X.e(1).toFixed(2),
     "x_point": X.e(2).toFixed(2),
     "y_value": X.e(3).toFixed(2),
     "y_point": X.e(4).toFixed(2),
     "fuelRest": this.mfuel.toFixed(2)
      });
    },
  
    // Définir le calcul de carburant
    _calculFuel : function(dt) {
      // Calculer la masse de carburant consommé
      this.mfuelCons = (Math.abs(this.ax) + Math.abs(this.ay))*dt;
      // Mettre à jour la masse de carburant embarqué
      this.mfuel -= this.mfuelCons;
      // Contrôler la réserve de carburant
      if(this.mfuel<0) {
        this.mfuel=0;
        this.ax=0;
        this.ay=0;
      } else {
        this.mfuel -= this.mfuelCons;
      }  
    }
  });
  
  // Définir le module lunaire en commande manuelle
  Q.Lunar.extend("LunarManual",{
    // Initialiser le module
    init: function(p) {
      this._super(p, { });
      // Définir la commande du module
      this.type="man";
    },
  
    // Définir les méthodes de contrôle du module
    up: function() {this.addAy(1);},
    down: function() {this.addAy(-1);},
    right: function() {this.addAx(1);},
    left: function() {this.addAx(-1);},
    space: function() {this.stopMoteur();},
  
    // Ajout de poussée horizontale des réacteur
    addAx: function(ax) {
      // Mettre à jour la matrice commande
      this.Un = this.Un.add([ax, 0]);
      // Mettre à jour la poussée
      this.ax = this.Un.e(1);
    },
  
    // Ajout de poussée verticale des réacteur
    addAy: function(ay) {
      // Mettre à jour la poussée
      this.ay += ay;
      // Mettre à jour la matrice de commande en prenant en compte la gravité lunaire
      this.Un = $V([this.ax, this.ay - g/this.erg]);
    },
  
    // Définir l'arrêt des réacteurs
    stopMoteur: function() {
      this.ax = this.ay = 0;
      this.Un = $V([0, - g/this.erg]);
    },
  });

  // Définir le module lunaire avec consigne
  Q.Lunar.extend("LunarTarget",{
    // Initialiser le module
    init: function(p) {
      this._super(p, { });
      // Initialiser le vecteur de consigne
      this.Cn = $V([p.target.X, p.target.vx, p.target.Y, p.target.vy]);
      // Initialiser la variation de consigne
      this.AddCn = [this.Cn.e(2)*Q.Te, 0, this.Cn.e(4)*Q.Te, 0];
    },
  
    // Définir le calcul du nouvel état du module
    calc: function(dt) {
      // Mettre à jour la consigne
      this.Cn = this.Cn.add(this.AddCn);
      // Calculer le nouvel état du module
      this.sousCalc(dt);
    },
  
    // Définir le calcul du nouvel état du module (méthode abstraite à implémenter)
    sousCalc: function() {},
  });
  
  // Définir le module à commande par retour d'état
  Q.LunarTarget.extend("LunarRetourEtat",{
    // Initialiser le module
    init: function(p) {
      this._super(p, { });
      this.matGluneErg = $V([0, 0]);
      // Définir la commande du module
      this.type="ret";
    },
  
    // Définir le calcul du nouvel état du module
    sousCalc: function(dt) {
      // Obtenir l'état courant du module
      var X = this.state;
      // Obtenir les matrices de calcul du système
      var Ad = this.Ad, Bd = this.Bd;
      
      // Mise à jour des accélérations
      axy = Q.valPropres.x(this.Cn.subtract(X));
      this.ax = axy.e(1);
      this.ay = axy.e(2);
      
      // Calculer le nouvel état du module
      //            (   Ad    -   Bd .    K        ) .  Xn     +   Bb   .   K    .   Cn            -      Bd  . (0, Glune/erg)
      this.state = ((Ad.subtract(Bd.x(Q.valPropres))).x(X)).add(Bd.x(Q.valPropres).x(this.Cn)).subtract(Bd.x(this.matGluneErg));
    }
  });

  // Définir le module lunaire en commande optimale
  Q.LunarTarget.extend("LunarOptimal",{
    // Initialiser le module
    init: function(p) {
      this._super(p, { });
      // Définir la commande
      this.type="opt";
      // Initialiser l'indice de parcours des matrices Kn
      this.currentStep = 0;
    },
  
    // Définir la méthode de remise à zéro de l'animation
    resetMore: function() {
      // Réinitialiser l'indice de parcours
      this.currentStep = 0;
    },
  
    // Définir le calcul du nouvel état du module
    sousCalc: function(dt) {
      // Contrôler la progression de la simlation
      if(this.currentStep < Q.Kn.length) {
        // Obtenir l'état du module
        var X = this.state;
        // Obtenir les matrices de calcul et la matrice de commande
        var Ad = this.Ad, Bd = this.Bd, Un = this.Un;
        // Obtenir les valeurs propres courantes
        var Ki = Q.Kn[this.currentStep];
        
        // Mise à jour des accélérations
        axy = Ki.x(this.Cn.subtract(X));
        this.ax = axy.e(1);
        this.ay = axy.e(2);
        
        // Calculer le nouvel état du module
        //            (   Ad    -  Bd . Ki ) .  Xn   +  Bb.  K   .   Cn        -      Bd  . Un
        this.state = ((Ad.subtract(Bd.x(Ki))).x(X)).add(Bd.x(Ki).x(this.Cn)).subtract(Bd.x(this.Un));
        this.currentStep++;
      } else {
        this.state = this.state.add([this.state.e(2)*Q.Te,0,this.state.e(4)*Q.Te,0]);
      }
    }
  });
  
  return Q;
};
