Quintus.Panel = function(Q) {
  // Element qui permet de modifier l'affichage du panel
  Q.GameObject.extend("LeftPanel",{
    init: function(p) {
      this.groups = new Array();
      this.id = p.id;
      // Récupère tous les sous panel
      var searchEles = document.getElementById(p.id).children;
      for(var i = 0; i < searchEles.length; i++) {
          if(searchEles[i].tagName == 'DIV') {
              this.groups.push(searchEles[i].id);
          }
      }
    },

    // Remet à zero toutes les valeurs des champs
    reset: function(p) { this.init(p); },
    
    // Retourne la valeur du champ avec l'id property
    get: function(key) {
      return document.getElementById(key).value;
    },
    
    // Définit la valeur d'un champs
    _setProperty: function(value,key) {
        document.getElementById(key).value = value;
    },

    // Definit la valeur de un ou plusieurs champs
    set: function(properties,value) {
      // Si c'est un hash de valeurs
      if(Q._isObject(properties)) {
        Q._each(properties,this._setProperty,this);
      } else {
        this._setProperty(value,properties);
      }
    },
    
    // Cache le panel
    hide: function() {
      this.hideEl(this.id);
    },
    // Affiche le panel
    show: function() {
      this.showEl(this.id);
    },
    hideEl: function(el) {
      document.getElementById(el).style.display="none";
    },
    showEl: function(el) {
      document.getElementById(el).style.display="block";
    },
    // Cache un ou plusieur sous panel
    hideGroup: function(groups) {
      if(groups instanceof Array) {
        Q._each(groups,this.hideEl,this);
      } else {
        this.hideEl(groups);
      }
    },
    // Cache tous les sous panels
    hideAll: function() {
       Q._each(this.groups,this.hideEl,this);
    },
    
    // Affiche un ou plusieur sous panel
    showGroup: function(groups) {
      if(groups instanceof Array) {
        Q._each(groups,this.showEl,this);
      } else {
        this.showEl(groups);
      }
    }
  });

  return Q;
};
