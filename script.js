/**
 * ============================================
 * IMPÉRIO BARBER - JAVASCRIPT PRINCIPAL
 * ============================================
 * Funcionalidades:
 * - Navegação suave e scroll
 * - Modal de agendamento com passos
 * - Sistema de calendário com horários
 * - LocalStorage para persistência
 * - Área administrativa do barbeiro
 * - Animações e interações
 * ============================================
 */

// ============================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================
const CONFIG = {
    // Senha da área do barbeiro
    SENHA_BARBEIRO: 'barbeiro123',
    
    // Horários de funcionamento
    HORARIO_ABERTURA: 9,
    HORARIO_FECHAMENTO: 20,
    
    // Intervalo entre agendamentos (minutos)
    INTERVALO_MINUTOS: 30,
    
    // Chaves do LocalStorage
    STORAGE_AGENDAMENTOS: 'imperio_agendamentos',
    STORAGE_BARBEIRO_LOGADO: 'imperio_barbeiro_logado'
};

// Preços dos serviços
const SERVICOS = {
    'corte-simples': { nome: 'Corte Simples', preco: 35.00, tempo: 30 },
    'degrade': { nome: 'Degradê', preco: 45.00, tempo: 45 },
    'corte-barba': { nome: 'Corte + Barba', preco: 70.00, tempo: 60 },
    'barba': { nome: 'Barba Completa', preco: 40.00, tempo: 30 },
    'sobrancelha': { nome: 'Sobrancelha', preco: 15.00, tempo: 15 },
    'tratamento': { nome: 'Tratamento Capilar', preco: 50.00, tempo: 45 }
};

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
const state = {
    agendamentos: [],
    barbeiroLogado: false,
    filtroAtual: 'todos',
    stepAtual: 1,
    dadosAgendamento: {
        nome: '',
        telefone: '',
        email: '',
        servico: '',
        data: '',
        horario: ''
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Carrega dados do LocalStorage
    carregarDados();
    
    // Inicializa componentes
    initNavbar();
    initScrollAnimations();
    initModalAgendamento();
    initAreaBarbeiro();
    initEstatisticas();
    initAgendamentoBotoes();
    initMascaraTelefone();
    
    // Define data mínima para hoje
    const dataInput = document.getElementById('dataAgendamento');
    if (dataInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        dataInput.min = `${ano}-${mes}-${dia}`;
    }
    
    console.log('🏛️ Império Barber - Sistema inicializado com sucesso!');
}

// ============================================
// NAVEGAÇÃO
// ============================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect no navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Atualiza link ativo
        updateActiveLink();
    });
    
    // Menu mobile toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Fecha menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// ANIMAÇÕES DE SCROLL
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observa elementos para animar
    const animElements = document.querySelectorAll('.servico-card, .preco-coluna, .feature-item, .info-item');
    animElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Adiciona classe de animação
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);
}

// ============================================
// ESTATÍSTICAS ANIMADAS
// ============================================
function initEstatisticas() {
    const statsSection = document.querySelector('.estatisticas');
    if (!statsSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animarNumeros();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
}

function animarNumeros() {
    const numeros = document.querySelectorAll('.stat-number');
    
    numeros.forEach(numero => {
        const valorFinal = parseFloat(numero.getAttribute('data-count'));
        const duracao = 2000;
        const incremento = valorFinal / (duracao / 16);
        let valorAtual = 0;
        
        const timer = setInterval(() => {
            valorAtual += incremento;
            
            if (valorAtual >= valorFinal) {
                valorAtual = valorFinal;
                clearInterval(timer);
            }
            
            // Formata o número
            if (valorFinal % 1 !== 0) {
                numero.textContent = valorAtual.toFixed(1);
            } else {
                numero.textContent = Math.floor(valorAtual).toLocaleString('pt-BR');
            }
        }, 16);
    });
}

// ============================================
// MODAL DE AGENDAMENTO
// ============================================
function initModalAgendamento() {
    const modal = document.getElementById('modalAgendamento');
    const btnAgendarHero = document.getElementById('btnAgendarHero');
    const modalClose = document.getElementById('modalClose');
    const form = document.getElementById('agendamentoForm');
    
    if (!modal) {
        console.error('Modal não encontrado!');
        return;
    }
    
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    // Abre modal
    if (btnAgendarHero) {
        btnAgendarHero.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal();
        });
    }
    
    // Fecha modal
    if (modalClose) {
        modalClose.addEventListener('click', fecharModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', fecharModal);
    }
    
    // Navegação entre passos
    initStepNavigation();
    
    // Atualiza preço ao selecionar serviço
    const servicoSelect = document.getElementById('servicoSelecionado');
    if (servicoSelect) {
        servicoSelect.addEventListener('change', atualizarPrecoPreview);
    }
    
    // Atualiza horários ao selecionar data
const dataInput = document.getElementById('dataAgendamento');
if (dataInput) {
    dataInput.addEventListener('change', atualizarHorarios);
    dataInput.addEventListener('input', atualizarHorarios);
}
    
    // Submit do formulário
    if (form) {
        form.addEventListener('submit', confirmarAgendamento);
    }
    
    // Tecla ESC fecha modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            fecharModal();
        }
    });
}

