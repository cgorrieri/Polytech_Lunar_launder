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

// Définir le panneau de l'animation
Quintus.Panel = function(Q) {
  Q.GameObject.extend("LeftPanel",{
    // Initialiser le panneau de l'animation
    init: function(p) {
      this.groups = new Array();
      this.id = p.id;
      // Obtenir les sous-panneaux
      var searchEles = document.getElementById(p.id).children;
      for(var i = 0; i < searchEles.length; i++) {
          if(searchEles[i].tagName == 'DIV') {
              this.groups.push(searchEles[i].id);
          }
      }
    },

    // Définir la remise à zéro du panneau
    reset: function(p) { this.init(p); },
    
    // Définir les accesseurs de consultation sur les éléments
    get: function(key) {
      return document.getElementById(key).value;
    },
    
    getRadio: function(key) {
      var radios = document.getElementsByName(key);

      for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
      }
    },
    
    // Définir les accesseurs de modification des éléments
    _setProperty: function(value, key) {
        document.getElementById(key).value = value;
    },

    set: function(properties, value) {
      // Contrôler la multiplicité des propriétés à modifier
      if(Q._isObject(properties)) {
        Q._each(properties,this._setProperty,this);
      } else {
        this._setProperty(value,properties);
      }
    },
    
    // Définir le non-affichage du panneau
    hide: function() {
      this.hideEl(this.id);
    },
    
    // Définir l'affichage du panneau
    show: function() {
      this.showEl(this.id);
    },
    
    // Définir le non-affichage d'un élément
    hideEl: function(el) {
      document.getElementById(el).style.display="none";
    },
    
    // Définir l'affichage d'un élément
    showEl: function(el) {
      document.getElementById(el).style.display="block";
    },
    
    // Définir le non-affichage d'un groupe d'éléments
    hideGroup: function(groups) {
      // Contrôler la multiplicité des éléments à masquer
      if(groups instanceof Array) {
        Q._each(groups,this.hideEl,this);
      } else {
        this.hideEl(groups);
      }
    },
    
    // Définir le non-affichage de tous les éléments
    hideAll: function() {
       Q._each(this.groups,this.hideEl,this);
    },
    
    // Définir l'affichage d'un groupe d'éléments
    showGroup: function(groups) {
      // Contrôler la multiplicité des éléments à masquer
      if(groups instanceof Array) {
        Q._each(groups,this.showEl,this);
      } else {
        this.showEl(groups);
      }
    }
  });

  return Q;
};
