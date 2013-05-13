function [K, P0]=riccati(H, ad, bd, R, Q)
    // initialise et résout l'équation récurrente de Riccati 
    // ad et bd sont les matrices d'état et de commande de Lunar Lander
    // K contient [K0;K1; ... KH-2;KH-1] (Ki de dimension 2,4)
    // KH-2 et KH-1 sont calculés pour initialiser, ainsi que PH-2
    // P0 (4,4) est la matrice de Riccati en t=0
    // Q (4,4) et R(2,2) fixent les poids de l'écart quadratique et de l'énergie de commande
    // ad(4,4) et bd(4,2) matrices d'état et de commande du processus discrétisé
    // H est l'horizon de la commande
    //
    G=[ad*bd bd]; // matrice de gouvernabilité carrée et inversible
    N = inv(G)*ad^2; // l'état final est nul
    K= N(1:2,:); // donne KH-2
    //pour trouver KH-1, on exprime que l'état final est nul dans l'équation d'état
    //K= [K; (bd'*inv(bd*bd'))*ad]; //donne le warning "bd mal conditionnée"
    K=[K; pinv(bd)*ad]; // équivalent, sans warning "bd est mal conditionnée" 
    // calcul de PH-2
    P0= N'*N
    RR= [R,zeros(R);zeros(R),R]
    P0= Q+N'*RR*N+(ad-bd*N(1:2,:))'*Q*(ad-bd*N(1:2,:));
    X=  P0;
    disp(bd)
    disp(pinv(bd))
    disp(bd')
    //résolution itérative
    for k = 1:H-2 // résolution
      K1= inv(R+bd'*P0*bd)*bd'*P0*ad;
      
      P0= ad'*P0*ad + Q - ad'*P0*bd*K1;
      X= [P0; X];
      K= [K1 ;K];
    end
endfunction