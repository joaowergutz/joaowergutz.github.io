(function () {
    'use strict';

    const html = document.documentElement;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        html.classList.remove('anime');
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    try {
        gsap.registerPlugin(ScrollTrigger);

        /* Smooth scroll (Lenis) sincronizado com o ScrollTrigger */
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                lerp: 0.09,
            });

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);

            /* Trava a rolagem com o menu mobile aberto */
            new MutationObserver(() => {
                if (document.body.classList.contains('menu-aberto')) {
                    lenis.stop();
                } else {
                    lenis.start();
                }
            }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

            /* Âncoras internas (#projetos) com a rolagem suave */
            document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
                link.addEventListener('click', (event) => {
                    const alvo = document.querySelector(link.getAttribute('href'));

                    if (alvo && !link.classList.contains('screen-reader-text')) {
                        event.preventDefault();
                        lenis.scrollTo(alvo, { offset: -80 });
                    }
                });
            });

            window.siteLenis = lenis;
        }

        /* Elementos que entram ao rolar (os que já estão na tela entram logo no carregamento) */
        ScrollTrigger.batch('[data-anime]:not(.hero [data-anime]):not(.page-hero [data-anime])', {
            start: 'top 90%',
            once: true,
            onEnter: (elementos) => {
                gsap.fromTo(
                    elementos,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        stagger: 0.08,
                        overwrite: true,
                    }
                );
            },
        });

        /* Brilho do banner acompanha a rolagem */
        gsap.to('.hero-brilho', {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });

        /* Celular do card de projeto sobe um pouco mais rápido que o navegador (profundidade) */
        gsap.utils.toArray('.card-projeto .mockup-celular').forEach((celular) => {
            gsap.fromTo(
                celular,
                { yPercent: 12 },
                {
                    yPercent: -8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: celular.closest('.card-projeto'),
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                }
            );
        });

        /* Lista de serviços: cada linha acende ao passar pelo meio da tela */
        gsap.utils.toArray('[data-acende]').forEach((linha) => {
            ScrollTrigger.create({
                trigger: linha,
                start: 'top 70%',
                end: 'bottom 30%',
                toggleClass: { targets: linha, className: 'acesa' },
            });
        });


        /* Recalcula as posições depois que as imagens terminam de carregar */
        window.addEventListener('load', () => ScrollTrigger.refresh());

        window.siteAnime = true;
    } catch (erro) {
        /* Qualquer falha: mostra todo o conteúdo sem animação */
        html.classList.remove('anime');
    }
})();
