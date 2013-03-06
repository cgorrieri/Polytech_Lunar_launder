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
  var Q = window.Q =  Quintus().include("Sprites, Scenes, Touch, UI, LunarLaunder, LunarPanel").setup("game");

  Q.options = {
    imagePath: "images/",
    audioPath: "audio/",
    dataPath:  "data/",
    audioSupported: [ 'mp3','ogg' ],
    sound: true,
    frameTimeLimit: 40,
    frameTimeApply: 40
  };

  // Le jeu
  Q.scene("game",function(stage) {
    // initialisation du panel
    Q.panel = new Q.PanelState();

    stage.insert(new Q.Lunar());
  });


  // Fin du jeu
  Q.scene('endGame',function(stage) {
    var box = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    
    var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                             label: "Play Again" }))         
    var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                          label: stage.options.label }));
    button.on("click",function() {
      console.log("click");
      Q.clearStages();
      Q.stageScene('game');
    });
    box.fit(20);
  });

  // Initialistaion 
  Q.load(["lunar.png"],function() {
    Q.stageScene("game");
  });
});