function initAgendamentoBotoes() {
    // Botões de agendar em cada serviço
    const botoes = document.querySelectorAll('.btn-agendar-servico');
    botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const servico = btn.getAttribute('data-servico');
            abrirModal(servico);
        });
    });
}

function abrirModal(servicoPreSelecionado = null) {
    const modal = document.getElementById('modalAgendamento');
    
    if (!modal) {
        console.error('Modal não encontrado!');
        return;
    }
    
    // Reseta o formulário
    resetarFormulario();
    atualizarHorarios(); // garante que horários apareçam
    
    // Pré-seleciona serviço se fornecido
    if (servicoPreSelecionado) {
        const select = document.getElementById('servicoSelecionado');
        if (select) {
            select.value = servicoPreSelecionado;
            atualizarPrecoPreview();
        }
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    const modal = document.getElementById('modalAgendamento');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function resetarFormulario() {
    state.stepAtual = 1;
    state.dadosAgendamento = {
        nome: '',
        telefone: '',
        email: '',
        servico: '',
        data: '',
        horario: ''
    };
    
    // Reseta steps
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index === 0);
    });
    
    // Limpa formulário
    const form = document.getElementById('agendamentoForm');
    if (form) {
        form.reset();
    }
    
    // Esconde preview de preço
    const precoPreview = document.getElementById('precoPreview');
    if (precoPreview) {
        precoPreview.style.display = 'none';
    }
    
    // Limpa horários
    const horariosGrid = document.getElementById('horariosGrid');
    if (horariosGrid) {
        horariosGrid.innerHTML = '';
    }
    
    // Limpa input de horário
    const horarioInput = document.getElementById('horarioSelecionado');
    if (horarioInput) {
        horarioInput.value = '';
    }
}

// ============================================
// NAVEGAÇÃO ENTRE PASSOS
// ============================================
function initStepNavigation() {
    // Botões próximo
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const proximoStep = parseInt(btn.getAttribute('data-next'));
            if (validarStepAtual()) {
                irParaStep(proximoStep);
            }
        });
    });
    
    // Botões voltar
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const stepAnterior = parseInt(btn.getAttribute('data-prev'));
            irParaStep(stepAnterior);
        });
    });
}

function irParaStep(step) {
    // Salva dados do step atual antes de mudar
    salvarDadosStep();
    
    // Atualiza visualização
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });
    
    const proximoStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if (proximoStepEl) {
        proximoStepEl.classList.add('active');
    }
    
    state.stepAtual = step;
    
    // Se for o step de confirmação, atualiza resumo
    if (step === 4) {
        atualizarResumo();
    }
}

