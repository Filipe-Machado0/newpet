/**
 * New Pet Banho e Tosa - Multi-step Booking Modal Controller
 * Araxá - MG
 * WhatsApp Oficial: (34) 9 9706-3456
 */

(function () {
  const NEWPET_WHATSAPP = '5534997063456';

  let currentStep = 1;
  const totalSteps = 4;

  const bookingState = {
    petSize: '',
    service: '',
    date: '',
    time: '',
    petName: '',
    petBreed: '',
    clientName: '',
    clientPhone: '',
    notes: ''
  };

  const pad = (n) => String(n).padStart(2, '0');
  const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function createModalDOM() {
    if (document.getElementById('bookingModalBackdrop')) return;

    const modalHTML = `
      <div class="booking-modal-backdrop" id="bookingModalBackdrop">
        <div class="booking-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="booking-modal__header">
            <div class="booking-modal__header-info">
              <span class="booking-modal__tag">New Pet &bull; Araxá - MG</span>
              <h3 class="booking-modal__title" id="modalTitle">Agendar Cuidados</h3>
            </div>
            <button type="button" class="booking-modal__close" id="btnModalClose" aria-label="Fechar Modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="booking-steps-bar">
            <div class="booking-step-dot is-active" data-step-indicator="1">
              <span class="booking-step-dot__num">1</span>
              <span>Porte</span>
            </div>
            <div class="booking-steps-connector"></div>
            <div class="booking-step-dot" data-step-indicator="2">
              <span class="booking-step-dot__num">2</span>
              <span>Serviço</span>
            </div>
            <div class="booking-steps-connector"></div>
            <div class="booking-step-dot" data-step-indicator="3">
              <span class="booking-step-dot__num">3</span>
              <span>Horário</span>
            </div>
            <div class="booking-steps-connector"></div>
            <div class="booking-step-dot" data-step-indicator="4">
              <span class="booking-step-dot__num">4</span>
              <span>Dados</span>
            </div>
          </div>

          <div class="booking-modal__body">
            <!-- Passo 1: Porte do Pet -->
            <div class="booking-step-pane is-active" data-step-pane="1">
              <h4 class="step-instruction">Qual o porte ou tipo do seu pet?</h4>
              <div class="pet-size-selector">
                <label class="size-pill" data-size="Pequeno Porte (até 10kg)">
                  <input type="radio" name="petSize" value="Pequeno Porte (até 10kg)">
                  <strong>Pequeno Porte</strong>
                  <span>Até 10kg (Shih Tzu, Poodle, Maltês, etc.)</span>
                </label>
                <label class="size-pill" data-size="Médio Porte (10kg a 20kg)">
                  <input type="radio" name="petSize" value="Médio Porte (10kg a 20kg)">
                  <strong>Médio Porte</strong>
                  <span>10kg a 20kg (Beagle, Cocker, Bulldog, etc.)</span>
                </label>
                <label class="size-pill" data-size="Grande Porte (acima de 20kg)">
                  <input type="radio" name="petSize" value="Grande Porte (acima de 20kg)">
                  <strong>Grande Porte</strong>
                  <span>Acima de 20kg (Golden, Labrador, Pastor, etc.)</span>
                </label>
                <label class="size-pill" data-size="Spitz Alemão / Lulu">
                  <input type="radio" name="petSize" value="Spitz Alemão / Lulu">
                  <strong>Spitz Alemão / Lulu</strong>
                  <span>Especialistas em pelagem dupla e subpelo</span>
                </label>
                <label class="size-pill" data-size="Gato / Felino">
                  <input type="radio" name="petSize" value="Gato / Felino">
                  <strong>Gato / Felino</strong>
                  <span>Ambiente tranquilo, higienização com carinho</span>
                </label>
              </div>
            </div>

            <!-- Passo 2: Escolha do Serviço -->
            <div class="booking-step-pane" data-step-pane="2">
              <h4 class="step-instruction">Qual cuidado você deseja para hoje?</h4>
              <div class="service-selector-list">
                <label class="service-select-card" data-service-name="Banho Completo & Higiene">
                  <input type="radio" name="petService" value="Banho Completo & Higiene">
                  <div class="service-select-info">
                    <h4>Banhos com Higiene Completa</h4>
                    <p>Shampoo específico, hidratação, corte de unhas e limpeza de ouvidos.</p>
                  </div>
                  <span class="service-select-badge">Mais pedido</span>
                </label>

                <label class="service-select-card" data-service-name="Tosa Bebê na Tesoura">
                  <input type="radio" name="petService" value="Tosa Bebê na Tesoura">
                  <div class="service-select-info">
                    <h4>Tosa Bebê na Tesoura</h4>
                    <p>Acabamento fofinho e natural, modelagem arredondada e suave.</p>
                  </div>
                  <span class="service-select-badge">Tesoura</span>
                </label>

                <label class="service-select-card" data-service-name="Trimming Especializado de Spitz">
                  <input type="radio" name="petService" value="Trimming Especializado de Spitz">
                  <div class="service-select-info">
                    <h4>Trimming Especializado de Spitz</h4>
                    <p>Remoção de subpelo morto sem raspar, contorno perfeito na tesoura.</p>
                  </div>
                  <span class="service-select-badge">Especialidade</span>
                </label>

                <label class="service-select-card" data-service-name="Tosa na Lâmina com Rostinho na Tesoura">
                  <input type="radio" name="petService" value="Tosa na Lâmina com Rostinho na Tesoura">
                  <div class="service-select-info">
                    <h4>Tosa na Lâmina com Rostinho</h4>
                    <p>Corpinho prático e baixinho, rostinho expressivo modelado na tesoura.</p>
                  </div>
                  <span class="service-select-badge">Praticidade</span>
                </label>

                <label class="service-select-card" data-service-name="Tosa Completa na Lâmina">
                  <input type="radio" name="petService" value="Tosa Completa na Lâmina">
                  <div class="service-select-info">
                    <h4>Tosa Completa na Lâmina</h4>
                    <p>Pelagem uniforme e baixinha para fácil manutenção no dia a dia.</p>
                  </div>
                  <span class="service-select-badge">Higiênica</span>
                </label>

                <label class="service-select-card" data-service-name="Atendimento Veterinário">
                  <input type="radio" name="petService" value="Atendimento Veterinário">
                  <div class="service-select-info">
                    <h4>Atendimento Veterinário</h4>
                    <p>Segunda a sexta a partir das 16h em ambiente acolhedor.</p>
                  </div>
                  <span class="service-select-badge">Saúde</span>
                </label>
              </div>
            </div>

            <!-- Passo 3: Data e Horário -->
            <div class="booking-step-pane" data-step-pane="3">
              <h4 class="step-instruction">Escolha a data e o horário desejado:</h4>
              <div class="date-picker-wrap">
                <label for="bookingDateInput">Selecione o Dia:</label>
                <input type="date" id="bookingDateInput" class="input-date-custom">
              </div>

              <div id="slotsContainer">
                <div class="slots-group-title">Horários Disponíveis em Araxá:</div>
                <div class="slots-grid" id="slotsGrid">
                  <!-- Botões de horários inseridos via JS -->
                </div>
              </div>
            </div>

            <!-- Passo 4: Dados do Pet e Tutor -->
            <div class="booking-step-pane" data-step-pane="4">
              <h4 class="step-instruction">Quase pronto! Quem vamos receber na New Pet?</h4>
              
              <div class="form-row--two-col">
                <div class="form-group-modal">
                  <label for="clientNameInput">Seu Nome Completo *</label>
                  <input type="text" id="clientNameInput" class="input-modal" placeholder="Ex: Ana Maria" required>
                </div>
                <div class="form-group-modal">
                  <label for="clientPhoneInput">Seu WhatsApp *</label>
                  <input type="tel" id="clientPhoneInput" class="input-modal" placeholder="(34) 99999-9999" required>
                </div>
              </div>

              <div class="form-row--two-col">
                <div class="form-group-modal">
                  <label for="petNameInput">Nome do Pet *</label>
                  <input type="text" id="petNameInput" class="input-modal" placeholder="Ex: Pipoca" required>
                </div>
                <div class="form-group-modal">
                  <label for="petBreedInput">Raça do Pet</label>
                  <input type="text" id="petBreedInput" class="input-modal" placeholder="Ex: Spitz, Poodle, SRD...">
                </div>
              </div>

              <div class="form-group-modal">
                <label for="bookingNotesInput">Alguma observação especial? (Opcional)</label>
                <textarea id="bookingNotesInput" class="input-modal" rows="2" placeholder="Ex: Pet idoso, pele sensível, nós atrás da orelha..."></textarea>
              </div>

              <div class="booking-summary-box" id="bookingSummaryBox">
                <!-- Resumo montado via JS -->
              </div>
            </div>
          </div>

          <div class="booking-modal__footer">
            <button type="button" class="btn-modal-prev" id="btnModalPrev" style="display: none;">Voltar</button>
            <button type="button" class="btn-modal-next" id="btnModalNext" disabled>Avançar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupEventListeners();
  }

  function setupEventListeners() {
    const backdrop = document.getElementById('bookingModalBackdrop');
    const btnClose = document.getElementById('btnModalClose');
    const btnNext = document.getElementById('btnModalNext');
    const btnPrev = document.getElementById('btnModalPrev');
    const dateInput = document.getElementById('bookingDateInput');

    // Fechar Modal
    btnClose.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Tecla Escape fecha
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Seleção de Porte (Passo 1)
    document.querySelectorAll('.size-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('is-selected'));
        pill.classList.add('is-selected');
        bookingState.petSize = pill.getAttribute('data-size');
        updateNextButtonState();
      });
    });

    // Seleção de Serviço (Passo 2)
    document.querySelectorAll('.service-select-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.service-select-card').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        bookingState.service = card.getAttribute('data-service-name');
        updateNextButtonState();
      });
    });

    // Data mínima (Hoje) e mudança de data (Passo 3)
    const today = new Date();
    const minDateISO = toISODate(today);
    dateInput.min = minDateISO;
    dateInput.value = minDateISO;
    bookingState.date = minDateISO;

    dateInput.addEventListener('change', () => {
      bookingState.date = dateInput.value;
      bookingState.time = '';
      renderSlotsForDate(dateInput.value);
      updateNextButtonState();
    });

    // Máscara de Telefone
    const phoneInput = document.getElementById('clientPhoneInput');
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      if (val.length > 6) {
        val = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
      } else if (val.length > 2) {
        val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
      }
      e.target.value = val;
      updateNextButtonState();
    });

    // Inputs do Passo 4
    ['clientNameInput', 'petNameInput', 'petBreedInput', 'bookingNotesInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          updateNextButtonState();
        });
      }
    });

    // Botões Próximo / Voltar
    btnNext.addEventListener('click', handleNextClick);
    btnPrev.addEventListener('click', handlePrevClick);
  }

  function renderSlotsForDate(dateStr) {
    const grid = document.getElementById('slotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const parts = dateStr.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      grid.innerHTML = '<div class="slots-empty-notice" style="grid-column: 1/-1;">A New Pet não abre aos domingos. Por favor, escolha um dia de segunda a sábado! 🐾</div>';
      return;
    }

    const availableSlots = BookingStore.getAvailableSlots(dateStr);

    if (availableSlots.length === 0) {
      grid.innerHTML = '<div class="slots-empty-notice" style="grid-column: 1/-1;">Nenhum horário livre encontrado para este dia. Tente outra data!</div>';
      return;
    }

    availableSlots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn';
      btn.textContent = slot.time;
      btn.disabled = !slot.available;
      if (!slot.available) {
        btn.title = slot.reason;
      }

      if (slot.time === bookingState.time && slot.available) {
        btn.classList.add('is-selected');
      }

      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        bookingState.time = slot.time;
        updateNextButtonState();
      });

      grid.appendChild(btn);
    });
  }

  function updateNextButtonState() {
    const btnNext = document.getElementById('btnModalNext');
    if (!btnNext) return;

    if (currentStep === 1) {
      btnNext.disabled = !bookingState.petSize;
      btnNext.textContent = 'Avançar para Serviços →';
    } else if (currentStep === 2) {
      btnNext.disabled = !bookingState.service;
      btnNext.textContent = 'Avançar para Horário →';
    } else if (currentStep === 3) {
      btnNext.disabled = !bookingState.date || !bookingState.time;
      btnNext.textContent = 'Avançar para Seus Dados →';
    } else if (currentStep === 4) {
      const cName = document.getElementById('clientNameInput')?.value.trim();
      const cPhone = document.getElementById('clientPhoneInput')?.value.trim();
      const pName = document.getElementById('petNameInput')?.value.trim();

      const isValid = cName && cPhone && cPhone.length >= 14 && pName;
      btnNext.disabled = !isValid;
      btnNext.textContent = 'Confirmar Agendamento 🐾';
    }
  }

  function handleNextClick() {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    } else {
      finalizeBooking();
    }
  }

  function handlePrevClick() {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  function goToStep(step) {
    currentStep = step;

    // Atualiza indicadores
    document.querySelectorAll('[data-step-indicator]').forEach(ind => {
      const indStep = parseInt(ind.getAttribute('data-step-indicator'), 10);
      ind.classList.remove('is-active', 'is-done');
      if (indStep === currentStep) {
        ind.classList.add('is-active');
      } else if (indStep < currentStep) {
        ind.classList.add('is-done');
      }
    });

    // Atualiza painéis
    document.querySelectorAll('[data-step-pane]').forEach(pane => {
      const paneStep = parseInt(pane.getAttribute('data-step-pane'), 10);
      if (paneStep === currentStep) {
        pane.classList.add('is-active');
      } else {
        pane.classList.remove('is-active');
      }
    });

    // Botão Voltar
    const btnPrev = document.getElementById('btnModalPrev');
    if (btnPrev) {
      btnPrev.style.display = currentStep > 1 ? 'block' : 'none';
    }

    if (currentStep === 3) {
      renderSlotsForDate(bookingState.date || toISODate(new Date()));
    }

    if (currentStep === 4) {
      renderSummaryBox();
    }

    updateNextButtonState();
  }

  function renderSummaryBox() {
    const box = document.getElementById('bookingSummaryBox');
    if (!box) return;

    const parts = bookingState.date.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : bookingState.date;

    box.innerHTML = `
      <div><strong>Serviço:</strong> ${bookingState.service}</div>
      <div><strong>Porte:</strong> ${bookingState.petSize}</div>
      <div><strong>Data &amp; Horário:</strong> ${formattedDate} às ${bookingState.time}</div>
      <div><strong>Local:</strong> Av. Honório de Paiva Abreu, 245 &bull; Araxá - MG</div>
    `;
  }

  async function finalizeBooking() {
    const btnNext = document.getElementById('btnModalNext');
    if (btnNext) {
      btnNext.disabled = true;
      btnNext.textContent = 'Enviando...';
    }

    bookingState.clientName = document.getElementById('clientNameInput')?.value.trim();
    bookingState.clientPhone = document.getElementById('clientPhoneInput')?.value.trim();
    bookingState.petName = document.getElementById('petNameInput')?.value.trim();
    bookingState.petBreed = document.getElementById('petBreedInput')?.value.trim() || 'SRD / Não informada';
    bookingState.notes = document.getElementById('bookingNotesInput')?.value.trim();

    // 1. Salva na store local / Supabase
    await BookingStore.add(bookingState);

    // 2. Prepara mensagem elegante para WhatsApp
    const parts = bookingState.date.split('-');
    const brDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : bookingState.date;

    const waText = encodeURIComponent(
      `Olá New Pet Banho e Tosa! 🐾\n` +
      `Gostaria de agendar pelo site:\n\n` +
      `🐶 *Pet:* ${bookingState.petName} (${bookingState.petBreed} - ${bookingState.petSize})\n` +
      `✨ *Serviço:* ${bookingState.service}\n` +
      `📅 *Data:* ${brDate}\n` +
      `⏰ *Horário:* ${bookingState.time}\n` +
      `👤 *Tutor(a):* ${bookingState.clientName} (${bookingState.clientPhone})\n` +
      (bookingState.notes ? `📝 *Obs:* "${bookingState.notes}"\n\n` : `\n`) +
      `Fico no aguardo da confirmação de vocês! Muito obrigado(a)!`
    );

    const waURL = `https://wa.me/${NEWPET_WHATSAPP}?text=${waText}`;

    // Fecha modal
    closeModal();

    // Redireciona para WhatsApp
    window.open(waURL, '_blank');
  }

  function openModal(preSelectedService) {
    createModalDOM();
    const backdrop = document.getElementById('bookingModalBackdrop');
    if (!backdrop) return;

    // Reset estado
    bookingState.petSize = '';
    bookingState.service = preSelectedService || '';
    bookingState.time = '';

    document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('is-selected'));
    document.querySelectorAll('.service-select-card').forEach(c => {
      c.classList.remove('is-selected');
      if (preSelectedService && c.getAttribute('data-service-name') === preSelectedService) {
        c.classList.add('is-selected');
      }
    });

    goToStep(1);
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const backdrop = document.getElementById('bookingModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('is-open');
    }
    document.body.style.overflow = '';
  }

  // Expõe globalmente
  window.openBookingModal = openModal;
  window.closeBookingModal = closeModal;

  document.addEventListener('DOMContentLoaded', () => {
    createModalDOM();
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const service = btn.getAttribute('data-service') || '';
        openModal(service);
      });
    });
  });
})();
