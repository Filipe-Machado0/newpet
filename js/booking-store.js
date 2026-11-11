/**
 * New Pet Banho e Tosa - Booking Data Store
 * Araxá - MG
 * Suporte a Sincronização Local (LocalStorage) + BroadcastChannel entre abas + Supabase opcional
 */

const SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};

const BOOKING_STORE_KEY = 'newpet_appointments_v1';
const BLOCKED_SLOTS_KEY = 'newpet_blocked_slots_v1';

// Horários específicos da New Pet Araxá:
// Seg: 12h às 18h
// Ter a Sex: 8h às 18h
// Sáb: 8h às 15h
// Dom: Fechado

const SLOTS_MONDAY = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const SLOTS_TUE_FRI = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const SLOTS_SATURDAY = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30'
];

function getSlotsForDay(dayOfWeek) {
  if (dayOfWeek === 0) return []; // Domingo fechado
  if (dayOfWeek === 1) return [...SLOTS_MONDAY]; // Segunda 12h às 18h
  if (dayOfWeek === 6) return [...SLOTS_SATURDAY]; // Sábado 8h às 15h
  return [...SLOTS_TUE_FRI]; // Terça a Sexta 8h às 18h
}

const DEFAULT_SLOTS = [...SLOTS_TUE_FRI];

