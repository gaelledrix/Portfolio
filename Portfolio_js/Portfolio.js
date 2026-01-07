    const body = document.body;
    const content = document.getElementById('content');
    const homeLink = document.getElementById('homeLink');
    const scrollableContent = document.querySelector('.scrollable-content');
    const footerInfo = document.getElementById('footer-info');
    window.projectContexts = window.projectContexts || {};
      // Fonction principale pour initialiser le défilement automatique
      function initAutoScroll() {
          const gallery = document.querySelector('.gallery-column');
          if (!gallery) return;

          // Déterminer si nous sommes en mode horizontal (responsive) ou vertical (desktop)
          const isHorizontal = window.innerWidth <= 768;
          
          let autoScrollEnabled = true;
          let userInteracting = false;
          let autoScrollTimeout;
          let scrollAnimationId;
          const scrollSpeed = 0.5;

          function smoothAutoScroll() {
              if (!autoScrollEnabled || userInteracting || !gallery) return;
              
              if (isHorizontal) {
                  // Défilement horizontal pour les versions mobiles
                  gallery.scrollLeft += scrollSpeed;
                  
                  // Réinitialisation en boucle infinie
                  if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10) {
                      gallery.scrollLeft = 0;
                  }
              } else {
                  // Défilement vertical pour les versions desktop
                  gallery.scrollTop += scrollSpeed;
                  
                  // Réinitialisation en boucle infinie
                  if (gallery.scrollTop + gallery.clientHeight >= gallery.scrollHeight - 10) {
                      gallery.scrollTop = 0;
                  }
              }
              
              scrollAnimationId = requestAnimationFrame(smoothAutoScroll);
          }

          function stopAutoScroll() {
              cancelAnimationFrame(scrollAnimationId);
          }

          function enableAutoScroll() {
              userInteracting = false;
              autoScrollEnabled = true;
              stopAutoScroll(); // S'assurer qu'aucune animation précédente ne tourne
              smoothAutoScroll();
          }

          function disableAutoScroll() {
              userInteracting = true;
              autoScrollEnabled = false;
              stopAutoScroll();
              clearTimeout(autoScrollTimeout);
          }

          // Détection de l'interaction utilisateur
          gallery.addEventListener('wheel', (e) => {
              disableAutoScroll();
              
              // Réactive le défilement automatique après 3 secondes d'inactivité
              autoScrollTimeout = setTimeout(enableAutoScroll, 3000);
          }, { passive: true });

          gallery.addEventListener('touchstart', disableAutoScroll, { passive: true });
          gallery.addEventListener('touchend', () => {
              autoScrollTimeout = setTimeout(enableAutoScroll, 3000);
          }, { passive: true });

          gallery.addEventListener('mousedown', disableAutoScroll, { passive: true });
          gallery.addEventListener('mouseup', () => {
              autoScrollTimeout = setTimeout(enableAutoScroll, 3000);
          }, { passive: true });

          // Détection quand la souris quitte la galerie
          gallery.addEventListener('mouseleave', () => {
              // Redémarre immédiatement le scroll automatique quand la souris quitte
              enableAutoScroll();
          });

          // Détection quand la souris entre dans la galerie
          gallery.addEventListener('mouseenter', () => {
              // Ne pas désactiver automatiquement, seulement si l'utilisateur interagit
          });

          // Démarrer le défilement automatique
          smoothAutoScroll();
          
          // Retourner une fonction pour arrêter le scroll si nécessaire
          return stopAutoScroll;
      }

    // Initialisation après le chargement des images
    (function(){
        const gallery = document.querySelector('.gallery-column');
        if (!gallery) return;

        // Dupliquer les éléments pour l'effet de boucle infinie
        const items = Array.from(gallery.children);
        items.forEach(item => gallery.appendChild(item.cloneNode(true)));

        const imgs = gallery.querySelectorAll('img');
        let loaded = 0;
        const onImgLoad = () => {
            loaded++;
            if (loaded === imgs.length) {
                // Positionner au milieu selon l'orientation
                if (window.innerWidth <= 768) {
                    // Mode horizontal (responsive)
                    gallery.scrollLeft = gallery.scrollWidth / 2;
                } else {
                    // Mode vertical (desktop)
                    gallery.scrollTop = gallery.scrollHeight / 2;
                }
                initAutoScroll();
            }
        };
        
        if (imgs.length === 0) {
            // Positionner au milieu selon l'orientation
            if (window.innerWidth <= 768) {
                gallery.scrollLeft = gallery.scrollWidth / 2;
            } else {
                gallery.scrollTop = gallery.scrollHeight / 2;
            }
            initAutoScroll();
        } else {
            imgs.forEach(img => {
                if (img.complete) onImgLoad();
                else {
                    img.addEventListener('load', onImgLoad, {once:true});
                    img.addEventListener('error', onImgLoad, {once:true});
                }
            });
        }
    })();

    // Gérer le redimensionnement de la fenêtre
    let stopCurrentScroll;
    window.addEventListener('resize', function() {
        // Arrêter le défilement actuel avant de redimensionner
        if (stopCurrentScroll) {
            stopCurrentScroll();
        }
        
        // Réinitialiser le défilement automatique lors du changement d'orientation
        const gallery = document.querySelector('.gallery-column');
        if (gallery) {
            // Réinitialiser la position
            if (window.innerWidth <= 768) {
                gallery.scrollLeft = gallery.scrollWidth / 2;
            } else {
                gallery.scrollTop = gallery.scrollHeight / 2;
            }
            
            // Relancer l'auto-scroll et stocker la fonction d'arrêt
            stopCurrentScroll = initAutoScroll();
        }
    });
    
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            const parent = img.closest('.gallery-item');
            const projectId = parent.dataset.project;
            const projectDetail = document.getElementById(projectId);
            if(!projectDetail) return;

            // Cache la page d'accueil ET le contenu vide
            document.querySelector('.intro-home').style.display = 'none';
            content.style.display = 'none';
            document.querySelectorAll('.project-detail').forEach(p => p.style.display='none');
            projectDetail.style.display = 'block';
            footerInfo.textContent = projectContexts[projectId] || "";
            
            // Réactive le scroll pour les projets
            scrollableContent.style.overflowY = 'auto';
            scrollableContent.scrollTop = 0;
            
            setTimeout(() => {
                const imagesColumn = projectDetail.querySelector('.images-column');
                const lastImage = imagesColumn?.lastElementChild;
                
                if (lastImage) {
                    // Add a small buffer to ensure we don't scroll past
                    const buffer = 100; // pixels
                    const contentHeight = scrollableContent.scrollHeight;
                    const containerHeight = scrollableContent.clientHeight;
                    
                    // If content is shorter than container, prevent scrolling
                    if (contentHeight <= containerHeight + buffer) {
                        scrollableContent.style.overflowY = 'hidden';
                    } else {
                        scrollableContent.style.overflowY = 'auto';
                    }
                }
            }, 100);

            // ← AJOUTE CETTE LIGNE POUR RETIRER LA CLASSE HOME-PAGE
            body.classList.remove('home-page');
        });
    });

    homeLink.addEventListener('click', () => {
        // RÉAFFICHE la page d'accueil
        document.querySelector('.intro-home').style.display = 'flex'; // ← CHANGÉ de 'grid' à 'flex'
        document.querySelectorAll('.project-detail').forEach(p => p.style.display='none');
        content.style.display = 'block';
        footerInfo.textContent = "";
        
        // Désactive le scroll pour l'accueil
        scrollableContent.style.overflowY = 'hidden';
        scrollableContent.scrollTop = 0;
        
        // AJOUTE la classe home-page pour AFFICHER le copyright
        body.classList.add('home-page');
    });

    // AJOUTE aussi cette ligne au début pour s'assurer que la page d'accueil a la classe au chargement
    document.addEventListener('DOMContentLoaded', function() {
        body.classList.add('home-page');
    });