function validarStepAtual() {
    const step = state.stepAtual;
    
    switch (step) {
        case 1:
            const nome = document.getElementById('nomeCliente').value.trim();
            const telefone = document.getElementById('telefoneCliente').value.trim();
            
            if (!nome) {
                mostrarToast('Erro', 'Por favor, digite seu nome completo.', 'erro');
                return false;
            }
            if (!telefone || telefone.length < 14) {
                mostrarToast('Erro', 'Por favor, digite um telefone válido.', 'erro');
                return false;
            }
            return true;
            
        case 2:
            const servico = document.getElementById('servicoSelecionado').value;
            if (!servico) {
                mostrarToast('Erro', 'Por favor, selecione um serviço.', 'erro');
                return false;
            }
            return true;
            
        case 3:
            const data = document.getElementById('dataAgendamento').value;
            const horario = document.getElementById('horarioSelecionado').value;
            
            if (!data) {
                mostrarToast('Erro', 'Por favor, selecione uma data.', 'erro');
                return false;
            }
            if (!horario) {
                mostrarToast('Erro', 'Por favor, selecione um horário.', 'erro');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

function salvarDadosStep() {
    const step = state.stepAtual;
    
    switch (step) {
        case 1:
            state.dadosAgendamento.nome = document.getElementById('nomeCliente').value.trim();
            state.dadosAgendamento.telefone = document.getElementById('telefoneCliente').value.trim();
            state.dadosAgendamento.email = document.getElementById('emailCliente').value.trim();
            break;
        case 2:
            state.dadosAgendamento.servico = document.getElementById('servicoSelecionado').value;
            break;
        case 3:
            state.dadosAgendamento.data = document.getElementById('dataAgendamento').value;
            state.dadosAgendamento.horario = document.getElementById('horarioSelecionado').value;
            break;
    }
}

// ============================================
// PREÇO E SERVIÇOS
// ============================================
function atualizarPrecoPreview() {
    const select = document.getElementById('servicoSelecionado');
    const precoPreview = document.getElementById('precoPreview');
    const precoValor = document.getElementById('precoValor');
    const tempoValor = document.getElementById('tempoValor');
    
    if (!select || !precoPreview || !precoValor || !tempoValor) return;
    
    const servico = select.value;
    
    if (servico && SERVICOS[servico]) {
        const info = SERVICOS[servico];
        precoValor.textContent = `R$ ${info.preco.toFixed(2).replace('.', ',')}`;
        tempoValor.textContent = `${info.tempo} min`;
        precoPreview.style.display = 'flex';
    } else {
        precoPreview.style.display = 'none';
    }
}

// ============================================
// SISTEMA DE HORÁRIOS
// ============================================
function atualizarHorarios() {
    const data = document.getElementById('dataAgendamento').value;
    const grid = document.getElementById('horariosGrid');
    const horarioInput = document.getElementById('horarioSelecionado');
    
    if (!grid || !horarioInput) return;
    
    // Limpa seleção anterior
    horarioInput.value = '';
    
    if (!data) {
        grid.innerHTML = '<p class="horario-vazio" style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Selecione uma data para ver os horários disponíveis.</p>';
        return;
    }
    
    // Gera horários disponíveis
    const horarios = gerarHorarios();
    const agendamentosDoDia = getAgendamentosPorData(data);
    
    // Horários ocupados
    const horariosOcupados = agendamentosDoDia
        .filter(a => a.status !== 'cancelado')
        .map(a => a.horario);
    
    // Renderiza botões de horário
    grid.innerHTML = '';
    horarios.forEach(horario => {
        const ocupado = horariosOcupados.includes(horario);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `horario-btn ${ocupado ? 'ocupado' : 'disponivel'}`;
        btn.textContent = horario;
        btn.disabled = ocupado;
        
        if (!ocupado) {
            btn.addEventListener('click', () => selecionarHorario(horario, btn));
        }
        
        grid.appendChild(btn);
    });
}

function gerarHorarios() {
    const horarios = [];
    const inicio = CONFIG.HORARIO_ABERTURA;
    const fim = CONFIG.HORARIO_FECHAMENTO;
    
    for (let hora = inicio; hora < fim; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
    }
    
    return horarios;
}

function selecionarHorario(horario, btn) {

    document.querySelectorAll('.horario-btn').forEach(b => {
        b.classList.remove('selecionado');
    });

    btn.classList.add('selecionado');

    const horarioInput = document.getElementById('horarioSelecionado');

    if (horarioInput) {
        horarioInput.value = horario;
    }

    console.log("Horário selecionado:", horario);
}

function getAgendamentosPorData(data) {
    return state.agendamentos.filter(a => a.data === data);
}

// ============================================
// RESUMO E CONFIRMAÇÃO
// ============================================
function atualizarResumo() {
    const dados = state.dadosAgendamento;
    const servicoInfo = SERVICOS[dados.servico];
    
    if (!servicoInfo) return;
    
    // Formata data
    const dataObj = new Date(dados.data + 'T00:00:00');
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const resumoNome = document.getElementById('resumoNome');
    const resumoTelefone = document.getElementById('resumoTelefone');
    const resumoServico = document.getElementById('resumoServico');
    const resumoData = document.getElementById('resumoData');
    const resumoHorario = document.getElementById('resumoHorario');
    const resumoValor = document.getElementById('resumoValor');
    
    if (resumoNome) resumoNome.textContent = dados.nome;
    if (resumoTelefone) resumoTelefone.textContent = dados.telefone;
    if (resumoServico) resumoServico.textContent = servicoInfo.nome;
    if (resumoData) resumoData.textContent = dataFormatada;
    if (resumoHorario) resumoHorario.textContent = dados.horario;
    if (resumoValor) resumoValor.textContent = `R$ ${servicoInfo.preco.toFixed(2).replace('.', ',')}`;
}

function confirmarAgendamento(e) {
    e.preventDefault();
    
    // Garante que os dados do step 3 estão salvos
    salvarDadosStep();
    
    const dados = state.dadosAgendamento;
    const servicoInfo = SERVICOS[dados.servico];
    
    // Validações finais
    if (!dados.nome || !dados.telefone || !dados.servico || !dados.data || !dados.horario) {
        mostrarToast('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'erro');
        return;
    }
    
    if (!servicoInfo) {
        mostrarToast('Erro', 'Serviço inválido.', 'erro');
        return;
    }
    
    // Cria objeto de agendamento
    const agendamento = {
        id: Date.now().toString(),
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        servico: dados.servico,
        servicoNome: servicoInfo.nome,
        preco: servicoInfo.preco,
        data: dados.data,
        horario: dados.horario,
        status: 'pendente',
        dataCriacao: new Date().toISOString()
    };
    
    // Verifica se horário ainda está disponível
    const agendamentosDoDia = getAgendamentosPorData(dados.data);
    const horarioOcupado = agendamentosDoDia.some(a => 
        a.horario === dados.horario && a.status !== 'cancelado'
    );
    
    if (horarioOcupado) {
        mostrarToast('Erro', 'Este horário acabou de ser reservado. Por favor, escolha outro.', 'erro');
        atualizarHorarios();
        irParaStep(3);
        return;
    }
    
    // Salva agendamento
    state.agendamentos.push(agendamento);
    salvarDados();
    
    // Fecha modal e mostra confirmação
    fecharModal();
    mostrarToast('Sucesso!', `Agendamento confirmado para ${dados.data} às ${dados.horario}.`, 'sucesso');
    
    // Atualiza lista do barbeiro se estiver logado
    if (state.barbeiroLogado) {
        renderizarAgendamentos();
    }
}

// ============================================
// ÁREA DO BARBEIRO
// ============================================
function initAreaBarbeiro() {
    const btnLogin = document.getElementById('btnLoginBarbeiro');
    const btnLogout = document.getElementById('btnLogoutBarbeiro');
    const btnAtualizar = document.getElementById('btnAtualizarLista');
    const inputSenha = document.getElementById('senhaBarbeiro');
    const filtros = document.querySelectorAll('.filtro-btn');
    
    // Verifica se já está logado
    if (localStorage.getItem(CONFIG.STORAGE_BARBEIRO_LOGADO) === 'true') {
        fazerLogin();
    }
    
    // Login
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            const senha = inputSenha ? inputSenha.value : '';
            if (senha === CONFIG.SENHA_BARBEIRO) {
                fazerLogin();
                mostrarToast('Sucesso!', 'Bem-vindo à área do barbeiro!', 'sucesso');
            } else {
                mostrarToast('Erro', 'Senha incorreta. Tente novamente.', 'erro');
            }
        });
    }
    
    // Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            fazerLogout();
            mostrarToast('Info', 'Você saiu da área do barbeiro.', 'info');
        });
    }
    
    // Atualizar lista
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            renderizarAgendamentos();
            mostrarToast('Sucesso!', 'Lista atualizada!', 'sucesso');
        });
    }
    
    // Filtros
    filtros.forEach(filtro => {
        filtro.addEventListener('click', () => {
            filtros.forEach(f => f.classList.remove('active'));
            filtro.classList.add('active');
            state.filtroAtual = filtro.getAttribute('data-filtro');
            renderizarAgendamentos();
        });
    });
    
    // Enter no input de senha
    if (inputSenha) {
        inputSenha.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnLogin.click();
            }
        });
    }
}

