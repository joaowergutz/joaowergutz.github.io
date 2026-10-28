(function () {
    'use strict';

    /* Formulário em 3 etapas que monta a mensagem e abre o WhatsApp (nada é enviado ao servidor) */
    const form = document.querySelector('[data-form-contato]');

    if (!form || typeof siteContato === 'undefined') {
        return;
    }

    const etapas = Array.from(form.querySelectorAll('[data-etapa]'));
    const progresso = form.querySelector('[data-progresso]');
    const voltar = form.querySelector('[data-voltar]');
    const avancar = form.querySelector('[data-avancar]');
    const enviar = form.querySelector('[data-enviar]');
    let atual = 0;

    form.classList.add('form-etapas');

    const mostrar = (indice, focar = true) => {
        atual = indice;

        etapas.forEach((etapa, i) => {
            etapa.hidden = i !== indice;
        });

        voltar.hidden = indice === 0;
        avancar.hidden = indice === etapas.length - 1;
        enviar.hidden = indice !== etapas.length - 1;
        progresso.textContent = `Etapa ${indice + 1} de ${etapas.length}`;
        form.style.setProperty('--progresso', `${((indice + 1) / etapas.length) * 100}%`);

        if (focar) {
            etapas[indice].querySelector('input, textarea')?.focus();
        }
    };

    /* A etapa é válida quando os campos obrigatórios estão preenchidos */
    const valida = (indice) => {
        const etapa = etapas[indice];
        const erro = etapa.querySelector('[data-erro]');
        const ok = Array.from(etapa.querySelectorAll('[required]')).every((campo) => {
            if (campo.type === 'radio') {
                return etapa.querySelector(`[name="${campo.name}"]:checked`);
            }

            return campo.value.trim() !== '';
        });

        erro.hidden = ok;

        if (!ok) {
            etapa.querySelector('[required]')?.focus();
        }

        return ok;
    };

    avancar.addEventListener('click', () => {
        if (valida(atual)) {
            mostrar(atual + 1);
        }
    });

    voltar.addEventListener('click', () => mostrar(atual - 1));

    /* Clicar numa opção já leva para a próxima etapa. Pelo teclado (setas, detail 0) só marca, e o avanço é no "Continuar" */
    form.querySelectorAll('input[type="radio"]').forEach((opcao) => {
        opcao.addEventListener('click', (event) => {
            etapas[atual].querySelector('[data-erro]').hidden = true;

            if (event.detail > 0) {
                setTimeout(() => mostrar(atual + 1), 250);
            }
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!valida(atual)) {
            return;
        }

        const dados = new FormData(form);
        const linhas = [
            `Olá, João! Meu nome é ${dados.get('nome').trim()}${dados.get('empresa').trim() ? `, da ${dados.get('empresa').trim()}` : ''}.`,
            '',
            `*Preciso de:* ${dados.get('servico')}`,
            `*Prazo:* ${dados.get('prazo')}`,
        ];

        if (dados.get('site').trim()) {
            linhas.push(`*Site atual:* ${dados.get('site').trim()}`);
        }

        if (dados.get('mensagem').trim()) {
            linhas.push('', dados.get('mensagem').trim());
        }

        window.siteEvento?.('generate_lead', { formulario: 'contato', servico: dados.get('servico') });

        window.open(`https://wa.me/${siteContato.whatsapp}?text=${encodeURIComponent(linhas.join('\n'))}`, '_blank', 'noopener');
    });

    mostrar(0, false);
})();
