/*
***************************************************
* panel.js                                        *
*     Panneau de l'animation                      *
*                                                 *
* Auteurs :                                       *
*   Loïc FAIZANT, Cyril GORRIERI, Maurice RAMBERT *
*                                                 *
* Ecole Polytech' Nice Sophia Antipolis           *
* Sciences Informatiques - 4e année               *
***************************************************
*/

// Définir d'un mobile à observer
Quintus.Target = function(Q) {
  Q.Sprite.extend("Target",{
    // Initialiser le mobile
    init: function(p) {
      this._super(p, {});
      
      // Définir la position du mobile
      this.X = p.x;
      this.Y = p.y;
      // Définir la vitesse du mobile
      this.vx = (p.vx ? p.vx : 0);
      this.vy = (p.vy ? p.vy : 0);
    },
    
    // Définir la boucle du mobile
    step: function(dt) {
      // Calculer la nouvelle position du mobile
      this.X += this.vx * Q.Te;
      this.Y += this.vy * Q.Te;
      
      // Afficher la nouvelle position du mobile
      this.p.x = Q.XtoPx(this.X);
      this.p.y = Q.YtoPy(this.Y);
    }
  });

  return Q;
}