function fazerLogin() {
    state.barbeiroLogado = true;
    localStorage.setItem(CONFIG.STORAGE_BARBEIRO_LOGADO, 'true');
    
    const loginEl = document.getElementById('barbeiroLogin');
    const painelEl = document.getElementById('barbeiroPainel');
    
    if (loginEl) loginEl.style.display = 'none';
    if (painelEl) painelEl.style.display = 'block';
    
    renderizarAgendamentos();
}

function fazerLogout() {
    state.barbeiroLogado = false;
    localStorage.removeItem(CONFIG.STORAGE_BARBEIRO_LOGADO);
    
    const loginEl = document.getElementById('barbeiroLogin');
    const painelEl = document.getElementById('barbeiroPainel');
    const senhaInput = document.getElementById('senhaBarbeiro');
    
    if (loginEl) loginEl.style.display = 'block';
    if (painelEl) painelEl.style.display = 'none';
    if (senhaInput) senhaInput.value = '';
}

function renderizarAgendamentos() {
    const lista = document.getElementById('agendamentosLista');
    if (!lista) return;
    
    const filtro = state.filtroAtual;
    
    // Filtra agendamentos
    let agendamentosFiltrados = [...state.agendamentos];
    
    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    switch (filtro) {
        case 'hoje':
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.data === hoje);
            break;
        case 'amanha':
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.data === amanha);
            break;
        case 'pendentes':
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.status === 'pendente');
            break;
        case 'concluidos':
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.status === 'concluido');
            break;
    }
    
    // Ordena por data e horário
    agendamentosFiltrados.sort((a, b) => {
        if (a.data !== b.data) {
            return a.data.localeCompare(b.data);
        }
        return a.horario.localeCompare(b.horario);
    });
    
    // Renderiza
    if (agendamentosFiltrados.length === 0) {
        lista.innerHTML = `
            <div class="agendamentos-vazio" style="text-align: center; padding: 40px; color: #888;">
                <i class="far fa-calendar-times" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                <p>Nenhum agendamento encontrado.</p>
            </div>
        `;
    } else {
        lista.innerHTML = agendamentosFiltrados.map(a => renderizarAgendamentoItem(a)).join('');
        
        // Adiciona eventos aos botões
        lista.querySelectorAll('.btn-acao').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const acao = btn.getAttribute('data-acao');
                executarAcaoAgendamento(id, acao);
            });
        });
    }
    
    // Atualiza resumo
    atualizarResumoBarbeiro();
}

