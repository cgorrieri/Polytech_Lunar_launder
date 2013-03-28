Quintus.Observeur = function(Q) {
  // Observateur qui va definir la trajectoire du Mobile
  Q.Sprite.extend("Observateur",{
    init: function(p) {
      this._super(p, { asset: "observer.png",
        x: 45,
        y: 51,
        scale: 0.5
      });
      this.X = this.p.x;
      this.Y = this.p.y;
      this.V = 10;
      this.teta = 0;
    },
    // fonction appelé à cheque boucle du jeu
    step: function(dt) {
      this.teta += 0.03;
      this.vx = this.V * Math.cos(this.teta);
      this.vy = this.V * Math.sin(this.teta);

      this.X += this.vx * dt;
      
      this.Y += this.vy * dt;
      
      this.p.x = this.X * 4;
      this.p.y = Q.height - this.Y*4;
    }
  });

  // Mobile suivant une trajectoire linéaire
  Q.Sprite.extend("Mobile",{
    init: function(p) {
      this._super(p, { asset: "observer.png",
        x: 45,
        y: 51,
        scale:0.25
      });
      this.X = this.Y = 0;
      this.vx = 5;
      this.vy = 5;
      // fonction appelé à cheque boucle du jeu
    },
    step: function(dt) {
      this.X += this.vx * dt;
      
      this.Y += this.vy * dt;
      
      this.p.x = this.X * 4;
      this.p.y = Q.height - this.Y*4;
      console.log(this.p.x);
    }
  });
  return Q;
};