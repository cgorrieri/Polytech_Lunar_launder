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
  var Q = window.Q =  Quintus().include("Sprites, Scenes, Touch, Input, UI, LunarLaunder, LunarPanel, Observeur").setup("game").controls().touch();
  Q.options = {
    imagePath: "images/",
    audioPath: "audio/",
    dataPath:  "data/",
    audioSupported: [ 'mp3','ogg' ],
    sound: true,
    frameTimeLimit: 40
  };
  
  // ajout du 'm' pour la commande manuelle
  Q.input.bindKey(77, "manual");
  
  // ajout du 'e' pour la commande par retours d'état
  Q.input.bindKey(69, "retEtat");

  // ajout du 'h' pour la commande optimale
  Q.input.bindKey(72, "optimal");
  
  // ajout du 'r' pour le reset
  Q.input.bindKey(82, "reset");
  
  Q.valPropres = $M([[0.33,		1.11,		0.0,	0.0],
                      [0.0,		0.0,		0.33,	1.11]]);
  
  Q.Te = 0.04;
  Q.ScalePM = 4;

  Q.Kn = null;
  // Set ValPropres to panel
  // initialisation du panel
  Q.panel = new Q.PanelState();
  Q.panel.set({"11":0.33,	"12":1.11,"13":0.0,	"14":0.0,
               "21":0.0,	"22":0.0,	"23":0.33,"24":1.11})
               
  Q.setValPropres = function() {
    Q.valPropres = $M([[parseFloat(Q.panel.get("11")),parseFloat(Q.panel.get("12")),parseFloat(Q.panel.get("13")),parseFloat(Q.panel.get("14"))],
                      [parseFloat(Q.panel.get("21")),parseFloat(Q.panel.get("22")),parseFloat(Q.panel.get("23")),parseFloat(Q.panel.get("24"))]]);
  }
  
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

  Q.scene("observerGame",function(stage) {
    var mobile = new Q.Mobile({x:50, y:50, asset:"observer.png", scale:0.2});
    var observer = new Q.Observateur({x:15, y:65, angle:Math.PI/2, mobile:mobile});
    stage.insert(observer);
    stage.insert(mobile);
    
    Q.gameLoop(function(dt) {
      _fixe(dt);
      Q.stageGameLoop(dt);
    });
    
    // Touche 'r' : Replace Lunar à son état d'origine
    Q.input.on('reset', stage, function(e) {
      Q.stage().pause();
      // A faire
      Q.stage().unpause();
    });
    
    // Bouton permettant le retour au menu
    var button = stage.insert(new Q.UI.Button({ x: 0+50, y: 0+30, fill: "#CCCCCC",
      label: "Menu", type: Q.SPRITE_UI },
      function() {
      Q.clearStages();
      Q.stageScene('main_menu');
    }));
  });

  Q.scene("main_menu",function(stage) {
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    
    var lunarGame = box.insert(
      new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
             label: "Loi de commandes", type: Q.SPRITE_UI },
             function() {
              Q.clearStages();
              Target = new Q.Target({x:0,y:0, asset:"target.png"});
              Q.panel.show("state");
              Q.stageScene('lunarGame');
             }));
    var observerGame = box.insert(new Q.UI.Button({ x: 0, y: 10+lunarGame.p.h, fill: "#CCCCCC",
                                             label: "Poursuite", type: Q.SPRITE_UI },
                                             function() {
                                              Q.clearStages();
                                              Q.panel.show("observer");
                                              Q.stageScene('observerGame');
                                             }));
    box.fit(20);
  });
  
  // Le jeu avec Lunar lander
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
    
    // Affectation des touches
    Q.input.on('up', stage, function(e) {
      LunarLander.up();
    });
    
    Q.input.on('down', stage, function(e) {
      LunarLander.down();
    });
    
    Q.input.on('left', stage, function(e) {
      LunarLander.left();
    });
    
    Q.input.on('right', stage, function(e) {
      LunarLander.right();
    });
    
    // La touche espace
    Q.input.on('fire', stage, function(e) {
      LunarLander.space();
    });
    
    // Touche 'm' : Change le lunar courrant par un lunar à comande manuelle
    Q.input.on('manual', stage, function(e) {
      Q.stage().pause();
      Q.panel.hide("valPropres");
      Q.panel.hide("commandOptimal");
      stage.remove(Target);
      stage.remove(LunarLander);
      LunarLander = new Q.LunarManual({state:LunarLander.state});
      stage.insert(LunarLander);
      Q.stage().unpause();
    });
    
    // Touche 'e' : Change le lunar courrant par un lunar à comande par retour d'état
    Q.input.on('retEtat', stage, function(e) {
      Q.stage().pause();
      Q.panel.show("valPropres");
      Q.panel.hide("commandOptimal");
      stage.remove(LunarLander);
      stage.insert(Target);
      LunarLander = new Q.LunarRetourEtat({state:LunarLander.state, target:Target});
      stage.insert(LunarLander);
      Q.stage().unpause();
    });

    // Touche 'e' : Change le lunar courrant par un lunar à comande par retour d'état
    Q.input.on('optimal', stage, function(e) {
      Q.stage().pause();
      Q.panel.hide("valPropres");
      Q.panel.show("commandOptimal");
      stage.remove(LunarLander);
      stage.insert(Target);
      LunarLander = new Q.LunarOptimal({state:LunarLander.state, target:Target});
      stage.insert(LunarLander);
      if(Q.Kn != null) // Si les valeurs de la commande optimale sont chargées
        Q.stage().unpause();
    });
    
    // Touche 'r' : Replace Lunar à son état d'origine
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
      Q.stageScene('main_menu');
    }));
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
    var button = box.insert(new Q.UI.Button({ x: 0, y: 10+label.p.h, fill: "#CCCCCC",
                                             label: "Play Again", type: Q.SPRITE_UI }));
    button.on("click", function() {
      Q.clearStages();
      Q.stageScene('lunarGame');
    });
    box.fit(20);
  });

  // Initialisation 
  Q.load(["lunar.png", "observer.png", "target.png"],function() {
    Q.stageScene("main_menu");
  });
});
