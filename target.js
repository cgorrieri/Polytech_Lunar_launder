Quintus.Target = function(Q) {
  
  // Mobile ayant une position de d�part et une vitesse
  Q.Sprite.extend("Target",{
    init: function(p) {
      this._super(p, {});
      // Position math�matique en m�tres
      this.X = p.x;
      this.Y = p.y;
      // Vitesse en m/s
      this.vx = (p.vx ? p.vx : 0);
      this.vy = (p.vy ? p.vy : 0);
    },
    step: function(dt) {
      // x(t+1) = x(t) + vx(t)*dt
      this.X += this.vx * Q.Te;
      // y(t+1) = y(t) + vy(t)*dt
      this.Y += this.vy * Q.Te;
      // Ajustage de la position � l'�cran
      this.p.x = Q.XtoPx(this.X);
      this.p.y = Q.YtoPy(this.Y);
    }
  });

  return Q;
}