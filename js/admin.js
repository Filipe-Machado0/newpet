/**
 * ========================================================
 * New Pet Banho e Tosa — Araxá MG
 * Admin Dashboard Controller
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeDateFilter = 'hoje';
  let activeStatusFilter = 'todos';

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayISO = toISO(new Date());

  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowISO = toISO(tomorrowObj);

  // Calcula início e fim da semana atual
  const curr = new Date();
  const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));
  const lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
  const weekStartISO = toISO(firstDay);
  const weekEndISO = toISO(lastDay);

  // Elementos do DOM
  const kpiTotalToday = document.getElementById('kpiTotalToday');
  const kpiPendingToday = document.getElementById('kpiPendingToday');
  const kpiDoneToday = document.getElementById('kpiDoneToday');
  const kpiTotalAll = document.getElementById('kpiTotalAll');

  const appointmentsGrid = document.getElementById('appointmentsGridContainer');
  const appointmentsViewTitle = document.getElementById('appointmentsViewTitle');
  const appointmentsViewCount = document.getElementById('appointmentsViewCount');
  const blockedSlotsSection = document.getElementById('blockedSlotsSection');
  const blockedTagsContainer = document.getElementById('blockedTagsContainer');

  const statusFilterSelect = document.getElementById('statusFilterSelect');
  const dateTabs = document.querySelectorAll('#dateFilterTabs .tab-btn');

  // Modal de Bloqueio
  const blockModalBackdrop = document.getElementById('blockModalBackdrop');
  const btnOpenBlockModal = document.getElementById('btnOpenBlockModal');
  const btnCloseBlockModal = document.getElementById('btnCloseBlockModal');
  const btnCancelBlockModal = document.getElementById('btnCancelBlockModal');
  const btnConfirmBlockSlot = document.getElementById('btnConfirmBlockSlot');
  const blockDateInput = document.getElementById('blockDateInput');
  const blockTimeSelect = document.getElementById('blockTimeSelect');
  const blockReasonInput = document.getElementById('blockReasonInput');

  if (blockDateInput) blockDateInput.value = todayISO;

  // Atualiza KPIs
  function updateKPIs() {
    const all = BookingStore.getAll();
    const todayList = all.filter(a => a.date === todayISO);

    const pendingToday = todayList.filter(a => a.status === 'confirmado').length;
    const doneToday = todayList.filter(a => a.status === 'concluido').length;

    if (kpiTotalToday) kpiTotalToday.textContent = todayList.length;
    if (kpiPendingToday) kpiPendingToday.textContent = pendingToday;
    if (kpiDoneToday) kpiDoneToday.textContent = doneToday;
    if (kpiTotalAll) kpiTotalAll.textContent = all.length;
  }

  // Formata data ISO para legível (ex: "11/11/2026")
  function formatBRDate(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length < 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Renderiza Lista de Agendamentos
  function renderAppointments() {
    if (!appointmentsGrid) return;
    const all = BookingStore.getAll();

    // Filtro por Data
    let filtered = all.filter(item => {
      if (activeDateFilter === 'hoje') return item.date === todayISO;
      if (activeDateFilter === 'amanha') return item.date === tomorrowISO;
      if (activeDateFilter === 'semana') return item.date >= weekStartISO && item.date <= weekEndISO;
      return true; // 'todos'
    });

    // Filtro por Status
    if (activeStatusFilter !== 'todos') {
      filtered = filtered.filter(item => item.status === activeStatusFilter);
    }

    // Ordena por horário crescente
    filtered.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });

    // Atualiza cabeçalho
    const titles = {
      hoje: 'Agendamentos de Hoje',
      amanha: 'Agendamentos de Amanhã',
      semana: 'Agendamentos Desta Semana',
      todos: 'Todos os Agendamentos'
    };
    if (appointmentsViewTitle) appointmentsViewTitle.textContent = titles[activeDateFilter] || 'Agendamentos';
    if (appointmentsViewCount) appointmentsViewCount.textContent = `${filtered.length} agendamento(s)`;

    appointmentsGrid.innerHTML = '';

    if (filtered.length === 0) {
      appointmentsGrid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <h4>Nenhum agendamento encontrado</h4>
          <p>Nenhum atendimento corresponde aos filtros selecionados.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `appointment-card is-${item.status}`;

      const statusLabels = {
        confirmado: 'Aguardando Atendimento',
        concluido: 'Concluído',
        cancelado: 'Cancelado'
      };

      // Limpa número de WhatsApp para link
      const cleanPhone = (item.clientPhone || '').replace(/\D/g, '');
      const waPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
      const readyMsg = encodeURIComponent(
        `Olá ${item.clientName}! 🐾\nO(a) ${item.petName} já finalizou o atendimento na New Pet Banho e Tosa (Araxá - MG) e está super cheiroso(a), lindo(a) e prontinho(a) para ir pra casa! 🐶✨`
      );

      const sizeLabel = (item.petSize || '').split(' ')[0] || 'Pet';

      card.innerHTML = `
        <div class="card-top">
          <div class="card-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${item.time} &bull; ${formatBRDate(item.date)}</span>
          </div>
          <span class="card-status-pill status-${item.status}">
            ${statusLabels[item.status] || item.status}
          </span>
        </div>

        <div class="card-body">
          <div class="card-pet">
            <span class="card-pet__name">${item.petName}</span>
            <span class="card-pet__size">${sizeLabel}</span>
          </div>
          <span class="card-pet__breed">${item.petBreed || 'Raça não informada'}</span>

          <div class="card-service">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>${item.service}</span>
          </div>

          <div class="card-client">
            Tutor: <strong>${item.clientName}</strong> &bull; ${item.clientPhone}
          </div>

          ${item.notes ? `<div class="card-notes">Obs: &ldquo;${item.notes}&rdquo;</div>` : ''}
        </div>

        <div class="card-actions">
          <a href="https://wa.me/${waPhone}?text=${readyMsg}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" title="Avisar no WhatsApp que o pet está pronto">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
            <span>Pet Pronto!</span>
          </a>

          <div class="card-action-btns">
            ${item.status !== 'concluido' ? `
              <button type="button" class="btn-icon-action btn-icon-action--done" title="Marcar como Concluído" data-action="concluir" data-id="${item.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            ` : ''}

            ${item.status !== 'cancelado' ? `
              <button type="button" class="btn-icon-action btn-icon-action--cancel" title="Cancelar Agendamento" data-action="cancelar" data-id="${item.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            ` : ''}
          </div>
        </div>
      `;

      appointmentsGrid.appendChild(card);
    });

    // Eventos de Ação nos Cards
    appointmentsGrid.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'concluir') {
          BookingStore.updateStatus(id, 'concluido');
        } else if (action === 'cancelar') {
          if (confirm('Deseja realmente cancelar este agendamento? O horário será liberado na agenda.')) {
            BookingStore.updateStatus(id, 'cancelado');
          }
        }
        renderAll();
      });
    });
  }

  // Renderiza Horários Bloqueados
  function renderBlockedSlots() {
    if (!blockedTagsContainer || !blockedSlotsSection) return;
    const blocked = BookingStore.getBlockedSlots();
    blockedTagsContainer.innerHTML = '';

    if (blocked.length === 0) {
      blockedSlotsSection.style.display = 'none';
      return;
    }

    blockedSlotsSection.style.display = 'flex';

    blocked.forEach(b => {
      const tag = document.createElement('div');
      tag.className = 'blocked-tag';
      tag.innerHTML = `
        <span><strong>${formatBRDate(b.date)} às ${b.time}</strong> &bull; ${b.reason}</span>
        <button type="button" class="btn-unblock" title="Desbloquear este horário" data-date="${b.date}" data-time="${b.time}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      tag.querySelector('.btn-unblock').addEventListener('click', () => {
        BookingStore.unblockSlot(b.date, b.time);
        renderAll();
      });

      blockedTagsContainer.appendChild(tag);
    });
  }

  function renderAll() {
    updateKPIs();
    renderAppointments();
    renderBlockedSlots();
  }

  // Eventos de Abas de Data
  dateTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dateTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      activeDateFilter = tab.getAttribute('data-date-filter');
      renderAppointments();
    });
  });

  // Evento de Filtro de Status
  if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', (e) => {
      activeStatusFilter = e.target.value;
      renderAppointments();
    });
  }

  // Modal de Bloqueio Events
  function openBlockModal() {
    if (blockModalBackdrop) blockModalBackdrop.classList.add('is-open');
  }

  function closeBlockModal() {
    if (blockModalBackdrop) blockModalBackdrop.classList.remove('is-open');
    if (blockReasonInput) blockReasonInput.value = '';
  }

  if (btnOpenBlockModal) btnOpenBlockModal.addEventListener('click', openBlockModal);
  if (btnCloseBlockModal) btnCloseBlockModal.addEventListener('click', closeBlockModal);
  if (btnCancelBlockModal) btnCancelBlockModal.addEventListener('click', closeBlockModal);

  if (btnConfirmBlockSlot) {
    btnConfirmBlockSlot.addEventListener('click', () => {
      const d = blockDateInput ? blockDateInput.value : '';
      const t = blockTimeSelect ? blockTimeSelect.value : '';
      const r = (blockReasonInput && blockReasonInput.value.trim()) || 'Bloqueio da equipe New Pet';

      if (!d || !t) return;

      BookingStore.blockSlot(d, t, r);
      closeBlockModal();
      renderAll();
    });
  }

  // Escuta atualizações de outras abas ou agendamentos feitos no site
  window.addEventListener('newpet_sync', renderAll);
  window.addEventListener('storage', renderAll);

  // ========================================================================
  // SISTEMA DE NOTIFICAÇÕES (SOM WEB AUDIO, TOAST VISUAL E ALERTA NATIVO)
  // ========================================================================
  const btnNotifyToggle = document.getElementById('btnNotifyToggle');
  const btnNotifyText = document.getElementById('btnNotifyText');
  const btnTestNotification = document.getElementById('btnTestNotification');
  const toastContainer = document.getElementById('adminToastContainer');
  let audioContext = null;
  let notificationsEnabled = localStorage.getItem('newpet_notifications_enabled') !== 'false';

  // Desbloqueia contexto de áudio em toque/clique
  function unlockAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !audioContext) audioContext = new AudioCtx();
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {}
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  }
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);

  function updateNotifyButtonUI() {
    if (!btnNotifyToggle) return;
    if (notificationsEnabled) {
      btnNotifyToggle.classList.add('is-active');
      if (btnNotifyText) btnNotifyText.textContent = 'Alertas na Tela: Ativos';
      btnNotifyToggle.title = 'Alertas sonoros e notificações ativados';
    } else {
      btnNotifyToggle.classList.remove('is-active');
      if (btnNotifyText) btnNotifyText.textContent = 'Alertas Silenciados';
      btnNotifyToggle.title = 'Clique para ativar notificações sonoras e visuais';
    }
  }

  if (btnNotifyToggle) {
    btnNotifyToggle.addEventListener('click', () => {
      notificationsEnabled = !notificationsEnabled;
      localStorage.setItem('newpet_notifications_enabled', notificationsEnabled ? 'true' : 'false');
      updateNotifyButtonUI();

      if (notificationsEnabled) {
        playNotificationChime();
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    });
  }
  updateNotifyButtonUI();

  // Som suave de notificação usando Web Audio API
  function playNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();

      const now = audioContext.currentTime;

      // Nota 1 (Dó sustenido - 554 Hz)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(554.37, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Nota 2 (Lá - 880 Hz)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch (e) {
      console.warn('Audio chime warning:', e);
    }
  }

  // Mostra Toast visual na tela
  function showToast(app) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.innerHTML = `
      <div class="admin-toast__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </div>
      <div class="admin-toast__content">
        <div class="admin-toast__title">Novo Agendamento Recebido!</div>
        <div class="admin-toast__msg">
          <strong>${app.petName || 'Pet'}</strong> (${app.petBreed || 'Cão/Gato'}) &bull; ${app.service || 'Serviço'}<br>
          📅 ${formatBRDate(app.date)} às ${app.time} &bull; Tutor: ${app.clientName || 'Cliente'}
        </div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 6000);
  }

  // Título da aba piscante
  let titleBlinkInterval = null;
  function triggerTabTitleAlert(petName) {
    if (document.hasFocus()) return;
    if (titleBlinkInterval) clearInterval(titleBlinkInterval);

    const originalTitle = document.title;
    let toggle = false;

    titleBlinkInterval = setInterval(() => {
      document.title = toggle ? `🔔 (1) NOVO PET: ${petName}!` : originalTitle;
      toggle = !toggle;
    }, 1000);

    const stopBlink = () => {
      clearInterval(titleBlinkInterval);
      titleBlinkInterval = null;
      document.title = originalTitle;
      window.removeEventListener('focus', stopBlink);
    };
    window.addEventListener('focus', stopBlink);
  }

  // Notificação nativa do browser
  function showNativeNotification(app) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`New Pet Araxá: Novo agendamento!`, {
          body: `${app.petName} (${app.petBreed || 'Pet'}) - ${app.service}\nData: ${formatBRDate(app.date)} às ${app.time}`,
          icon: 'assets/images/logo-clean.png'
        });
      } catch (e) {}
    }
  }

  // Testar Notificação
  if (btnTestNotification) {
    btnTestNotification.addEventListener('click', () => {
      playNotificationChime();
      const mock = {
        id: 'test-' + Date.now(),
        petName: 'Thor (Teste)',
        petBreed: 'Spitz Alemão',
        service: 'Trimming de Spitz Alemão',
        date: todayISO,
        time: '14:30',
        clientName: 'Aline Ferreira (Demonstração)',
        clientPhone: '(34) 99123-4567'
      };
      showToast(mock);
      triggerTabTitleAlert('Thor');
      showNativeNotification(mock);
    });
  }

  // Escuta novos agendamentos via BroadcastChannel
  const handledIds = new Set();
  window.addEventListener('newpet_new_appointment', (e) => {
    const app = e.detail;
    if (!app || !app.id) return;
    if (handledIds.has(app.id)) return;
    handledIds.add(app.id);

    if (notificationsEnabled) {
      playNotificationChime();
    }
    showToast(app);
    showNativeNotification(app);
    triggerTabTitleAlert(app.petName || 'Agendamento');
  });

  // ========================================================================
  // MODO DEMONSTRATIVO: POVOAMENTO INICIAL DE EXEMPLO (SEM SENHA)
  // ========================================================================
  function seedDemoAppointmentsIfEmpty() {
    const all = BookingStore.getAll();
    if (!all || all.length === 0) {
      const demoList = [
        {
          id: 'newpet-demo-1',
          clientName: 'Camila Fernandes',
          clientPhone: '(34) 99123-4567',
          petName: 'Thor',
          petBreed: 'Spitz Alemão',
          petSize: 'Pequeno Porte',
          service: 'Trimming de Spitz Alemão',
          date: todayISO,
          time: '09:00',
          status: 'confirmado',
          notes: 'Manter o volume característico e usar gravatinha New Pet.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'newpet-demo-2',
          clientName: 'Lucas Rezende',
          clientPhone: '(34) 99876-5432',
          petName: 'Mel',
          petBreed: 'Shih Tzu',
          petSize: 'Pequeno Porte',
          service: 'Tosa Bebê na Tesoura',
          date: todayISO,
          time: '10:30',
          status: 'confirmado',
          notes: 'Carinha arredondada, sem tosar muito o corpinho.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'newpet-demo-3',
          clientName: 'Patrícia Souza',
          clientPhone: '(34) 99221-7890',
          petName: 'Bob',
          petBreed: 'Golden Retriever',
          petSize: 'Grande Porte',
          service: 'Banhos Revigorantes & Hidratação',
          date: todayISO,
          time: '13:30',
          status: 'concluido',
          notes: 'Secagem completa e escovação profunda de subpelo.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'newpet-demo-4',
          clientName: 'Rafael Guimarães',
          clientPhone: '(34) 99345-6789',
          petName: 'Pipoca',
          petBreed: 'Poodle Toy',
          petSize: 'Pequeno Porte',
          service: 'Tosa na Lâmina com Rostinho na Tesoura',
          date: todayISO,
          time: '15:00',
          status: 'confirmado',
          notes: 'Pet dócil, tutor busca às 16:30.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'newpet-demo-5',
          clientName: 'Juliana Castro',
          clientPhone: '(34) 99112-3344',
          petName: 'Luna',
          petBreed: 'Yorkshire Terrier',
          petSize: 'Pequeno Porte',
          service: 'Tosa Completa na Lâmina',
          date: tomorrowISO,
          time: '09:30',
          status: 'confirmado',
          notes: 'Primeiro atendimento na New Pet Araxá.',
          createdAt: new Date().toISOString()
        }
      ];
      demoList.forEach(item => {
        BookingStore.add(item);
      });
    }
  }

  // Inicializa
  seedDemoAppointmentsIfEmpty();
  renderAll();
});
