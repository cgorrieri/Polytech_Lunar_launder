// # Quintus moving ball example
//
// [Run the example](../examples/ball/index.html)
//
// This is one of the simplest possible examples of using 
// Quintus that doesn't use the scene/stage functionality, 
// but rather just creates a single sprite and steps and 
// draws that sprite
//
// The goal of the example is to demonstrate the modularity
// of the engine and the ability to only include the components
// you actually need.


// Wait for the load event to start the game.
window.addEventListener("load",function() {

  // Create an instance of the engine, including only
  // the `Sprites` module, and then call setup to create a
  // canvas element on the page. If you already have a 
  // canvas element in your page, you can pass the element
  // or it's id as the first parameter to set up as well.
  var Q = window.Q =  Quintus().include("Sprites, Scenes, Touch, Input, UI, Target, Panel, LunarLaunder, Observeur").setup("game").controls().touch();
  Q.options = {
    imagePath: "images/",
    audioPath: "audio/",
    dataPath:  "data/",
    audioSupported: [ 'mp3','ogg' ],
    sound: true,
    frameTimeLimit: 40
  };
  
  // Initialisation du panel
  Q.panel = new Q.LeftPanel({id:"panel"});
  Q.panel.hide();
  
  // TOUCHE CLAVIER
  // 'm' pour la commande manuelle
  Q.input.bindKey(77, "manual");
  // 'e' pour la commande par retours d'état
  Q.input.bindKey(69, "retEtat");
  // 'h' pour la commande optimale
  Q.input.bindKey(72, "optimal");
  // 'r' pour le reset
  Q.input.bindKey(82, "reset");
  
  // Valeurs propres pour la commande par retour d'état
  Q.valPropres = $M([[0.33,		1.11,		0.0,	0.0],
                      [0.0,		0.0,		0.33,	1.11]]);
  // Affichage de la matrice
  Q.panel.set({"11":0.33,	"12":1.11,"13":0.0,	"14":0.0,
               "21":0.0,	"22":0.0,	"23":0.33,"24":1.11});
  // Recupere les nouvelles valeurs propres dans le panel
  Q.setValPropres = function() {
    Q.valPropres = $M([[parseFloat(Q.panel.get("11")),parseFloat(Q.panel.get("12")),parseFloat(Q.panel.get("13")),parseFloat(Q.panel.get("14"))],
                      [parseFloat(Q.panel.get("21")),parseFloat(Q.panel.get("22")),parseFloat(Q.panel.get("23")),parseFloat(Q.panel.get("24"))]]);
  }
  
  // Tableau des valeurs propres pour la commande optimale
  Q.Kn = null;
  
  // Temps d'échantillonnage
  Q.Te = 0.04;
  // Affichage du Te
  Q.panel.set({"te" : (Q.Te*1000).toFixed(0)});
  
  // Echel d'afichage et px/metre
  Q.ScalePM = 4;
  
  // Permet de fixer dt à Te pour avoir un temps cohérent
  _fixe = function(dt) {
      // fixe dt à Te
      lastGameLoopFrame = new Date().getTime()+(dt*1000);
      var now;
      do{
        now = new Date().getTime();
        dt = now - Q.lastGameLoopFrame;
      } while(dt < Q.options.frameTimeLimit);
      if(dt>= Q.options.frameTimeLimit) return Q.options.frameTimeLimit;
      return dt;
    }
  
  // LunarLander
  var LunarLander;
  // Consigne
  var Target;
  
  Q.XtoPx = function(x) {return x * Q.ScalePM;}
  Q.YtoPy = function(y) {return Q.height - y * Q.ScalePM;}
  
  // Menu principale
  Q.scene("main_menu",function(stage) {
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    // Lance la simulation de Lunar Lander
    var lunarGame = box.insert(
      new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
        label: "Loi de commandes", type: Q.SPRITE_UI },
        function() {
        Q.clearStages();
        Q.panel.show();
        Target = new Q.Target({x:0,y:0, asset:"target.png"});
        Q.panel.showGroup("state");
        Q.stageScene('lunarGame');
        }));
    // Lance l'observation du mobile
    var observerGame = box.insert(
      new Q.UI.Button({ x: 0, y: 10+lunarGame.p.h, fill: "#CCCCCC",
        label: "Poursuite", type: Q.SPRITE_UI },
        function() {
        Q.clearStages();
        Q.panel.show();
        Q.panel.showGroup("observer");
        Q.stageScene('observerGame');
        }));
    box.fit(20);
  });
  
  Q.ObserverCommande = "ret";
  
  // Observation de la trajectoire d'un mobile
  Q.scene("observerGame",function(stage) {
    // Initialisation du mobile
    var mobile = new Q.Target({x:50, y:50, vx:2,vy:2, asset:"mobile.png", scale:0.3});
    stage.insert(mobile);
    // Affichage de l'état initial du mobile
    Q.panel.set({"reel_mobile_x_value":50,	"reel_mobile_x_speed":2,
               "reel_mobile_y_value":50,	"reel_mobile_y_speed":2});
    // Initialisation de l'observeur
    var observer = new Q.Observateur({x:15, y:65, angle:Math.PI/2, mobile:mobile});
    stage.insert(observer);
    
    // boocle de jeu
    Q.gameLoop(function(dt) {
      _fixe(dt);
      Q.stageGameLoop(dt);
    });
    
    // Touche 'e' : commande par retour d'état
    Q.input.on('retEtat', stage, function(e) {
      if(Q.ObserverCommande != "ret") {
        Q.ObserverCommande = "ret"
        Q.stageScene('observerGame');
      }
    });

    // Touche 'h' : Change le lunar courrant par un lunar à comande optimale
    Q.input.on('optimal', stage, function(e) {
      if(Q.ObserverCommande != "opt") {
        Q.ObserverCommande = "opt"
        Q.stageScene('observerGame');
      }
    });
    
    // Bouton permettant le retour au menu
    var button = stage.insert(new Q.UI.Button({ x: 0+50, y: 0+30, fill: "#CCCCCC",
      label: "Menu", type: Q.SPRITE_UI },
      function() {
      Q.clearStages();
      Q.panel.hide();
      Q.panel.hideAll();
      Q.stageScene('main_menu');
    }));
  });
  
  // Simulation Lunar lander
  Q.scene("lunarGame",function(stage) {
    // Si lunar n'est pas defini alors on le creer par défault en commande manuelle
    if(!LunarLander)
      LunarLander = new Q.LunarManual({state:$V([45, 1, 51, -1])});
    else  {// Sinon on le reset
      LunarLander.reset($V([45, 1, 51, -1]));
      if(LunarLander.type=="ret" || LunarLander.type=="opt")
        stage.insert(Target);
    }
    // On ajoute le module lunaire à la scène
    stage.insert(LunarLander);
    
    addTargetX = function(ax) {
      if(LunarLander.Cn.e(1) + ax >= 0) {
        LunarLander.Cn = LunarLander.Cn.add([ax, 0, 0, 0]);
        Target.X += ax;
       }
    };
    addTargetY = function(ay) {
      if(LunarLander.Cn.e(3) + ay >= 0) {
        LunarLander.Cn = LunarLander.Cn.add([0, 0, ay, 0]);
        Target.Y += ay;
      }
    };
    
    // Affectation des touches
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
    // La touche espace
    Q.input.on('fire', stage, function(e) {
      if(LunarLander.type == "man") {
        LunarLander.space();
      }
    });
    
    // Touche 'm' : Change le lunar courrant par un lunar à comande manuelle
    Q.input.on('manual', stage, function(e) {
      Q.stage().pause();
      Q.panel.hideAll();
      Q.panel.showGroup("state");
      stage.remove(Target);
      stage.remove(LunarLander);
      LunarLander = new Q.LunarManual({state:LunarLander.state});
      stage.insert(LunarLander);
      Q.stage().unpause();
    });
    
    // Touche 'e' : Change le lunar courrant par un lunar à comande par retour d'état
    Q.input.on('retEtat', stage, function(e) {
      Q.stage().pause();
      Q.panel.hideAll();
      Q.panel.showGroup(["state","valPropres"]);
      stage.remove(LunarLander);
      stage.insert(Target);
      LunarLander = new Q.LunarRetourEtat({state:LunarLander.state, target:Target});
      stage.insert(LunarLander);
      Q.stage().unpause();
    });

    // Touche 'h' : Change le lunar courrant par un lunar à comande optimale
    Q.input.on('optimal', stage, function(e) {
      Q.stage().pause();
      Q.panel.hideAll();
      Q.panel.showGroup(["state","commandOptimal"]);
      stage.remove(LunarLander);
      stage.insert(Target);
      LunarLander = new Q.LunarOptimal({state:LunarLander.state, target:Target});
      stage.insert(LunarLander);
      if(Q.Kn != null) // Si les valeurs de la commande optimale sont chargées alors on continue
        Q.stage().unpause();
    });
    
    // Touche 'r' : Replace le Lunar à son état d'origine
    Q.input.on('reset', stage, function(e) {
      Q.stage().pause();
      LunarLander.reset($V([45, 1, 51, -1]));
      Q.stage().unpause();
    });
    
    // Boucle de jeu
    Q.gameLoop(function(dt) {
      // fixe Te
      _fixe(dt);
      Q.stageGameLoop(dt);
    });
    
    // Bouton permettant le retour au menu
    var button = stage.insert(new Q.UI.Button({ x: 0+50, y: 0+30, fill: "#CCCCCC",
      label: "Menu", type: Q.SPRITE_UI },
      function() {
        Q.clearStages();
        Q.panel.hide();
        Q.panel.hideAll();
        Q.stageScene('main_menu');}
    ));
  });

  // Fin du jeu, lorsque Lunar alunit
  Q.scene('endLunarGame',function(stage) {
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    
    // Calcul de la vitesse d'alunissage
    var ll = LunarLander;
    var vitImpact = Math.sqrt(ll.state.e(2)*ll.state.e(2) + ll.state.e(4)*ll.state.e(4)).toFixed(2);
    
    // Text en fonction de la vitesse
    var text_alunissage;
    if(vitImpact < 2)       text_alunissage = "Alunissage en douceur";
    else if(vitImpact < 12) text_alunissage = "Alunissage brutal";
    else                    text_alunissage = "Crash de l'appareil";
    
           
    var label = box.insert(new Q.UI.Text({x:10, y: 0, 
                                          label: text_alunissage+"\nVitesse d'impact: "+vitImpact+"m/s" }));
    var playAgain = box.insert(new Q.UI.Button({ x: 0, y: 10+label.p.h, fill: "#CCCCCC",
                                             label: "Play Again", type: Q.SPRITE_UI }));
    playAgain.on("click", function() {
      Q.clearStages();
      Q.stageScene('lunarGame');
    });
    box.fit(20);
  });

  // Initialisation
  // Chargement des images
  Q.load(["lunar.png", "observer.png", "target.png", "mobile.png"],function() {
    // Lancement du menu principale
    Q.stageScene("main_menu");
  });
});
