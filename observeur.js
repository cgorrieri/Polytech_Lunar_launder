/*
***************************************************
* observeur.js                                    *
* 	Script principal de l'animation               *
*                                                 *
* Auteurs :                                       *
* 	Loïc FAIZANT, Cyril GORRIERI, Maurice RAMBERT *
*                                                 *
* Ecole Polytech' Nice Sophia Antipolis           *
* Sciences Informatiques - 4e année               *
***************************************************
*/

// Définir l'observateur
Quintus.Observeur = function(Q) {
  Q.Sprite.extend("Observateur",{
    // Initialiser l'observateur
    init: function(p) {
      this._super(p, { 
	    // Charger l'image de l'observateur
        asset: "observer.png",
		// Définir le pas d'animation
        scale: 0.5
      });
	  
	  // Initialiser la position de l'observateur
      this.X = p.x;
      this.Y = p.y;
	  // Définir la vitesse de l'observateur
      this.V = 5;
	  // Définir l'angle de rotation
      this.angleRotation = (p.angle ? p.angle : 0);
	  // Définir le mobile à observer
      this.mobile = p.mobile;
	  
	  // Initialiser le tableau de mesures
      this.teta = new Array();
      this.ci = new Array();
	  // Définir le nombre limite de mesures
      this.nbMesures = 25;
	  // Initialiser le nombre de mesures effectuées
      this.currMesure = 0;
    },
	
    // Définir la boucle de l'observateur
    step: function(dt) {
      // Contrôler le nombre de mesures effectuées
      if(this.currMesure < this.nbMesures) {
		// Ajuster la rotation de l'observateur
        this.angleRotation -= 0.006;
		// Ajuster la vitesse de l'observateur
        this.vx = this.V * Math.cos(this.angleRotation);
        this.vy = this.V * Math.sin(this.angleRotation);

        // Calculer la nouvelle position de l'observateur
        this.X += (this.vx+this.mobile.vx) * Q.Te;
        this.Y += (this.vy+this.mobile.vy) * Q.Te;
        // Afficher l'observateur dans sa nouvelle position
        this.p.x = Q.XtoPx(this.X);
        this.p.y = Q.YtoPy(this.Y);
        
        // Mesurer la position du mobile (abscisse et ordonnée) et l'angle formé avec l'observateur
        this.teta.push({x:this.X, y:this.Y, t:Q.Te*this.currMesure,
          angle:Math.PI/2 - (Math.atan2((this.mobile.Y - this.Y), (this.mobile.X - this.X)))});
        // Incrémenter le nombre de mesures  
        this.currMesure++;
      }
	  else if(this.currMesure == this.nbMesures) {
	    // Calculer la position initiale et la vitesse du mobile
        infoMobile = this.calculeInfoMobile();
        // Afficher les informations du mobile
        Q.panel.set({"calc_mobile_x_value":infoMobile[0],	"calc_mobile_x_speed":infoMobile[1],
               "calc_mobile_y_value":infoMobile[2],	"calc_mobile_y_speed":infoMobile[3]});
        
        // Définir la consigne du module lunaire sur le mobile
        mobileDest = new Q.Target({x:infoMobile[0]+infoMobile[1]*this.nbMesures*Q.Te, vx:infoMobile[1],
                y: infoMobile[2] + infoMobile[3]*this.nbMesures*Q.Te, vy:infoMobile[3]});
        
		// Définir les attributs du module lunaire
        var lunarInfos = {scale:0.1, state:$V([this.X, 0, this.Y,0]) , target:mobileDest};
                
		// Traiter le cas d'une commande par retour d'état
        if(Q.ObserverCommande == "ret") {
		  // Masquer le panneau de commande optimale
          Q.panel.hideGroup("commandOptimal");
		  // Insérer le module lunaire avec commande par retour d'état
          Q.stage().insert(new Q.LunarRetourEtat(lunarInfos));
        }
		// Traiter le cas d'une commande optimale
		else if (Q.ObserverCommande == "opt") {
		  // Mettre l'animation en pause
          Q.stage().pause();
		  // Insérer le module lunaire avec commande optimale
          Q.stage().insert(new Q.LunarOptimal(lunarInfos));
		  // Afficher le paneau de commande optimale
          Q.panel.showGroup("commandOptimal");
		  // Contrôler la présence des valeurs propres de la commande optimale
          if(Q.Kn == null)
            alert("Veuillez selectionner le fichier de commande (dans le panel)");
          else
		    // Reprendre l'animation
			Q.stage().unpause();
        }
        
        // Incrémenter le nombre de mesures effectuées
        this.currMesure++;
      }
    },
	
	// --- Fonction calculeInfoMobile
	//	Calcule la position initiale et la vitesse du mobile
    calculeInfoMobile: function() {
      // Initialiser la matrice ci(t)
      var ci = new Array();
	  // Parcourir les mesures effectuées
      for(var i = 0; i < this.teta.length; i++) {
		// Construire la matrice ci(t)
        ci.push($M([
          [Math.sin(this.teta[i].angle)],
          [this.teta[i].t * Math.sin(this.teta[i].angle)],
          [-(Math.cos(this.teta[i].angle))],
          [this.teta[i].t * Math.cos(this.teta[i].angle)]])
        );
      }
	  
	  // Initialiser la matrice y(t)
      var y = new Array();
	  // Parcourir les mesures effectuées
      for(var i = 0; i < this.teta.length; i++) {
		// Construire la matrice y(t)
        y.push((-(this.teta[i].y) * Math.sin(this.teta[i].angle)) + (this.teta[i].x * Math.cos(this.teta[i].angle)));
      }
	  
	  // Initialiser la matrice Gamma
      var gamma = $M([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
	  // Parcourir les mesures effectuées
      for(var i = 0; i < ci.length; i++) {
	    // Construire la matrice Gamma
        gamma = gamma.add(ci[i].multiply(ci[i].transpose()));
      }
      
      // Initialiser la matrice b
      var b = $M([
        [0],
        [0],
        [0],
        [0]
      ]);
	  // Parcourir les mesures effectuées
      for(var i = 0; i < ci.length; i++) {
	    // Construire la matrice b
        b = b.add(ci[i].x(y[i]));
      }
      
      // Résoudre le système d'équations
      var ga = gamma;
      var equations = ga.augment(b);
      var eqns = equations.toRightTriangular();
      
	  // Calculer la vitesse du mobile (ordonnée)
      var sol_vy = eqns.e(4,5) / eqns.e(4,4);
	  // Calculer la position initiale du mobile (ordonnée)
      var sol_y =(eqns.e(3,5) - eqns.e(3,4)*sol_vy) / eqns.e(3,3);
	  // Calculer la vitesse du mobile (abscisse)
      var sol_vx = (eqns.e(2,5) - eqns.e(2,4)*sol_vy - eqns.e(2,3)*sol_y) / eqns.e(2,2);
	  // Calculer la position initiale du mobile (abscisse)
      var sol_x = (eqns.e(1,5) - eqns.e(1,4)*sol_vy - eqns.e(1,3)*sol_y - eqns.e(1,2)*sol_vx) / eqns.e(1,1);
      
	  // Renvoyer la matrice résultante
      var res = [-sol_x, -sol_vx, -sol_y, sol_vy];
      return res;
    }
  });

  // Définir le mobile à observer
  Q.Target.extend("Mobile",{
    // Initialiser le mobile
    init: function(p) {
      this._super(p, {scale:0.25});
	  // Définir la vitesse du mobile
      this.vx = this.vy = Vmobile;
      // Fixer la référence du mobile en son centre
      this.p.cx = this.p.w/2;
    }
  });
  return Q;
};