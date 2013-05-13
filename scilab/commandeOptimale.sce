//script ‘commandeOptimale.sce’ 
// équations de Lunar Lander en temps continu
Te=0.04       // (s) période d'échantillonnage
mvide= 6839;  // masse à vide (kg)
mfuel=816.5   // masse de carburant (kg)
m = mvide + mfuel // masse totale
ve=4500;    // vitesse d'éjection des gaz (en m/s), 
erg = ve/m; // coefficient de poussée 
maxThrust = 50; //débit de carburant maximum (en kg/s) 
g= 1.6; // attraction lunaire (en m/s^2)
x0=[45, 1, 51, -1]'; // état initial de Lunar Lander
A= [0, 1, 0, 0
    0, 0, 0, 0
    0, 0, 0, 1
    0, 0, 0, 0]; // matrice d'état (4x4)
B=[0,    0
   erg,  0
   0,    0
   0,  erg];  // matrice de commande, 2 commandes
C=eye(4,4);   // matrice d'observation, quatre sorties
D=zeros(4,2); //matrice de couplage entrée sortie
lem=syslin('c',A,B,C,D);
// discretisation du processus d'alunissage
lemd=dscr(lem,Te);
ad=lemd('a');
bd=lemd('b');

// calcul de la loi de commande
funcprot(0) //pour redéfinir ‘riccati’ sans warning
//exec('riccati.sci'); 
H=100; //horizon
Q=0*eye(4,4); // poids de l'écart quadratique
R=eye(2,2)    // poids de l'énergie de commande
[K,P0]=riccati(H,ad,bd,R,Q);
//
//écrire K dans le fichier 'K.txt'
fileid='K.txt'
fp=mopen(fileid,'w');
Kt=K';
Ks=string(K(1));
for k=2:length(K),
    Ks=Ks+','+string(Kt(k));
end
mputstr(Ks,fp);
mclose(fp);