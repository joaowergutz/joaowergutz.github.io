(function () {
    'use strict';

    /* Header ao rolar */
    const header = document.querySelector('.site-header');

    const atualizarHeader = () => {
        header?.classList.toggle('rolou', window.scrollY > 40);
    };

    atualizarHeader();
    window.addEventListener('scroll', atualizarHeader, { passive: true });

    /* Botão flutuante do WhatsApp (desktop) e barra de contato (celular): aparecem após rolar
       e somem no rodapé (não cobrem os botões do banner nem os créditos) */
    const flutuantes = document.querySelectorAll('.whatsapp-flutuante, .barra-contato');
    const rodape = document.querySelector('.site-footer');
    let rodapeVisivel = false;

    const atualizarFlutuante = () => {
        flutuantes.forEach((el) => el.classList.toggle('visivel', window.scrollY > 600 && !rodapeVisivel));
    };

    if (flutuantes.length) {
        if (rodape && 'IntersectionObserver' in window) {
            new IntersectionObserver(([entrada]) => {
                rodapeVisivel = entrada.isIntersecting;
                atualizarFlutuante();
            }).observe(rodape);
        }

        atualizarFlutuante();
        window.addEventListener('scroll', atualizarFlutuante, { passive: true });
    }

    /* Menu mobile */
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('menu-mobile');

    /* Com o menu aberto, o resto da página fica inerte (fora do Tab e do leitor de tela) */
    const fundo = () => document.querySelectorAll('main, .site-footer, .whatsapp-flutuante, .screen-reader-text, .logo, .botao-h, .icone-h, .barra-contato');

    const fecharMenu = () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
        document.body.classList.remove('menu-aberto');
        menu.hidden = true;
        fundo().forEach((el) => { el.inert = false; });
    };

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const aberto = toggle.getAttribute('aria-expanded') === 'true';

            if (aberto) {
                fecharMenu();
                return;
            }

            menu.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Fechar menu');
            document.body.classList.add('menu-aberto');
            fundo().forEach((el) => { el.inert = true; });
            menu.querySelector('a')?.focus();
        });

        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', fecharMenu));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !menu.hidden) {
                fecharMenu();
                toggle.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992 && !menu.hidden) {
                fecharMenu();
            }
        });
    }

    /* Dúvidas frequentes: abre uma pergunta por vez */
    document.querySelectorAll('[data-faq]').forEach((faq) => {
        faq.querySelectorAll('details').forEach((item) => {
            item.addEventListener('toggle', () => {
                if (!item.open) {
                    return;
                }

                faq.querySelectorAll('details[open]').forEach((outro) => {
                    if (outro !== item) {
                        outro.open = false;
                    }
                });
            });
        });
    });

    /* Análise gratuita: monta a mensagem com o endereço do site e abre o WhatsApp */
    document.querySelectorAll('[data-form-analise]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const site = form.querySelector('[name="text"]').value.trim();

            if (!site) {
                return;
            }

            event.preventDefault();

            const mensagem = `Olá, João! Quero uma análise gratuita do meu site: ${site}`;

            window.siteEvento?.('generate_lead', { formulario: 'analise' });

            window.open(`${form.action}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
        });
    });

    /* Copiar e-mail */
    document.querySelectorAll('[data-copiar]').forEach((botao) => {
        botao.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(botao.dataset.copiar);
                botao.classList.add('copiado');
                botao.setAttribute('aria-label', 'E-mail copiado');
                setTimeout(() => {
                    botao.classList.remove('copiado');
                    botao.setAttribute('aria-label', 'Copiar e-mail');
                }, 2000);
            } catch (erro) {
                window.location.href = 'mailto:' + botao.dataset.copiar;
            }
        });
    });
})();