function renderizarAgendamentoItem(agendamento) {
    const dataObj = new Date(agendamento.data + 'T00:00:00');
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
    });
    
    const statusClass = agendamento.status;
    const statusText = {
        'pendente': 'Pendente',
        'concluido': 'Concluído',
        'cancelado': 'Cancelado'
    }[agendamento.status];
    
    return `
        <div class="agendamento-item ${statusClass}">
            <div class="agendamento-hora">
                <span class="hora">${agendamento.horario}</span>
                <span class="data">${dataFormatada}</span>
            </div>
            <div class="agendamento-info">
                <span class="nome">${agendamento.nome}</span>
                <span class="servico">${agendamento.servicoNome} - R$ ${agendamento.preco.toFixed(2).replace('.', ',')}</span>
                <span class="telefone"><i class="fas fa-phone"></i> ${agendamento.telefone}</span>
            </div>
            <div class="agendamento-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
                ${agendamento.status === 'pendente' ? `
                    <div class="agendamento-acoes">
                        <button class="btn-acao concluir" data-id="${agendamento.id}" data-acao="concluir" title="Marcar como concluído">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-acao cancelar" data-id="${agendamento.id}" data-acao="cancelar" title="Cancelar agendamento">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function executarAcaoAgendamento(id, acao) {
    const agendamento = state.agendamentos.find(a => a.id === id);
    if (!agendamento) return;
    
    if (acao === 'concluir') {
        agendamento.status = 'concluido';
        mostrarToast('Sucesso!', `Agendamento de ${agendamento.nome} marcado como concluído.`, 'sucesso');
    } else if (acao === 'cancelar') {
        if (confirm(`Tem certeza que deseja cancelar o agendamento de ${agendamento.nome}?`)) {
            agendamento.status = 'cancelado';
            mostrarToast('Info', 'Agendamento cancelado.', 'info');
        }
    }
    
    salvarDados();
    renderizarAgendamentos();
}