// Conversores entre Frontend e Supabase
function mapFromSupabase(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    petName: row.pet_name,
    petBreed: row.pet_breed || 'SRD / Vira-lata',
    petSize: row.pet_size,
    service: row.service,
    date: row.date,
    time: row.time,
    status: row.status || 'confirmado',
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

function mapToSupabase(app) {
  return {
    id: app.id,
    client_name: app.clientName,
    client_phone: app.clientPhone,
    pet_name: app.petName,
    pet_breed: app.petBreed || 'SRD / Vira-lata',
    pet_size: app.petSize,
    service: app.service,
    date: app.date,
    time: app.time,
    status: app.status || 'confirmado',
    notes: app.notes || '',
    created_at: app.createdAt || new Date().toISOString()
  };
}

// Canal de comunicação instantânea entre abas no navegador
const newpetBroadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('newpet_channel_v1') : null;
if (newpetBroadcast) {
  newpetBroadcast.onmessage = (event) => {
    if (event.data && event.data.type === 'NEW_APPOINTMENT' && event.data.appointment) {
      window.dispatchEvent(new CustomEvent('newpet_new_appointment', {
        detail: event.data.appointment
      }));
    }
    if (event.data && event.data.type === 'SYNC') {
      window.dispatchEvent(new CustomEvent('newpet_sync'));
    }
  };
}

const BookingStore = (function () {
  let isSupabaseReady = false;
  let supabaseClient = null;

  function initSupabase() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        isSupabaseReady = true;
        setupRealtimeSubscription();
        startContinuousPolling();
      } catch (err) {
        console.warn('New Pet: Erro ao inicializar cliente Supabase:', err);
      }
    }
  }

  function startContinuousPolling() {
    if (!supabaseClient) return;
    setInterval(async () => {
      try {
        const { data: remoteApps, error } = await supabaseClient
          .from('appointments')
          .select('*')
          .order('date', { ascending: true });

        if (!error && remoteApps) {
          const currentLocal = getLocalAppointments();
          const remoteMapped = remoteApps.map(mapFromSupabase);

          if (remoteMapped.length > currentLocal.length) {
            const currentIds = new Set(currentLocal.map(a => a.id));
            const newOnes = remoteMapped.filter(a => !currentIds.has(a.id));
            newOnes.forEach(newItem => {
              window.dispatchEvent(new CustomEvent('newpet_new_appointment', {
                detail: newItem
              }));
            });
          }

          saveLocalAppointments(remoteMapped);
          window.dispatchEvent(new CustomEvent('newpet_sync'));
        }
      } catch (e) {}
    }, 3500);
  }

  function setupRealtimeSubscription() {
    if (!supabaseClient) return;
    try {
      supabaseClient
        .channel('newpet_appointments_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newItem = mapFromSupabase(payload.new);
            const list = getLocalAppointments();
            if (!list.find(x => x.id === newItem.id)) {
              list.push(newItem);
              saveLocalAppointments(list);
              window.dispatchEvent(new CustomEvent('newpet_new_appointment', {
                detail: newItem
              }));
              window.dispatchEvent(new CustomEvent('newpet_sync'));
            }
          } else {
            BookingStore.syncWithRemote();
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('New Pet: Falha ao ativar canal Realtime:', err);
    }
  }

  function getLocalAppointments() {
    try {
      const data = localStorage.getItem(BOOKING_STORE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalAppointments(list) {
    try {
      localStorage.setItem(BOOKING_STORE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('New Pet: Falha ao salvar localmente:', e);
    }
  }

  function getLocalBlockedSlots() {
    try {
      const data = localStorage.getItem(BLOCKED_SLOTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalBlockedSlots(list) {
    try {
      localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('New Pet: Falha ao salvar bloqueios:', e);
    }
  }

  return {
    init: function () {
      initSupabase();
      if (isSupabaseReady) {
        this.syncWithRemote();
      }
    },

    isConfigured: function () {
      return isSupabaseReady;
    },

    syncWithRemote: async function () {
      if (!isSupabaseReady || !supabaseClient) return;
      try {
        const { data: apps, error: errApps } = await supabaseClient
          .from('appointments')
          .select('*')
          .order('date', { ascending: true });

        if (!errApps && apps) {
          saveLocalAppointments(apps.map(mapFromSupabase));
        }

        const { data: blocks, error: errBlocks } = await supabaseClient
          .from('blocked_slots')
          .select('*');

        if (!errBlocks && blocks) {
          saveLocalBlockedSlots(blocks.map(b => ({
            id: b.id,
            date: b.date,
            time: b.time,
            reason: b.reason || 'Bloqueio administrativo'
          })));
        }

        window.dispatchEvent(new CustomEvent('newpet_sync'));
      } catch (err) {
        console.warn('New Pet: Erro ao sincronizar com nuvem:', err);
      }
    },

    getAll: function () {
      return getLocalAppointments();
    },

    getById: function (id) {
      return getLocalAppointments().find(item => item.id === id) || null;
    },

    getByDate: function (dateStr) {
      return getLocalAppointments().filter(item => item.date === dateStr);
    },

    getAvailableSlots: function (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return [];
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayOfWeek = dateObj.getDay();

      const possibleSlots = getSlotsForDay(dayOfWeek);
      if (possibleSlots.length === 0) return [];

      const appointments = this.getByDate(dateStr);
      const bookedTimes = new Set(
        appointments
          .filter(a => a.status !== 'cancelado')
          .map(a => a.time)
      );

      const blockedList = this.getBlockedSlotsByDate(dateStr);
      const blockedTimes = new Set(blockedList.map(b => b.time));

      return possibleSlots.map(time => ({
        time,
        available: !bookedTimes.has(time) && !blockedTimes.has(time),
        reason: bookedTimes.has(time) ? 'Horário já reservado' : (blockedTimes.has(time) ? 'Indisponível' : 'Livre')
      }));
    },

    add: async function (appointmentData) {
      const appointment = {
        id: appointmentData.id || 'np_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        clientName: appointmentData.clientName,
        clientPhone: appointmentData.clientPhone,
        petName: appointmentData.petName,
        petBreed: appointmentData.petBreed || 'SRD / Vira-lata',
        petSize: appointmentData.petSize,
        service: appointmentData.service,
        date: appointmentData.date,
        time: appointmentData.time,
        status: appointmentData.status || 'confirmado',
        notes: appointmentData.notes || '',
        createdAt: appointmentData.createdAt || new Date().toISOString()
      };

      const list = getLocalAppointments();
      list.push(appointment);
      saveLocalAppointments(list);

      if (newpetBroadcast) {
        newpetBroadcast.postMessage({
          type: 'NEW_APPOINTMENT',
          appointment
        });
      }

      window.dispatchEvent(new CustomEvent('newpet_new_appointment', {
        detail: appointment
      }));

      if (isSupabaseReady && supabaseClient) {
        try {
          await supabaseClient.from('appointments').insert([mapToSupabase(appointment)]);
        } catch (e) {
          console.warn('New Pet: Erro ao salvar no Supabase:', e);
        }
      }

      return appointment;
    },

    updateStatus: async function (id, newStatus) {
      const list = getLocalAppointments();
      const item = list.find(x => x.id === id);
      if (!item) return false;

      item.status = newStatus;
      saveLocalAppointments(list);

      if (newpetBroadcast) {
        newpetBroadcast.postMessage({ type: 'SYNC' });
      }
      window.dispatchEvent(new CustomEvent('newpet_sync'));

      if (isSupabaseReady && supabaseClient) {
        try {
          await supabaseClient.from('appointments').update({ status: newStatus }).eq('id', id);
        } catch (e) {
          console.warn('New Pet: Erro ao atualizar status no Supabase:', e);
        }
      }

      return true;
    },

    delete: async function (id) {
      let list = getLocalAppointments();
      list = list.filter(x => x.id !== id);
      saveLocalAppointments(list);

      if (newpetBroadcast) {
        newpetBroadcast.postMessage({ type: 'SYNC' });
      }
      window.dispatchEvent(new CustomEvent('newpet_sync'));

      if (isSupabaseReady && supabaseClient) {
        try {
          await supabaseClient.from('appointments').delete().eq('id', id);
        } catch (e) {}
      }
      return true;
    },

    getBlockedSlots: function () {
      return getLocalBlockedSlots();
    },

    getBlockedSlotsByDate: function (dateStr) {
      return getLocalBlockedSlots().filter(b => b.date === dateStr);
    },

    blockSlot: async function (dateStr, timeStr, reason) {
      const blockItem = {
        id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: dateStr,
        time: timeStr,
        reason: reason || 'Bloqueio administrativo'
      };

      const list = getLocalBlockedSlots();
      list.push(blockItem);
      saveLocalBlockedSlots(list);

      if (newpetBroadcast) {
        newpetBroadcast.postMessage({ type: 'SYNC' });
      }
      window.dispatchEvent(new CustomEvent('newpet_sync'));

      if (isSupabaseReady && supabaseClient) {
        try {
          await supabaseClient.from('blocked_slots').insert([{
            id: blockItem.id,
            date: blockItem.date,
            time: blockItem.time,
            reason: blockItem.reason
          }]);
        } catch (e) {}
      }

      return blockItem;
    },

    unblockSlot: async function (blockId) {
      let list = getLocalBlockedSlots();
      list = list.filter(b => b.id !== blockId);
      saveLocalBlockedSlots(list);

      if (newpetBroadcast) {
        newpetBroadcast.postMessage({ type: 'SYNC' });
      }
      window.dispatchEvent(new CustomEvent('newpet_sync'));

      if (isSupabaseReady && supabaseClient) {
        try {
          await supabaseClient.from('blocked_slots').delete().eq('id', blockId);
        } catch (e) {}
      }

      return true;
    }
  };
})();

// Inicializa a store automaticamente ao carregar
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    BookingStore.init();
  });
}
