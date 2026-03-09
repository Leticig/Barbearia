/**
 * IMPÉRIO BARBER - JavaScript Principal
 * Controla navegação, modal de agendamento, área do barbeiro e interações
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // VARIÁVEIS GLOBAIS
    // ============================================
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const modalAgendamento = document.getElementById('modalAgendamento');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = modalAgendamento.querySelector('.modal-overlay');
    const agendamentoForm = document.getElementById('agendamentoForm');
    const toastContainer = document.getElementById('toastContainer');
    
    // Modal Meus Agendamentos
    const modalMeusAgendamentos = document.getElementById('modalMeusAgendamentos');
    const modalCloseMeus = document.getElementById('modalCloseMeus');
    const btnMeusAgendamentos = document.getElementById('btnMeusAgendamentos');
    
    // Dados do agendamento
    let agendamentoData = {
        nome: '',
        telefone: '',
        email: '',
        servico: '',
        servicoNome: '',
        preco: '',
        tempo: '',
        data: '',
        horario: ''
    };
    
    // Agendamentos armazenados (simulando banco de dados)
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    
    // ============================================
    // NAVEGAÇÃO - Scroll da Navbar
    // ============================================
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleNavbarScroll);
    
    // ============================================
    // MENU MOBILE
    // ============================================
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Não fechar se for o link de meus agendamentos
            if (this.id === 'btnMeusAgendamentos') return;
            
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // ============================================
    // SCROLL SUAVE PARA SEÇÕES
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#barbeiro') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // MODAL DE AGENDAMENTO - FUNÇÕES
    // ============================================
    
    // Abrir modal
    function abrirModal(servicoPreSelecionado = null) {
        modalAgendamento.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Resetar formulário
        resetarFormulario();
        
        // Se tiver serviço pré-selecionado, ir direto para passo 2
        if (servicoPreSelecionado) {
            const selectServico = document.getElementById('servicoSelecionado');
            selectServico.value = servicoPreSelecionado;
            selectServico.dispatchEvent(new Event('change'));
            mostrarPasso(2);
        }
        
        // Definir data mínima como hoje
        const dataInput = document.getElementById('dataAgendamento');
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.setAttribute('min', hoje);
        dataInput.value = hoje;
        
        // Gerar horários (todos disponíveis inicialmente)
        gerarHorarios();
    }
    
    // Fechar modal
    function fecharModal() {
        modalAgendamento.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Resetar formulário
    function resetarFormulario() {
        agendamentoForm.reset();
        mostrarPasso(1);
        document.getElementById('precoPreview').style.display = 'none';
        document.getElementById('horarioSelecionado').value = '';
        
        // Limpar seleção de horários
        document.querySelectorAll('.horario-btn').forEach(btn => {
            btn.classList.remove('selecionado');
        });
        
        // Resetar dados
        agendamentoData = {
            nome: '',
            telefone: '',
            email: '',
            servico: '',
            servicoNome: '',
            preco: '',
            tempo: '',
            data: '',
            horario: ''
        };
    }
    
    // Mostrar passo específico do formulário
    function mostrarPasso(passo) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`.form-step[data-step="${passo}"]`).classList.add('active');
        
        // Scroll para o topo do modal
        const scrollContainer = document.querySelector('.modal-scroll-container');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }
    
    // Event listeners do modal
    modalClose.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', fecharModal);
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modalAgendamento.classList.contains('active')) {
                fecharModal();
            }
            if (modalMeusAgendamentos.classList.contains('active')) {
                fecharModalMeus();
            }
        }
    });
    
    // Botões de abrir modal
    document.getElementById('btnAgendarHero').addEventListener('click', () => abrirModal());
    
    // Botões de agendar serviço
    document.querySelectorAll('.btn-agendar-servico').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const servico = this.getAttribute('data-servico');
            abrirModal(servico);
        });
    });
    
    // ============================================
    // FORMULÁRIO MULTI-PASSOS
    // ============================================
    
    // Botões próximo
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const passoAtual = this.closest('.form-step').getAttribute('data-step');
            const proximoPasso = this.getAttribute('data-next');
            
            if (validarPasso(passoAtual)) {
                salvarDadosPasso(passoAtual);
                mostrarPasso(proximoPasso);
                
                if (proximoPasso === '4') {
                    atualizarResumo();
                }
            }
        });
    });
    
    // Botões voltar
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            const passoAnterior = this.getAttribute('data-prev');
            mostrarPasso(passoAnterior);
        });
    });
    
    // Validação de cada passo
    function validarPasso(passo) {
        let valido = true;
        
        if (passo === '1') {
            const nome = document.getElementById('nomeCliente').value.trim();
            const telefone = document.getElementById('telefoneCliente').value.trim();
            
            if (!nome) {
                mostrarToast('Erro', 'Por favor, informe seu nome completo.', 'erro');
                valido = false;
            } else if (nome.length < 3) {
                mostrarToast('Erro', 'O nome deve ter pelo menos 3 caracteres.', 'erro');
                valido = false;
            } else if (!telefone) {
                mostrarToast('Erro', 'Por favor, informe seu telefone.', 'erro');
                valido = false;
            } else if (telefone.replace(/\D/g, '').length < 10) {
                mostrarToast('Erro', 'Por favor, informe um telefone válido.', 'erro');
                valido = false;
            }
        }
        
        if (passo === '2') {
            const servico = document.getElementById('servicoSelecionado').value;
            if (!servico) {
                mostrarToast('Erro', 'Por favor, selecione um serviço.', 'erro');
                valido = false;
            }
        }
        
        if (passo === '3') {
            const data = document.getElementById('dataAgendamento').value;
            const horario = document.getElementById('horarioSelecionado').value;
            
            if (!data) {
                mostrarToast('Erro', 'Por favor, selecione uma data.', 'erro');
                valido = false;
            } else if (!horario) {
                mostrarToast('Erro', 'Por favor, selecione um horário.', 'erro');
                valido = false;
            }
        }
        
        return valido;
    }
    
    // Salvar dados de cada passo
    function salvarDadosPasso(passo) {
        if (passo === '1') {
            agendamentoData.nome = document.getElementById('nomeCliente').value.trim();
            agendamentoData.telefone = document.getElementById('telefoneCliente').value.trim();
            agendamentoData.email = document.getElementById('emailCliente').value.trim();
        }
        
        if (passo === '2') {
            const select = document.getElementById('servicoSelecionado');
            const option = select.options[select.selectedIndex];
            agendamentoData.servico = select.value;
            agendamentoData.servicoNome = option.text.split(' - ')[0];
            agendamentoData.preco = option.getAttribute('data-preco');
            agendamentoData.tempo = option.getAttribute('data-tempo');
        }
        
        if (passo === '3') {
            agendamentoData.data = document.getElementById('dataAgendamento').value;
            agendamentoData.horario = document.getElementById('horarioSelecionado').value;
        }
    }
    
    // Atualizar resumo no passo 4
    function atualizarResumo() {
        document.getElementById('resumoNome').textContent = agendamentoData.nome;
        document.getElementById('resumoTelefone').textContent = agendamentoData.telefone;
        document.getElementById('resumoServico').textContent = agendamentoData.servicoNome;
        
        const dataFormatada = new Date(agendamentoData.data + 'T00:00:00').toLocaleDateString('pt-BR');
        document.getElementById('resumoData').textContent = dataFormatada;
        document.getElementById('resumoHorario').textContent = agendamentoData.horario;
        document.getElementById('resumoValor').textContent = `R$ ${parseFloat(agendamentoData.preco).toFixed(2).replace('.', ',')}`;
    }
    
    // ============================================
    // MÁSCARA DE TELEFONE
    // ============================================
    const telefoneInput = document.getElementById('telefoneCliente');
    telefoneInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length > 11) {
            valor = valor.substring(0, 11);
        }
        
        if (valor.length > 0) {
            if (valor.length <= 10) {
                valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = valor;
    });
    
    // ============================================
    // SERVIÇO - Atualizar preço preview
    // ============================================
    document.getElementById('servicoSelecionado').addEventListener('change', function() {
        const option = this.options[this.selectedIndex];
        const preco = option.getAttribute('data-preco');
        const tempo = option.getAttribute('data-tempo');
        
        if (preco && tempo) {
            document.getElementById('precoValor').textContent = `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
            document.getElementById('tempoValor').textContent = `${tempo} min`;
            document.getElementById('precoPreview').style.display = 'flex';
        } else {
            document.getElementById('precoPreview').style.display = 'none';
        }
    });
    
    // ============================================
    // HORÁRIOS - Gerar e verificar ocupados
    // ============================================
    function gerarHorarios() {
        const grid = document.getElementById('horariosGrid');
        const dataSelecionada = document.getElementById('dataAgendamento').value;
        grid.innerHTML = '';
        
        const horarios = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
            '18:00', '18:30', '19:00', '19:30'
        ];
        
        // Verificar quais horários estão ocupados para a data selecionada
        const horariosOcupados = agendamentos
            .filter(a => a.data === dataSelecionada && a.status !== 'cancelado')
            .map(a => a.horario);
        
        horarios.forEach(horario => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = horario;
            
            // Verificar se o horário está ocupado
            if (horariosOcupados.includes(horario)) {
                btn.className = 'horario-btn ocupado';
                btn.disabled = true;
                btn.title = 'Horário ocupado';
            } else {
                btn.className = 'horario-btn disponivel';
            }
            
            btn.addEventListener('click', function() {
                if (!this.disabled) {
                    document.querySelectorAll('.horario-btn').forEach(b => {
                        b.classList.remove('selecionado');
                    });
                    this.classList.add('selecionado');
                    document.getElementById('horarioSelecionado').value = horario;
                }
            });
            
            grid.appendChild(btn);
        });
    }
    
    // Atualizar horários quando mudar a data
    document.getElementById('dataAgendamento').addEventListener('change', function() {
        gerarHorarios();
        document.getElementById('horarioSelecionado').value = '';
    });
    
    // ============================================
    // SUBMIT DO FORMULÁRIO
    // ============================================
    agendamentoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Criar objeto do agendamento
        const novoAgendamento = {
            id: Date.now(),
            ...agendamentoData,
            status: 'pendente',
            dataCriacao: new Date().toISOString()
        };
        
        // Salvar no localStorage
        agendamentos.push(novoAgendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Mostrar mensagem de sucesso
        mostrarToast('Sucesso!', 'Agendamento realizado com sucesso!', 'sucesso');
        
        // Fechar modal
        fecharModal();
        
        // Atualizar lista na área do barbeiro se estiver visível
        if (document.getElementById('barbeiroPainel').style.display !== 'none') {
            carregarAgendamentos();
        }
    });
    
    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    function mostrarToast(titulo, mensagem, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        
        const icones = {
            sucesso: 'fa-check-circle',
            erro: 'fa-times-circle',
            aviso: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icones[tipo]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${titulo}</div>
                <div class="toast-message">${mensagem}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Fechar toast
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.remove();
        });
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
    
    // ============================================
    // MEUS AGENDAMENTOS (CLIENTE)
    // ============================================
    
    // Abrir modal de meus agendamentos
    function abrirModalMeus() {
        modalMeusAgendamentos.classList.add('active');
        document.body.classList.add('modal-open');
        carregarMeusAgendamentos();
    }
    
    // Fechar modal de meus agendamentos
    function fecharModalMeus() {
        modalMeusAgendamentos.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Event listeners
    btnMeusAgendamentos.addEventListener('click', function(e) {
        e.preventDefault();
        abrirModalMeus();
    });
    
    modalCloseMeus.addEventListener('click', fecharModalMeus);
    modalMeusAgendamentos.querySelector('.modal-overlay').addEventListener('click', fecharModalMeus);
    
    // Carregar meus agendamentos
    function carregarMeusAgendamentos() {
        const container = document.getElementById('meusAgendamentosContent');
        
        if (agendamentos.length === 0) {
            container.innerHTML = `
                <div class="meus-agendamentos-vazio">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Nenhum agendamento encontrado</h3>
                    <p>Você ainda não possui agendamentos. Clique em "Agendar Horário" para fazer o seu primeiro agendamento!</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por data e horário (mais recentes primeiro)
        const meusAgendamentos = [...agendamentos].sort((a, b) => {
            const dataA = new Date(a.data + 'T' + a.horario);
            const dataB = new Date(b.data + 'T' + b.horario);
            return dataB - dataA;
        });
        
        let html = '<div class="meus-agendamentos-lista">';
        
        meusAgendamentos.forEach(ag => {
            const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const statusTexto = {
                'pendente': 'Pendente',
                'concluido': 'Concluído',
                'cancelado': 'Cancelado'
            };
            
            html += `
                <div class="meu-agendamento-card ${ag.status}">
                    <div class="meu-agendamento-header">
                        <span class="meu-agendamento-servico">${ag.servicoNome}</span>
                        <span class="meu-agendamento-status ${ag.status}">${statusTexto[ag.status]}</span>
                    </div>
                    <div class="meu-agendamento-detalhes">
                        <div class="meu-agendamento-info">
                            <i class="fas fa-calendar"></i>
                            <span>${dataFormatada}</span>
                        </div>
                        <div class="meu-agendamento-info">
                            <i class="fas fa-clock"></i>
                            <span>${ag.horario}</span>
                        </div>
                        <div class="meu-agendamento-info">
                            <i class="fas fa-user"></i>
                            <span>${ag.nome}</span>
                        </div>
                        <div class="meu-agendamento-info">
                            <i class="fas fa-phone"></i>
                            <span>${ag.telefone}</span>
                        </div>
                    </div>
                    <div class="meu-agendamento-preco">
                        R$ ${parseFloat(ag.preco).toFixed(2).replace('.', ',')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // ============================================
    // ÁREA DO BARBEIRO - Login e Painel
    // ============================================
    const btnLoginBarbeiro = document.getElementById('btnLoginBarbeiro');
    const btnLogoutBarbeiro = document.getElementById('btnLogoutBarbeiro');
    const barbeiroLogin = document.getElementById('barbeiroLogin');
    const barbeiroPainel = document.getElementById('barbeiroPainel');
    const senhaBarbeiro = document.getElementById('senhaBarbeiro');
    const btnAtualizarLista = document.getElementById('btnAtualizarLista');
    const btnLimparConcluidos = document.getElementById('btnLimparConcluidos');
    const btnLimparTodos = document.getElementById('btnLimparTodos');
    
    // Login
    btnLoginBarbeiro.addEventListener('click', function() {
        const senha = senhaBarbeiro.value;
        
        if (senha === 'barbeiro123') {
            barbeiroLogin.style.display = 'none';
            barbeiroPainel.style.display = 'block';
            carregarAgendamentos();
            mostrarToast('Bem-vindo!', 'Login realizado com sucesso!', 'sucesso');
        } else {
            mostrarToast('Erro', 'Senha incorreta!', 'erro');
        }
        
        senhaBarbeiro.value = '';
    });
    
    // Logout
    btnLogoutBarbeiro.addEventListener('click', function() {
        barbeiroLogin.style.display = 'block';
        barbeiroPainel.style.display = 'none';
    });
    
    // Enter no input de senha
    senhaBarbeiro.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            btnLoginBarbeiro.click();
        }
    });
    
    // Atualizar lista
    btnAtualizarLista.addEventListener('click', function() {
        carregarAgendamentos();
        mostrarToast('Atualizado', 'Lista de agendamentos atualizada!', 'info');
    });
    
    // Limpar agendamentos concluídos
    btnLimparConcluidos.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja remover todos os agendamentos concluídos?')) {
            agendamentos = agendamentos.filter(a => a.status !== 'concluido');
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            carregarAgendamentos();
            mostrarToast('Sucesso!', 'Agendamentos concluídos removidos!', 'sucesso');
        }
    });
    
    // Limpar todos os agendamentos
    btnLimparTodos.addEventListener('click', function() {
        if (confirm('ATENÇÃO! Tem certeza que deseja remover TODOS os agendamentos? Esta ação não pode ser desfeita!')) {
            agendamentos = [];
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            carregarAgendamentos();
            mostrarToast('Sucesso!', 'Todos os agendamentos foram removidos!', 'sucesso');
        }
    });
    
    // Filtros
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            carregarAgendamentos(this.getAttribute('data-filtro'));
        });
    });
    
    // Carregar agendamentos no painel do barbeiro
    function carregarAgendamentos(filtro = 'todos') {
        const lista = document.getElementById('agendamentosLista');
        lista.innerHTML = '';
        
        let agendamentosFiltrados = [...agendamentos];
        
        // Aplicar filtros
        if (filtro === 'hoje') {
            const hoje = new Date().toISOString().split('T')[0];
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.data === hoje);
        } else if (filtro === 'amanha') {
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = amanha.toISOString().split('T')[0];
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.data === amanhaStr);
        } else if (filtro === 'pendentes') {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.status === 'pendente');
        } else if (filtro === 'concluidos') {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.status === 'concluido');
        }
        
        // Ordenar por data e horário
        agendamentosFiltrados.sort((a, b) => {
            const dataA = new Date(a.data + 'T' + a.horario);
            const dataB = new Date(b.data + 'T' + b.horario);
            return dataA - dataB;
        });
        
        // Atualizar contadores
        const totalPendentes = agendamentos.filter(a => a.status === 'pendente').length;
        const totalConcluidos = agendamentos.filter(a => a.status === 'concluido').length;
        
        document.getElementById('totalAgendamentos').textContent = agendamentos.length;
        document.getElementById('totalPendentes').textContent = totalPendentes;
        document.getElementById('totalConcluidos').textContent = totalConcluidos;
        
        // Mostrar mensagem se vazio
        if (agendamentosFiltrados.length === 0) {
            lista.innerHTML = `
                <div class="agendamentos-vazio">
                    <i class="fas fa-calendar-times"></i>
                    <p>Nenhum agendamento encontrado</p>
                </div>
            `;
            return;
        }
        
        // Renderizar agendamentos
        agendamentosFiltrados.forEach(agendamento => {
            const dataFormatada = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
            
            const item = document.createElement('div');
            item.className = `agendamento-item ${agendamento.status}`;
            item.innerHTML = `
                <div class="agendamento-hora">
                    <span class="hora">${agendamento.horario}</span>
                    <span class="data">${dataFormatada}</span>
                </div>
                <div class="agendamento-info">
                    <span class="nome">${agendamento.nome}</span>
                    <span class="servico">${agendamento.servicoNome}</span>
                    <span class="telefone">${agendamento.telefone}</span>
                </div>
                <div class="agendamento-status">
                    <span class="status-badge ${agendamento.status}">${agendamento.status}</span>
                    <div class="agendamento-acoes">
                        ${agendamento.status === 'pendente' ? `
                            <button class="btn-acao concluir" data-id="${agendamento.id}" title="Marcar como concluído">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn-acao excluir" data-id="${agendamento.id}" title="Excluir agendamento">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            lista.appendChild(item);
        });
        
        // Adicionar eventos aos botões de ação
        document.querySelectorAll('.btn-acao.concluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                concluirAgendamento(id);
            });
        });
        
        document.querySelectorAll('.btn-acao.excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                excluirAgendamento(id);
            });
        });
    }
    
    // Concluir agendamento
    function concluirAgendamento(id) {
        const index = agendamentos.findIndex(a => a.id === id);
        if (index !== -1) {
            agendamentos[index].status = 'concluido';
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            carregarAgendamentos(document.querySelector('.filtro-btn.active')?.getAttribute('data-filtro') || 'todos');
            mostrarToast('Sucesso!', 'Agendamento marcado como concluído!', 'sucesso');
        }
    }
    
    // Excluir agendamento individual
    function excluirAgendamento(id) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            agendamentos = agendamentos.filter(a => a.id !== id);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            carregarAgendamentos(document.querySelector('.filtro-btn.active')?.getAttribute('data-filtro') || 'todos');
            mostrarToast('Sucesso!', 'Agendamento excluído!', 'sucesso');
        }
    }
    
    // ============================================
    // ANIMAÇÃO DE NÚMEROS (Estatísticas)
    // ============================================
    function animarNumeros() {
        const numeros = document.querySelectorAll('.stat-number');
        
        numeros.forEach(numero => {
            const alvo = parseFloat(numero.getAttribute('data-count'));
            const duracao = 2000;
            const incremento = alvo / (duracao / 16);
            let atual = 0;
            
            const timer = setInterval(() => {
                atual += incremento;
                
                if (atual >= alvo) {
                    atual = alvo;
                    clearInterval(timer);
                }
                
                if (alvo % 1 !== 0) {
                    numero.textContent = atual.toFixed(1);
                } else {
                    numero.textContent = Math.floor(atual).toLocaleString('pt-BR');
                }
            }, 16);
        });
    }
    
    // Observador de interseção para animar números quando visíveis
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animarNumeros();
                observer.disconnect();
            }
        });
    });
    
    const estatisticas = document.querySelector('.estatisticas');
    if (estatisticas) {
        observer.observe(estatisticas);
    }
    
    // ============================================
    // ANIMAÇÃO DE ELEMENTOS AO SCROLL
    // ============================================
    const observerElements = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.servico-card, .preco-coluna, .feature-item').forEach(el => {
        observerElements.observe(el);
    });
    
    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    handleNavbarScroll();
    
    // Adicionar alguns agendamentos de exemplo se estiver vazio
    if (agendamentos.length === 0) {
        const exemplos = [
            {
                id: Date.now() - 1000,
                nome: 'João Silva',
                telefone: '(11) 98765-4321',
                email: 'joao@email.com',
                servico: 'corte-simples',
                servicoNome: 'Corte Simples',
                preco: '35.00',
                tempo: '30',
                data: new Date().toISOString().split('T')[0],
                horario: '14:00',
                status: 'pendente',
                dataCriacao: new Date().toISOString()
            },
            {
                id: Date.now() - 2000,
                nome: 'Pedro Santos',
                telefone: '(11) 91234-5678',
                email: 'pedro@email.com',
                servico: 'corte-barba',
                servicoNome: 'Corte + Barba',
                preco: '70.00',
                tempo: '60',
                data: new Date().toISOString().split('T')[0],
                horario: '10:30',
                status: 'concluido',
                dataCriacao: new Date().toISOString()
            }
        ];
        agendamentos = exemplos;
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    }
});

// ============================================
// ANIMAÇÃO CSS PARA TOAST SAINDO
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes toastOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .servico-card,
    .preco-coluna,
    .feature-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .servico-card.animate-in,
    .preco-coluna.animate-in,
    .feature-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Bloquear scroll quando menu mobile está aberto */
    body.menu-open {
        overflow: hidden;
    }
`;
document.head.appendChild(style);
