/*
***************************************************
* jeu.js                                          *
* 	Script principal de l'animation               *
*                                                 *
* Auteurs :                                       *
* 	Loïc FAIZANT, Cyril GORRIERI, Maurice RAMBERT *
*                                                 *
* Ecole Polytech' Nice Sophia Antipolis           *
* Sciences Informatiques - 4e année               *
***************************************************
*/


// Définir le chargement de la page
window.addEventListener("load", function() {
  // Instancier le moteur graphique avec les composants nécessaires à l'animation
  var Q = window.Q =  Quintus().include("Sprites, Scenes, Touch, Input, UI, Target, Panel, LunarLaunder, Observeur").setup("game").controls().touch();
  // Définir les options du moteur graphique
  Q.options = {
    imagePath: "images/",
    audioPath: "audio/",
    dataPath:  "data/",
    audioSupported: [ 'mp3','ogg' ],
    sound: true,
    frameTimeLimit: 40
  };
  
  // Initialiser le panel de l'animation
  Q.panel = new Q.LeftPanel({id:"panel"});
  Q.panel.hide();
  
  // Mapper les touches clavier avec les commandes du module lunaire
  Q.input.bindKey(77, "manual"); // 'm' : commande manuelle
  Q.input.bindKey(69, "retEtat"); // 'e' : commande par retour d'état
  Q.input.bindKey(72, "optimal"); // 'h' : commande optimale
  Q.input.bindKey(82, "reset"); // 'r' : remise à zéro de l'animation
  
  // Définir les valeurs propres pour la commande par retour d'état
  Q.valPropres = $M([[0.33,		1.11,		0.0,	0.0],
                      [0.0,		0.0,		0.33,	1.11]]);
  // Afficher les valeurs propres initiales
  Q.panel.set({"11":0.33,	"12":1.11,"13":0.0,	"14":0.0,
               "21":0.0,	"22":0.0,	"23":0.33,"24":1.11});
  // Définir les valeurs propres de l'animation avec les valeurs saisies via l'interface
  Q.setValPropres = function() {
    Q.valPropres = $M([[parseFloat(Q.panel.get("11")),parseFloat(Q.panel.get("12")),parseFloat(Q.panel.get("13")),parseFloat(Q.panel.get("14"))],
                      [parseFloat(Q.panel.get("21")),parseFloat(Q.panel.get("22")),parseFloat(Q.panel.get("23")),parseFloat(Q.panel.get("24"))]]);
  }
  
  // Initialiser le tableau des valeurs propres pour la commande optimale
  Q.Kn = null;
  
  // Définir la période d'échantillonnage
  Q.Te = 0.04;
  // Afficher la période d'échantillonnage
  Q.panel.set({"te" : (Q.Te*1000).toFixed(0)});
  
  // Définir l'échelle d'espace (pixels/mètre)
  Q.ScalePM = 4;
  
  // Assurer la cohérence du temps en fixant l'intervalle de temps à la période d'échantillonnage
  _fixe = function(dt) {
      lastGameLoopFrame = new Date().getTime()+(dt*1000);
      var now;
      do {
        now = new Date().getTime();
        dt = now - Q.lastGameLoopFrame;
      } while(dt < Q.options.frameTimeLimit);
      if(dt >= Q.options.frameTimeLimit) return Q.options.frameTimeLimit;
      return dt;
    }
  
  // Instancier le module lunaire
  var LunarLander;
  // Instancier la consigne de commande
  var Target;
  
  // --- Fonction XtoPx
  //	Convertit la position (abscisse) en pixels
  //		x :
  //			position à convertir
  Q.XtoPx = function(x) {return x * Q.ScalePM;}
  
  // --- Fonction YtoPx
  //	Convertit la position (ordonnée) en pixels
  //		y :
  //			position à convertir
  Q.YtoPy = function(y) {return Q.height - y * Q.ScalePM;}
  
  // Définir le menu principal de la simulation
  Q.scene("main_menu", function(stage) {
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
	
    // Afficher le bouton pour la simulation des lois de commande
    var lunarGame = box.insert(
      new Q.UI.Button({x:0, y:0, fill:"#CCCCCC", label:"Loi de commandes", type:Q.SPRITE_UI},
        function() {
			// Réinitialiser l'animation
			Q.clearStages();
			// Afficher le panel
			Q.panel.show();
			// Initialiser la consigne de commande
			Target = new Q.Target({x:0,y:0, asset:"target.png"});
			// Afficher les contrôles du module
			Q.panel.showGroup("state");
			// Lancer la simulation de l'alunissage
			Q.stageScene('lunarGame');
        }));
		
    // Afficher le bouton pour la simulation de poursuite
    var observerGame = box.insert(
      new Q.UI.Button({x:0, y:10 + lunarGame.p.h, fill:"#CCCCCC", label:"Poursuite", type:Q.SPRITE_UI},
        function() {
			// Réinitialiser l'animation
			Q.clearStages();
			// Afficher le panel
			Q.panel.show();
			// Afficher les contrôles du mobile
			Q.panel.showGroup("observer");
			// Lancer la simulation de poursuite
			Q.stageScene('observerGame');
        }));
    box.fit(20);
  });
  
  // Initialiser la commande du module avec la commande par retour d'état
  Q.ObserverCommande = "ret";
  
  // Définir l'observation de la trajectoire du mobile
  Q.scene("observerGame", function(stage) {
    // Initialiser le mobile
    var mobile = new Q.Target({x:50, y:50, vx:2,vy:2, asset:"mobile.png", scale:0.3});
	// Insérer le mobile dans l'animation
    stage.insert(mobile);
    // Afficher l'état du mobile
    Q.panel.set({"reel_mobile_x_value":50,	"reel_mobile_x_speed":2,
               "reel_mobile_y_value":50,	"reel_mobile_y_speed":2});
    // Initialiser l'observateur
    var observer = new Q.Observateur({x:15, y:65, angle:Math.PI/2, mobile:mobile});
	// Insérer l'observateur dans l'animation
    stage.insert(observer);
    
    // Définir la boucle de l'animation
    Q.gameLoop(function(dt) {
      _fixe(dt);
      Q.stageGameLoop(dt);
    });
    
    // Gérer les touches clavier pour le changement de type de commande
    Q.input.on('retEtat', stage, function(e) {
      if(Q.ObserverCommande != "ret") {
        Q.ObserverCommande = "ret"
        Q.stageScene('observerGame');
      }
    });

    Q.input.on('optimal', stage, function(e) {
      if(Q.ObserverCommande != "opt") {
        Q.ObserverCommande = "opt"
        Q.stageScene('observerGame');
      }
    });
    
    // Afficher le bouton de retour au menu
    var button = stage.insert(new Q.UI.Button({x:0+50, y:0+30, fill:"#CCCCCC", label:"Menu", type:Q.SPRITE_UI},
      function() {
		  // Réinitialiser l'animation
		  Q.clearStages();
		  // Masquer les panels
		  Q.panel.hide();
		  Q.panel.hideAll();
		  // Afficher le menu principal
		  Q.stageScene('main_menu');
    }));
  });
  
  // Définir la simulation de l'alunissage du module
  Q.scene("lunarGame",function(stage) {
    // Contrôler l'éventuelle instanciation du module
    if(!LunarLander)
	  // Instancier le module avec la commande manuelle
      LunarLander = new Q.LunarManual({state:$V([45, 1, 51, -1])});
    else  {
	  // Réinitialiser le module
      LunarLander.reset($V([45, 1, 51, -1]));
	  // Contrôler le type de commande affectée au module
      if(LunarLander.type == "ret" || LunarLander.type== "opt")
	    // Afficher l'éventuelle consigne de commande
        stage.insert(Target);
    }
    // Afficher le module
    stage.insert(LunarLander);
    
	// --- Fonction addTargetX
	//	Déplace la consigne de commande en abscisse
	//		ax :
	//			déplacement de consigne
    addTargetX = function(ax) {
	  // Contrôler la validité du déplacement
      if(LunarLander.Cn.e(1) + ax >= 0) {
			// Mettre à jour la consigne
			LunarLander.Cn = LunarLander.Cn.add([ax, 0, 0, 0]);
			Target.X += ax;
       }
    };
	
	// --- Fonction addTargetY
	//	Déplace la consigne de commande en abscisse
	//		ay :
	//			déplacement de consigne
    addTargetY = function(ay) {
	  // Contrôler la validité du déplacement
      if(LunarLander.Cn.e(3) + ay >= 0) {
			// Mettre à jour la consigne
			LunarLander.Cn = LunarLander.Cn.add([0, 0, ay, 0]);
			Target.Y += ay;
      }
    };
    
    // Gérer les touches clavier pour le déplacement du module ou de la consigne
    Q.input.on('up', stage, function(e) {
      if(LunarLander.type == "man") {
        LunarLander.up();
      } else {
        addTargetY(1);
      }
    });
    Q.input.on('down', stage, function(e) {
      if(LunarLander.type == "man") {
        LunarLander.down();
      } else {
        addTargetY(-1);
      }
    });
    Q.input.on('left', stage, function(e) {
      if(LunarLander.type == "man") {
        LunarLander.left();
      } else {
        addTargetX(-1);
      }
    });
    Q.input.on('right', stage, function(e) {
      if(LunarLander.type == "man") {
        LunarLander.right();
      } else {
        addTargetX(1);
      }
    });
    Q.input.on('fire', stage, function(e) {
      if(LunarLander.type == "man") {
        LunarLander.space();
      }
    });
    
    // Traiter le cas d'un passage à une commande manuelle
    Q.input.on('manual', stage, function(e) {
		// Mettre l'animation en pause
		Q.stage().pause();
		// Afficher l'état du module
		Q.panel.hideAll();
		Q.panel.showGroup("state");
		// Désactiver la consigne
		stage.remove(Target);
		// Supprimer le module actuel
		stage.remove(LunarLander);
		// Redéfinir le module en commande manuelle
		LunarLander = new Q.LunarManual({state:LunarLander.state});
		// Insérer le nouveau module
		stage.insert(LunarLander);
		// Reprendre l'animation
		Q.stage().unpause();
    });
    
    // Traiter le cas d'un passage à une commande par retour d'état
    Q.input.on('retEtat', stage, function(e) {
		// Mettre l'animation en pause
		Q.stage().pause();
		Q.panel.hideAll();
		// Afficher l'état du module et les valeurs propres de la commande
		Q.panel.showGroup(["state", "valPropres"]);
		// Supprimer le module actuel
		stage.remove(LunarLander);
		// Insérer la commande de consigne
		stage.insert(Target);
		// Redéfinir le module en commande par retour d'état
		LunarLander = new Q.LunarRetourEtat({state:LunarLander.state, target:Target});
		// Insérer le nouveau module
		stage.insert(LunarLander);
		// Reprendre l'animation
		Q.stage().unpause();
    });

    // Traiter le cas d'un passage à une commande optimale
    Q.input.on('optimal', stage, function(e) {
		// Mettre l'animation en pause
		Q.stage().pause();
		Q.panel.hideAll();
		// Afficher l'état du module et les paramètres de la commande
		Q.panel.showGroup(["state", "commandOptimal"]);
		// Supprimer le module actuel
		stage.remove(LunarLander);
		// Insérer la commande de consigne
		stage.insert(Target);
		// Redéfinir le module en commande optimale
		LunarLander = new Q.LunarOptimal({state:LunarLander.state, target:Target});
		// Insérer le nouveau module
		stage.insert(LunarLander);
		// Contrôler la présence des paramètres de commande
		if(Q.Kn != null)
			// Reprendre l'animation
			Q.stage().unpause();
    });
    
    // Traiter le cas d'une remise à zéro de l'animation
    Q.input.on('reset', stage, function(e) {
		// Mettre l'animation en pause
		Q.stage().pause();
		// Réinitialiser le module
		LunarLander.reset($V([45, 1, 51, -1]));
		// Reprendre l'animation
		Q.stage().unpause();
    });
    
    // Définir la boucle de l'animation
    Q.gameLoop(function(dt) {
      _fixe(dt);
      Q.stageGameLoop(dt);
    });
    
    // Afficher le bouton de retour au menu
    var button = stage.insert(new Q.UI.Button({x:0+50, y:0+30, fill:"#CCCCCC", label:"Menu", type:Q.SPRITE_UI},
      function() {
		  // Réinitialiser l'animation
		  Q.clearStages();
		  // Masquer les panels
		  Q.panel.hide();
		  Q.panel.hideAll();
		  // Afficher le menu principal
		  Q.stageScene('main_menu');
    }));
  });

  // Définir la fin de l'animation
  Q.scene('endLunarGame',function(stage) {
    // Initialiser l'affichage du résultat
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    
    // Calculer la vitesse d'alunissage du module
    var ll = LunarLander;
    var vitImpact = Math.sqrt(ll.state.e(2)*ll.state.e(2) + ll.state.e(4)*ll.state.e(4)).toFixed(2);
    
    // Déterminer le type d'alunissage
    var text_alunissage;
    if(vitImpact < 2)       text_alunissage = "Alunissage en douceur";
    else if(vitImpact < 12) text_alunissage = "Alunissage brutal";
    else                    text_alunissage = "Crash de l'appareil";
    
    // Afficher le résultat
    var label = box.insert(new Q.UI.Text({x:10, y:0, label:text_alunissage + "\nVitesse d'impact: " + vitImpact + "m/s"}));
	// Afficher le bouton de redémarrage
    var playAgain = box.insert(new Q.UI.Button({x:0, y:10 + label.p.h, fill:"#CCCCCC", label:"Relancer", type:Q.SPRITE_UI}));
    playAgain.on("click", function() {
      Q.clearStages();
      Q.stageScene('lunarGame');
    });
    box.fit(20);
  });

  // Définir le chargement de l'animation
  Q.load(["lunar.png", "observer.png", "target.png", "mobile.png"],function() {
    // Afficher le menu principal
    Q.stageScene("main_menu");
  });
});
