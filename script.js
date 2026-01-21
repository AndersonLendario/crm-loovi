// =================================================================
// CONFIGURAÇÃO - COLOQUE A URL DA SUA API AQUI
// =================================================================
const apiUrl = 'https://script.google.com/macros/s/AKfycbxR-86oaqFwclsQUlOM-WZ_AScREHJfaZETw-UlGWdyG5Ni3rNLGjRhsB2XM0pq4QWqcg/exec';
// =================================================================

// Função principal que é chamada quando a página termina de carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada. Iniciando CRM...");
    fetchLeads();
});

// Função para buscar os leads da nossa API (Google Sheets)
function fetchLeads() {
    console.log("Buscando leads na API...");
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ou na API: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Leads recebidos:", data);
            populateKanban(data);
            initKanban(); // Inicia o drag-and-drop DEPOIS que os cards foram criados
        })
        .catch(error => {
            console.error('Falha ao buscar leads:', error);
            const kanbanContainer = document.querySelector('.kanban-container');
            if(kanbanContainer) {
                kanbanContainer.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar os dados. Verifique o console (F12) para mais detalhes.</p>';
            }
        });
}

// Função para criar os cards e colocar nas colunas
function populateKanban(leads) {
    console.log("Populando o Kanban com os leads...");
    document.querySelectorAll('.kanban-column').forEach(column => {
        const cards = column.querySelectorAll('.kanban-card');
        cards.forEach(card => card.remove());
    });

    leads.forEach(lead => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.textContent = lead.nome;
        card.dataset.id = lead.id;

        const columnId = coluna-${lead.status_funil.toLowerCase().replace(/ /g, '-')};
        const column = document.getElementById(columnId);

        if (column) {
            column.appendChild(card);
        } else {
            console.warn(Coluna não encontrada para o status: ${lead.status_funil});
        }
    });
}

// Função para inicializar o "Arrastar e Soltar"
function initKanban() {
    console.log("Inicializando o SortableJS (drag-and-drop)...");
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        new Sortable(column, {
            group: 'kanban',
            animation: 150,
            onEnd: function (evt) {
                const leadId = evt.item.dataset.id;
                const novoStatusRaw = evt.to.id.replace('coluna-', '');
                const novoStatus = novoStatusRaw.charAt(0).toUpperCase() + novoStatusRaw.slice(1).replace(/-/g, ' ');
                
                console.log(Lead ${leadId} movido para ${novoStatus});
                updateLeadStatus(leadId, novoStatus);
            }
        });
    });
}

// Função para enviar a atualização de status para a API
function updateLeadStatus(leadId, novoStatus) {
    console.log(Enviando atualização para a API: ID ${leadId}, Novo Status ${novoStatus});
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
            action: 'updateStatus',
            id: leadId,
            novoStatus: novoStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log("API confirmou a atualização!");
        } else {
            console.error("API retornou um erro:", data);
        }
    })
    .catch(error => {
        console.error('Falha ao atualizar status:', error);
    });
}
