const btnAdicionar = document.querySelector('.btn-adicionar');
const btnLimpar = document.querySelector('.btn-limpar');
const btnGerar = document.querySelector('.btn-gerar');
const lista = document.getElementById('lista');
const badge = document.getElementById('total-atividades');

const inputNome = document.getElementById('nome-atv');
const inputValor = document.getElementById('valor-atv');
const inputTempo = document.getElementById('tempo-atv');

let atividades = [];

function parsearHoras(tempo) {
    const str = tempo.trim().toLowerCase();

    const combinado = str.match(/^(\d+(?:\.\d+)?)h(\d+(?:\.\d+)?)m$/);
    if (combinado) return parseFloat(combinado[1]) + parseFloat(combinado[2]) / 60;

    const horas = str.match(/^(\d+(?:\.\d+)?)h$/);
    if (horas) return parseFloat(horas[1]);

    const minutos = str.match(/^(\d+(?:\.\d+)?)m$/);
    if (minutos) return parseFloat(minutos[1]) / 60;

    const puro = str.match(/^(\d+(?:\.\d+)?)$/);
    if (puro) return parseFloat(puro[1]);

    return null;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizar() {
    if (atividades.length === 0) {
        lista.innerHTML = `
            <p class="feedback-vazio">Nenhuma atividade adicionada ainda.</p>
            <p class="feedback-vazio">Preencha o formulário acima para começar.</p>
        `;
    } else {
        lista.innerHTML = '';
        atividades.forEach((atv, index) => {
            const item = document.createElement('article');
            item.className = 'item-lista';
            item.innerHTML = `
                <div>
                    <strong>${atv.nome}</strong> —
                    <span style="color: #383CFF; font-size: 1.15rem; font-weight: 700;">${formatarMoeda(atv.total)}</span>
                </div>
                <div style="display:flex;gap:12px;align-items:center;">
                    <button onclick="editarItem(${index})" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;" title="Editar">
                        <img src="../img/ferramenta-lapis.png" alt="Editar" style="width:18px;height:auto;">
                    </button>
                    <button onclick="removerItem(${index})" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;" title="Excluir">
                        <img src="../img/x.png" alt="Excluir" style="width:16px;height:auto;">
                    </button>
                </div>
            `;
            lista.appendChild(item);
        });
    }

    badge.innerText = atividades.length;
}

btnAdicionar.addEventListener('click', () => {
    const nome = inputNome.value.trim();
    const valor = inputValor.value.trim();
    const tempo = inputTempo.value.trim();

    if (!nome || !valor || !tempo) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const custoPorHora = parseFloat(valor);
    const horas = parsearHoras(tempo);

    if (isNaN(custoPorHora) || custoPorHora <= 0) {
        alert('Informe um custo por hora válido!');
        return;
    }

    if (horas === null || isNaN(horas) || horas <= 0) {
        alert('Tempo inválido! Use formatos como: 2h, 30m, 1.5h, 1h30m ou número (horas).');
        return;
    }

    const total = custoPorHora * horas;

    atividades.push({
        nome,
        custoPorHora,
        horas,
        horasFormatado: tempo,
        total,
    });

    inputNome.value = '';
    inputValor.value = '';
    inputTempo.value = '';
    inputNome.focus();

    renderizar();
});

window.removerItem = function (index) {
    atividades.splice(index, 1);
    renderizar();
};

window.editarItem = function (index) {
    const atv = atividades[index];

    inputNome.value = atv.nome;
    inputValor.value = atv.custoPorHora;
    inputTempo.value = atv.horasFormatado;

    atividades.splice(index, 1);
    renderizar();

    inputNome.focus();
};

btnLimpar.addEventListener('click', () => {
    if (atividades.length === 0) return;
    if (confirm('Tem certeza que deseja apagar tudo?')) {
        atividades = [];
        renderizar();
    }
});

btnGerar.addEventListener('click', () => {
    if (atividades.length === 0) {
        alert('Adicione pelo menos uma atividade antes de gerar o orçamento!');
        return;
    }

    const painel = document.getElementById('orcamento-painel');
    const corpo = document.getElementById('orcamento-corpo');
    const totalGeralEl = document.getElementById('orcamento-total-geral');
    const dataEl = document.getElementById('orcamento-data');

    const agora = new Date();
    dataEl.textContent = agora.toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    corpo.innerHTML = '';
    let totalGeral = 0;
    atividades.forEach((atv, i) => {
        totalGeral += atv.total;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${atv.nome}</td>
            <td>${formatarMoeda(atv.custoPorHora)}</td>
            <td>${atv.horasFormatado}</td>
            <td><strong>${formatarMoeda(atv.total)}</strong></td>
        `;
        corpo.appendChild(tr);
    });

    totalGeralEl.textContent = formatarMoeda(totalGeral);

    painel.style.display = 'block';
    painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

window.baixarPDF = function () {
    window.print();
};

window.fecharOrcamento = function () {
    const painel = document.getElementById('orcamento-painel');
    painel.style.display = 'none';
};