function atualizarResumoBarbeiro() {
    const total = state.agendamentos.length;
    const pendentes = state.agendamentos.filter(a => a.status === 'pendente').length;
    const concluidos = state.agendamentos.filter(a => a.status === 'concluido').length;
    
    const totalEl = document.getElementById('totalAgendamentos');
    const pendentesEl = document.getElementById('totalPendentes');
    const concluidosEl = document.getElementById('totalConcluidos');
    
    if (totalEl) totalEl.textContent = total;
    if (pendentesEl) pendentesEl.textContent = pendentes;
    if (concluidosEl) concluidosEl.textContent = concluidos;
}

// ============================================
// LOCALSTORAGE
// ============================================
function carregarDados() {
    try {
        // Carrega agendamentos
        const agendamentosSalvos = localStorage.getItem(CONFIG.STORAGE_AGENDAMENTOS);
        if (agendamentosSalvos) {
            state.agendamentos = JSON.parse(agendamentosSalvos);
        }
        
        // Carrega estado de login do barbeiro
        state.barbeiroLogado = localStorage.getItem(CONFIG.STORAGE_BARBEIRO_LOGADO) === 'true';
    } catch (e) {
        console.error('Erro ao carregar dados:', e);
        state.agendamentos = [];
        state.barbeiroLogado = false;
    }
}

function salvarDados() {
    try {
        localStorage.setItem(CONFIG.STORAGE_AGENDAMENTOS, JSON.stringify(state.agendamentos));
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
        mostrarToast('Erro', 'Não foi possível salvar o agendamento.', 'erro');
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function mostrarToast(titulo, mensagem, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const icones = {
        'sucesso': 'fa-check-circle',
        'erro': 'fa-times-circle',
        'aviso': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icones[tipo]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titulo}</div>
            <div class="toast-message">${mensagem}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// ============================================
// MÁSCARA DE TELEFONE
// ============================================
function initMascaraTelefone() {
    const telefoneInput = document.getElementById('telefoneCliente');
    if (!telefoneInput) return;
    
    telefoneInput.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }
        
        // Aplica máscara
        if (valor.length > 7) {
            valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
        } else if (valor.length > 2) {
            valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        } else if (valor.length > 0) {
            valor = `(${valor}`;
        }
        
        e.target.value = valor;
    });
}

// ============================================
// UTILITÁRIOS
// ============================================

// Debounce para eventos frequentes
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para scroll
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exporta funções para debug (opcional)
window.ImperioBarber = {
    state,
    SERVICOS,
    CONFIG,
    mostrarToast,
    getAgendamentos: () => state.agendamentos,
    limparAgendamentos: () => {
        state.agendamentos = [];
        salvarDados();
        renderizarAgendamentos();
        mostrarToast('Info', 'Todos os agendamentos foram removidos.', 'info');
    }
};
