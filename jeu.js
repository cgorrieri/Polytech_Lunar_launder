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
  var Q = window.Q =  Quintus().include("Sprites, Scenes, Touch, Input, UI, LunarLaunder, LunarPanel, Observeur").setup("game").controls();

  Q.options = {
    imagePath: "images/",
    audioPath: "audio/",
    dataPath:  "data/",
    audioSupported: [ 'mp3','ogg' ],
    sound: true,
    frameTimeLimit: 40,
    frameTimeApply: 40
  };
  
  // ajout du 'm' pour la commande manuelle
  Q.input.bindKey(77, "manual");
  
  // ajout du 'e' pour la commande par retours d'état
  Q.input.bindKey(69, "retEtat");
  
  // LunarLander
  var LunarLander;

  Q.scene("observe",function(stage) {
    var mobile = new Q.Mobile({x:0, y:0});
    stage.insert(new Q.Observateur({x:15, y:15, angle:3*Math.PI/4, mobile:mobile}));
    stage.insert(mobile);
  });

  // Le jeu
  Q.scene("game",function(stage) {
    // initialisation du panel
    Q.panel = new Q.PanelState();
    LunarLander = new Q.LunarManual({state:$V([45, 1, 51, -1])});
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
    
    Q.input.on('fire', stage, function(e) {
      LunarLander.space();
    });
    
    // change le lunar courrant par un lunar à comande manuelle
    Q.input.on('manual', stage, function(e) {
      stage.remove(LunarLander);
      LunarLander = new Q.LunarManual({state:LunarLander.state});
      stage.insert(LunarLander);
    });
    
    // change le lunar courrant par un lunar à comande par retour d'état
    Q.input.on('retEtat', stage, function(e) {
      stage.remove(LunarLander);
      LunarLander = new Q.LunarRetourEtat({state:LunarLander.state});
      stage.insert(LunarLander);
    });
  });


  // Fin du jeu
  Q.scene('endGame',function(stage) {
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
                                             label: "Play Again" }))  
    button.on("click",function() {
      console.log("click");
      Q.clearStages();
      Q.stageScene('game');
    });
    box.fit(20);
  });

  // Initialisation 
  Q.load(["lunar.png", "observer.png"],function() {
    Q.stageScene("game");
  });
});
